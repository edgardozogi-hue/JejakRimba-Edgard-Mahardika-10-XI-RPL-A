# Prompt Use Case & ERD untuk ChatGPT

Salin-tempel seluruh isi blok di bawah ini ke ChatGPT (jangan ubah bagian [DATA] supaya
konsisten dengan aplikasi aktual). ChatGPT akan mengembalikan kode diagram yang bisa
langsung dirender. Pilih salah satu format di bagian "Permintaan" tergantung tujuanmu.

---

## [PERMINTAAN] — pilih salah satu

### Opsi A: Mermaid (paling praktis, bisa dirender di GitHub / draw.io)
> Buatlah dua diagram dari data berikut dengan gaya profesional dan rapi:
> (1) **Use Case Diagram** memakai `sequenceDiagram`? Tidak. Gunakan **Mermaid "flowchart"** untuk
> merepresentasikan use case. Pemakaian notasi batas sistem memakai blok `subgraph`.
> (2) **ERD** memakai **Mermaid `erDiagram`** dengan kardinalitas yang benar
> (one-to-many, one-to-one) untuk setiap relasi.
> Sertakan kata kunci kardinalitas Crow's Foot di sisi yang tepat untuk tiap tabel yang
> menyimpan foreign key. Setelah itu, beri catatan singkat daftar relasi beserta
> kardinalitasnya. Jangan menambahkan atribut yang tidak ada di data.

### Opsi B: PlantUML (notasi Chen bisa digambar)
> Buatlah dua diagram UML dari data berikut:
> (1) **Use Case Diagram** (`@startuml`) dengan 5 aktor: Pengunjung, Penyewa, Vendor,
> Admin, dan Midtrans. Gunakan `use case` untuk tiap fitur dan ikon `<<include>>` serta
> `<<extends>>` sesuai daftar relasi. Kelompokkan aktor dengan relasi generalisasi
> `Penyewa --|> Pengunjung` dan `Vendor --|> Penyewa`.
> (2) **ERD Notasi Chen** (`@startuml`) dengan entitas sebagai persegi panjang, atribut
> sebagai elips (ilustrasikan lewat komentar/label bullet), dan relasi sebagai belah
> ketupat. Karena PlantUML tidak punya diamond atribut bawaan, gunakan label yang jelas
> dan beri kardinalitas di tiap ujung garis. Kunci utama diberi penanda `PK`, kunci asing
> `FK`.
> Sertakan blok `@enduml` yang utuh dan siap pakai.

### Opsi C: Instruksi menggambar manual di draw.io
> Baca data berikut lalu berikan instruksi langkah demi langkah untuk menggambar
> Use Case Diagram dan ERD Notasi Chen di draw.io secara manual, termasuk tata letak
> (layout) yang rapi, posisi tiap aktor/entitas, dan cara menautkan garis. Berikan juga
> daftar teks label untuk tiap kotak elips sehingga tinggal disalin.

---

## [DATA] — schema database Jejak Rimba

Tambahkan baris ini PDATANYA ke prompt sebagai "jangan buat tabel baru" supaya ChatGPT
tidak berimajinasi.

```
Enums:
- user_role: renter | vendor | admin
- equipment_category: tenda | carrier | sleeping_bag | kompor | matras | jaket
- equipment_condition: baru | sangat_baik | baik
- booking_status: menunggu_konfirmasi | dikonfirmasi | sedang_berjalan | selesai | dibatalkan
- payment_status: menunggu | berhasil | gagal | kedaluwarsa
- notification_type: konfirmasi_booking | pengingat_pengembalian | pembayaran_berhasil | pembayaran_gagal

Tabel:
profiles(id PK uuid, full_name text, role user_role, phone_number text?, avatar_url text?,
        address text?, latitude float?, longitude float?, notification_prefs jsonb?,
        created_at, updated_at)
vendors(id PK uuid, profile_id FK->profiles, business_name text, business_description text?,
        address text, latitude float, longitude float, whatsapp_number text,
        is_verified bool, is_active bool?, created_at, updated_at)
equipment(id PK uuid, vendor_id FK->vendors, name text, category equipment_category,
        description text?, price_per_day numeric, total_stock int, condition equipment_condition,
        capacity text?, elevation text?, is_active bool, created_at, updated_at)
equipment_images(id PK uuid, equipment_id FK->equipment, url text, is_primary bool,
        sort_order int, created_at)
bookings(id PK uuid, renter_id FK->profiles, equipment_id FK->equipment?,
        quantity int, start_date date, end_date date, total_price numeric,
        status booking_status, notes text?, created_at, updated_at)
booking_items(id PK uuid, booking_id FK->bookings, equipment_id FK->equipment,
        quantity int, price_per_day numeric, subtotal numeric, created_at)
transactions(id PK uuid, booking_id FK->bookings, amount numeric, payment_method text?,
        payment_status payment_status, midtrans_transaction_id text?,
        midtrans_order_id text?, paid_at timestamptz?, created_at, updated_at)
reviews(id PK uuid, booking_id FK->bookings, reviewer_id FK->profiles,
        equipment_id FK->equipment, rating int 1-5, comment text?, created_at)
notifications(id PK uuid, profile_id FK->profiles, booking_id FK->bookings?,
        type notification_type, message text, is_read bool, sent_at timestamptz?, created_at)

Relasi & kardinalitas:
- profiles (1) -- MEMILIKI --> (0..1) vendors      [satu profile punya maksimal satu vendor]
- vendors (1) -- MENYEDIAKAN --> (0..N) equipment
- equipment (1) -- MEMILIKI_GAMBAR --> (0..N) equipment_images
- profiles (1) -- MEMESAN --> (0..N) bookings       [sebagai renter]
- bookings (1) -- MEMILIKI_ITEM --> (0..N) booking_items
- equipment (1) -- DIPESAN_DALAM --> (0..N) booking_items
- bookings (1) -- DICATAT --> (0..1) transactions
- profiles (1) -- MENULIS --> (0..N) reviews        [sebagai reviewer]
- bookings (1) -- DIDASARI --> (0..N) reviews
- equipment (1) -- DINILAI --> (0..N) reviews
- profiles (1) -- MENERIMA --> (0..N) notifications
- bookings (1) -- TERKAIT --> (0..N) notifications

Catatan: booking multi-item dimodelkan lewat entitas booking_items. Kolom
bookings.equipment_id bersifat opsional dan null untuk booking multi-item.
```

