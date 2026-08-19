# Use Case — Jejak Rimba

Dokumen ini berisi analisis use case aplikasi Jejak Rimba beserta diagram use case
berformat ASCII. Isi diagram disesuaikan dengan fitur yang benar-benar sudah
diimplementasikan di dalam kode (bukan sekadar rencana).

---

## 1. Aktor

| Aktor | Deskripsi |
|---|---|
| **Pengunjung** | Pengguna yang belum masuk akun. Hanya bisa melihat katalog, detail alat, dan ulasan. |
| **Penyewa** | Pengunjung yang sudah masuk akun. Bisa memesan alat, membayar, dan memberi ulasan. |
| **Vendor** | Penyewa yang terdaftar sebagai penyedia alat. Mengelola katalog dan booking alat miliknya. |
| **Admin** | Pengelola platform (aplikasi "Komunitas Robotika"). Mengelola pengguna, vendor, alat, dan booking. |
| **Midtrans** | Sistem pembayaran eksternal yang memproses pembayaran dan mengirim webhook status. |

Relasi antar aktor: **Penyewa extends Pengunjung**, **Vendor extends Penyewa**.

---

## 2. Daftar Use Case per Aktor

### 2.1 Pengunjung
- UC-01 Lihat Katalog Alat
- UC-02 Cari dan Filter Alat
- UC-03 Lihat Detail dan Ulasan Alat
- UC-04 Daftar (Registrasi)
- UC-05 Masuk (Login)

### 2.2 Penyewa (termasuk semua hak Pengunjung)
- UC-06 Kelola Keranjang (tambah, ubah jumlah, hapus item)
- UC-07 Pesan Alat (single-item atau multi-item)
- UC-08 Pilih Tanggal Sewa
- UC-09 Bayar via Midtrans
- UC-10 Lihat Booking Saya
- UC-11 Batalkan Booking
- UC-12 Beri Ulasan
- UC-13 Kelola Profil (nama, avatar, kata sandi, preferensi notifikasi, sesi aktif)
- UC-14 Daftar atau Beralih sebagai Vendor

### 2.3 Vendor (termasuk semua hak Penyewa)
- UC-15 Kelola Katalog Alat (tambah, ubah, hapus, aktif/nonaktif)
- UC-16 Unggah Gambar Alat
- UC-17 Lihat Booking Alat Miliknya
- UC-18 Konfirmasi dan Update Status Booking

### 2.4 Admin
- UC-19 Masuk Admin
- UC-20 Lihat Dashboard (statistik, grafik pendapatan 6 bulan)
- UC-21 Kelola Pengguna (ubah role)
- UC-22 Kelola Vendor (setujui/aktifkan)
- UC-23 Kelola Alat (aktif/nonaktif, hapus)
- UC-24 Lihat Semua Booking dan Update Status

### 2.5 Midtrans (sistem eksternal)
- UC-25 Proses Pembayaran
- UC-26 Kirim Webhook Status Pembayaran

---

## 3. Diagram Use Case (ASCII Art)

```
            +==================================================================+
            |                    SISTEM JEJAK RIMBA                            |
            |==================================================================|
            |                                                              VENDOR
            |  +------------+  +------------+  +-----------------+  +-------------------+
            |  | UC-01      |  | UC-02      |  | UC-03           |  | UC-15             |
   +--------+  | Lihat      |  | Cari dan   |  | Lihat Detail    |  | Kelola Katalog    |
   | PENGU- |  | Katalog    |  | Filter     |  | dan Ulasan      |  | Alat (CRUD)       |
   | NJUNG  +--| Alat       |  | Alat       |  | Alat            |  |                   |
   |        |  +------------+  +------------+  +-----------------+  +-------------------+
   +--------+                                                          +-------------------+
       |                                                                | UC-16             |
       |   <<extends>>                                                  | Unggah Gambar     |
       v                                                               | Alat              |
   +--------+                                                          +-------------------+
   | PENYE- |                                                          +-------------------+
   | WA     +--+        +------------+  +------------+  +------------+  | UC-17             |
   +--------+  |        | UC-06      |  | UC-07      |  | UC-08      |  | Lihat Booking     |
       |       +----->  | Kelola     |  | Pesan Alat |  | Pilih      |  | Alat Miliknya     |
       |                | Keranjang  |  | (single/   |  | Tanggal    |  +-------------------+
       |                |            |  | multi-item)|  | Sewa       |  +-------------------+
       |                +------------+  +------------+  +------------+  | UC-18             |
       |                      |               |                |         | Konfirmasi &      |
       |                      |               v                v         | Update Status     |
       |                      |         +-------------+   +----------+   +-------------------+
       |                      |         | UC-09       |   | UC-10    |
       |                      |         | Bayar via   |   | Lihat    |
       |                      |         | Midtrans    |   | Booking  |
       |                      |         +-------------+   | Saya    |
       |                      |              ^            +----------+
       |                      |              |                  |
       |                      |              |                  v
       |                      |              |           +------------+
       |                      |              |           | UC-11      |
       |                      |              |           | Batalkan   |
       |                      |              |           | Booking    |
       |                      |              |           +------------+
       |                      |              |
       |                      |              +------ (berlanjut ke diagram bawah)
       |
       |   (lanjutan dari UC-04/UC-05/UC-12/UC-13/UC-14 ada di bagian bawah)
```

