# LAPORAN PROJECT BASED LEARNING
## WEBSITE JEJAK RIMBA
### Konsentrasi Keahlian Rekayasa Perangkat Lunak
### Semester Ganjil 2026/2027

---

<br><br><br><br><br><br>

**PENYUSUN :**

[Nama Lengkap Penulis]

NIS [Nomor Induk Siswa]

<br><br>

**PEMBIMBING :**

[Nama Guru Pembimbing, M.Pd]

<br><br><br>

**SMK NEGERI 4 MALANG**
Jalan Tanimbar Nomor 22 Malang, Jawa Timur 65117
Telepon (0341) 353798
Laman www.smkn4malang.sch.id, Pos-el mail@smkn4malang.sch.id

---

<br>

# KATA PENGANTAR

Assalamu'alaikum Wr. Wb.

Puji syukur kehadirat Allah SWT yang telah memberikan rahmat, taufik, dan hidayah-Nya sehingga laporan Project Based Learning dengan judul "Website Jejak Rimba" ini dapat terselesaikan. Shalawat serta salam senantiasa tercurah kepada Nabi Muhammad SAW beserta keluarga, sahabat, dan pengikutnya hingga akhir zaman.

Penulis menyadari bahwa laporan ini tidak akan selesai tanpa bantuan dari banyak pihak. Oleh karena itu, penulis ingin menyampaikan rasa hormat dan terima kasih kepada:

1. Bapak/Ibu Kepala SMK Negeri 4 Malang yang telah memberikan izin, kesempatan, serta dukungan kepada penulis dalam pelaksanaan kegiatan Project Based Learning (PjBL) sehingga penyusunan laporan ini dapat terlaksana dengan baik.

2. Bapak/Ibu Ketua Program Keahlian Rekayasa Perangkat Lunak (RPL) SMK Negeri 4 Malang yang telah memberikan arahan, dukungan, serta kerja sama selama pelaksanaan kegiatan Project Based Learning (PjBL) dan penyusunan laporan ini.

3. Bapak/Ibu Guru Pembimbing di SMK Negeri 4 Malang yang telah memberikan bimbingan, masukan, serta pendampingan kepada penulis selama pelaksanaan kegiatan Project Based Learning (PjBL) sehingga laporan ini dapat diselesaikan dengan baik.

4. Bapak/Ibu Wali Kelas yang telah memberikan arahan, dukungan, serta membantu mengoordinasikan peserta didik selama pelaksanaan kegiatan Project Based Learning (PjBL), sehingga kegiatan dapat berlangsung dengan baik dan laporan ini dapat diselesaikan.

5. Teman-teman yang telah memberikan dukungan, motivasi, bantuan, serta berbagi pengalaman dan masukan selama pelaksanaan kegiatan Project Based Learning (PjBL) hingga penyusunan laporan ini dapat diselesaikan.

Demi kesempurnaan laporan ini, penulis mengharapkan kritik dan saran yang membangun. Harapan penulis, laporan ini dapat memberikan manfaat bagi semua pihak yang membacanya.

Wassalamu'alaikum Wr. Wb.

<br><br><br><br><br>

Malang, [Tanggal] 2026
Penulis,

<br><br><br><br>

[Nama Lengkap Penulis]

---

# DAFTAR ISI

| Bagian | Halaman |
|---|---|
| KATA PENGANTAR | ii |
| DAFTAR ISI | iv |
| DAFTAR TABEL | v |
| DAFTAR GAMBAR | vi |
| DAFTAR LAMPIRAN | vii |
| BAB 1 PENDAHULUAN | 1 |
| 1.1 Latar Belakang | 1 |
| 1.2 Tujuan | 1 |
| 1.3 Manfaat | 1 |
| BAB 2 KAJIAN PUSTAKA | 2 |
| 2.1 Website | 2 |
| 2.2 Jejak Rimba | 2 |
| 2.3 Next.js | 3 |
| 2.4 Supabase | 3 |
| 2.5 Midtrans | 3 |
| BAB 3 PROSES KERJA | 5 |
| 3.1 Desain Produk | 5 |
| 3.2 Alur Perencanaan dan Pelaksanaan | 5 |
| 3.3 Alat dan Bahan | 6 |
| 3.4 Jadwal Projek | 6 |
| BAB 4 HASIL PROYEK | 8 |
| 4.1 Hasil | 8 |
| BAB 5 PENUTUP | 9 |
| 5.1 Kesimpulan | 9 |
| 5.2 Saran | 9 |
| DAFTAR RUJUKAN | 10 |
| PROFIL PENULIS | 12 |

---

# DAFTAR TABEL

