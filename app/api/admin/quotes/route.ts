import { NextResponse } from "next/server";
import { createPanelOrder } from "@/lib/smm";
import { getQuote, listQuotes, updateQuote, summarizeQueue } from "@/lib/quotes";
import { invalidateCatalog } from "@/lib/catalog";

/**
 * POST /api/admin/quotes
 * Aksi admin untuk mengelola antrean pesanan (dipakai dashboard /admin).
 *
 * Body: { token, action: "submit" | "cancel" | "sync" | "list", reference?, reason? }
 *
 * - submit : kirim pesanan yang sudah dibayar ke panel (memotong saldo panel,
 *            sekaligus merealisasikan margin).
 * - cancel : tandai pesanan batal (mis. pembayaran tidak diterima).
 * - sync   : paksa tarik ulang katalog dari panel.
 * - list   : ringkasan antrean (untuk monitoring eksternal).
 */

interface Body {
  token?: string;
  action?: "submit" | "cancel" | "sync" | "list";
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
      if (quote.status !== "menunggu_pembayaran") {
        return NextResponse.json(
          { ok: false, error: `Pesanan ini sudah berstatus "${quote.status}" dan tidak bisa dikirim ulang.` },
          { status: 409 },
        );
      }

      const result = await createPanelOrder({
        service: quote.serviceId,
        target: quote.target,
        quantity: quote.quantity,
      });

      if (!result.ok) {
        updateQuote(reference, { note: `Gagal dikirim ke panel: ${result.error}` });
        return NextResponse.json({ ok: false, error: result.error, reference }, { status: 502 });
      }

      const updated = updateQuote(reference, {
        status: "terkirim",
        panelOrderId: result.data.orderId,
        paidAt: new Date().toISOString(),
        note: `Pembayaran diterima. Pesanan diteruskan ke panel dengan ID #${result.data.orderId}.`,
      });

      return NextResponse.json({
        ok: true,
        reference,
        panelOrderId: result.data.orderId,
        profit: updated?.profit ?? quote.profit,
        message: `Pesanan ${reference} berhasil dikirim ke panel (#${result.data.orderId}).`,
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

    default:
      return NextResponse.json(
        { ok: false, error: "Aksi tidak dikenal. Gunakan: submit | cancel | sync | list." },
        { status: 400 },
      );
  }
}

export const dynamic = "force-dynamic";
