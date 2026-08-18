# 07 — Backend & Data

Bagian ini menjelaskan **logika backend**, **data**, **database**, dan **konfigurasi** project. Bagian ini yang membedakan "tampilan" (halaman) dengan "otak" (pemrosesan data). Pahami dulu `01-FONDASI.md` bila belum.

## Peta Backend & Data

```
app/actions/              → Server Actions ("otak")
app/lib/                  → utilitas & tipe data
   supabase.ts            → koneksi Supabase di browser
   supabase-server.ts     → koneksi Supabase di server
   database.types.ts      → tipe data & pemetaan kategori
   data.ts                → data statis (contoh alat, testimoni)
   midtrans.ts            → konfigurasi Midtrans
   animations.ts          → pengaturan animasi
app/api/                  → jalur khusus (webhook)
middleware.ts             → pengaman rute (proteksi halaman login)
.env.local                → kunci rahasia
next.config.ts            → konfigurasi Next.js
```

---

## 1. Server Actions — Folder `app/actions/`

**Apa itu Server Action?** Fungsi yang bertanda `"use server"` di baris pertama. Ia berjalan **di server** (bukan browser), bisa mengakses database dan logika rahasia. Dari halaman, kamu memanggilnya seperti fungsi biasa.

**Analogi:** Server Action = *kasir/gudang*; halaman = *etalase*. Etalase hanya menampilkan & menerima pesanan; gudang yang memproses.

### File di folder ini & fungsinya

| File | Fungsi | Fungsi utamanya |
|---|---|---|
| `auth.ts` | Autentikasi (signUp, signIn, signOut, resetPassword, Google) | `signUp`, `signIn`, `getCurrentUser`, `resetPassword`, `signInWithGoogle` |
| `booking.ts` | Proses pemesanan & pengelolaan booking | `createBooking`, `getUserBookings`, `getBookingById`, `cancelBooking`, `getVendorBookings`, `updateBookingStatus` |
| `equipment.ts` | Ambil & filter data alat | `getEquipmentList`, `getEquipmentById`, `getCategories` |
| `midtrans.ts` | Buat token pembayaran Midtrans | `createSnapToken` |
| `review.ts` | Kelola ulasan/testimoni | `createReview`, `getEquipmentReviews`, `getUserReviews`, `getTestimonials` |

### 1.1 Contoh nyata: `app/actions/equipment.ts`

- **`getEquipmentList(filters?)`** (baris 86–161): Mengambil semua alat aktif dari Supabase, menggabungkan rating, lalu **memfilter** berdasarkan lokasi/kategori/pencarian/ketersediaan & mengurutkan.
  - Data API (Supabase) di-cache 60 detik via `unstable_cache` (**baris 35–82**). Ini membuat katalog cepat.
- **`getEquipmentById(id)`** (baris 165–223): Mengambil detail satu alat + data vendor + rating.
- **`getCategories()`** (baris 227–234): Mengambil daftar kategori unik.

**Cara mengubah filter/perilaku:** Jika ingin menambah filter baru (misal filter "harga < X"), tambahkan logika di `getEquipmentList` (mulai baris 126). Namun ini **logika backend** — lakukan hati-hati setelah memahami pola.

### 1.2 Contoh nyata: `app/actions/booking.ts`

- **`createBooking(...)`** (baris 14–98): Memeriksa login, memvalidasi tanggal, mengecek stok, **menghitung total harga**, lalu menyimpan ke tabel `bookings`. 
  - Rumus total harga: **baris 64–68**:
    ```ts
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000*60*60*24)));
    const totalPrice = days * equipment.pricePerDay * formData.quantity;
    ```
  - Ini rumus utama penghitungan biaya sewa. Bila suatu saat mau menambah biaya admin, tambahkan di sini.
- **`getUserBookings()`** (baris 115–168): Mengambil semua booking milik user yang login.
- **`getBookingById(id)`** (baris 189–263): Detail satu booking + validasi kepemilikan (akses ditolak jika bukan miliknya).
- **`cancelBooking(id)`** (baris 267–312): Membatalkan booking (dengan pengecekan status).
- **`getVendorBookings()`** (baris 316–374) & **`updateBookingStatus(...)`** (baris 378–405): Fungsi untuk **vendor** — mengambil booking yang masuk & mengubah status. (Saat ini dashboard vendor masih placeholder, tapi fungsi ini sudah siap dipakai.)

### 1.3 Contoh nyata: `app/actions/review.ts`

- **`createReview(...)`** (baris 13–118): Validasi login & rating, cek duplikat, lalu simpan ulasan ke tabel `reviews`.
- **`getTestimonials()`** (baris 210–248): Mengambil ulasan bercorak testimoni untuk landing page.

### 1.4 Contoh nyata: `app/actions/auth.ts`