| No | Judul Tabel | Halaman |
|---|---|---|
| Tabel 3.1 | Jadwal Projek | 6 |
| Tabel 4.1 | Data Alat pada Katalog Jejak Rimba | 8 |

---

# DAFTAR GAMBAR

| No | Judul Gambar | Halaman |
|---|---|---|
| Gambar 3.1 | Wireframe Halaman Masuk | 5 |
| Gambar 3.2 | Alur Perencanaan dan Pelaksanaan | 5 |
| Gambar 3.3 | Diagram ERD Jejak Rimba | 6 |
| Gambar 4.1 | Tampilan Halaman Utama | 8 |
| Gambar 4.2 | Tampilan Halaman Katalog Alat | 8 |

---

# DAFTAR LAMPIRAN

| No | Judul Lampiran |
|---|---|
| Lampiran 1 | Struktur Tabel Basis Data |
| Lampiran 2 | Foto Kegiatan |

---

<br>

# BAB 1 PENDAHULUAN

## 1.1 Latar Belakang

Aktivitas mendaki gunung dan berkemah akhir-akhir ini semakin diminati masyarakat. Tren ini terlihat jelas di berbagai media sosial seperti Instagram, TikTok, dan Twitter. Banyak kreator konten dan influencer yang rutin membagikan pengalaman mereka saat berada di alam terbuka. Dampaknya, minat orang untuk mencoba kegiatan yang sama ikut naik.

Sayangnya, ada satu kendala yang sering dihadapi calon pendaki, yaitu keterbatasan alat. Peralatan pendakian seperti tenda, carrier, sleeping bag, dan jaket gunung harganya cukup mahal. Tidak semua orang sanggup membelinya, apalagi kalau alat itu hanya dipakai sekali atau dua kali dalam setahun.

Di sisi lain, penyedia sewa alat di wilayah Malang Raya masih banyak yang bekerja secara manual. Mereka mengandalkan pesan singkat melalui WhatsApp atau media sosial. Akibatnya, calon penyewa kesulitan mengetahui ketersediaan stok, harga, dan lokasi pengambilan secara cepat. Mereka harus menghubungi satu per satu penyedia hanya untuk mengecek apakah alat yang dicari masih ada.

Berdasarkan masalah tersebut, penulis membangun sebuah platform bernama Jejak Rimba. Platform ini berbentuk website yang mempertemukan penyewa dengan penyedia alat camping dan mendaki. Dengan adanya platform ini, pengguna dapat melihat katalog alat, memeriksa stok secara langsung, membandingkan harga dan lokasi, lalu melakukan pemesanan dan pembayaran secara daring.

## 1.2 Tujuan

Tujuan pengembangan website Jejak Rimba adalah sebagai berikut.

1. Menyediakan platform persewaan alat mendaki dan berkemah yang dapat diakses selama 24 jam setiap hari.
2. Memberikan pengalaman transaksi yang aman, transparan, dan efisien bagi pengguna maupun penyedia alat.
3. Membangun ekosistem yang saling menguntungkan antara pengguna dan penyedia alat persewaan di Malang Raya.

## 1.3 Manfaat

Manfaat yang diharapkan dari pengembangan Jejak Rimba antara lain:

1. Bagi pengguna, mempermudah pencarian alat camping yang tersedia tanpa harus menghubungi penyedia satu per satu.
2. Bagi penyedia, memperluas jangkauan pasar sehingga alat yang disewakan dapat menjangkau lebih banyak pelanggan.
3. Bagi penulis, menambah pengalaman dalam merancang dan membangun aplikasi berbasis website menggunakan teknologi modern seperti Next.js dan Supabase.

---

<br>

# BAB 2 KAJIAN PUSTAKA

## 2.1 Website

Website adalah kumpulan halaman yang saling terhubung dan dapat diakses melalui internet menggunakan peramban. Setiap website memiliki alamat tersendiri yang disebut domain. Halaman di dalamnya dapat memuat teks, gambar, video, maupun formulir interaktif.

Secara garis besar, website dibagi menjadi dua jenis. Website statis menampilkan konten yang tetap dan tidak berubah kecuali file-nya diubah. Sementara itu, website dinamis menampilkan konten yang dapat berubah sesuai interaksi pengguna dan data yang tersimpan di basis data. Jejak Rimba termasuk website dinamis karena katalog alat dan status pemesanan diambil langsung dari basis data.

## 2.2 Jejak Rimba

Jejak Rimba adalah platform persewaan alat camping dan mendaki yang beroperasi di wilayah Malang Raya, mencakup Malang Kota, Batu, dan Lawang. Melalui website ini, pengguna dapat menjelajahi katalog alat, melihat ketersediaan stok secara langsung, membandingkan harga dan lokasi penyedia, serta melakukan pemesanan dan pembayaran secara daring.

