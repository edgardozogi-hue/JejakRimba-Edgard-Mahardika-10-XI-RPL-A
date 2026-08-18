# 01 — Fondasi: Gambaran Besar Project

Sebelum mengubah apa pun, penting memahami **cara kerja project secara utuh**. Bagian ini menjelaskan diagram alur, perbedaan frontend dan backend, aturan coding, cara menjalankan, dan istilah-istilah penting.

---

## 1. Gambaran Besar (Diagram Alur)

Mari kita lihat apa yang terjadi saat seseorang membuka website Jejak Rimba di browser.

```
┌──────────────────────────────────────────────────────────────┐
│  BROWSER (di komputer pengguna / HP pengguna)                │
│  = "etalse / ruang tamu" website                              │
│  · Menampilkan tampilan (frontend)                           │
│  · Menangkap klik, isian form, dan interaksi pengguna        │
└───────────────────────────┬──────────────────────────────────┘
                            │ pengguna masuk URL / klik sesuatu
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  NEXT.JS — SERVER (mesin yang menjalankan aplikasi)          │
│  = "dapur / gudang" website                                   │
│                                                               │
│  · app/page.tsx dsb     → menghasilkan HALAMAN (tampilan)    │
│  · app/actions/         → "otak" yang memproses aksi          │
│  · app/lib/             → koneksi & alat bantu               │
│  · app/api/             → jalur khusus dari luar              │
└───────────────┬───────────────────────────────┬───────────────┘
                │ baca/tulis data               │ proses pembayaran
                ▼                               ▼
        ┌───────────────┐              ┌─────────────────┐
        │  SUPABASE     │              │  MIDTRANS       │
        │  (database +  │              │  (gateway       │
        │   auth,       │              │   pembayaran)   │
        │   PostgreSQL) │              │                 │
        └───────────────┘              └─────────────────┘
```

**Analogi resto:**
- **Browser** = tamu yang duduk di meja dan melihat menu.
- **Next.js** = koki dan pelayan di dapur; menerima "pesanan", mengolah data, lalu menaruh hasilnya di meja.
- **Supabase** = gudang + buku catatan stok (data alat, user, booking).
- **Midtrans** = kasir pembayaran dari pihak luar yang menghitung dan memproses uang.

Semua tampilan yang kamu lihat dihasilkan oleh Next.js dari **data** yang diambil dari Supabase. Itulah inti aplikasi ini: **tampilan (frontend) + logika/data (backend)**.

---

## 2. Frontend vs Backend

Pembagian paling mendasar di project ini adalah **frontend** dan **backend**. Analogi sederhananya seperti **toko**:

| | FRONTEND | BACKEND |
|---|---|---|
| **Analogi** | Etalase, kasir, ruang pamer | Gudang, buku laporan stok |
| **Peran** | Yang **terlihat** & disentuh pengguna | Yang **memproses** & menyimpan data |
| **Apa itu** | Teks, warna, tombol, gambar, animasi | Ambil data, simpan data, validasi, hitung harga |
| **Lokasi di project** | Folder `page.tsx` + `components/` + `globals.css` | Folder `actions/` + bagian `lib/` |
| **Contoh kegiatan** | Ganti teks tombol "Masuk" | Proses login, simpan booking ke database |
| **Dijalankan di** | Browser & Server (Next.js) | Server (Next.js) & Supabase |

### Cara Membedakan dalam Kode
- File yang bagian atasnya bertulis **`"use client"`** → berjalan di browser, bersifat **interaktif** (menangkap klik, mengubah layar). Ini **frontend**.
- File yang bagian atasnya bertulis **`"use server"`** → berjalan di server, tidak boleh memanipulasi tampilan langsung; ia **memproses data**. Ini **backend**.
- File **tanpa keduanya** → bisa dijalankan di server; biasanya "komponen kaca" (hanya menampilkan) atau file utilitas.

> **Catatan:** Beberapa file `page.tsx` memakai `"use client"` karena butuh interaksi (misal form booking). Sebagian lain (seperti `katalog/page.tsx`) tidak memakainya karena cukup mengambil data dan menampilkan.

### Tabel "Siapa Melakukan Apa"

| Kebutuhan | File yang disentuh |
|---|---|
| Ubah **teks** yang terlihat | `page.tsx` / `components/` yang bersangkutan |
| Ubah **warna / desain** | `app/globals.css` + class Tailwind |
| Ubah **data alat / testimoni** | `app/lib/data.ts` (data statis) atau database Supabase |
| Ubah **cara login** | `app/actions/auth.ts` + `masuk/page.tsx` |
| Ubah **cara hitung harga sewa** | `app/booking/[id]/page.tsx` + `app/actions/booking.ts` |

---

## 3. Aturan Coding yang Perlu Diingat

Meskipun kamu tidak menulis semua kode, beberapa aturan penting memudahkan kamu ketika mengedit atau meminta AI mengubah sesuatu.

### 3.1 Struktur Halaman = Folder
Di Next.js, **setiap folder di dalam `app/` menjadi sebuah alamat URL**:

| Folder di `app/` | URL di browser |
|---|---|
| `app/katalog/page.tsx` | `/katalog` |
| `app/katalog/[slug]/page.tsx` | `/katalog/<id-alat>` |
| `app/masuk/page.tsx` | `/masuk` |
| `app/faq/page.tsx` | `/faq` |

File bernama **`page.tsx`** (khusus) adalah "halaman". Folder dengan tanda `[slug]` atau `[id]` artinya **alamat dinamis** (isinya berganti-ganti, misal id alat).