Fungsi server untuk autentikasi. **Perhatian:** Halaman login/daftar memakai *client* Supabase (`app/lib/supabase.ts`), bukan fungsi ini. Namun fungsi di `auth.ts` tetap tersedia bila kamu ingin pindah ke arsitektur Server Action.
- `signUp` (baris 14–82): daftar + insert profil (+vendor).
- `signIn` (baris 90–107): login email/password (versi server).
- `signOut` (baris 111–116), `resetPassword` (baris 164–176), `signInWithGoogle` (baris 180–193).

### 1.5 Contoh nyata: `app/actions/midtrans.ts`

- **`createSnapToken(bookingId)`** (baris 19–129): Membuat token pembayaran Midtrans untuk sebuah booking. Memakai `MIDTRANS_SERVER_KEY` & alamat API dari env.

---

## 2. Folder `app/lib/`

### 2.1 `supabase.ts` — Koneksi di Browser
```typescript
export const supabase = createBrowserClient(URL, ANON_KEY);
```
**Fungsi:** Client Supabase yang dipakai dari komponen/halaman `"use client"` (misal untuk login di `masuk/page.tsx`, logout, dll). Memakai `createBrowserClient` dari `@supabase/ssr` agar cookie refresh otomatis.

### 2.2 `supabase-server.ts` — Koneksi di Server
**Fungsi:** `getServerClient()` — membuat client Supabase dengan cookie server. **Dipanggil ulang di tiap Server Action** (bukan di-import sebagai objek tetap). Fungsinya di-import oleh semua `actions/*`.

### 2.3 `database.types.ts` — Tipe Data & Pemetaan
**Fungsi:** Mendefinisikan bentuk data (TypeScript) yang cocok dengan schema Supabase + **pemetaan kategori/kondisi** antara bahasa Indonesia (frontend) dan kode database (issue).

**Pemetaan kategori (penting jika menambah kategori):**
```ts
export const CATEGORY_MAP = { Tenda: "tenda", Carrier: "carrier", "Sleeping Bag": "sleeping_bag", Kompor: "kompor", Matras: "matras", Jaket: "jaket" };
export const CATEGORY_MAP_REVERSE = { tenda: "Tenda", ... };
// dan pemetaan kondisi (baru / sangat_baik / baik) di baris 187-197
```
**Cara mengubah:** Jika menambah kategori alat baru, kamu harus mengubah pemetaan di file ini **dan** di database (lihat bagian 5).

**Tabel yang didefinisikan di sini:** `profiles`, `vendors`, `equipment`, `equipment_images`, `bookings`, `transactions`, `reviews`, `notifications`.

### 2.4 `data.ts` — Data Statis (Cara Cepat Menambah Alat/Testimoni)
**Fungsi:** Berisi data statis contoh: `equipmentList` (daftar alat) dan `testimonials`. 

**Catatan penting:** Data **sungguhan** di website umumnya diambil dari **Supabase** (via actions), bukan dari file ini. File `data.ts` tampak sebagai data contoh/sisa pada saat pengembangan awal. Halaman beranda mengambil testimoni dari `getTestimonials()` (database), bukan dari `testimonials` di file ini.

**Jika kamu ingin data contoh cepat tanpa database,** isinya bisa disunting di **baris 25–151** (alat) dan **baris 153–202** (testimoni). Namun untuk perubahan yang tampil di website, **utamakan database Supabase** (lihat bagian 5).

### 2.5 `midtrans.ts` — Konfigurasi Midtrans
**Fungsi:** Membaca kunci Midtrans dari env (`MIDTRANS_IS_PRODUCTION`, `MIDTRANS_SERVER_KEY`, `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`) dan menyediakan `loadMidtransScript()` untuk memuat script Snap di browser.

### 2.6 `animations.ts` — Pengaturan Animasi
**Fungsi:** Mendefinisikan variabel animasi `framer-motion` (`spring`, `fadeUp`, `staggerContainer`, `pageVariants`, dll).

**Cara mengubah:** Jika ingin mengubah kecepatan/efek animasi global, edit nilai di sini. Contoh `spring` (baris 3–8) mengatur kekakuan & pegas animasi.

---

## 3. API Routes — Folder `app/api/`

### 3.1 `app/api/midtrans-webhook/route.ts`
**Fungsi:** Menerima **notifikasi pembayaran dari Midtrans** (disebut webhook). Saat pembayaran berubah status, Midtrans mengirim data ke sini; lalu pembayaran & status booking diperbarui di database.

**Alur:**
1. Terima data (`order_id`, `transaction_status`, `signature_key`, dsb).
2. **Verifikasi tanda tangan** (`verifySignature`, baris 9–21) — penting untuk keamanan.
3. Petakan status pembayaran → status booking (baris 45–59).
4. Perbarui tabel `transactions` & `bookings` (baris 62–79) memakai **service role key**.

**Cara mengubah status mapping:** Edit bagian **baris 45–59**. Contoh: "capture/settlement" → booking `dikonfirmasi`.