Platform ini menghubungkan dua pihak. Pihak pertama adalah penyewa, yaitu masyarakat umum yang membutuhkan alat untuk kegiatan berkemah atau mendaki. Pihak kedua adalah penyedia, yaitu pemilik usaha rental yang menyewakan perlengkapan outdoor. Interaksi keduanya difasilitasi secara digital sehingga prosesnya lebih cepat dan terarah.

## 2.3 Next.js

Next.js adalah kerangka kerja React yang digunakan untuk membangun aplikasi website. Next.js mendukung server-side rendering dan static generation, sehingga halaman dapat dimuat dengan cepat. Kerangka kerja ini juga menyediakan sistem routing berbasis folder, API routes, dan server actions untuk menangani logika di sisi server.

Pada Jejak Rimba, Next.js digunakan bersama TypeScript. TypeScript menambahkan pemeriksaan tipe data sehingga kode lebih aman dan mudah dikelola. Antarmuka dibangun dengan React, sedangkan gaya tampilannya memakai Tailwind CSS. Animasi antarmuka memanfaatkan Framer Motion untuk memberikan kesan yang lebih hidup.

## 2.4 Supabase

Supabase adalah layanan backend yang menyediakan basis data PostgreSQL, autentikasi pengguna, dan penyimpanan file. Supabase dilengkapi dengan Row Level Security, yaitu aturan keamanan di tingkat baris data. Dengan aturan ini, setiap pengguna hanya dapat mengakses data yang menjadi haknya.

Autentikasi di Jejak Rimba ditangani oleh Supabase Auth. Pengguna dapat mendaftar dan masuk menggunakan email serta kata sandi, atau melalui akun Google. Sesi pengguna dikelola menggunakan cookie yang disegarkan secara otomatis. Data profil, alat, pemesanan, dan ulasan disimpan pada basis data PostgreSQL.

## 2.5 Midtrans

Midtrans adalah penyedia layanan pembayaran daring di Indonesia. Midtrans mendukung berbagai metode pembayaran, mulai dari transfer bank, kartu kredit, hingga dompet digital. Integrasi dengan Midtrans memungkinkan aplikasi menerima pembayaran tanpa harus mengurus sistem perbankan sendiri.

Pada Jejak Rimba, Midtrans menangani proses pembayaran pesanan. Ketika pengguna melakukan pembayaran, statusnya diperbarui secara otomatis melalui webhook yang dikirim Midtrans ke server. Dengan begitu, status pembayaran selalu sesuai dengan kondisi sebenarnya tanpa bergantung pada tindakan pengguna.

---

<br>

# BAB 3 PROSES KERJA

## 3.1 Desain Produk

Tahap desain dimulai dengan membuat wireframe untuk halaman-halaman utama. Wireframe ini menggambarkan tata letak elemen sebelum diubah menjadi kode. Dua wireframe yang dibuat lebih dahulu adalah halaman masuk dan halaman daftar.

Halaman masuk terdiri dari tombol kembali di pojok kiri atas, logo Jejak Rimba, judul "Masuk ke Akun Anda", dua kolom input untuk email dan kata sandi, tautan lupa kata sandi, tombol masuk utama, pemisah "atau", tombol masuk dengan Google, serta tautan menuju halaman daftar.

Halaman daftar memiliki tombol kembali, judul "Buat Akun Baru", empat kolom input untuk nama lengkap, email, kata sandi, dan konfirmasi kata sandi, tombol daftar utama, pemisah "atau", tombol daftar dengan Google, serta tautan menuju halaman masuk.

![Gambar 3.1 Wireframe Halaman Masuk]

## 3.2 Alur Perencanaan dan Pelaksanaan

Pengerjaan Jejak Rimba berjalan melalui beberapa tahap. Setiap tahap diselesaikan secara berurutan agar hasilnya terarah.

- Analisis kebutuhan. Penulis mengidentifikasi fitur yang dibutuhkan, di antaranya katalog alat, sistem pemesanan, dan pembayaran daring.
- Perancangan data. Penulis membuat diagram ERD dan menentukan delapan tabel utama beserta relasinya.
- Implementasi basis data. Tabel-tabel dibuat pada Supabase beserta aturan keamanan barisnya.
- Pengembangan halaman. Halaman utama, katalog, detail alat, dan alur pemesanan dibangun menggunakan Next.js.
- Penerapan autentikasi. Sistem masuk dan daftar pengguna disambungkan ke Supabase Auth, lalu route yang bersifat pribadi dilindungi oleh middleware.
- Pengujian. Seluruh fitur diuji untuk memastikan alur pemesanan dan pembayaran berjalan dengan benar.

