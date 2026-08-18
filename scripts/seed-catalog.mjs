// Seed 60 item ke katalog Supabase (Jejak Rimba) + wiring equipment_images.
// Baca kredensial dari .env.local lalu introspect schema nyata via PostgREST OpenAPI.
//
// Jalankan:  node scripts/seed-catalog.mjs
// Mode kering (tanpa menulis DB):  node scripts/seed-catalog.mjs --dry

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline";
import { randomUUID } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const DRY = process.argv.includes("--dry");

// ── Env loader (tanpa dotenv) ──
function loadEnv() {
  const raw = readFileSync(join(root, ".env.local"), "utf8");
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

const env = loadEnv();
const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !SERVICE) {
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY tidak ada di .env.local"
  );
  process.exit(1);
}

const headers = {
  apikey: SERVICE,
  Authorization: `Bearer ${SERVICE}`,
  "Content-Type": "application/json",
};

// ── Introspect schema via OpenAPI ──
async function introspect() {
  const res = await fetch(`${URL}/rest/v1/`, { headers: { Accept: "application/json", ...headers } });
  if (!res.ok) {
    console.error("Gagal introspect:", res.status, await res.text());
    process.exit(1);
  }
  const spec = await res.json();
  const colSet = (table) => {
    const t = spec?.definitions?.[table];
    return t && t.properties ? Object.keys(t.properties) : [];
  };
  return {
    equipment: colSet("equipment"),
    vendors: colSet("vendors"),
    equipment_images: colSet("equipment_images"),
  };
}

// ── Pool foto Unsplash (ID yang stabil & sudah dipakai di repo) ──
const IMG_POOL = {
  tenda: [
    "photo-1504280390367-361c6d9f38f4",
    "photo-1478131143081-80f7f84ca84d",
    "photo-1506905925346-21bda4d32df4",
    "photo-1519904981063-b0cf448d479e",
    "photo-1510312305653-8ed496efae75",
  ],
  carrier: [
    "photo-1622260614153-03223fb72052",
    "photo-1470071459604-3b5ec3a7fe05",
    "photo-1504280390367-361c6d9f38f4",
    "photo-1510312305653-8ed496efae75",
    "photo-1506905925346-21bda4d32df4",
  ],
  sleeping_bag: [
    "photo-1510312305653-8ed496efae75",
    "photo-1506905925346-21bda4d32df4",
    "photo-1470071459604-3b5ec3a7fe05",
    "photo-1519904981063-b0cf448d479e",
    "photo-1470071459604-3b5ec3a7fe05",
  ],
  kompor: [
    "photo-1520250497591-112f2f40a3f4",
    "photo-1470071459604-3b5ec3a7fe05",
    "photo-1481931098730-318b6f776db0",
    "photo-1510798831971-661eb04b3739",
    "photo-1506905925346-21bda4d32df4",
  ],
  matras: [
    "photo-1478131143081-80f7f84ca84d",
    "photo-1504280390367-361c6d9f38f4",
    "photo-1506905925346-21bda4d32df4",
    "photo-1519904981063-b0cf448d479e",
    "photo-1470071459604-3b5ec3a7fe05",
  ],
  jaket: [
    "photo-1551028719-00167b16eac5",
    "photo-1470071459604-3b5ec3a7fe05",
    "photo-1544022613-e87ca75a784a",
    "photo-1506905925346-21bda4d32df4",
    "photo-1554469384-e58fac16e23a",
  ],
};

const px = (id) => `https://images.unsplash.com/${id}?w=800&q=80`;

// ── Nama product per kategori (10 per kategori = 60) ──
const CATEGORY_DEFS = {
  tenda: {
    kind: ["Tenda Dome", "Tenda Kapasitas", "Tenda Family", "Tenda Quick Camp"],
    suffix: ["4 Orang", "2 Orang", "6 Orang", "4 Orang Pro"],
    capacity: ["2-4 Orang", "4-6 Orang", "6-8 Orang"],
  },
  carrier: {
    kind: ["Carrier Expedition", "Ransel Carrier", "Carrier Hiking", "Ransel Gunung"],
    suffix: ["60L", "45L", "80L", "52L"],
    capacity: ["45-60L", "60-80L"],
  },
  sleeping_bag: {
    kind: ["Sleeping Bag Winter", "Sleeping Bag T-body", "Sleeping Bag Rectangular"],
    suffix: ["-10°C", "0°C", "5°C", "-15°C"],
    capacity: ["Dewasa", "Anak"],
  },
  kompor: {
    kind: ["Kompor Portable", "Kompor Camping Gas", "Kompor Windshield"],
    suffix: ["Single Burner", "Double Burner", "Isi Ulang", "Hiking"],
    capacity: ["1 Tungku", "2 Tungku"],
  },
  matras: {
    kind: ["Matras Self-Inflating", "Matras Busa", "Matras Lipat", "Sleeping Pad"],
    suffix: ["3cm", "5cm", "10cm", "Isolasi"],
    capacity: ["Single", "Double"],
  },
  jaket: {
    kind: ["Jaket Gunung", "Jaket Tebal", "Windbreaker", "Jaket Down"],
    suffix: ["Hoodie", "Waterproof", "Thermal", "PrimaLoft"],
    capacity: ["M", "L", "XL"],
  },
};

const CONDITIONS = ["baru", "sangat_baik", "baik"];
const PRICES = [45000, 60000, 75000, 50000, 80000, 65000, 55000, 90000, 40000, 100000];

