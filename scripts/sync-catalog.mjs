/**
 * Sinkronisasi katalog dari panel SMM Nusantara ke data/services.json
 * ------------------------------------------------------------------
 * Jalankan di komputer/VPS yang punya akses internet ke panel:
 *
 *    npm run sync:catalog
 *
 * Kredensial dibaca dari .env.local (SMM_API_URL, SMM_API_ID, SMM_API_KEY).
 * Hasilnya dipakai otomatis oleh website sebagai data cadangan bila server
 * tidak dapat menjangkau API panel (mis. saat build/offline).
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();

function loadEnv(file) {
  const full = path.join(root, file);
  if (!existsSync(full)) return {};
  const env = {};
  for (const line of readFileSync(full, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!match) continue;
    let [, key, value] = match;
    value = value.trim().replace(/^["']|["']$/g, "");
    env[key] = value;
  }
  return env;
}

const env = { ...loadEnv(".env"), ...loadEnv(".env.local"), ...process.env };

const baseUrl = (env.SMM_API_URL || "https://smmnusantara.id").replace(/\/+$/, "").replace(/\/api(\/.*)?$/, "");
const apiId = env.SMM_API_ID;
const apiKey = env.SMM_API_KEY;

if (!apiId || !apiKey) {
  console.error("❌ SMM_API_ID / SMM_API_KEY belum diisi di .env.local");
  process.exit(1);
}

const endpoint = `${baseUrl}/api/services`;
const body = new URLSearchParams({ api_id: apiId, api_key: apiKey });

async function tryRequest(method) {
  const url = method === "POST" ? endpoint : `${endpoint}?${body.toString()}`;
  const res = await fetch(url, {
    method,
    headers: { Accept: "application/json" },
    ...(method === "POST"
      ? { body, headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" } }
      : {}),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

console.log(`⏳ Menarik katalog dari ${endpoint} …`);

let json;
try {
  json = await tryRequest("POST");
} catch (error) {
  console.warn(`⚠️  POST gagal (${error.message}), mencoba GET…`);
  json = await tryRequest("GET");
}

if (json?.status === false) {
  console.error(`❌ Panel menolak permintaan: ${json.msg ?? "tidak diketahui"}`);
  process.exit(1);
}

const services = Array.isArray(json) ? json : json?.services;
if (!Array.isArray(services) || services.length === 0) {
  console.error("❌ Respons panel tidak memuat daftar layanan.");
  process.exit(1);
}

const outDir = path.join(root, "data");
mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, "services.json");

writeFileSync(
  outFile,
  JSON.stringify(
    {
      syncedAt: new Date().toISOString(),
      baseUrl,
      count: services.length,
      services,
    },
    null,
    2,
  ),
);

const platforms = new Set();
let cheapest = Number.POSITIVE_INFINITY;
for (const service of services) {
  const group = String(service.category ?? "").split("|")[0];
  platforms.add(group.split("-")[0].trim());
  const price = Number(service.price) || 0;
  if (price > 0 && price < cheapest) cheapest = price;
}

console.log(`✅ ${services.length} layanan tersimpan di ${path.relative(root, outFile)}`);
console.log(`   Platform terdeteksi : ${platforms.size}`);
console.log(`   Harga termurah/1000 : Rp ${cheapest.toLocaleString("id-ID")}`);
console.log("   Katalog ini otomatis dipakai sebagai cadangan oleh website.");