![Gambar 3.2 Alur Perencanaan dan Pelaksanaan]

![Gambar 3.3 Diagram ERD Jejak Rimba]

## 3.3 Alat dan Bahan

Perangkat dan perangkat lunak yang digunakan dalam pengerjaan proyek ini adalah sebagai berikut.

1. Laptop: perangkat keras utama untuk menjalankan seluruh aplikasi yang dibutuhkan.
2. Visual Studio Code: editor kode tempat menulis dan mengelola seluruh kode program.
3. Next.js dan TypeScript: kerangka kerja dan bahasa pemrograman untuk membangun aplikasi.
4. Tailwind CSS dan Framer Motion: untuk menata tampilan dan menambahkan animasi.
5. Supabase: basis data dan layanan autentikasi.
6. Midtrans: penyedia layanan pembayaran daring.
7. Git dan GitHub: untuk mengelola versi kode dan menyimpan repository.
8. Figma: digunakan dalam perancangan desain antarmuka sebelum diterjemahkan ke kode.

## 3.4 Jadwal Projek

| Tahapan | Waktu | Kegiatan |
|---|---|---|
| Perencanaan | 14-16 April 2026 | Analisis kebutuhan sistem dan perancangan data |
|  | 17 April 2026 | Perancangan basis data (ERD) |
| Pelaksanaan | 21 April - 16 Mei 2026 | Pembuatan basis data dan koneksi (Supabase) |
|  | 18 Mei 2026 | Implementasi halaman dinamis dan autentikasi |
|  | 19-20 Mei 2026 | Pembuatan katalog alat dan dashboard penyedia |
|  | 21 Mei 2026 | Implementasi alur pemesanan dan pembayaran |
|  | 22 Mei 2026 | Pengujian sistem |
| Pelaporan | 4 Juni 2026 | Finalisasi laporan |
|  | 5 Juni 2026 | Presentasi akhir |

Tabel 3.1 Jadwal Projek

---

<br>

# BAB 4 HASIL PROYEK

## 4.1 Hasil

Website Jejak Rimba berhasil dibangun sesuai dengan perancangan awal. Seluruh halaman utama yang direncanakan telah terwujud, di antaranya:

1. Halaman utama yang menampilkan sambutan, alur cara sewa, katalog alat unggulan, serta testimoni pengguna.
2. Halaman katalog yang memuat daftar alat lengkap dengan filter kategori dan lokasi.
3. Halaman detail alat yang menampilkan harga per hari, stok, kondisi, lokasi, dan nama penyedia.
4. Alur pemesanan yang terdiri dari pemilihan tanggal, pengisian data, dan konfirmasi pesanan.
5. Halaman masuk, daftar, dan lupa kata sandi yang terhubung dengan Supabase Auth.
6. Halaman profil untuk mengelola data diri dan melihat riwayat pemesanan.
7. Dashboard khusus untuk penyedia dalam mengelola alat dan melihat pesanan masuk.
8. Halaman informasi berupa FAQ, kebijakan privasi, serta syarat dan ketentuan.

Data alat yang tampil pada katalog mengambil contoh nyata dari beberapa penyedia. Beberapa di antaranya dapat dilihat pada tabel berikut.

| Nama Alat | Kategori | Harga/Hari | Stok | Lokasi |
|---|---|---|---|---|
| Tenda Dome Consina 4P | Tenda | Rp35.000 | 6 | Malang Kota |
| Tenda Ultralight Eiger 2P | Tenda | Rp45.000 | 3 | Batu |
| Carrier Avtech 60L | Carrier | Rp20.000 | 10 | Malang Kota |
| Carrier Deuter 80L | Carrier | Rp28.000 | 4 | Lawang |
| Sleeping Bag Naturehike M400 | Sleeping Bag | Rp15.000 | 12 | Malang Kota |
| Kompor Portable + Gas Windproof | Kompor | Rp12.000 | 8 | Batu |
| Matras Lipat Aluminium Foil | Matras | Rp8.000 | 15 | Lawang |
| Jaket Gunung Waterproof Eiger | Jaket | Rp25.000 | 0 | Malang Kota |

Tabel 4.1 Data Alat pada Katalog Jejak Rimba

![Gambar 4.1 Tampilan Halaman Utama]

![Gambar 4.2 Tampilan Halaman Katalog Alat]

---

<br>

# BAB 5 PENUTUP

## 5.1 Kesimpulan

