# 03 — Halaman Katalog & Detail Alat

Bagian ini membahas halaman yang menampilkan **daftar alat** dan **detail alat**, termasuk filter, pencarian, dan gambar.

Ada 3 file utama:
1. `app/katalog/page.tsx` — halaman daftar (server)
2. `app/katalog/CatalogClient.tsx` — logika interaktif pencarian/filter (client)
3. `app/katalog/[slug]/page.tsx` — halaman detail satu alat (client)

```
URL dibuka
   /katalog            → daftar semua alat (page.tsx + CatalogClient)
   /katalog/<id-alat>  → detail satu alat ([slug]/page.tsx)
```

---

## 1. Halaman Daftar Alat — `app/katalog/page.tsx`

**Fungsi:** Halaman pertama katalog. **Mengambil data** dari server (functions `getEquipmentList` & `getCategories`) lalu **menyerahkan** daftarnya ke komponen client `CatalogClient` untuk ditampilkan dan difilter.

**Jenis file:** Server component (tidak punya `"use client"`).

### 1.1 Bagian yang Berubah

#### a) Mengubah Teks Halaman
**Lokasi:** `app/katalog/page.tsx`, **baris 30–39**.
```tsx
<p className="...">KATALOG</p>
<h1 ...>Cek stok dan harga</h1>
<p ...>Data alat dari mitra penyedia di Malang Raya. ...</p>
```
**Cara ubah:** Sunting `<p>` dan `<h1>`. "KATALOG" tegas di baris 30, judul di baris 33, keterangan di baris 37.

#### b) Mengubah Teks Tombol "Kembali"
**Lokasi:** **baris 22–28**. Ganti kata "Kembali" bila perlu.

> **Catatan:** Halaman ini **tidak** mencantumkan data alat secara langsung — datanya dikirim lewat `<CatalogClient items={items} ... />` (baris 42–46). Semua tampilan kartu & filter berada di `CatalogClient.tsx`.

---

## 2. Logika Interaktif Katalog — `app/katalog/CatalogClient.tsx`

**Fungsi:** Menampilkan **kartu alat**, **kotak pencarian**, **filter kategori**, **cek "hanya yang tersedia"**, dan **pengurutan** (termurah/termahal/stok). Ini hati dari halaman katalog.

**Jenis file:** `"use client"` (interaktif).

### 2.1 Bagian yang Sering Diubah

#### a) Mengubah Placeholder Pencarian
**Lokasi:** **baris 68**.
```tsx
placeholder="Cari alat..."
```
**Cara ubah:** Ganti teks dalam tanda kutip.

#### b) Mengubah Opsi Pengurutan (Sort)
**Lokasi:** **baris 95–103** (`<select>` dengan opsi `Termurah`, `Termahal`, `Stok Terbanyak`).
**Cara ubah:** Ganti label `<option value="...">`. Logika pengurutan ada di **baris 41–51** (`switch (sort)`). Jika menambah opsi baru, tambahkan juga logikanya di `switch` tersebut.

#### c) Mengubah Label Filter
- Label "Hanya yang tersedia" → **baris 92**.
- Label "Kategori", "Semua", "Kembali ke beranda" → baris 77–82, 202–207.

#### d) Mengubah Gambar Per Kategori
**Lokasi:** **baris 9–16** (`categoryImages`).
```tsx
const categoryImages: Record<string, string> = {
  Tenda: "https://.../tenda...",
  Carrier: "https://...",
  ...
};
```
**Cara ubah:** Ganti URL gambar per kategori. Gambar ini dipakai di kartu katalog (baris 127–132).

#### e) Mengubah Teks Status (Tersedia/Habis)
**Lokasi:** **baris 133–146**. Kata "Tersedia" dan "Habis".
**Cara ubah:** Sunting teks, atau ubah warna badge (`bg-sage/50` untuk tersedia → hijau, `bg-red/50` untuk habis → merah).

#### f) Mengubah Teks "N alat ditemukan"
**Lokasi:** **baris 109–111**. Sunting teks jika perlu.

#### g) Mengubah Teks Tampilan "Tidak Ada Hasil" (Empty State)
**Lokasi:** **baris 179–197**. Kata "Belum ada alat yang cocok" dan "Coba ganti filter kategori di atas."
**Cara ubah:** Sunting `<p>` di dalam blok tersebut.

#### h) Mengubah Teks "Kembali ke beranda"
**Lokasi:** **baris 200–207**.

---

## 3. Halaman Detail Alat — `app/katalog/[slug]/page.tsx`

**Fungsi:** Menampilkan **detail satu alat** berdasarkan id (slug): foto, nama, harga, stok, deskripsi, InfoCard (lokasi, mitra, kapasitas, kondisi), tombol "Sewa Sekarang", dan form rating.

