import { randomBytes } from "node:crypto";

/**
 * ============================================================================
 *  Antrean Pesanan Menunggu Pembayaran (Payment Queue) — modul khusus server.
 *  Jangan diimpor dari komponen client.
 * ============================================================================
 *  Alur aman:
 *    1. Customer mengisi form  → sistem membuat *penawaran* (quote) dengan
 *       kode referensi unik, TANPA memotong saldo panel.
 *    2. Customer membayar (QRIS / e-wallet / transfer) dan konfirmasi ke admin.
 *    3. Admin menandai lunas di halaman /admin → satu klik mengirim pesanan
 *       ke panel dan customer bisa memantau status lewat kode referensi.
 *
 *  Penyimpanan: memori proses (cocok untuk VPS/self-host, hilang saat restart).
 *  Untuk produksi skala besar, ganti implementasi ini dengan database.
 * ============================================================================
 */

export type QuoteStatus = "menunggu_pembayaran" | "dibatalkan" | "terkirim";

export interface Quote {
  reference: string;
  serviceId: number;
  serviceName: string;
  platform: string;
  target: string;
  quantity: number;
  /** Harga jual per 1.000 (yang dibayar customer). */
  retailPerThousand: number;
  /** Harga kulakan per 1.000 (modal) — hanya untuk admin. */
  costPerThousand: number;
  total: number;
  /** Laba yang didapat dari pesanan ini. */
  profit: number;
  status: QuoteStatus;
  createdAt: string;
  paidAt?: string;
  panelOrderId?: string;
  note?: string;
}

const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 hari
const MAX_ITEMS = 500;

/** Penyimpanan di globalThis supaya tidak hilang saat hot-reload dev. */
const globalStore = globalThis as unknown as { __synixQuotes?: Map<string, Quote> };
const store: Map<string, Quote> = globalStore.__synixQuotes ?? new Map();
globalStore.__synixQuotes = store;

function generateReference(): string {
  // Contoh: SYN-7F3K2Q
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(6);
  let code = "";
  for (const byte of bytes) code += alphabet[byte % alphabet.length];
  return `SYN-${code}`;
}

export function isReference(value: string): boolean {
  return /^SYN-[A-Z0-9]{4,10}$/i.test(value.trim());
}

export function createQuote(input: Omit<Quote, "reference" | "status" | "createdAt">): Quote {
  let reference = generateReference();
  while (store.has(reference)) reference = generateReference();

  const quote: Quote = {
    ...input,
    reference,
    status: "menunggu_pembayaran",
    createdAt: new Date().toISOString(),
  };

  store.set(reference, quote);
  prune();
  return quote;
}

export function getQuote(reference: string): Quote | undefined {
  return store.get(reference.trim().toUpperCase());
}

export function listQuotes(status?: QuoteStatus): Quote[] {
  const list = [...store.values()].filter((quote) => {
    if (Date.now() - new Date(quote.createdAt).getTime() > TTL_MS) return false;
    if (status && quote.status !== status) return false;
    return true;
  });
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function updateQuote(reference: string, patch: Partial<Quote>): Quote | undefined {
  const current = store.get(reference.trim().toUpperCase());
  if (!current) return undefined;
  const next = { ...current, ...patch };
  store.set(next.reference, next);
  return next;
}

function prune() {
  if (store.size <= MAX_ITEMS) return;
  const entries = [...store.entries()].sort((a, b) => a[1].createdAt.localeCompare(b[1].createdAt));
  const toDelete = entries.slice(0, store.size - MAX_ITEMS);
  for (const [key] of toDelete) store.delete(key);
}

/* --------------------------------------------------------------- Ringkasan */
export interface QueueSummary {
  pendingCount: number;
  pendingValue: number;
  pendingProfit: number;
  sentCount: number;
  sentProfit: number;
}

export function summarizeQueue(): QueueSummary {
  const all = listQuotes();
  const pending = all.filter((q) => q.status === "menunggu_pembayaran");
  const sent = all.filter((q) => q.status === "terkirim");
  return {
    pendingCount: pending.length,
    pendingValue: pending.reduce((sum, q) => sum + q.total, 0),
    pendingProfit: pending.reduce((sum, q) => sum + q.profit, 0),
    sentCount: sent.length,
    sentProfit: sent.reduce((sum, q) => sum + q.profit, 0),
  };
}
