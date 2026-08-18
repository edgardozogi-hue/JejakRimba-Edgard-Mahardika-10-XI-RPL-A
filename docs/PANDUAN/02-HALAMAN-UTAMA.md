# 02 — Halaman Utama (Beranda) & Komponen Bersama

Bagian ini membedah halaman **beranda** (`app/page.tsx`) dan **komponen bersama** yang tampil di hampir semua halaman (Navbar, Footer, BottomNav, dan lainnya).

---

## 1. Halaman Beranda — `app/page.tsx`

**Fungsi:** Halaman yang pertama kali dilihat pengguna saat membuka `/`. Berisi hero (pembuka), jalur pendakian, cara kerja, partner, preview katalog, testimoni, dan ajakan bertindak (CTA).

**Jenis file:** `"use client"` (interaktif — ambil data dari server, animasi scroll).

### 1.1 Bagian yang Sering Diubah

Berikut tabel bagian di beranda beserta **di mana** dan **bagaimana** cara mengubahnya.

#### a) Mengubah Teks Hero (judul utama)
**Lokasi:** `app/page.tsx`, sekitar **baris 196–229** (variabel `["Alat", "mendaki", "tersedia,"]` dan `"tanpa perlu beli."`).

Cari kode seperti ini:
```tsx
{["Alat", "mendaki", "tersedia,"].map((word, i) => ( ... ))}
...
tanpa perlu beli.
```

**Cara ubah:** Ganti kata-kata di dalam tanda `[...]`. Setiap kata ditampilkan satu per satu dengan animasi. Contoh ganti menjadi `["Sewa", "alat", "camping,"]`. Pastikan tetap dalam kurung siku dan dipisah koma.

#### b) Mengubah Teks Paragraf di Bawah Hero
**Lokasi:** `app/page.tsx`, **baris 236–239**.
```tsx
Jejak Rimba menghubungkan kamu dengan penyedia sewa alat camping
di sekitar Malang. ...
```
**Cara ubah:** Sunting teks di antara `<motion.p ...>...</motion.p>`.

#### c) Mengubah Tombol CTA (Hero)
**Lokasi:** `app/page.tsx`, **baris 245–257**.
```tsx
<Link href="/katalog" ...>Lihat Katalog Alat</Link>
<a href="#alur" ...>Gimana Cara Sewanya?</a>
```
**Cara ubah:** Ganti teks di dalam tag (`Lihat Katalog Alat`, `Gimana Cara Sewanya?`) atau ganti `href` (alamat tujuan).

#### d) Mengubah Konten "Rute Persiapan" (Journey)
**Lokasi:** `app/page.tsx`, variabel **`journeyStops`** di **baris 32–57**.
```tsx
const journeyStops = [
  { elevation: "0800", label: "Basecamp", desc: "...", icon: Tent },
  { elevation: "1600", label: "Pos Bayangan", desc: "...", icon: Backpack },
  ...
];
```
**Cara ubah:** Edit nilai `elevation`, `label`, `desc`. Anda juga bisa **menambah/menghapus item** dalam daftar (pastikan setiap item punya `icon` yang valid; ikon diambil dari import `lucide-react` di atas file).

#### e) Mengubah Konten "Cara Kerja" (4 langkah)
**Lokasi:** `app/page.tsx`, variabel **`howItWorksSteps`** di **baris 59–80**.
```tsx
const howItWorksSteps = [
  { icon: Compass, title: "Cari Alat", desc: "..." },
  ...
];
```
**Cara ubah:** Sunting `title` dan `desc`. Jumlah langkah otomatis menyesuaikan grid.

#### f) Mengubah Nama Mitra (Partner Badges)
**Lokasi:** `app/page.tsx`, **baris 82**.
```tsx
const partners = ["Rimba Gear Malang", "Alas Camp Batu", "Basecamp Lawang"];
```
**Cara ubah:** Tambah/hapus/ganti nama dalam tanda `[...]`.

#### g) Mengubah Jumlah Statistik (Counter)
**Lokasi:** `app/page.tsx`, **baris 259–266**.
```tsx
<Counter value={totalStock} label="unit tersedia" />
<Counter value={locations.length} label="titik lokasi" />
<Counter value={3} label="mitra penyedia" />
```
- `totalStock` = jumlah stok otomatis dari data (jangan diubah manual).
- `locations.length` = jumlah lokasi otomatis.
- `value={3}` → angka tetap "mitra penyedia". **Ubah angka 3** bila jumlah mitra berubah (misal jadi 5).

