# Modul 8 — API Route + Pembayaran (Webhook)

Modul ini menjelaskan jalur khusus di mana **server menerima permintaan dari luar**, bukan hanya dari halaman aplikasi sendiri. Ini dipakai untuk menerima **notifikasi pembayaran** (Midtrans webhook) di `app/api/midtrans-webhook/route.ts` project asli.

---

## 🥅 Target

Setelah modul ini kamu bisa:
- Menjelaskan **Route Handler** (`route.ts`) & bedanya dengan `page.tsx`
- Membuat `GET`/`POST` route handler sederhana
- Menjelaskan **webhook** (server menerima sinyal dari layanan lain)
- Memahami alur midtrans: `createSnapToken` → menjadi `midtrans-webhook`
- Mengerti verifikasi signature & keamanan webhook

---

## 📖 Penjelasan panjang

### 8.1 Route Handler (`route.ts`) — "lawan bicara" dari luar

Kamu telah kenal `page.tsx` (mengirim **HTML** tampilan). **Route Handler** (`route.ts`) mengembalikan **data (JSON)** dan menangkap permintaan HTTP (`GET`, `POST`, dll.). Ini cara aplikasi "berbicara" dengan dunia luar / API lain.

```
file di app:
  page.tsx   →  menghasilkan HALAMAN (HTML) untuk dikunjungi pengguna
  route.ts   →  menghasilkan RESPONSE (JSON) untuk ditanya/dipanggil kode lain
```

Bentuk:
```ts
// app/api/hello/route.ts
export async function GET(request: Request) {
  return Response.json({ pesan: "Halo dari API" });
}
```
Maka `GET http://localhost:3000/api/hello` → `{"pesan":"Halo dari API"}`.

**Aturan:** Route Handler hanya di dalam folder `app/`. Tidak boleh ada `route.ts` dan `page.tsx` di level folder yang sama.

### 8.2 Webhook — pintu "akibat" dari layanan lain

**Webhook** = layanan pihak ketiga memanggil URL-mu saat *ada kejadian*, tanpa kamu harus menanya terus-menerus.

**Analogi:** kamu memesan makanan lewat aplikasi driver. Aplikasi driver **menelepon kantormu** ("pesanan sudah sampai") — bukan kamu yang menelpon memeriksa tiap detik. Telepon itu = webhook; dapurmu = server; berita "sampai/tidak" = status pembayaran.

**Di project asli:** Midtrans = aplikasi driver. Ia memanggil `/api/midtrans-webhook` saat pembayaran berubah (settlement/gagal), lalu server memperbarui tabel `transactions` & `bookings`.

```
[Browser] buat booking
    → Server buat token (createSnapToken di app/actions/midtrans.ts)
    → Midtrans menampilkan Snap (pembayaran)
    → Midtrans memanggil WEBHOOK /api/midtrans-webhook  (server terima status)
    → Server perbarui transaction & booking
```

### 8.3 Kenapa webhook (bukan cuma form)? 

Pembayaran butuh konfirmasi dari **pihak yang terpercaya** (Midtrans), bukan hanya buletin dari browser (yang bisa dipalsukan). Webhook memberi tahu server status nyata. Ini alasan *verifikasi signature* penting: memastikan request yang datang benar-benar dari Midtrans.

### 8.4 Alur lengkap di project asli (buka kedua file)

**a) `app/actions/midtrans.ts`**
- `createSnapToken(bookingId)` → membuat **token** (semacam "kode bayar") dengan mencari booking, lalu memanggil API Midtrans dengan `MIDTRANS_SERVER_KEY`. Pemanggilan Midtrans ini terjadi **di server** (kunci rahasia tidak bocor).

**b) `app/api/midtrans-webhook/route.ts`**
- `POST` menerima data dari Midtrans (`order_id`, `transaction_status`, `signature_key`...).
- `verifySignature` memeriksa tanda tangan (keamanan).
- Memetakan status → status booking, lalu update database via service role key (server).

> **Catatan versi:** Kelola environment `MIDTRANS_IS_PRODUCTION` → jika `false` memakai **sandbox**; jika `true` memakai produksi. Di modul 12 kamu menyiapkan kunci sandbox.

### 8.5 Keamanan webhook (wajib dipahami)

- **Verifikasi signature**: hindari memercayai request palsu yang berpura-pura dari Midtrans.
- **Jangan pernah** menaruh `MIDTRANS_SERVER_KEY`/`SUPABASE_SERVICE_ROLE_KEY` di file `"use client"`; semuanya diproses di server.
- Route handler webhook memakai **POST** (tidak di-cache), cocok untuk menerima status berubah.

---

## 🛠️ Tutorial step-by-step

Kita buat route handler + simulasi "webhook pembayaran mini" di `latihan-next`. (Integrasi Midtrans asli: Modul 12.)

### Langkah 1 — buat route handler dasar

Buat `app/api/status/route.ts`:

```ts
export async function GET() {
  return Response.json({ ok: true, layanan: "Jejak Rimba Mini" });
}
```

