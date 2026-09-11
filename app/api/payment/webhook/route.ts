import { NextResponse } from "next/server";
import { getGatewayConfig, verifyWebhook } from "@/lib/payment-gateway";
import { settleQuotePayment } from "@/lib/payment-settlement";

/**
 * ============================================================================
 *  Webhook pembayaran — /api/payment/webhook?provider=xxx
 * ============================================================================
 *  POST : dipanggil oleh payment gateway (Tripay/Midtrans/DOKU/Duitku/Xendit/
 *         iPaymu) setelah customer membayar. Signature diverifikasi sebelum
 *         pesanan dianggap lunas.
 *  GET  : hanya untuk provider "mock" (simulasi lokal) — dipakai tombol
 *         "Bayar sekarang" saat uji alur tanpa akun gateway.
 *
 *  Yang terjadi setelah pembayaran valid:
 *    quote → status "dibayar" → otomatis dikirim ke panel SMM (bila
 *    ORDER_AUTO_SUBMIT_PAID != 0) → status "terkirim" + ID panel + laba.
 *
 *  URL webhook yang perlu didaftarkan di dashboard provider:
 *    https://domain-anda.com/api/payment/webhook?provider=tripay
 *    (ganti provider sesuai PAYMENT_PROVIDER: midtrans, doku, duitku, xendit, ipaymu)
 * ============================================================================
 */

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const rawBody = await request.text();
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => (headers[key.toLowerCase()] = value));

  const verification = verifyWebhook(rawBody, headers, url.searchParams.get("provider") ?? undefined);

  if (!verification.ok) {
    return NextResponse.json(
      { ok: false, error: verification.error },
      { status: verification.status },
    );
  }

  const event = verification.event;

  /* Status selain "paid" hanya dicatat sebagai catatan, bukan pelunasan. */
  if (event.status !== "paid") {
    if (event.reference) {
      const { getQuote, updateQuote } = await import("@/lib/quotes");
      const quote = getQuote(event.reference);
      if (quote && quote.status === "menunggu_pembayaran") {
        if (event.status === "expired") {
          updateQuote(quote.reference, {
            status: "dibatalkan",
            note: "Batas waktu pembayaran habis (otomatis dari payment gateway). Silakan buat pesanan baru bila masih ingin diproses.",
          });
        } else if (event.status === "failed") {
          updateQuote(quote.reference, {
            note: "Percobaan pembayaran gagal/dibatalkan di sisi gateway. Pesanan belum lunas — silakan coba lagi.",
          });
        }
      }
    }
    return NextResponse.json({ ok: true, handled: false, status: event.status });
  }

  if (!event.reference) {
    return NextResponse.json({ ok: true, handled: false, reason: "Webhook tanpa kode referensi." });
  }

  const settlement = await settleQuotePayment({
    reference: event.reference,
    provider: url.searchParams.get("provider") || getGatewayConfig().provider,
    providerRef: event.providerRef,
    channel: event.channel,
    amount: event.amount,
    fee: event.fee,
    paidAt: event.paidAt,
    raw: event.raw,
  });

  /* Referensi tak dikenal → balas 200 agar gateway tidak mengirim ulang terus. */
  if (!settlement.ok) {
    return NextResponse.json({ ok: true, handled: false, reason: settlement.error, reference: settlement.reference });
  }

  return NextResponse.json({
    ok: true,
    handled: true,
    reference: settlement.reference,
    status: settlement.status,
    panelSubmitted: settlement.panelSubmitted,
    panelOrderId: settlement.panelOrderId ?? null,
    alreadyProcessed: settlement.alreadyProcessed,
    warning: settlement.error ?? null,
  });
}

/* --------------------------------------------------- Simulasi lokal (mock) */

export async function GET(request: Request) {
  const url = new URL(request.url);
  const provider = url.searchParams.get("provider");

  if (provider !== "mock") {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Endpoint ini hanya menerima POST dari payment gateway. Untuk uji simulasi, set PAYMENT_PROVIDER=mock lalu buat pesanan dari /order.",
      },
      { status: 405 },
    );
  }

  const config = getGatewayConfig();
  if (config.provider !== "mock") {
    return htmlPage(
      "Simulasi tidak aktif",
      "Provider pembayaran saat ini bukan <b>mock</b>, jadi tautan simulasi tidak berlaku.",
      null,
      400,
    );
  }

  if (config.webhookToken && url.searchParams.get("token") !== config.webhookToken) {
    return htmlPage("Token tidak valid", "Tautan simulasi ini tidak memiliki token yang benar.", null, 401);
  }

  const reference = url.searchParams.get("reference") ?? "";
  const settlement = await settleQuotePayment({
    reference,
    provider: "mock",
    providerRef: `MOCK-${Date.now().toString(36).toUpperCase()}`,
    channel: "SIMULASI",
    simulated: true,
  });

  if (!settlement.ok) {
    return htmlPage("Simulasi gagal", settlement.error, reference, 404);
  }

  const detail = settlement.panelSubmitted
    ? `Pesanan otomatis dikirim ke panel dengan ID <b>#${settlement.panelOrderId}</b>.`
    : settlement.alreadyProcessed
      ? "Pembayaran ini sebelumnya sudah diproses (webhook dikirim ulang)."
      : `Pembayaran tercatat, tetapi pengiriman otomatis ke panel belum berhasil:<br><span style="color:#fda4af">${
          settlement.error ?? "tidak diketahui"
        }</span><br>Anda bisa mencoba lagi lewat tombol <b>Kirim ke panel</b> di dashboard admin.`;

  return htmlPage(
    "Pembayaran simulasi berhasil ✅",
    `${detail}<br><br>Kode referensi: <b>${settlement.reference}</b>`,
    settlement.reference,
    200,
  );
}

function htmlPage(title: string, message: string, reference: string | null, status: number) {
  const body = `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title} — SynixAI</title>
<style>
  :root { color-scheme: dark; }
  body { margin:0; min-height:100vh; display:grid; place-items:center; background:#0b0716; color:#ece9ff;
         font:15px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif; padding:24px; }
  .card { max-width:520px; width:100%; background:#150e2b; border:1px solid #2b2050; border-radius:20px; padding:28px; }
  h1 { margin:0 0 10px; font-size:20px; }
  p { margin:0 0 18px; color:#b9b0e6; }
  a.btn { display:inline-block; background:linear-gradient(90deg,#7c3aed,#d946ef); color:#fff; text-decoration:none;
          padding:11px 18px; border-radius:12px; font-weight:700; }
  .note { margin-top:16px; font-size:12px; color:#8b82b8; }
</style>
</head>
<body>
  <div class="card">
    <h1>${title}</h1>
    <p>${message}</p>
    ${reference ? `<a class="btn" href="/cek-order?order=${encodeURIComponent(reference)}">Lihat status pesanan →</a>` : `<a class="btn" href="/order">Kembali ke halaman order</a>`}
    <p class="note">Halaman ini hanya muncul pada mode simulasi (PAYMENT_PROVIDER=mock). Ganti ke provider asli sebelum website dipakai publik.</p>
  </div>
</body>
</html>`;

  return new Response(body, { status, headers: { "content-type": "text/html; charset=utf-8" } });
}