#### h) Mengubah Gambar Latar Hero
**Lokasi:** `app/page.tsx`, **baris 165–173**.
```tsx
style={{ backgroundImage: "url(https://images.unsplash.com/...)" }}
```
**Cara ubah:** Ganti URL gambar. Bisa memakai URL lain dari Unsplash atau file di `public/` (contoh: `url(/nama-file.jpg)`).

#### i) Mengubah Foto Kategori di Preview Katalog
**Lokasi:** `app/page.tsx`, **baris 406–414** (objek yang memetakan kategori ke URL gambar).
```tsx
Tenda: "https://...",
Carrier: "https://...",
"Sleeping Bag": "https://...",
```
**Cara ubah:** Ganti URL per kategori.

#### j) Mengubah Teks Testimoni
**Konten testimoni diambil dari data** (lihat `app/actions/review.ts` & database), **bukan** dari file ini. Judul seksi "Cerita dari Puncak" ada di **baris 460–475**.
`mountainNames` (nama gunung) dan `gearRented` ada di **baris 480–482** — bisa kamu sunting.

#### k) Mengubah Teks CTA Akhir ("Siap mendaki?")
**Lokasi:** `app/page.tsx`, **baris 588–616**.
**Cara ubah:** Sunting `<h2>` dan `<p>` dan tombol (`/katalog`, `/daftar`).

---

## 2. Komponen Bersama (Folder `app/components/`)

Komponen ini **dipakai ulang** di banyak halaman. Ubah di sini → berlaku di semua halaman.

### 2.1 Navbar — `app/components/Navbar.tsx`
**Fungsi:** Bar navigasi atas: logo, menu, tombol tema, pencarian, dan status login.

**Cara mengubah menu:**
**Lokasi:** **baris 11–15**.
```tsx
const NAV_ITEMS = [
  { href: "/", label: "Beranda" },
  { href: "/katalog", label: "Katalog" },
  { href: "/booking", label: "Booking Saya" },
];
```
**Ubah:** Tambah/ganti `{ href: "/path", label: "Nama Menu" }`. Pastikan path sesuai folder di `app/`.

**Tombol tema (dark/light):** Otomatis, jangan diubah. **Pencarian (Ctrl K):** Saran pada modal ada di **baris 17–33** (`QUICK_SEARCHES`, `POPULAR_GEAR`) — kamu bisa ubah daftar kata kunci.

### 2.2 Footer — `app/components/Footer.tsx`
**Fungsi:** Kaki halaman: brand, navigasi, bantuan, kontak, sosial.

**Cara mengubah:**
- **Menu Navigasi:** **baris 7–12** (`navLinks`).
- **Menu Bantuan:** **baris 14–19** (`bantuanLinks`).
- **Sosial media:** **baris 21–25** (`socialLinks`) — ganti `href: "#"` dengan alamat asli, misal `"https://instagram.com/..."`.
- **Kontak (telepon/email/alamat):** **baris 114–141**. Ganti nomor WhatsApp, email, dan alamat.
- **Teks copyright & nama:** **baris 150–155**.

### 2.3 BottomNav — `app/components/BottomNav.tsx`
**Fungsi:** Navigasi bawah (hanya tampil di layar kecil / mobile).

**Cara mengubah:** **baris 9–14** (`NAV_ITEMS`).
```tsx
const NAV_ITEMS = [
  { href: "/", label: "Beranda", icon: Home },
  ...
];
```
**Ubah:** sesuaikan `href`, `label`, dan `icon` (pilih ikon dari `lucide-react` yang sudah di-import di baris 6).

### 2.4 PageShell — `app/components/PageShell.tsx`
**Fungsi:** "Bungkus" halaman agar punya navbar, footer, dan transition. Hampir semua halaman membungkus kontennya dalam `<PageShell>`.

**Cara mengubah:** Umumnya **tidak perlu diubah manual**. Jika ingin halaman tanpa navbar, caranya sudah disediakan lewat prop `showNav` (dipakai di halaman status pembayaran).

### 2.5 PageTransition — `app/components/PageTransition.tsx`
**Fungsi:** Memberi animasi halus saat berpindah halaman.

**Cara mengubah:** Biasanya tidak perlu. Kecepatan/efek animasi diatur dari `app/lib/animations.ts` (misal `pageVariants`).

