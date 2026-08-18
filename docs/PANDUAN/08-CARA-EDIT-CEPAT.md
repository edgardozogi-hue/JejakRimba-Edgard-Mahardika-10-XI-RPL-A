# 08 — Cara Edit Cepat (Lembar Contekan)

Lembar contekan "ubah X → buka file Y → edit baris Z". Gunakan halaman ini bila ingin mengganti teks/tampilan tanpa membaca panduan lengkap. Semua rujukan baris mengikuti kode saat ini (pembaruan terakhir).

> **Cara pakai:** Cari apa yang ingin kamu ubah di kolom kiri. Buka file di kolom tengah. Sunting bagian di lokasi yang tertera.

---

## 1. Teks & Tampilan Halaman (Frontend)

| Ingin mengubah | Buka file | Lokasi |
|---|---|---|
| Nama/logo brand | `app/components/Navbar.tsx` | bagian brand/logo (sekitar baris 50–58) |
| Tagline hero di beranda | `app/page.tsx` | baris ~14–17 |
| Deskripsi beranda | `app/page.tsx` | baris ~20–24 |
| Alat unggulan beranda | `app/actions/equipment.ts` | `getEquipmentList` |
| Filter/sort katalog | `app/katalog/CatalogClient.tsx` | bagian filter & sort |
| Pesan "tidak ada alat" | `app/katalog/CatalogClient.tsx` | bagian empty state |
| Harga & stok alat | dashboard Supabase | tabel `equipment` |
| Isi pertanyaan FAQ | `app/faq/page.tsx` | array `faqs` (baris 9–42) |
| Isi kebijakan privasi | `app/kebijakan-privasi/page.tsx` | array `sections` (baris 8–39) |
| Isi syarat & ketentuan | `app/syarat-ketentuan/page.tsx` | array `sections` (baris 8–39) |
| Menu profil | `app/profil/page.tsx` | array `links` (baris 21–40) |
| Label tombol "Keluar" | `app/profil/page.tsx` | baris 139–146 & 206–213 |
| Judul dashboard vendor | `app/profil/dashboard-vendor/page.tsx` | `title`/`description` (baris 7–9) |
| Section pengaturan | `app/profil/pengaturan/page.tsx` | baris 163–247 |

## 2. Form & Alur (Login, Daftar, Booking)

| Ingin mengubah | Buka file | Lokasi |
|---|---|---|
| Pesan error login | `app/masuk/page.tsx` | baris 40 |
| Placeholder email login | `app/masuk/page.tsx` | baris 79 |
| Label peran Penyewa/Vendor | `app/daftar/page.tsx` | baris 175, 189 |
| Syarat password daftar | `app/daftar/page.tsx` | baris 205 & validasi baris 41–48 |
| Teks sukses reset password | `app/lupa-password/page.tsx` | baris 64–67 |
| Placeholder tanggal booking | `app/booking/page.tsx` | bagian input tanggal |
| Harga satuan per hari | dashboard Supabase | tabel `equipment` → `price_per_day` |

## 3. Logika & Data (Backend)

| Ingin mengubah | Buka file | Lokasi |
|---|---|---|
| Rumus total harga sewa | `app/actions/booking.ts` | baris 64–68 |
| Halaman yang wajib login | `middleware.ts` | baris 34 (`protectedRoutes`) |
| Status mapping pembayaran | `app/api/midtrans-webhook/route.ts` | baris 45–59 |
| Tambah kategori alat | `app/lib/database.types.ts` + Supabase | `CATEGORY_MAP` (baris ~30) |
| Ambil ulasan testimoni | `app/actions/review.ts` | `getTestimonials` |
| Konfigurasi Midtrans | `app/lib/midtrans.ts` | seluruh file |
| Kunci Supabase/Midtrans | `.env.local` | lihat `07-BACKEND-DATA.md` |

## 4. Warna, Font, Tampilan Global

| Ingin mengubah | Buka file | Lokasi |
|---|---|---|
| Warna tema (oranye -ember) | `app/globals.css` | baris 9–48 (variabel CSS) |
| Ukuran/ketebalan font | `app/globals.css` | variabel tipografi |
| Kecepatan animasi global | `app/lib/animations.ts` | `spring`, `fadeUp`, dll |
| Tampilan transisi halaman | `app/components/PageTransition.tsx` | seluruh file |

---

## 5. Peringatan Penting Sebelum Mengedit

1. **Kunci rahasia** (`SUPABASE_SERVICE_ROLE_KEY`, `MIDTRANS_SERVER_KEY`) hanya boleh di server; jangan pernah dipindah ke file `"use client"` atau di-publish.
2. **Jangan mengubah** `.gitignore` sehingga `.env.local` ikut ter-commit.
3. Setelah mengubah file `.tsx`, simpan lalu **restart dev server** bila perlu (`npm run dev`). Beberapa perubahan langsung tampil saat file disimpan.
4. Untuk **data alat/booking sesungguhnya**, ubah di **dashboard Supabase** (Table Editor), bukan di file. Perubahan pada katalog mungkin butuh ~1 menit karena cache 60 detik.
5. Sebelum membangun ulang untuk produksi, jalankan **`npm run build`** untuk memastikan tidak ada error.

---

## 6. Struktur File Utama (Pengingat)

```
app/
  page.tsx                    → beranda
  katalog/                    → halaman katalog & detail alat
  booking/                    → pemesanan & pembayaran
  masuk, daftar, lupa-password→ autentikasi
  profil/                     → profil, dashboard vendor, pengaturan
  faq, kebijakan-privasi, syarat-ketentuan → halaman teks
  components/                 → komponen UI (Navbar, Footer, dsb.)
  actions/                    → Server Actions (logika/data)
  lib/                        → utilitas, tipe, koneksi DB
  api/                        → webhook & callback
middleware.ts                 → proteksi rute
.env.local                    → kunci rahasia (jangan di-publish)
```

---

## 7. Ringkasan

- **Tampilan/teks** → edit langsung di `page.tsx` / `components`.
- **Logika/data** → edit di `app/actions/`.
- **Data alat/booking sesungguhnya** → kelola di dashboard Supabase.
- **Konfigurasi** → `globals.css` (tampilan), `.env.local` (rahasia), `middleware.ts` (proteksi).

Seluruh panduan ini selesai. Bila kamu ingin menambahkan fitur baru atau memahami alur lebih dalam, gunakan `00-README.md` sebagai titik masuk untuk membaca bagian yang relevan.