function buildItems() {
  const items = [];
  const cats = Object.keys(CATEGORY_DEFS);
  for (const cat of cats) {
    const def = CATEGORY_DEFS[cat];
    for (let i = 0; i < 10; i++) {
      const kind = def.kind[i % def.kind.length];
      const suffix = def.suffix[i % def.suffix.length];
      const capacity = def.capacity[i % def.capacity.length];
      const name = `${kind} ${suffix}`;
      items.push({
        id: randomUUID(),
        category: cat,
        name,
        price: PRICES[i % PRICES.length],
        stock: 1 + ((i * 3) % 12),
        condition: CONDITIONS[i % CONDITIONS.length],
        capacity,
        img: px(IMG_POOL[cat][i % IMG_POOL[cat].length]),
        description: `${name} siap sewa untuk kebutuhan pendakian. Kondisi terjaga dan layak dipakai di jalur gunung sekitar Malang Raya.`,
      });
    }
  }
  return items;
}

const items = buildItems();

async function post(path, body, method = "POST") {
  const res = await fetch(`${URL}${path}`, {
    method,
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    // 406 (konflik index unik) dibiarkan lewat agar idempotent-friendly
    throw new Error(`${method} ${path} -> ${res.status}: ${text.slice(0, 500)}`);
  }
  return res.status === 204 ? null : await res.json().catch(() => null);
}

async function del(path) {
  const res = await fetch(`${URL}${path}`, { method: "DELETE", headers });
  if (!res.ok && res.status !== 404) {
    throw new Error(`DELETE ${path} -> ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  return res.status;
}

async function get(path) {
  const res = await fetch(`${URL}${path}`, { headers });
  if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`);
  return await res.json().catch(() => []);
}

async function main() {
  console.log("Introspect schema...");
  const cols = await introspect();
  console.log("  equipment      :", cols.equipment.join(", "));
  console.log("  vendors        :", cols.vendors.join(", "));
  console.log("  equipment_images :", cols.equipment_images.join(", "));

  const eqCols = cols.equipment;
  if (!eqCols.includes("price_per_day")) {
    console.error("Kolom price_per_day tidak ada di tabel equipment. Batalkan.");
    process.exit(1);
  }
  const stockCol = eqCols.includes("stock") ? "stock" : eqCols.includes("total_stock") ? "total_stock" : null;
  if (!stockCol) {
    console.error("Kolom stok (stock/total_stock) tidak ditemukan. Batalkan.");
    process.exit(1);
  }

  // ── Vendor target ──
  let vendorId = null;
  const vSel = cols.vendors.includes("is_active") ? "is_active" : null;
  const vendorSelect = vSel ? `?select=id,business_name&${vSel}=eq.true&limit=1` : "?select=id,business_name&limit=1";
  const vr = await fetch(`${URL}/rest/v1/vendors${vendorSelect}`, { headers });
  const existing = vr.ok ? await vr.json() : [];
  vendorId = existing[0]?.id ?? null;

  if (!vendorId) {
    throw new Error(
      "Tidak ada vendor aktif. Buat vendor dulu lewat app (profil > vendor) lalu jalankan ulang."
    );
  }
  console.log("Pakai vendor:", existing[0].business_name, "(", vendorId, ")");

  console.log(`Akan insert ${items.length} item + ${items.length} gambar. Dry-run=${DRY}`);
  const autoYes = process.argv.includes("--yes") || process.argv.includes("-y");
  if (!DRY && !autoYes) {
    const proceed = await confirm("Lanjut menulis ke Supabase? (y/N) ");
    if (proceed !== "y") { console.log("Dibatalkan."); return; }
  }

  if (!DRY) {
    // Bersihkan sisa insert parsial milik seed ini (identifikasi lewat equipment yang punya gambar)
    const imgRows = await get("/rest/v1/equipment_images?select=equipment_id").catch(() => []);
    const imgIds = [...new Set(imgRows.map((r) => r.equipment_id))];
    if (imgIds.length) {
      await del(`/rest/v1/equipment_images?equipment_id=in.(${imgIds.join(",")})`).catch(() => {});
      await del(`/rest/v1/equipment?id=in.(${imgIds.join(",")})`).catch(() => {});
      console.log(`  bersihkan parsial: ${imgIds.length} item terkait gambar dihapus`);
    }
  }

  // Insert equipment (id eksplisit) dalam batch
  const chunk = 12;
  let inserted = 0;
  for (let i = 0; i < items.length; i += chunk) {
    const batch = items.slice(i, i + chunk);
    const rows = batch.map((it) => {
      const row = {
        id: it.id,
        vendor_id: vendorId,
        name: it.name,
        category: it.category,
        description: it.description,
        price_per_day: it.price,
        condition: it.condition,
        capacity: it.capacity,
        is_active: true,
      };
      row[stockCol] = it.stock;
      return row;
    });
    if (DRY) {
      inserted += rows.length;
      continue;
    }
    await post(
      `/rest/v1/equipment?select=id`,
      rows,
      "POST"
    );
    inserted += rows.length;
    console.log(`  equipment ${inserted}/${items.length}...`);
  }

  // Insert equipment_images
  if (!DRY) {
    for (let i = 0; i < items.length; i += chunk) {
      const batch = items.slice(i, i + chunk);
      const imgRows = batch.map((it) => ({
        equipment_id: it.id,
        url: it.img,
        is_primary: true,
        sort_order: 0,
      }));
      await post("/rest/v1/equipment_images?select=equipment_id", imgRows);
      console.log(`  images ${Math.min(i + chunk, items.length)}/${items.length}...`);
    }
  }

  console.log("\nSELESAI.");
  console.log("Jumlah equipment terproses:", inserted);
  if (DRY) {
    console.log("\nMODE KERING — tidak ada perubahan ke DB. Jalankan tanpa --dry untuk eksekusi.");
  }
}

// confirm() sederhana (ESM-safe)
function confirm(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (a) => { rl.close(); resolve(a.trim().toLowerCase()); }));
}

main().catch((e) => { console.error("ERROR:", e); process.exit(1); });