# Modul 6 — Server Actions + Supabase

Sekarang kita masuk bagian "otak": bagaimana project asli mengambil data (Supabase) dan memprosesnya lewat **Server Actions**. Ini jembatan dari soal "tampilan" ke soal "data & logika" — tepatnya yang ada di `app/actions/*.ts`.

---

## 🥅 Target

Setelah modul ini kamu bisa:
- Menjelaskan Server Action (`"use server"`) & kapan dipakai
- Menjelaskan peran Supabase sebagai database cloud
- Menjelaskan client browser vs client server (`supabase.ts` vs `supabase-server.ts`)
- Mengganti data hardcoded di mini project menjadi data dari "database" sederhana
- Mengenali pola `getEquipmentList` & `createBooking` di project asli

---

## 📖 Penjelasan panjang

### 6.1 Dari "data di dalam file" ke "data di mana-mana"

Sampai modul 5, data alat (nama, harga, stok) **hardcoded** di dalam file `App.tsx`/komponen. Masalahnya:
- Kalau ubah data, harus ubah kode & build ulang.
- Kalau 2 pengguna ingin akses data yang sama, tidak bisa berbagi.

**Solusinya: pindahkan data ke "gudang terpusat"** — sebuah **database**. Project asli memakai **Supabase** (database cloud dibayar gratis untuk project kecil). Data ada di server Supabase; aplikasi membaca & menulis ke sana.

```
Sebelum:  data ↘ di dalam komponen (statis, per-device)
Sesudah:  data ↘ di Supabase (satu sumber kebenaran) → aplikasi membacanya via API
```

### 6.2 Supabase: database + auth dalam satu layanan

Supabase punya beberapa bagian yang kita pakai:
- **PostgreSQL database** → menyimpan tabel (`equipment`, `bookings`, `profiles`, ...).
- **Auth** → login, register, session (modul 7).
- **Storage** (opsional) → tempat upload gambar.
- **Dashboard** di `supabase.com` → mengelola tabel & melihat data tanpa menulis kode.

Koneksi ke Supabase dari code memakai **client**. Ada dua jenis (lihat `app/lib/supabase.ts` dan `supabase-server.ts`):

| Client | Dipakai di | Keunggulan |
|---|---|---|
| Browser client (`createBrowserClient`) | komponen `"use client"` | bisa langsung dari UI |
| Server client (`getServerClient()`) | Server Actions (`actions/`) | kunci server aman, tidak bocor ke browser |

### 6.3 Server Action — "kasir" yang berjalan di server

**Server Action** = fungsi yang bertanda `"use server"` di baris pertama, berjalan **di server** (bukan browser). Browser mengirim "pesanan" lewat request; server yang mengolah (termasuk akses Supabase server dan kunci rahasia).

**Analogi:** halaman = etalase (tampilan); Server Action = kasir & gudang (menerima permintaan, mengurus data). **Kunci rahasia tidak pernah sampai ke browser** karena semuanya diproses di server.

```ts
// app/actions/alat.ts
"use server";
import { getServerClient } from "@/lib/supabase-server";

export async function getAlatList() {
  const supabase = getServerClient();
  const { data, error } = await supabase.from("equipment").select("*");
  if (error) throw new Error(error.message);
  return data;
}
```

Fungsi ini dipanggil dari halaman/komponen. Muncul sinkron (lewat `await`) di belakang layar.

### 6.4 Cara membedakan penulisan "use server"

Ada dua gaya (keduanya dipakai di docs & project):
1. **File seluruhnya Server Actions:** taruh `"use server";` di **baris pertama file** → semua `export async function` menjadi action.
2. **Per-fungsi:** taruh `"use server"` di dalam tubuh fungsi tertentu.

File `app/actions/*.ts` di project asli memakai gaya **file-level** (`"use server"` di atas). Cara ini rapi untuk mengelompokkan aksi per domain (auth, booking, review, equipment, midtrans).

### 6.5 Perbedaan baca vs tulis

