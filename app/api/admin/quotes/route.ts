import { NextResponse } from "next/server";
import { getQuote, listQuotes, updateQuote, summarizeQueue } from "@/lib/quotes";
import { invalidateCatalog } from "@/lib/catalog";
import { submitQuoteToPanel } from "@/lib/quote-fulfillment";
import { getGatewayConfig } from "@/lib/payment-gateway";
import { settleQuotePayment } from "@/lib/payment-settlement";

/**
 * POST /api/admin/quotes
 * Aksi admin untuk mengelola antrean pesanan (dipakai dashboard /admin).
 *
 * Body: { token, action: "submit" | "cancel" | "sync" | "list" | "simulate", reference?, reason? }
 *
 * - submit   : kirim pesanan ke panel (memotong saldo panel, merealisasikan margin).
 *              Bisa dipakai untuk pesanan "menunggu_pembayaran" (konfirmasi manual)
 *              maupun "dibayar" (pembayaran gateway sudah lunas / kirim ulang
 *              setelah pengiriman otomatis gagal).
 * - cancel   : tandai pesanan batal (mis. pembayaran tidak diterima).
 * - sync     : paksa tarik ulang katalog dari panel.
 * - list     : ringkasan antrean (untuk monitoring eksternal).
 * - simulate : khusus PAYMENT_PROVIDER=mock → menandai pembayaran lunas untuk
 *              menguji alur webhook → kirim otomatis ke panel.
 */

interface Body {
  token?: string;
  action?: "submit" | "cancel" | "sync" | "list" | "simulate";
  reference?: string;
  reason?: string;
}

function authorized(token: string | undefined): boolean {
  const expected = process.env.ADMIN_TOKEN || "";
  if (!expected) return true; // token tidak dipasang → halaman /admin memang terbuka
  return Boolean(token) && token === expected;
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Format permintaan tidak valid." }, { status: 400 });
  }

  if (!authorized(body.token)) {
    return NextResponse.json({ ok: false, error: "Token admin tidak valid." }, { status: 401 });
  }

  switch (body.action) {
    /* ------------------------------------------------ kirim pesanan ke panel */
    case "submit": {
      const reference = String(body.reference ?? "").trim().toUpperCase();
      const quote = getQuote(reference);

      if (!quote) {
        return NextResponse.json({ ok: false, error: "Kode referensi tidak ditemukan." }, { status: 404 });
      }

      const result = await submitQuoteToPanel(reference);

      if (!result.ok) {
        const statusCode = result.code === "NOT_FOUND" ? 404 : result.code === "WRONG_STATUS" ? 409 : 502;
        return NextResponse.json({ ok: false, error: result.error, reference }, { status: statusCode });
      }

      return NextResponse.json({
        ok: true,
        reference,
        panelOrderId: result.panelOrderId,
        profit: result.profit,
        message: `Pesanan ${reference} berhasil dikirim ke panel (#${result.panelOrderId}).`,
      });
    }

    /* ----------------------------------------------------------- batalkan */
    case "cancel": {
      const reference = String(body.reference ?? "").trim().toUpperCase();
      const quote = updateQuote(reference, {
        status: "dibatalkan",
        note: body.reason?.trim() || "Pembayaran tidak diterima — pesanan dibatalkan.",
      });
      if (!quote) {
        return NextResponse.json({ ok: false, error: "Kode referensi tidak ditemukan." }, { status: 404 });
      }
      return NextResponse.json({ ok: true, reference, message: `Pesanan ${reference} dibatalkan.` });
    }

    /* ------------------------------------------------------ sinkron katalog */
    case "sync": {
      const catalog = await invalidateCatalog();
      return NextResponse.json({
        ok: true,
        source: catalog.source,
        totalServices: catalog.services.length,
        fetchedAt: catalog.fetchedAt,
        error: catalog.error ?? null,
        message:
          catalog.source === "panel"
            ? `Katalog tersinkron dari panel (${catalog.services.length} layanan).`
            : `Gagal mengambil katalog dari panel, memakai sumber "${catalog.source}".`,
      });
    }

    /* ---------------------------------------------------------- ringkasan */
    case "list": {
      return NextResponse.json({
        ok: true,
        summary: summarizeQueue(),
        quotes: listQuotes().slice(0, 50),
      });
    }

    /* ------------------------------------------- simulasi pembayaran (mock) */
    case "simulate": {
      const config = getGatewayConfig();
      if (config.provider !== "mock") {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Aksi simulate hanya tersedia bila PAYMENT_PROVIDER=mock (mode uji). Ganti provider ke mock untuk menguji alur pembayaran otomatis.",
          },
          { status: 400 },
        );
      }

      const reference = String(body.reference ?? "").trim().toUpperCase();
      const settlement = await settleQuotePayment({
        reference,
        provider: "mock",
        providerRef: `MOCK-${Date.now().toString(36).toUpperCase()}`,
        channel: "SIMULASI",
        simulated: true,
      });

      if (!settlement.ok) {
        return NextResponse.json({ ok: false, error: settlement.error, reference }, { status: 404 });
      }

      return NextResponse.json({
        ok: true,
        reference: settlement.reference,
        status: settlement.status,
        panelSubmitted: settlement.panelSubmitted,
        panelOrderId: settlement.panelOrderId ?? null,
        warning: settlement.error ?? null,
        message: settlement.panelSubmitted
          ? `Simulasi lunas — pesanan otomatis dikirim ke panel (#${settlement.panelOrderId}).`
          : "Simulasi lunas. Pengiriman otomatis belum berhasil — lihat catatan pada pesanan.",
      });
    }

    default:
      return NextResponse.json(
        { ok: false, error: "Aksi tidak dikenal. Gunakan: submit | cancel | sync | list | simulate." },
        { status: 400 },
      );
  }
}

export const dynamic = "force-dynamic";
