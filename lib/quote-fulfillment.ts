import { createPanelOrder, isIpNotAllowed } from "./smm";
import { getQuote, updateQuote, type Quote } from "./quotes";

/**
 * ============================================================================
 *  Pengiriman pesanan ke panel SMM (khusus server)
 * ============================================================================
 *  Dipakai oleh dua jalur:
 *    1. Admin menekan "Kirim ke panel" di dashboard (pembayaran manual).
 *    2. Otomatis setelah payment gateway memverifikasi pembayaran lunas.
 *
 *  Status yang boleh dikirim:
 *    - "menunggu_pembayaran" → admin mengonfirmasi pembayaran manual.
 *    - "dibayar"             → pembayaran sudah terverifikasi gateway; ini juga
 *                              jalur percobaan ulang bila pengiriman otomatis
 *                              sebelumnya gagal (mis. IP belum di-whitelist).
 * ============================================================================
 */

export type FulfillmentResult =
  | { ok: true; quote: Quote; panelOrderId: string; profit: number }
  | {
      ok: false;
      code: "NOT_FOUND" | "WRONG_STATUS" | "IP_NOT_ALLOWED" | "PANEL_ERROR";
      error: string;
      reference: string;
    };

export async function submitQuoteToPanel(reference: string): Promise<FulfillmentResult> {
  const normalized = reference.trim().toUpperCase();
  const quote = getQuote(normalized);

  if (!quote) {
    return { ok: false, code: "NOT_FOUND", error: "Kode referensi tidak ditemukan.", reference: normalized };
  }

  if (quote.status !== "menunggu_pembayaran" && quote.status !== "dibayar") {
    return {
      ok: false,
      code: "WRONG_STATUS",
      error: `Pesanan ini berstatus "${quote.status}" dan tidak bisa dikirim ke panel.`,
      reference: normalized,
    };
  }

  const result = await createPanelOrder({
    service: quote.serviceId,
    target: quote.target,
    quantity: quote.quantity,
  });

  if (!result.ok) {
    updateQuote(normalized, { note: `Gagal dikirim ke panel: ${result.error}` });
    return {
      ok: false,
      code: isIpNotAllowed(result.error) ? "IP_NOT_ALLOWED" : "PANEL_ERROR",
      error: result.error,
      reference: normalized,
    };
  }

  const paidViaGateway = quote.status === "dibayar";
  const updated = updateQuote(normalized, {
    status: "terkirim",
    panelOrderId: result.data.orderId,
    paidAt: quote.paidAt ?? new Date().toISOString(),
    note: paidViaGateway
      ? `Pembayaran terverifikasi otomatis. Pesanan diteruskan ke panel dengan ID #${result.data.orderId}.`
      : `Pembayaran dikonfirmasi admin. Pesanan diteruskan ke panel dengan ID #${result.data.orderId}.`,
  });

  return {
    ok: true,
    quote: updated ?? quote,
    panelOrderId: result.data.orderId,
    profit: quote.profit,
  };
}