### 3.2 Komponen Berulang Ada di `components/`
Komponen seperti Navbar, Footer, dan BottomNav dipakai di banyak halaman. Ubah di satu tempat → semua halaman ikut berubah. Ini seperti **template surat**: sekali ubah kop surat, semua surat pakai yang baru.

### 3.3 `"use client"` vs `"use server"`
- **`"use client"`** (di baris pertama) = file ini **interaktif** dan berjalan di browser.
- **`"use server"`** = file ini **memproses data** di server (Server Actions).
- Jangan menaruh logika berat/data rahasia di file `"use client"` — data sensitif harus di server.

### 3.4 Gaya Penulisan (Best Practices)
- **Nama file** kecil semua dan pakai tanda hubung: `kebijakan-privasi`, bukan `KebijakanPrivasi`.
- **Bahasa antarmuka** konsisten: sebagian memakai "kamu", sebagian "Anda". Sebaiknya dipilih satu gaya (project ini banyak memakai "kamu").
- **Nama variabel** menjelaskan isinya: `totalPrice` untuk total harga, `nama` untuk nama penyewa.
- **Jangan commit** file `.env.local` (berisi kunci rahasia).

### 3.5 Alur Data (Server Actions)
Ketika pengguna melakukan aksi yang menyentuh data (misal submit form booking), alurnya:

```
Form di browser  →  panggil Server Action (actions/booking.ts)
                      →  validasi & proses
                      →  simpan/ambil data ke Supabase
                      →  kembalikan hasil/redirect
```

Server Action menjaga keamanan: data penting (misal cek apakah user sudah login) dilakukan di server, bukan di browser.

---

## 4. Cara Menjalankan Project

```bash
npm install        # pasang semua pustaka (cukup sekali)
npm run dev        # jalankan server pengembangan
```

Buka **http://localhost:3000**. Setiap file yang kamu simpan akan **langsung diperbarui** di browser (fitur hot-reload).

> **Membuat build produksi (opsional):** `npm run build` lalu `npm run start`. Berguna sebelum di-deploy ke Vercel.

---

## 5. Peta Struktur Folder Lengkap

```
jejak-rimba/
├── app/                     # SEMUA kode aplikasi
│   ├── layout.tsx           # Kerangka dasar semua halaman (judul, tema)
│   ├── page.tsx             # Beranda (home)
│   ├── globals.css          # Gaya global: warna, font, ukuran
│   ├── components/          # Komponen bersama (Navbar, Footer, dll)
│   ├── actions/             # Server Actions (backend)
│   ├── lib/                 # Utilitas, tipe data, koneksi
│   ├── api/                 # API route khusus (webhook)
│   ├── katalog/             # Daftar & detail alat
│   ├── booking/             # Alur pemesanan
│   ├── masuk/ daftar/ lupa-password/   # Autentikasi
│   ├── profil/              # Profil & dashboard vendor
│   ├── faq/ kebijakan-privasi/ syarat-ketentuan/   # Halaman teks
│   └── auth/                # Callback OAuth (login Google)
├── public/                  # Gambar placeholder, favicon
├── docs/                    # Dokumen & laporan (termasuk panduan ini)
├── tools/                   # Alat bantu (drawio, plantuml)
├── middleware.ts            # Pengaman rute (proteksi halaman login)
├── next.config.ts           # Konfigurasi Next.js
├── tsconfig.json            # Konfigurasi TypeScript
├── .env.local               # Kunci rahasia (JANGAN di-publish!)
└── package.json             # Daftar pustaka & perintah
```

---

## 6. Glosarium Istilah

| Istilah | Arti | Analogi |
|---|---|---|
| **Next.js** | Framework aplikasi web (berbasis React) yang dipakai project ini | Rangka + mesin bangunan |
| **React** | Pustaka untuk membangun antarmuka dengan komponen | Kotak LEGO penyusun tampilan |
| **TypeScript** | JavaScript dengan aturan tipe data yang ketat | Bahasa yang "memeriksa ejaan" sebelum jalan |
| **Server Action** | Fungsi di server yang dipanggil dari halaman | Kasir di gudang yang memproses pesanan |
| **Client Component** | Komponen yang berjalan di browser (`"use client"`) | Etalase interaktif |
| **Server Component** | Komponen yang diolah server, menampilkan hasil | Menu yang sudah dicetak koki |
| **Route** | Alamat URL sebuah halaman | Nomor rak di toko |
| **Dynamic route** | Alamat dinamis (`[slug]`, `[id]`) | Rak dengan id berubah |
| **Supabase** | Backend-as-a-Service: database + autentikasi | Gudang + pegawai pencatat stok |
| **Tailwind CSS v4** | Framework gaya penulisan class untuk desain cepat | Cat & alat dekorasi siap pakai |
| **Framer Motion** | Pustaka animasi untuk React | Pemutar animasi halus |
| **Lucide React** | Kumpulan ikon | Rak ikon siap guna |
| **Midtrans** | Gateway pembayaran (sandbox/produksi) | Kasir pembayaran pihak luar |
| **Hot-reload** | Perubahan kode langsung tampil tanpa restart | Perbaikan langsung terlihat |
| **.env.local** | File berisi kunci rahasia (variabel lingkungan) | Brankas kunci rahasia |

---

Lanjut ke **[02-HALAMAN-UTAMA.md](02-HALAMAN-UTAMA.md)** untuk mulai membedah halaman-halaman.