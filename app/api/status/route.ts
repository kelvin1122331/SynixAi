import { NextResponse } from "next/server";
import { fetchPanelOrderStatus, isIpNotAllowed } from "@/lib/smm";
import { getQuote, isReference } from "@/lib/quotes";
import { formatRupiah, statusLabel } from "@/lib/format";

/**
 * GET /api/status?order=12345
 * GET /api/status?orders=12345,12346,SYN-7F3K2Q   (maksimal 20 ID)
 *
 * Menerima ID pesanan panel maupun kode referensi SynixAI (SYN-XXXXXX).
 * Kode referensi berasal dari pesanan yang menunggu pembayaran.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const single = searchParams.get("order");
  const multiple = searchParams.get("orders");

  const ids = (multiple ? multiple.split(",") : single ? [single] : [])
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 20);

  if (!ids.length) {
    return NextResponse.json(
      { ok: false, error: "Sertakan parameter `order` atau `orders` (contoh: /api/status?order=SYN-7F3K2Q)." },
      { status: 400 },
    );
  }

  const results = [];

  for (const id of ids) {
    /* --------- Kode referensi internal (pesanan menunggu pembayaran) --------- */
    if (isReference(id)) {
      const quote = getQuote(id);

      if (!quote) {
        results.push({
          id,
          ok: false,
          status: null,
          statusLabel: null,
          error:
            "Kode referensi tidak ditemukan atau sudah kedaluwarsa. Simpan kode Anda atau hubungi admin untuk pengecekan manual.",
          code: "NOT_FOUND",
        });
        continue;
      }

      if (quote.status === "menunggu_pembayaran") {
        results.push({
          id: quote.reference,
          ok: true,
          status: "Menunggu Pembayaran",
          statusLabel: "Menunggu Pembayaran",
          startCount: "0",
          remains: String(quote.quantity),
          charge: formatRupiah(quote.total),
          currency: "IDR",
          note:
            quote.note ??
            `Pesanan "${quote.serviceName}" (${quote.quantity.toLocaleString("id-ID")} unit) akan otomatis dikirim ke provider setelah pembayaran dikonfirmasi admin.`,
          details: [
            { label: "Layanan", value: quote.serviceName },
            { label: "Target", value: quote.target },
            { label: "Total", value: formatRupiah(quote.total) },
          ],
        });
        continue;
      }

      if (quote.status === "dibatalkan") {
        results.push({
          id: quote.reference,
          ok: true,
          status: "Canceled",
          statusLabel: "Dibatalkan",
          startCount: "0",
          remains: "0",
          charge: formatRupiah(quote.total),
          currency: "IDR",
          note: quote.note ?? "Pesanan dibatalkan. Silakan hubungi admin bila Anda sudah melakukan pembayaran.",
        });
        continue;
      }

      // status "terkirim" → lanjut cek status nyata di panel
      if (quote.panelOrderId) {
        const panel = await fetchPanelOrderStatus(quote.panelOrderId);
        if (panel.ok) {
          results.push({
            id: quote.reference,
            ok: true,
            status: panel.data.status,
            statusLabel: statusLabel(panel.data.status),
            startCount: panel.data.startCount,
            remains: panel.data.remains,
            charge: formatRupiah(quote.total),
            currency: "IDR",
            note: `Pesanan sudah diteruskan ke provider dengan ID panel #${quote.panelOrderId}.`,
            details: [
              { label: "Layanan", value: quote.serviceName },
              { label: "Target", value: quote.target },
            ],
          });
        } else {
          results.push({
            id: quote.reference,
            ok: true,
            status: "Sedang Diproses",
            statusLabel: "Sedang Diproses",
            startCount: "0",
            remains: String(quote.quantity),
            charge: formatRupiah(quote.total),
            currency: "IDR",
            note: `Pesanan sudah diteruskan ke provider (#${quote.panelOrderId}). Detail status provider belum dapat dibaca: ${panel.error}`,
          });
        }
        continue;
      }

      results.push({
        id: quote.reference,
        ok: true,
        status: "Diproses",
        statusLabel: "Diproses",
        startCount: "0",
        remains: String(quote.quantity),
        charge: formatRupiah(quote.total),
        currency: "IDR",
        note: "Pembayaran diterima. Pesanan sedang diteruskan ke provider.",
      });
      continue;
    }

    /* ------------------------- ID pesanan panel langsung ------------------- */
    const res = await fetchPanelOrderStatus(id);
    if (res.ok) {
      results.push({
        id,
        ok: true,
        status: res.data.status,
        statusLabel: statusLabel(res.data.status),
        startCount: res.data.startCount,
        remains: res.data.remains,
        charge: res.data.charge,
        currency: res.data.currency,
      });
    } else {
      results.push({
        id,
        ok: false,
        status: null,
        statusLabel: null,
        error: res.error,
        code: isIpNotAllowed(res.error) ? "IP_NOT_ALLOWED" : "PANEL_ERROR",
      });
    }
  }

  return NextResponse.json({
    ok: results.some((r) => r.ok),
    count: results.length,
    data: results,
    checkedAt: new Date().toISOString(),
  });
}

export const dynamic = "force-dynamic";
