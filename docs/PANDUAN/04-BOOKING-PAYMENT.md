# 04 — Alur Booking & Pembayaran (Midtrans)

Bagian ini menjelaskan **alur pemesanan** (booking) dari mulai memilih tanggal hingga status pembayaran, termasuk integrasi **Midtrans**.

## Peta Alur Booking

```
Pengguna pilih alat (katalog/[slug]) 
   → klik "Sewa Sekarang"
        ▼
   /booking/<id-alat>         (form: pilih tanggal + data diri)
        ▼ klik "Lanjut ke Konfirmasi"
   /booking/<id-alat>/konfirmasi   (lihat ringkasan, isi nama/HP)
        ▼ klik "Konfirmasi & Bayar"
   - buat booking di database (actions/booking.ts)
   - kalau Midtrans aktif → popup pembayaran Snap
        ▼
   /booking/<id-booking>/status    (halaman status pembayaran)

Selain itu, ada halaman "Booking Saya" /booking (daftar riwayat).
```

---

## 1. Halaman "Booking Saya" (Daftar Riwayat) — `app/booking/page.tsx`

**Fungsi:** Menampilkan daftar semua booking milik pengguna yang login, lengkap dengan status.

**Jenis file:** `"use client"`.

### 1.1 Bagian yang Berubah

#### a) Judul & Teks
**Lokasi:** **baris 87–90** ("BOOKING SAYA", "Riwayat Sewa"), **baris 103–106** (teks kosong "Belum ada booking").

#### b) Label Status
**Lokasi:** **baris 34–42** (`statusConfig`):
```tsx
active:    { label: "Aktif", ... },
completed: { label: "Selesai", ... },
pending:   { label: "Menunggu", ... },
cancelled: { label: "Dibatalkan", ... },
```
**Cara ubah:** Ganti kata `label` (misal "Aktif" → "Berjalan").

#### c) Peta Status Database → Tampilan
**Lokasi:** **baris 24–30** (`dbStatusToFrontend`). Mengubah pemetaan ini mengubah status mana tampil dengan label mana.

#### d) Format Tanggal / Harga
**Lokasi:** **baris 53–63** (`formatPrice`, `formatDate`). Biasanya tidak perlu diubah.

> **Catatan:** Data booking diambil dari `getUserBookings()` (ada di **07-BACKEND-DATA.md**).

---

## 2. Form Booking — `app/booking/[id]/page.tsx`

**Fungsi:** Halaman utama pengisian booking: pilih **tanggal ambil & kembali**, isi **nama, no HP, catatan**, dan melihat **ringkasan harga** yang terhitung otomatis.

**Jenis file:** `"use client"`.

### 2.1 Bagian yang Berubah

#### a) Mengubah Judul & Sub-judul Halaman
**Lokasi:** **baris 317–323** ("BOOKING", "Sewa Alat Camping", "Isi data diri dan pilih tanggal sewa").

#### b) Label Tanggal & Placeholder
- "Tanggal Ambil" / "Tanggal Kembali" → **baris 390, 422**.
- Placeholder nama "Masukkan nama lengkap" → **baris 518**.
- Placeholder HP "08xxxxxxxxxx" → **baris 551**.
- Placeholder catatan "Catatan tambahan (misal: request waktu ambil)" → **baris 579**.

#### c) Teks Validasi Form (pesan error)
**Lokasi:** fungsi `validate()` **baris 194–209**. Contoh:
```tsx
errs.nama = "Nama lengkap wajib diisi";
errs.noHp = "No HP wajib diisi";
errs.tanggalKembali = "Tanggal kembali harus setelah tanggal ambil";
```
**Cara ubah:** Sunting pesan dalam tanda kutip.

#### d) Mengubah Teks Tombol "Lanjut ke Konfirmasi"
**Lokasi:** **baris 735** (desktop) & **baris 768** (mobile "Lanjut"). Teks **baris 739–741** ("Data pemesanan dapat diubah...").

#### e) Harga / Rumus Total
**Lokasi:** **baris 182–190**:
```tsx
const days = useMemo(() => calcDays(tanggalAmbil, tanggalKembali), ...);
const total = useMemo(() => (equipment ? days * equipment.pricePerDay : 0), ...);
```
- `days` = jumlah hari (dihitung dari tanggal).
- `total` = **hari × harga per hari**.
**Cara ubah:** Bila suatu saat mau menambah biaya lain (misal biaya admin), tambahkan di sini. Namun ini logika backend — pahamkan dulu sebelum berubah (lihat 07).

---

## 3. Halaman Konfirmasi — `app/booking/[id]/konfirmasi/page.tsx`

**Fungsi:** Ringkasan akhir + form pengisian nama/HP, lalu **merespons pembayaran**. Di sinilah `createBooking` dipanggil.

