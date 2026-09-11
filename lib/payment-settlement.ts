import { getQuote, updateQuote, type Quote } from "./quotes";
import { submitQuoteToPanel } from "./quote-fulfillment";
import { getGatewayConfig } from "./payment-gateway";

/**
 * ============================================================================
 *  Penyelesaian pembayaran (settlement) — khusus server
 * ============================================================================
 *  Dipanggil dari webhook payment gateway (dan dari tombol simulasi di
 *  dashboard ketika PAYMENT_PROVIDER=mock).
 *
 *  Alur aman & idempoten:
 *    1. Cari quote dari kode referensi.
 *    2. Bila sudah "dibayar"/"terkirim" → jangan proses ulang (webhook gateway
 *       sering dikirim berkali-kali).
 *    3. Tandai "dibayar" + catat detail transaksi.
 *    4. Bila ORDER_AUTO_SUBMIT_PAID != 0 → kirim ke panel memakai modal panel.
 *       Bila pengiriman gagal (mis. IP belum di-whitelist), status tetap
 *       "dibayar" + catatan alasan, dan admin bisa menekan tombol kirim ulang.
 * ============================================================================
 */

export interface SettlementInput {
  reference: string;
  provider: string;
  providerRef?: string;
  channel?: string;
  /** Nominal yang diterima (bila provider mengirimkannya). */
  amount?: number;
  fee?: number;
  paidAt?: string;
  simulated?: boolean;
  raw?: unknown;
}

export type SettlementResult =
  | {
      ok: true;
      reference: string;
      alreadyProcessed: boolean;
      status: Quote["status"];
      panelSubmitted: boolean;
      panelOrderId?: string;
      error?: string;
      quote?: Quote;
    }
  | { ok: false; code: "NOT_FOUND" | "CANCELED" | "IGNORED"; error: string; reference: string };

export async function settleQuotePayment(input: SettlementInput): Promise<SettlementResult> {
  const reference = (input.reference || "").trim().toUpperCase();
  const quote = getQuote(reference);

  if (!quote) {
    return { ok: false, code: "NOT_FOUND", error: "Kode referensi tidak ditemukan.", reference };
  }

  if (quote.status === "dibatalkan") {
    return { ok: false, code: "CANCELED", error: "Pesanan sudah dibatalkan sebelum pembayaran masuk.", reference };
  }

  /* Idempoten: webhook sering dikirim ulang oleh provider. */
  if (quote.status === "dibayar" || quote.status === "terkirim") {
    return {
      ok: true,
      reference,
      alreadyProcessed: true,
      status: quote.status,
      panelSubmitted: quote.status === "terkirim",
      panelOrderId: quote.panelOrderId,
      quote,
    };
  }

  /* Nominal lebih kecil dari tagihan → tetap diproses, tapi admin diberi tanda. */
  const mismatch =
    typeof input.amount === "number" && input.amount > 0 && input.amount + 1 < quote.total
      ? `Nominal diterima ${input.amount.toLocaleString("id-ID")} lebih kecil dari tagihan ${quote.total.toLocaleString("id-ID")} — periksa manual.`
      : null;

  const paidQuote = updateQuote(reference, {
    status: "dibayar",
    paidAt: input.paidAt ?? new Date().toISOString(),
    payment: {
      provider: input.provider,
      providerRef: input.providerRef ?? "-",
      channel: input.channel ?? "-",
      amount: input.amount ?? quote.total,
      fee: input.fee ?? 0,
      baseAmount: quote.total,
      simulated: input.simulated,
    },
    note: [
      `Pembayaran terverifikasi otomatis${input.simulated ? " (SIMULASI)" : ""} via ${input.provider}${
        input.channel ? ` · ${input.channel}` : ""
      }.`,
      mismatch,
    ]
      .filter(Boolean)
      .join(" "),
  });

  const config = getGatewayConfig();
  if (!config.autoSubmitAfterPaid) {
    updateQuote(reference, {
      note: `${paidQuote?.note ?? ""} Pengiriman otomatis dimatikan (ORDER_AUTO_SUBMIT_PAID=0) — kirim manual dari dashboard.`,
    });
    return {
      ok: true,
      reference,
      alreadyProcessed: false,
      status: "dibayar",
      panelSubmitted: false,
      quote: getQuote(reference),
    };
  }

  const submit = await submitQuoteToPanel(reference);
  if (!submit.ok) {
    return {
      ok: true,
      reference,
      alreadyProcessed: false,
      status: "dibayar",
      panelSubmitted: false,
      error: submit.error,
      quote: getQuote(reference),
    };
  }

  return {
    ok: true,
    reference,
    alreadyProcessed: false,
    status: "terkirim",
    panelSubmitted: true,
    panelOrderId: submit.panelOrderId,
    quote: submit.quote,
  };
}