### 3.2 `app/auth/callback/route.ts`
**Fungsi:** Menangani **callback OAuth** setelah login Google (pertukaran code → session). Diatur agar redirect kembali ke `/`.

---

## 4. Middleware — `middleware.ts`

**Fungsi:** "Satpam" yang berjalan sebelum halaman dimuat; menyegarkan session & **melindungi halaman tertentu**.

**Lokasi & cara kerja:**
- **Proteksi (baris 33–47):** rute `/profil` dan `/booking` **wajib login**.
  ```ts
  const protectedRoutes = ["/profil", "/booking"];
  if (!user && protectedRoutes.some((route) => path.startsWith(route))) {
    // redirect ke /masuk dengan parameter redirect
  }
  ```
- **Cara ubah halaman yang wajib login:** tambah/hapus string di `protectedRoutes` (baris 34). Contoh untuk melindungi `/faq`, tambahkan `"/faq"`.
- **Menyegarkan session (baris 28–31):** memastikan token tidak kedaluwarsa.

> **Catatan:** `path.startsWith` berarti `/profil/...` juga terproteksi.

---

## 5. Database Supabase — Tempat Data Sebenarnya

Sebagian besar data (alat, user, booking, ulasan, vendor) disimpan di **Supabase**. Kamu mengelola data ini di dashboard Supabase (dashboard.supabase.com), bukan di file project.

**Tabel penting** (sesuai `database.types.ts`):
| Tabel | Isi |
|---|---|
| `profiles` | Profil pengguna (nama, HP, peran) |
| `vendors` | Data usaha mitra penyedia |
| `equipment` | Data alat (nama, kategori, harga, stok, kondisi) |
| `bookings` | Pemesanan (renter, alat, tanggal, total) |
| `transactions` | Pembayaran (status, metode, waktu) |
| `reviews` | Ulasan & rating |
| `notifications` | Notifikasi (belum dipakai penuh) |

### Cara praktis menambah/mengubah alat (di database)
1. Buka **dashboard.supabase.com** → masuk ke project.
2. Menu **Table Editor** → pilih tabel `equipment`.
3. **Insert row** untuk menambah alat, atau **edit sel yang ada** (misal ubah harga `price_per_day`, stok).
4. Perubahan langsung tampil di website (ingat cache katalog 60 detik — muat ulang halaman setelah ~1 menit atau gunakan revalidate).

> **Kategori & kondisi** memakai nilai kode database (misal `tenda`, `baru`), bukan bahasa Indonesia — sesuai pemetaan di `database.types.ts`.

---

## 6. File Konfigurasi

### 6.1 `.env.local` — Kunci Rahasia (JANGAN DI-PUBLISH!)
Berisi variabel lingkungan. Kunci yang dipakai:
- `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY` — untuk koneksi Supabase (publik/aman ditampilkan ke browser).
- `SUPABASE_SERVICE_ROLE_KEY` — kunci server dengan akses penuh (rahasia!).
- `MIDTRANS_IS_PRODUCTION`, `MIDTRANS_SERVER_KEY`, `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` — konfigurasi Midtrans.

**PERINGATAN KEAMANAN:**
- `SUPABASE_SERVICE_ROLE_KEY` dan `MIDTRANS_SERVER_KEY` **hanya boleh dipakai di server**, jangan pernah di file `"use client"` atau dipublikasikan.
- File `.env.local` **sudah ada di `.gitignore`** (ada di daftar ignore), jadi seharusnya tidak ter-commit ke git. **Jangan** menghapusnya dari `.gitignore`.
- `.env.example` berisi template tanpa nilai rahasia — cukup aman untuk dibagikan.

### 6.2 `next.config.ts`
**Fungsi:** Konfigurasi Next.js. Saat ini mengaktifkan Turbopack (`turbopack.root`). Jarang perlu diubah.

### 6.3 `package.json`
**Fungsi:** Daftar pustaka & perintah. Perintah yang dipakai: `dev`, `build`, `start`, `lint`.

---

## 7. Ringkasan Cepat — Backend & Data

| Ingin | Buka | Catatan |
|---|---|---|
| Paham alur data alat | `app/actions/equipment.ts` | `getEquipmentList`, `getEquipmentById` |
| Ubah rumus harga sewa | `app/actions/booking.ts` | baris 64–68 |
| Tambah kategori alat | `app/lib/database.types.ts` + Supabase | pemetaan kategori |
| Ubah status mapping pembayaran | `app/api/midtrans-webhook/route.ts` | baris 45–59 |
| Ubah halaman wajib login | `middleware.ts` | baris 34 |
| Kelola data alat sesungguhnya | dashboard Supabase | tabel `equipment` |
| Ganti kunci rahasia | `.env.local` | jangan di-publish |

---

Lanjut ke **[08-CARA-EDIT-CEPAT.md](08-CARA-EDIT-CEPAT.md)** untuk lembar contekan cepat.