- **Baca data** (menampilkan) → biasanya di **Server Component** (halaman) langsung, atau lewat Server Action `getXList()`.
- **Tulis/ubah data** (booking, review, daftar) → lewat **Server Action** `createX()` di dalam form / event handler.

Contoh pola project asli di `app/actions/booking.ts` `createBooking`:
1. Cek user login.
2. Validasi tanggal & stok.
3. Hitung total harga.
4. **Tulis ke Supabase.**
5. Redirect / beri kabar.

Ini inti logika bisnis — bukan hanya "menampilkan".

### 6.6 Security: verifikasi di server

Karena Server Action bisa dipanggil langsung lewat POST (tidak hanya lewat UI), **wajib** cek autentikasi/otorisasi **di dalam** setiap action. Jangan percaya input dari client. Pola di project: `if (!user) throw / redirect`. Ini pelajaran penting sejak awal (akan dibahas lagi di modul 7).

### 6.7 Revalidate setelah ubah data

Setelah mutasi, server perlu "menyegarkan" cache agar UI menampilkan data terbaru. Pola:
- `revalidatePath("/katalog")` — bersihkan cache untuk path.
- `redirect("/katalog")` — pindah halaman setelah aksi.

Keduanya sering dipakai setelah `createBooking`/`createReview` di project asli.

---

## 🛠️ Tutorial step-by-step

Kita praktikkan **Server Action sederhana + data dari array "server"** dulu (tanpa akun), lalu pengenalan pola Supabase. Ini biar fokus ke konsep tanpa tersendat setup akun.

> Setup **Supabase asli** (buat project, ambil kunci, isi `.env`) ada di **Modul 12 (BONUS)**. Di sini kita pakai "database mini" berupa array di sisi server supaya mekanismenya terbangun (pindah ke Supabase = tinggal ganti sumber data).

### Langkah 1 — buat file Server Action di `latihan-next`

Buat folder `lib/` di dalam `latihan-next` lalu file `app/actions/katalog.ts`:

```ts
"use server";

// "Gudang data" sementara = array di sisi server
let daftarAlat = [
  { nama: "Tenda Dome", harga: 50000 },
  { nama: "Carrier 60L", harga: 40000 },
  { nama: "Sleeping Bag", harga: 20000 },
];

export async function ambilAlat() {
  // meniru panggilan database yang async
  return daftarAlat;
}
```

### Langkah 2 — gunakan di Server Component (halaman katalog)

Ubah `app/katalog/page.tsx` menjadi server component yang memanggil aksi:

```tsx
import { ambilAlat } from "../actions/katalog";

export default async function KatalogPage() {
  const daftar = await ambilAlat();
  return (
    <div>
      <h1 className="text-2xl font-bold">Katalog Alat</h1>
      <ul>
        {daftar.map(a => (
          <li key={a.nama}>{a.nama} - Rp {a.harga}/hari</li>
        ))}
      </ul>
    </div>
  );
}
```

**Perhatikan:** halaman ini **server component** (tidak `"use client"`) — mengambil data lewat action langsung. Buka `/katalog`, data muncul.

### Langkah 3 — tambah aksi untuk "menyewa" (mutasi)

Tambahkan di `app/actions/katalog.ts`:

```ts
export async function sewaAlat(formData: FormData) {
  const nama = formData.get("nama")?.toString() ?? "";
  const jumlahHari = Number(formData.get("jumlahHari") ?? 0);
  const alat = daftarAlat.find(a => a.nama === nama);

  if (!alat) {
    return { ok: false, pesan: "Alat tidak ditemukan" };
  }

  return {
    ok: true,
    pesan: `Berhasil: ${nama} untuk ${jumlahHari} hari, total Rp ${alat.harga * jumlahHari}`,
  };
}
```

### Langkah 4 — buat form yang memanggil action

Buat `app/katalog/FormSewa.tsx` (Client Component, karena memakai `useState` untuk pesan):