Buka `http://localhost:3000/api/status` → JSON muncul.

### Langkah 2 — buat endpoint untuk menerima "konfirmasi bayar"

Buat `app/api/pembayaran/mini-webhook/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";

// simulasi "database" status pesanan di memori
// dalam project asli, ini tabel transactions & bookings di Supabase
const pesanan = new Map<string, { status: string }>();

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { orderId, status } = body;

  if (!orderId || !status) {
    return NextResponse.json({ error: "data tidak lengkap" }, { status: 400 });
  }

  // otorisasi sederhana: terima "penanda" tertentu saja (media belajar)
  if (body.token !== "RAHASIA-MINI") {
    return NextResponse.json({ error: "tanda tangan invalid" }, { status: 401 });
  }

  pesanan.set(orderId, { status });
  return NextResponse.json({ ok: true, status });
}

export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get("orderId");
  return NextResponse.json({ pesanan: pesanan.get(orderId ?? "") ?? null });
}
```

### Langkah 3 — halaman yang memicu simulasi bayar

Buat `app/pembayaran/demo/page.tsx` (Client) yang memanggil webhook ini dan membaca hasilnya:

```tsx
"use client";
import { useState } from "react";

export default function DemoBayar() {
  const [hasil, setHasil] = useState<string>("");

  const bayar = async (status: string) => {
    const orderId = "ORD-" + Date.now();
    const res = await fetch("/api/pembayaran/mini-webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status, token: "RAHASIA-MINI" }),
    });
    const data = await res.json();
    setHasil(`Pesanan ${orderId}: ${JSON.stringify(data)}`);
  };

  return (
    <div className="max-w-sm mx-auto mt-10 space-y-3 text-center">
      <h1 className="text-2xl font-bold">Demo Bayar</h1>
      <div className="flex gap-2 justify-center">
        <button onClick={() => bayar("settlement")} className="bg-green-600 text-white px-4 py-2 rounded">Bayar Berhasil</button>
        <button onClick={() => bayar("cancel")} className="bg-red-500 text-white px-4 py-2 rounded">Batal</button>
      </div>
      {hasil && <p className="text-sm">{hasil}</p>}
    </div>
  );
}
```

Uji: klik tombol → server menerima "konfirmasi", lalu status tersimpan di `Map` memori. Ini **meniru inti webhook**: server menerima status dari "pihak luar" dan menyimpannya.

> Pindah ke Supabase/Midtrans asli = mengganti `pesanan Map` dengan update tabel `transactions`/`bookings`, dan validasi token dengan `verifySignature` sungguhan (Modul 12).

---

## ✋ Tugas Manual (TANPA AI)

1. **Gambar alur** di kertas alur webhook project asli: `Browser → createSnapToken → Midtrans → /api/midtrans-webhook → update transaction & booking`. Labeli HTTP method tiap langkah & di mana verifikasi signature.
2. **Tulis ulang** `app/api/pembayaran/mini-webhook/route.ts` di file latihan, beri komentar tiap bagian (kenapa `POST`, kenapa validasi token, kenapa JSON).
3. **Tambahkan endpoint `DELETE`** di route handler `mini-webhook` yang menghapus pesanan berdasarkan `orderId`, lalu uji dari halaman. Jelaskan bedanya method HTTP.

---

## 🤖 Prompt ke AI (bimbingan)

```text
Saya di modul 8. Saya tidak paham kenapa pembayaran perlu webhook dan kenapa perlu
verifikasi signature, mengapa tidak cukup hanya mengandalkan tombol "sudah bayar"
di halaman. Jelaskan pakai analogi dan beri 1 latihan kecil untuk saya ketik, tanpa
langsung jawaban akhir.
```

```text
Saya error ketika fetch POST ke /api/... (404 / 405 / [tempel]). Ini kode route [tempel],
ini pemanggilan [tempel]. Bantu saya menemukan masalah lewat pertanyaan bertingkat.
```

---

## ✅ Checkpoint (jawaban di `11-JAWABAN-CHECKPOINT.md`)

1. Apa beda `page.tsx` dan `route.ts`?
2. Apa itu webhook? Kenapa dibutuhkan untuk konfirmasi pembayaran?
3. Kenapa route handler webhook sebaiknya `POST` dan tidak di-cache?
4. Apa bahaya kalau server tidak memverifikasi signature webhook?
5. Sebutkan persamaan inti antara "simulasi Map" di modul ini dan `transactions`/`bookings` di `midtrans-webhook` asli.

---

## 🧠 Refleksi (tulis di notes-mu)

- Kenapa server tidak boleh percaya begitu saja pada status yang dikirim browser?
- Sebutkan dua alasan kunci di-balik "kunci rahasia hanya di server" saat membangun pembayaran.
- Apa yang berubah secara konseptual saat pindah dari "Map memori" ke tabel Supabase sungguhan?

---

**Lanjut ke [Modul 9 — Middleware + Framer Motion + Deploy](09-MIDDLEWARE-ANIMASI-DEPLOY.md).**