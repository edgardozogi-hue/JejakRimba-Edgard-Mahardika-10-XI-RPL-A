# 06 — Halaman Teks Statis (FAQ, Kebijakan Privasi, Syarat & Ketentuan)

Bagian ini membahas tiga halaman berisi **teks/bacaan** yang mudah diubah karena datanya ditulis langsung di `page.tsx` masing-masing. Tidak ada koneksi database; cukup ubah teks lalu simpan.

Halaman yang dibahas:
1. `app/faq/page.tsx` — pertanyaan yang sering diajukan
2. `app/kebijakan-privasi/page.tsx` — kebijakan privasi
3. `app/syarat-ketentuan/page.tsx` — syarat & ketentuan

---

## 1. Pola Umum Tiga Halaman Ini

Ketiga file `page.tsx` ini punya pola yang sama:
- Diawali `"use client"` (karena memakai animasi `framer-motion`).
- Mendefinisikan **array data bernama `faqs` / `sections`** di bagian atas.
- Menampilkan array itu dengan `map()` di bagian `return`.

**Artinya:** Untuk mengubah isi teks, kamu tidak perlu menyentuh bagian tampilan. **Cukup ubah data di array** pada bagian atas file.

---

## 2. FAQ — `app/faq/page.tsx`

**Fungsi:** Menampilkan daftar pertanyaan & jawaban dalam bentuk **accordion** (bisa dibuka/tutup).

**Jenis file:** `"use client"`.

### 2.1 Mengubah Pertanyaan & Jawaban (Penting)

**Lokasi:** array **`faqs`** di **baris 9–42**.
```tsx
const faqs = [
  {
    q: "Bagaimana cara menyewa alat?",
    a: "Pilih alat yang diinginkan melalui halaman Katalog, lalu klik Sewa Sekarang. ...",
  },
  {
    q: "Di mana lokasi pengambilan alat?",
    a: "...",
  },
  // dst
];
```

**Cara menambah item FAQ:** salin blok satu item lalu ubah teksnya:
```tsx
  {
    q: "Apakah ada biaya tambahan?",
    a: "Tidak ada. Harga yang tertera sudah termasuk biaya sewa sesuai durasi.",
  },
```
Pastikan setiap item **ditutup koma** di antara item-item (kecuali item terakhir). Jumlah FAQ otomatis menyesuaikan jumlah item.

**Cara menghapus item:** hapus blok `{ ... }` milik pertanyaan tersebut.

### 2.2 Mengubah Teks Halaman (Header)
- Label "TANYA JAWAB" → **baris 96–98**.
- Judul "FAQ" → **baris 99–101**.
- Keterangan → **baris 105–107**.

> **Catatan perilaku:** Saat halaman dibuka, FAQ pertama dalam keadaan terbuka karena `openIndex` dimulai dari 0 (**baris 81**).

---

## 3. Kebijakan Privasi — `app/kebijakan-privasi/page.tsx`

**Fungsi:** Menampilkan kebijakan privasi dalam beberapa bagian teks.

**Jenis file:** `"use client"`.

### 3.1 Mengubah Isi Bagian

**Lokasi:** array **`sections`** di **baris 8–39**.
```tsx
const sections = [
  {
    title: "1. Informasi yang Kami Kumpulkan",
    content: "Kami mengumpulkan informasi yang Anda berikan saat mendaftar ...",
  },
  {
    title: "2. Penggunaan Informasi",
    content: "...",
  },
  // dst
];
```
**Cara ubah:** Sunting `title` (judul bagian) dan `content` (isi paragraf). Tambah/hapus blok item sesuai kebutuhan — halaman otomatis menyesuaikan.

### 3.2 Mengubah Teks Halaman
- Label "DOKUMEN" → **baris 55–57**.
- Judul "Kebijakan Privasi" → **baris 58–60**.
- "Terakhir diperbarui: Juli 2026" → **baris 64–66**. **Ubah tanggal** di sini jika perlu.

---

## 4. Syarat & Ketentuan — `app/syarat-ketentuan/page.tsx`

**Fungsi:** Menampilkan syarat & ketentuan dalam beberapa bagian teks.

**Jenis file:** `"use client"`.

### 4.1 Mengubah Isi Bagian

**Lokasi:** array **`sections`** di **baris 8–39**.
```tsx
const sections = [
  { title: "1. Ketentuan Umum", content: "..." },
  { title: "2. Pemesanan", content: "..." },
  { title: "3. Pembayaran", content: "..." },
  // dst
];
```
**Cara ubah:** Sama seperti kebijakan privasi — ubah `title` & `content`.

### 4.2 Mengubah Teks Halaman
- Label "DOKUMEN" → **baris 55–57**.
- Judul "Syarat & Ketentuan" → **baris 58–60**.
- "Terakhir diperbarui: Juli 2026" → **baris 64–66**.

---

## 5. Ringkasan Cepat

| Ingin mengubah | Buka file | Lokasi |
|---|---|---|
| Isi pertanyaan & jawaban FAQ | `app/faq/page.tsx` | baris 9–42 |
| Judul FAQ | `app/faq/page.tsx` | baris 99–101 |
| Isi kebijakan privasi | `app/kebijakan-privasi/page.tsx` | baris 8–39 |
| Tanggal "Terakhir diperbarui" (privasi) | `app/kebijakan-privasi/page.tsx` | baris 64-66 |
| Isi syarat & ketentuan | `app/syarat-ketentuan/page.tsx` | baris 8–39 |
| Tanggal "Terakhir diperbarui" (syarat) | `app/syarat-ketentuan/page.tsx` | baris 64-66 |

---

Lanjut ke **[07-BACKEND-DATA.md](07-BACKEND-DATA.md)** untuk memahami data, database, dan konfigurasi.