**Jenis file:** `"use client"` (mengambil data berdasarkah `slug` URL).

### 3.1 Bagian yang Sering Diubah

#### a) Mengubah Deskripsi Template Per Kategori
**Lokasi:** **baris 43–65** (`categoryDescriptions`).
```tsx
const categoryDescriptions: Record<string, (name, capacity?) => string> = {
  Tenda: (name, cap) => `...`,
  Carrier: (name, cap) => `...`,
  ...
};
```
**Cara ubah:** Sunting teks dalam template string. Perhatikan: `name` dan `cap` adalah data otomatis (nama & kapasitas alat); jangan dihapus tanda `${}` tersebut. Ini template -> semua alat kategori itu memakai deskripsi ini.

#### b) Mengubah Gambar Per Kategori
**Lokasi:** **baris 34–41** (`categoryImages`, memakai file di `public/`).
```tsx
Tenda: "/placeholders/tenda.svg",
```
**Cara ubah:** Ganti path ke file gambar lain (misal "/placeholders/tenda-baru.svg").

#### c) Mengubah Batas Stok Maksimum (pada bar pengisian stok)
**Lokasi:** **baris 30**.
```tsx
const MAX_STOCK = 15;
```
**Fungsi:** Bar stok (0/15) dihitung dari nilai ini. **Ubah 15** bila stok maksimal berubah (misal jadi 20).

#### d) Mengubah Ambang Badge Stok
**Lokasi:** fungsi `StockBadge` **baris 74–97**. Logika:
- `stock === 0` → "Stok Habis" (merah)
- `stock <= 3` → "Sisa N" (kuning)
- selain itu → "Tersedia" (hijau)

**Cara ubah:** Angka `3` di baris 83 untuk mengubah ambang "sedikit". Kata di baris 77, 86, 92.

#### e) Mengubah Warna Bar Stok
**Lokasi:** fungsi `StockBar` **baris 99–123** (`barColor`). Hijau (`bg-moss`), kuning (`bg-amber`), merah (`bg-red`).

#### f) Mengubah Tombol "Sewa Sekarang"
**Lokasi:** **baris 354–360** (desktop) & **baris 396–403** (mobile sticky). Ganti teks & `href` (`/booking/${item.id}`).

#### g) Mengubah InfoCards (label di bawah foto)
**Lokasi:** **baris 234–246**.
```tsx
const infoCards = [
  { icon: <MapPin/>, label: "Lokasi", value: item.location },
  { icon: <User/>, label: "Mitra", value: item.provider },
  ...
];
```
**Cara ubah:** Ganti `label`. Nilai (`value`) umumnya dari data otomatis.

#### h) Mengubah Teks "Alat Tidak Ditemukan" (404/halaman tidak ada)
**Lokasi:** fungsi `NotFoundState` **baris 151–182**. Sunting teks & tombol.

#### i) Mengubah Teks "Elevasi"
**Lokasi:** **baris 241–245**. Saat ini memakai nilai `≥ 0800 mdpl` (tetap).

### 3.2 Data yang Tampil di Detail

Data ditampilkan dari database (bukan file ini). Aliran:
- `page.tsx` memanggil `getEquipmentById(slug)` di **baris 192–197**.
- Fungsi tersebut ada di `app/actions/equipment.ts` — mengambil data alat dari tabel `equipment` Supabase dan menggabungkan data vendor + rating.
- Foto memakai `categoryImages` (placeholder).

**Cara mengubah isi alat yang sebenarnya:** lihat **file 07 (BACKEND-DATA)** dan cara kelola database Supabase.

---

## 4. Ringkasan Cepat — File Katalog

| Ingin mengubah | Buka file | Lokasi |
|---|---|---|
| Judul/keterangan daftar | `katalog/page.tsx` | baris 30–39 |
| Placeholder pencarian | `katalog/CatalogClient.tsx` | baris 68 |
| Opsi pengurutan | `katalog/CatalogClient.tsx` | baris 95–103 |
| Gambar kategori daftar | `katalog/CatalogClient.tsx` | baris 9–16 |
| Teks tersedia/habis | `katalog/CatalogClient.tsx` | baris 133–146 |
| Deskripsi template | `katalog/[slug]/page.tsx` | baris 43–65 |
| Gambar kategori detail | `katalog/[slug]/page.tsx` | baris 34–41 |
| Ambang stok rendah | `katalog/[slug]/page.tsx` | baris 74–97 |
| Maks stok (bar) | `katalog/[slug]/page.tsx` | baris 30 |
| Tombol Sewa Sekarang | `katalog/[slug]/page.tsx` | baris 354–360 |

---

Lanjut ke **[04-BOOKING-PAYMENT.md](04-BOOKING-PAYMENT.md)** untuk alur pemesanan dan pembayaran.