```tsx
"use client";
import { useState } from "react";
import { sewaAlat } from "../actions/katalog";

export default function FormSewa() {
  const [pesan, setPesan] = useState("");

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const hasil = await sewaAlat(fd);
        setPesan(hasil.pesan);
      }}
      className="mt-6 space-y-2"
    >
      <input name="nama" placeholder="Nama alat (Tenda Dome)" className="border p-2 rounded" />
      <input name="jumlahHari" type="number" placeholder="Jumlah hari" className="border p-2 rounded" />
      <button type="submit" className="bg-orange-500 text-white px-4 py-2 rounded">Sewa</button>
      {pesan && <p className="text-sm">{pesan}</p>}
    </form>
  );
}
```

Panggil `<FormSewa />` di `app/katalog/page.tsx` (server component boleh memuat client component). Submit → pesan muncul. Ini siklus **client memanggil aksi server → server memproses → hasil kembali**.

### Langkah 5 — (persiapan Supabase) kenali file lib di project asli

Buka di project asli:
- `app/lib/supabase.ts` → browser client.
- `app/lib/supabase-server.ts` → `getServerClient()` untuk action.
- `app/actions/equipment.ts` → `getEquipmentList` (dari Supabase bukan array) & `getEquipmentById`.
- `app/lib/database.types.ts` → tipe bentuk tabel (dari modul 4).

Bandingkan: `getEquipmentList` di project asli mirip `ambilAlat`, hanya sumbernya Supabase (`.from("equipment").select(...)`) bukan array. **Konsep sama, sumber data berbeda.**

---

## ✋ Tugas Manual (TANPA AI)

1. **Tulis ulang** `app/actions/katalog.ts` dengan tangan di file `latihan/tulis-ulang-actions.ts`, beri komentar jelas tiap baris: apa yang terjadi, kenapa `"use server"`, kenapa async.
2. **Gambar alur** di kertas: `Browser (FormSewa)` → `POST` → `Server Action sewaAlat` → `array daftarAlat → hasil → kembali ke Browser`. Labeli mana yang jalan di server vs client.
3. **Ubah `ambilAlat`** agar sebuah alat bisa dihapus dari array (tambahkan aksi `hapusAlat(nama)`) dan panggil dari form. Setelahnya, jelaskan kenapa data "berubah" untuk semua pengguna (karena data di array sisi server).

---

## 🤖 Prompt ke AI (bimbingan)

```text
Saya di modul 6. Saya tidak paham kenapa Server Action harus berjalan di server dan
kenapa data array di dalam app/actions/katalog.ts "global" untuk semua pengguna,
sedangkan kalau array di komponen isinya per pengguna. Jelaskan pakai analogi
"kasir & gudang vs meja kasir" lalu beri saya 1 latihan kecil untuk saya ketik.
Jangan kasih jawaban final dulu.
```

```text
Error di app/actions/katalog.ts: [tempel]. Ini kode [tempel]. Bantu saya menemukan
penyebab lewat pertanyaan, tanpa langsung menulis kode perbaikan.
```

---

## ✅ Checkpoint (jawaban di `11-JAWABAN-CHECKPOINT.md`)

1. Apa itu Server Action dan di mana ia menjalankan? Kenapa dipakai untuk akses data?
2. Apa beda browser client dan server client Supabase di project asli? Kapan memakai masing-masing?
3. Mengapa autentikasi/otorisasi **harus** dicek di dalam setiap Server Action (bukan cuma di form)?
4. Setelah mutasi, apa yang biasa dipanggil agar UI menampilkan data terbaru?
5. Bagaimana cara `getEquipmentList` di project asli berubah sumber datanya (array → Supabase) tanpa mengubah pola halaman?

---

## 🧠 Refleksi (tulis di notes-mu)

- Apa beda "menampilkan data" (server component) dan "mengubah data" (server action) dalam bayanganmu?
- Kenapa penting memisahkan logika ke `app/actions/` ketimbang menulis di dalam komponen?
- Melihat `createBooking` di project asli: sebutkan 3 langkah yang dilakukan fungsi itu.

---

**Lanjut ke [Modul 7 — Autentikasi](07-AUTENTIKASI.md).**