Berdasarkan hasil pengerjaan proyek ini, penulis menarik beberapa kesimpulan. Website Jejak Rimba berhasil dibangun sebagai platform persewaan alat camping dan mendaki yang dapat diakses melalui peramban, baik dari perangkat desktop maupun ponsel.

Fitur utama seperti katalog alat, pemesanan, dan pembayaran daring telah berjalan sesuai rencana. Teknologi yang dipakai, yaitu Next.js untuk antarmuka dan Supabase untuk basis data serta autentikasi, terbukti mampu mendukung kebutuhan tersebut. Melalui platform ini, calon pendaki dapat menemukan alat yang tersedia tanpa harus menghubungi penyedia satu per satu.

## 5.2 Saran

Untuk pengembangan selanjutnya, penulis menyarankan beberapa perbaikan. Katalog dapat dilengkapi dengan fitur pencarian dan filter berdasarkan harga, ketersediaan tanggal, serta peringkat penyedia. Penambahan fitur peta interaktif akan membantu pengguna melihat lokasi pengambilan alat secara visual.

Selain itu, sistem pengingat untuk pengembalian alat dapat ditambahkan agar penyewa tidak melewatkan batas waktu. Penyedia juga akan terbantu jika tersedia laporan transaksi yang bisa diunduh. Dengan begitu, pengalaman seluruh pihak dapat menjadi lebih nyaman.

---

# DAFTAR RUJUKAN

[1] Vercel. "Next.js Documentation." https://nextjs.org/docs (diakses pada [Tanggal] 2026).

[2] Supabase. "Supabase Documentation: Auth, Database, Row Level Security." https://supabase.com/docs (diakses pada [Tanggal] 2026).

[3] Midtrans. "Midtrans Documentation: Payment Gateway Indonesia." https://docs.midtrans.com (diakses pada [Tanggal] 2026).

[4] Tailwind Labs. "Tailwind CSS Documentation." https://tailwindcss.com/docs (diakses pada [Tanggal] 2026).

[5] Kemdikbud. "Kamus Besar Bahasa Indonesia." https://kbbi.kemdikbud.go.id (diakses pada [Tanggal] 2026).

---

# PROFIL PENULIS

Penulis bernama [Nama Lengkap Penulis], lahir di [Tempat Lahir] pada tanggal [Tanggal Lahir]. Saat ini penulis merupakan peserta didik kelas XI Program Keahlian Rekayasa Perangkat Lunak (RPL) di SMK Negeri 4 Malang. Penulis memiliki minat di bidang pengembangan perangkat lunak, khususnya pembuatan website, desain antarmuka (UI/UX), dan pengelolaan basis data.

Selama menempuh pendidikan di SMK Negeri 4 Malang, penulis aktif mengikuti berbagai kegiatan pembelajaran berbasis proyek. Salah satu proyek yang pernah dikerjakan adalah website Jejak Rimba, yaitu platform persewaan alat camping dan mendaki. Melalui proyek tersebut, penulis memperoleh pengalaman dalam menganalisis kebutuhan pengguna, merancang sistem, mengembangkan aplikasi, serta bekerja sama dengan rekan satu tim.

Penulis berharap ilmu dan pengalaman yang diperoleh selama masa pendidikan dapat menjadi bekal untuk melanjutkan studi maupun berkarier di bidang teknologi informasi. Penulis juga ingin memberikan kontribusi positif bagi masyarakat melalui pengembangan perangkat lunak yang bermanfaat.

---

<br>

# LAMPIRAN 1: STRUKTUR TABEL BASIS DATA

**Tabel User (Profiles)**

| No | Nama Field | Tipe | Panjang | Keterangan |
|---|---|---|---|---|
| 1 | id | UUID | - | Primary Key |
| 2 | full_name | text | - | Nama lengkap pengguna |
| 3 | email | text | - | Alamat email |
| 4 | phone_number | text | - | Nomor telepon |
| 5 | role | enum | - | penyewa, vendor, admin |
| 6 | avatar_url | text | - | Foto profil |

**Tabel Equipment**

| No | Nama Field | Tipe | Panjang | Keterangan |
|---|---|---|---|---|
| 1 | id | UUID | - | Primary Key |
| 2 | vendor_id | UUID | - | Foreign Key ke vendors |
| 3 | name | text | - | Nama alat |
| 4 | category | text | - | Kategori alat |
| 5 | price_per_day | number | - | Harga per hari |
| 6 | total_stock | integer | - | Jumlah stok |
| 7 | condition | enum | - | Kondisi alat |

---

# LAMPIRAN 2: FOTO KEGIATAN

[Tempat foto kegiatan selama proses pengerjaan proyek]