---

## [DATA] — use case Jejak Rimba

```
Aktor:
- Pengunjung  : tamu yang belum login.
- Penyewa     : sudah login, memiliki semua hak Pengunjung.
- Vendor      : penyewa yang terdaftar sebagai penyedia alat, memiliki semua hak Penyewa.
- Admin       : pengelola platform (aplikasi "Komunitas Robotika").
- Midtrans    : sistem pembayaran eksternal.

Use case per aktor:
Pengunjung:
  UC-01 Lihat Katalog Alat
  UC-02 Cari dan Filter Alat
  UC-03 Lihat Detail dan Ulasan Alat
  UC-04 Daftar (Registrasi)
  UC-05 Masuk (Login)
Penyewa (plus hak Pengunjung):
  UC-06 Kelola Keranjang
  UC-07 Pesan Alat (single-item atau multi-item)
  UC-08 Pilih Tanggal Sewa
  UC-09 Bayar via Midtrans
  UC-10 Lihat Booking Saya
  UC-11 Batalkan Booking
  UC-12 Beri Ulasan
  UC-13 Kelola Profil (nama, avatar, kata sandi, preferensi notifikasi, sesi aktif)
  UC-14 Daftar atau Beralih sebagai Vendor
Vendor (plus hak Penyewa):
  UC-15 Kelola Katalog Alat (tambah, ubah, hapus, aktif/nonaktif)
  UC-16 Unggah Gambar Alat
  UC-17 Lihat Booking Alat Miliknya
  UC-18 Konfirmasi dan Update Status Booking
Admin:
  UC-19 Masuk Admin
  UC-20 Lihat Dashboard dan Grafik Pendapatan (6 bulan)
  UC-21 Kelola Pengguna (ubah role)
  UC-22 Kelola Vendor (setujui/aktifkan)
  UC-23 Kelola Alat (aktif/nonaktif, hapus)
  UC-24 Lihat Semua Booking dan Update Status
Midtrans (eksternal):
  UC-25 Proses Pembayaran
  UC-26 Kirim Webhook Status Pembayaran

Relasi:
- Penyewa --|> Pengunjung   (extends)
- Vendor  --|> Penyewa      (extends)
- UC-07 Pesan Alat  include  UC-09 Bayar via Midtrans
- UC-07 Pesan Alat  include  UC-08 Pilih Tanggal Sewa
- UC-04 Daftar      include  UC-05 Masuk
- UC-15 Kelola Katalog termasuk UC-16 Unggah Gambar
```

---

## Cara pakai

1. Salin isi blok **[PERMINTAAN]** (pilih Opsi A/B/C) lalu gabung dengan blok
   **[DATA schema]** dan **[DATA use case]**.
2. Tempel semuanya ke ChatGPT dalam satu pesan.
3. Hasil kode diagram:
   - **Opsi A (Mermaid):** paste ke file `.mmd` lalu render di GitHub atau editor
     Mermaid, atau tempel langsung di draw.io (Menu: Arrange → Insert → Advanced → Mermaid).
   - **Opsi B (PlantUML):** paste ke draw.io (Arrange → Insert → Advanced → PlantUML)
     atau tool PlantUML online.
4. Kalau mau format dokumen (Word), render diagram jadi gambar PNG/SVG lalu sisipkan ke
   laporan. Ingat konvensi: judul "Gambar x.y" dan lebar 14,5 cm di laporan.

> Tips: sebutkan ke ChatGPT "jangan menambah entitas, use case, atau atribut di luar data
> di atas" agar hasil tetap sesuai implementasi nyata.