**Jenis file:** `"use client"` + `Suspense` (karena memakai `useSearchParams`).

### 3.1 Bagian yang Berubah

#### a) Judul & Teks
**Lokasi:** **baris 227–232** ("KONFIRMASI PESANAN", "Lengkapi Data Sewa"), **baris 241–243** ("Data Penyewa").

#### b) Tombol "Konfirmasi & Bayar"
**Lokasi:** **baris 391** (desktop, di baris 484–497) & **baris 495** (mobile). Teks "Memproses..." di baris 388/492.

#### c) Teks Ringkasan (kolom kanan)
**Lokasi:** **baris 405–472** ("Ringkasan Pesanan", "Durasi Sewa", "Harga per hari", "Total").

### 3.2 Alur Pembayaran (yang penting diketahui)
Saat tombol diklik, fungsi `handleBayar` (**baris 83–148**) menjalankan:
1. **Membuat booking** → memanggil `createBooking(...)`.
2. **Cek Midtrans** → jika `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` ada & bukan "xxxx", lanjut; jika tidak, **langsung redirect ke halaman status** (tanpa bayar).
3. **Mendapat token Snap** → `createSnapToken(bookingId)`.
4. **Membuka popup Midtrans** → `window.snap.pay(...)`; setelah sukses/pending → pindah ke `/booking/<id>/status`.

> **Cara menonaktifkan pembayaran (mode tanpa bayar):** Kosongkan `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` di `.env.local` (isikan `xxxx`). Aplikasi akan otomatis **melewati** pembayaran dan langsung ke status. Berguna saat demo tanpa kartu uji. Lihat juga **07-BACKEND-DATA.md**.

---

## 4. Halaman Status Pembayaran — `app/booking/[id]/status/page.tsx`

**Fungsi:** Menampilkan status pembayaran/sewa dari sebuah booking (Aktif, Selesai, Menunggu, Dibatalkan) beserta ringkasan dan tombol aksi.

**Jenis file:** `"use client"`.

### 4.1 Bagian yang Berubah

#### a) Label & Deskripsi Status
**Lokasi:** **baris 14–46** (`statusConfig`):
```tsx
active:    { label: "Sedang Berlangsung", desc: "Alat sedang kamu sewa...", color: "text-blue-500", bg: "bg-blue-500/10" },
completed: { label: "Selesai", desc: "...", ... },
waiting:   { label: "Menunggu Konfirmasi", ... },
cancelled: { label: "Dibatalkan", ... },
```
**Cara ubah:** Sunting `label`, `desc`, dan warna (`color`/`bg`).

#### b) Peta Status Database → Tampilan
**Lokasi:** **baris 48–54** (`dbStatusToFrontend`).

#### c) Tombol Aksi per Status
**Lokasi:** **baris 189–246**. Menentukan tombol yang muncul di tiap status (contoh: "Cek Status", "Booking Ulang", "Hubungi Admin").

#### d) Format Tanggal/Harga
**Lokasi:** **baris 56–66**.

> **Data** booking diambil dari `getBookingById(id)` — kombinasikan dengan informasi di **07-BACKEND-DATA.md**.

---

## 5. Komponen Bantu di Dalam Form Booking

Beberapa potongan kecil dipakai dalam form booking. Umumnya **tidak perlu diubah**, tapi berguna untuk dipahami:

- **`AnimatedPrice`** (baris 63–79): angka harga yang "beranimasi" (melembut saat berubah). Ini komponen visual dari `framer-motion`.
- **`StepIndicator`** (baris 89–155): penanda langkah 1-2-3 (Tanggal → Data → Konfirmasi). Label langkah di **baris 83–87**. Warna aksen memakai `#c4622d` (baris 143) — ganti bila ingin warna lain.
- **`calcDays`** (baris 45–50): menghitung jumlah hari sewa.

---

## 6. Ringkasan Cepat — File Booking

| Ingin mengubah | Buka file | Lokasi |
|---|---|---|
| Label status di daftar | `booking/page.tsx` | baris 34–42 |
| Pesan validasi form | `booking/[id]/page.tsx` | baris 194–209 |
| Tombol "Lanjut ke Konfirmasi" | `booking/[id]/page.tsx` | baris 735, 768 |
| Teks ringkasan konfirmasi | `booking/[id]/konfirmasi/page.tsx` | baris 405–472 |
| Tombol "Konfirmasi & Bayar" | `konfirmasi/page.tsx` | baris 380–393 / 484–497 |
| Label & warna status | `booking/[id]/status/page.tsx` | baris 14–46 |
| Tombol aksi per status | `booking/[id]/status/page.tsx` | baris 189–246 |

---

Lanjut ke **[05-AUTH-PROFIL.md](05-AUTH-PROFIL.md)** untuk autentikasi dan profil.