### 2.6 ThemeProvider — `app/components/ThemeProvider.tsx`
**Fungsi:** Mengatur mode terang/gelap dan menyimpannya di `localStorage` (kunci `jejak-rimba-theme`).

**Cara mengubah:** Hampir selalu tanpa perubahan. Tema default = `dark` (baris 24). Ganti ke `"light"` bila ingin default terang.

### 2.7 StarRating — `app/components/StarRating.tsx`
**Fungsi:** Menampilkan bintang rating (tampilan saja, atau interaktif bila `interactive`).

**Cara mengubah:** Warna bintang memakai `text-amber-400`. Jumlah maksimal default `5`. Umumnya dipakai otomatis, tidak perlu diubah manual.

### 2.8 RatingForm — `app/components/RatingForm.tsx`
**Fungsi:** Form untuk memberi rating & testimoni + daftar ulasan penyewa (dipakai di halaman detail alat).

**Cara mengubah (opsional):**
- Judul "Beri Rating & Testimoni" → **baris 71–76**.
- Placeholder textarea "Ceritakan pengalamanmu..." → **baris 136**.
- Kata "Login / Daftar" / "Kirim Rating" → baris 89–91, 159.
- Teks ajakan saat login → **baris 85–87**.

> **Catatan:** Form ini **membutuhkan login** untuk mengirim review (logika ada di `app/actions/review.ts`).

### 2.9 AuthLayout — `app/components/AuthLayout.tsx` & ComingSoon — `app/components/ComingSoon.tsx`
- **AuthLayout:** Kerangka halaman login/daftar (logo, tab "Masuk"/"Daftar", gambar samping). Gambar samping di **baris 66–70**. Logo teks "Jejak Rimba" di baris 23–25.
- **ComingSoon:** Halaman sederhana "Dalam Pengembangan" (dipakai di dashboard vendor). Teks & judul diatur lewat prop `title`/`description`.

---

## 3. Kerangka Global — `app/layout.tsx` & `app/globals.css`

### 3.1 `app/layout.tsx`
**Fungsi:** Kerangka **semua** halaman. Mengatur judul tab browser (`metadata`) dan meletakkan `ThemeProvider`.

**Cara mengubah:**
- Judul & deskripsi di tab browser → **baris 5–9** (`title`, `description`).
- Struktur `<html lang="id">` → **baris 17** (bahasa Indonesia).

### 3.2 `app/globals.css`
**Fungsi:** Gaya global — warna tema, font, dan class khusus.

**Cara mengubah warna keseluruhan (tema):**
Warna utama didefinisikan di **baris 9–48**. Contoh variabel penting:
```css
--ember: #c4622d;        /* warna aksen (oranye/coklat) */
--ember-light: #e08148;  /* aksen lebih terang */
--moss: #4a5d3a;         /* aksen kedua (hijau lumut) */
--paper: #ede6d6;        /* warna terang */
--bark: #121417;         /* warna gelap */
```
Mode terang dipakai saat ada class `.light` (baris 23–35), mode gelap saat `.dark` (baris 37–48).

**Cara mengubah:** Ganti nilai hex. Contoh: ubah `--ember: #c4622d;` menjadi `--ember: #d4412b;` untuk aksen kemerahan. Pengaruh otomatis ke semua halaman karena Tailwind memetakan variabel ini ke class `bg-accent`, `text-accent`, dsb (baris 65–94).

> **Mengubah font:** Semua font diset ke "Archivo" (baris 90–93). Font di-import lewat `@import "@fontsource/archivo/...css"` (baris 2–7).

---

## 4. Ringkasan Cepat

| Ingin mengubah | Buka file | Lokasi |
|---|---|---|
| Judul hero beranda | `app/page.tsx` | baris 196–229 |
| Teks paragraf hero | `app/page.tsx` | baris 236–239 |
| Menu navbar | `app/components/Navbar.tsx` | baris 11–15 |
| Menu footer | `app/components/Footer.tsx` | baris 7–25 |
| Kontak footer | `app/components/Footer.tsx` | baris 114–141 |
| Warna tema global | `app/globals.css` | baris 9–48 |
| Judul tab browser | `app/layout.tsx` | baris 5–9 |

---

Lanjut ke **[03-KATALOG.md](03-KATALOG.md)** untuk memahami halaman daftar & detail alat.