> Catatan: diagram penuh dengan relasi `<<include>>` dan `<<extends>>` dijelaskan
> pada bagian 4. Karena batasan lebar baris terminal, diagram dibagi menjadi beberapa
> blok berikut.

### 3.1 Blok Autentikasi (Pengunjung dan Penyewa)

```
        +--------+      +------------+
        | PENGU- |----> | UC-04      |         <<include>>
        | NJUNG  |      | Daftar     |--------------------+
        +--------+      +------------+                    |
             |                                             v
             |        +------------+                +------------+
             +----->  | UC-05      |                | UC-05      |
                      | Masuk      |  <-------------| Masuk      |
                      +------------+   <<include>>  +------------+
                                                            ^
             <<extends>> (Penyewa extends Pengunjung)        |
        +--------+                                          |
        | PENYE- |---->  UC-12 Beri Ulasan                   |
        | WA     |---->  UC-13 Kelola Profil                 |
        |        |---->  UC-14 Daftar/Beralih Vendor         |
        +--------+                                           |
        +--------+                                           |
        | VENDOR |---->  UC-14 (sudah vendor)                |
        +--------+                                           |
```

### 3.2 Blok Pembayaran dan Booking

```
  +------------+     <<include>>      +------------+
  | UC-07      |----------------------| UC-09      |
  | Pesan Alat |                      | Bayar via  |
  +------------+                      | Midtrans   |
        |                             +------------+
        |                                   ^
        |                                   |  terhubung ke aktor Midtrans
        |                                   |
  +------------+                     +--------------+
  | UC-08      |                     | MIDTRANS     |
  | Pilih      |                     | (eksternal)  |
  | Tanggal    |                     +--------------+
  +------------+                          |
                                          |  UC-26 Kirim Webhook
                                          v
                                   +--------------+
                                   | UC-25        |
                                   | Proses       |
                                   | Pembayaran   |
                                   +--------------+
```

### 3.3 Blok Admin (aplikasi Komunitas Robotika)

```
        +--------+
        | ADMIN  |---->  UC-19 Masuk Admin
        +--------+              |
                     +----------+----------+----------+----------+
                     |          |          |          |          |
                     v          v          v          v          v
              +----------+ +----------+ +----------+ +----------+ +----------+
              | UC-20    | | UC-21    | | UC-22    | | UC-23    | | UC-24    |
              | Dashboard| | Kelola   | | Kelola   | | Kelola   | | Lihat    |
              | + grafik | | Pengguna | | Vendor   | | Alat     | | Semua    |
              |          | | (role)   | | (setuju) | |          | | Booking  |
              +----------+ +----------+ +----------+ +----------+ +----------+
```

---

## 4. Relasi Include dan Extends

| Use Case | Relasi | Target | Keterangan |
|---|---|---|---|
| UC-07 Pesan Alat | `include` | UC-09 Bayar via Midtrans | Memesan alat mengharuskan pembayaran |
| UC-07 Pesan Alat | `include` | UC-08 Pilih Tanggal Sewa | Tanggal wajib sebelum pesan |
| UC-04 Daftar | `include` | UC-05 Masuk | Setelah daftar, pengguna masuk |
| UC-15 Kelola Katalog | `include` | UC-16 Unggah Gambar | Tambah alat bisa disertai gambar |
| Penyewa | `extends` | Pengunjung | Penyewa punya semua hak pengunjung |
| Vendor | `extends` | Penyewa | Vendor punya semua hak penyewa |
| UC-12 Beri Ulasan | `extends` | UC-03 Lihat Detail | Ulasan ditulis dari halaman detail |

---

## 5. Skenario Utama

### 5.1 Skenario Login
1. Pengunjung memilih "Masuk".
2. Sistem menampilkan form email dan kata sandi.
3. Pengunjung mengisi kredensial lalu menekan "Masuk".
4. Sistem memverifikasi lewat Supabase Auth.
5. Jika berhasil, sistem mengarahkan pengguna ke halaman utama.
6. Jika gagal, sistem menampilkan pesan kesalahan.

### 5.2 Skenario Pesan dan Bayar Alat
1. Penyewa melihat katalog lalu memilih alat.
2. Penyewa memasukkan alat ke keranjang dan memilih tanggal sewa.
3. Penyewa membuka halaman checkout dan menekan "Bayar".
4. Sistem membuat booking dan mengirim permintaan ke Midtrans.
5. Midtrans memproses pembayaran lalu mengirim webhook.
6. Sistem memperbarui status pembayaran dan booking.

### 5.3 Skenario Konfirmasi Booking oleh Vendor
1. Vendor membuka dashboard.
2. Sistem menampilkan booking alat milik vendor.
3. Vendor mengonfirmasi booking (status menjadi "dikonfirmasi").
4. Vendor mengubah status menjadi "sedang_berjalan" dan "selesai".

### 5.4 Skenario Admin Mengelola Pengguna
1. Admin masuk ke aplikasi "Komunitas Robotika".
2. Admin memilih menu Pengguna.
3. Sistem menampilkan daftar pengguna.
4. Admin mengubah role pengguna (renter/vendor/admin).
5. Sistem menyimpan perubahan.

---
