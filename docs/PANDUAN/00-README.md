# Panduan Project Jejak Rimba

Selamat datang! Folder ini berisi panduan lengkap untuk memahami, menjelajahi, dan **mengedit** project **Jejak Rimba** (platform sewa alat camping & mendaki di Malang Raya).

Dokumen ini ditulis khusus untuk kamu yang **membuat project ini dengan bantuan AI** dan ingin tahu apa fungsi setiap folder/file, bagaimana frontend dan backend bekerja, serta **cara mengubah** bagian-bagian tertentu tanpa harus paham semua kode dari awal.

---

## Cara Memakai Panduan Ini

Baca **urut mulai dari file 01**, lalu lanjut sesuai kebutuhan. Jangan khawatir kalau sekilas terasa banyak; tiap file membahas satu topik yang berdiri sendiri. Gunakan daftar di bawah untuk melompat langsung ke bagian yang kamu butuhkan.

## Alur Belajar yang Disarankan

1. **01-FONDASI** — pahami gambaran besar dulu (wajib dibaca pertama).
2. **02 s/d 06** — baca sesuai halaman yang mau kamu pahami atau ubah.
3. **07-BACKEND-DATA** — untuk urusan data, database, dan konfigurasi.
4. **08-CARA-EDIT-CEPAT** — simpan sebagai "lembar contekan" saat ingin cepat mengubah sesuatu.

---

## Daftar Isi Panai

| File | Isi | Kapan Dibaca |
|------|-----|--------------|
| **00-README.md** (ini) | Daftar isi & cara pakai | Pertama kali |
| **01-FONDASI.md** | Gambaran besar, frontend vs backend, cara menjalankan, aturan coding, glosarium | Wajib pertama |
| **02-HALAMAN-UTAMA.md** | Halaman beranda (`page.tsx`) + komponen bersama (Navbar, Footer, BottomNav, dll) | Mau ubah tampilan beranda/menu |
| **03-KATALOG.md** | Halaman katalog & detail alat (list, filter, gambar) | Mau ubah data/tampilan katalog |
| **04-BOOKING-PAYMENT.md** | Alur booking & pembayaran (Midtrans), status | Mau ubah alur sewa |
| **05-AUTH-PROFIL.md** | Login, register, lupa password, profil, dashboard vendor | Mau ubah autentikasi/profil |
| **06-HALAMAN-STATIS.md** | FAQ, kebijakan privasi, syarat & ketentuan | Mau ganti isi teks dokumen |
| **07-BACKEND-DATA.md** | Actions, lib, middleware, env, jenis data | Mau paham database & logika |
| **08-CARA-EDIT-CEPAT.md** | Tabel "cara mengubah X" yang cepat | Ingin cepat seperti contekan |

---

## Peta Folder Secara Ringkas (detail di 01-FONDASI)

```
jejak-rimba/
├── app/               → SEMUA kode aplikasi (halaman, komponen, backend)
│   ├── page.tsx       → Halaman beranda
│   ├── katalog/       → Halaman daftar & detail alat
│   ├── booking/       → Alur pemesanan
│   ├── masuk/ daftar/ lupa-password/ → Autentikasi
│   ├── profil/        → Profil user & dashboard vendor
│   ├── faq/ kebijakan-privasi/ syarat-ketentuan/ → Halaman teks statis
│   ├── components/    → Potongan UI yang dipakai berulang
│   ├── actions/       → "Otak" backend (Server Actions)
│   ├── lib/           → Utilitas & koneksi Supabase
│   └── api/           → Jalur khusus dari luar (webhook pembayaran)
├── public/            → File statis (gambar placeholder, favicon)
├── docs/              → Dokumen/artefak laporan (ada juga panduan ini)
├── tools/             → Alat bantu (drawio, plantuml)
└── node_modules/      → Dependensi/pustaka (JANGAN diubah manual)
```

---

## Hal Penting Sebelum Mengubah Kode

1. **Aplikasi berjalan otomatis "hot-reload"** dengan `npm run dev`. Simpan file, browser langsung diperbarui tanpa perlu restart server.
2. **File di `node_modules/` jangan diubah.** Itu pustaka pihak ketiga.
3. **Jangan publish file `.env.local`** ke git/GitHub. Berisi kunci rahasia (Supabase & Midtrans).
4. **Backup sebelum mengubah besar** — salin file yang akan diubah, atau pakai git (lihat bagian git di file 08).
5. **Semua nama folder di `app/` menjadi URL otomatis.** Folder `katalog/` = alamat `/katalog`.

---

## Cara Menjalankan Project

```bash
npm install     # jalankan sekali saja, setelah clone/download
npm run dev     # jalankan server pengembangan
```

Buka browser ke **http://localhost:3000**. Menjalankan project ini seperti *menyalakan lampu sebelum bekerja* — tanpa itu, kode hanya teks di layar.

Silakan lanjut ke **[01-FONDASI.md](01-FONDASI.md)**.