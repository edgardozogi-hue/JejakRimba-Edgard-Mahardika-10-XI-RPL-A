# 00 — Pengantar Mini Project "Jejak Rimba Mini"

Selamat datang! Kurikulum ini akan membuatmu **benar-benar paham** seluruh isi project Jejak Rimba, dengan cara membangun sendiri versi mini-nya dari nol. Bukan teori yang dihapal, tapi **skill yang dicoba, dihancurkan, dan diperbaiki**.

---

## 1. Cara kerja kurikulum ini

Kamu akan membangun aplikasi **"Jejak Rimba Mini"** di dalam folder `latihan/` (di dalam project besarmu, tapi terpisah dari `app/` yang asli). Hasil akhirnya adalah aplikasi sewa alat camping mini yang **bentuknya persis pola** Jejak Rimba asli, tapi versi sederhana yang build-nya kamu pahami baris per baris.

Kurikulum dibagi **10 modul** + **2 file bonus**:

```
docs/LATIHAN/
├── 00-PENGANTAR.md        ← file ini
├── 01-HTML-CSS.md
├── 02-JAVASCRIPT.md
├── 03-REACT.md
├── 04-TYPESCRIPT.md
├── 05-NEXTJS-ROUTING.md
├── 06-SERVER-ACTIONS-SUPABASE.md
├── 07-AUTENTIKASI.md
├── 08-API-PEMBAYARAN.md
├── 09-MIDDLEWARE-ANIMASI-DEPLOY.md
├── 10-PROJECT-FINAL.md
├── 11-JAWABAN-CHECKPOINT.md
└── 12-BONUS-SUPABASE-MIDTRANS.md
```

### Setiap modul punya 7 bagian

| Ikon | Bagian | Apa isinya |
|---|---|---|
| 🥅 | **Target** | Capaian setelah modul selesai |
| 📖 | **Penjelasan panjang** | Konsep + analogi + ASCII art + kode contoh |
| 🛠️ | **Tutorial step-by-step** | Perintah & kode yang kamu ketik **sendiri** |
| ✋ | **Tugas Manual** | Latihan TANPA AI. Menulis ulang, menggambar, merapikan. |
| 🤖 | **Prompt ke AI** | Kalimat siap-tempel untuk minta bimbingan |
| ✅ | **Checkpoint** | Kuis pemantik. Jawaban di file `11-JAWABAN-CHECKPOINT.md` |
| 🧠 | **Refleksi** | Merangkum dengan bahasamu sendiri |

---

## 2. Aturan emas belajar

1. **TIPIS, DULUN, KETIK.** Jangan copy-paste kode utuh dari tutorial. Ketik sendiri, baris demi baris. Kesalahan ketik adalah guru terbaik.
2. **Kerjakan Tugas Manual.** Justru di sinilah otakmu mengolah, bukan menyalin.
3. **Importan, importan.** Semua konsep tersusun berurutan. Jangan loncat ke modul 7 kalau modul 3 belum kelar.
4. **Hancurkan dengan sengaja.** Kalau penasaran "kenapa error?", ubah kode, rusakkan, amati, perbaiki. Ini cara tercepat paham.
5. **Satu error, baca dulu.** Sebelum tanya AI, baca pesan error sampai paham. Error itu petunjuk, bukan musuh.

---

## 3. Setup lokasi latihan

Project asli kamu di `C:\Users\M S I\jejak-rimba\app`. Mini project didesain di folder **`latihan`** di root.

Kenapa kok terpisah? Supaya tidak merusak aplikasi aslimu. `latihan/` adalah "kertas buram" yang bebas dikotori.

**Buat folder latihan:**

Di terminal (buka di `C:\Users\M S I\jejak-rimba`), jalankan:

```bash
mkdir latihan
```

Modul 1–4 memakai file `.html`, `.css`, `.js` polos (jalankan langsung di browser). Mulai modul 5, kita akan mengubah `latihan/` menjadi aplikasi Next.js sungguhan dengan `package.json` sendiri.

> **Keamanan:** folder `latihan/` tidak ikut dibuild oleh Next.js asli karena hanya membaca folder `app/`. Jadi project aslimu tetap aman.

---

## 4. Cara meminta bimbingan (Promote ke AI)

Ini bagian yang kamu minta: **template prompt**. Ada dua kondisi:

### a) Kamu bingung konsep (belum menulis apa-apa)

Salin kalimat ini, ganti `[TOPIK]`:

```
Saya sedang belajar dari docs/LATIHAN/[NAMA MODUL]. Saya belum paham soal [TOPIK/KONSEP].
Jangan kasih kode langsung. Jelaskan dulu dengan analogi sederhana, lalu suruh saya mengetik
sendiri langkah pertamanya contoh kecil. Jangan langsung berikan jawaban akhir.
```

### b) Kamu error & buntu (sudah menulis kode)

```text
Saya error di [NAMA FILE], bagian [apa yang kamu lakukan].
Ini pesan errornya:
[tempel pesan error lengkap]

Ini kode saya:
[tempel kode yang error]

Jangan langsung perbaiki. Beri tahu dulu: 1) kenapa ini terjadi dengan bahasa saya,
2) petunjuk apa yang ada di pesan error itu, 3) baru setelah saya coba, ajak saya menemukan fix-nya.
```

### c) Kamu selesai satu modul, mau lanjut

```text
Saya selesai modul [n] [nama]. Ini yang saya buat:
[tempel hasilnya / screenshot]
Apa yang harus saya cek dulu sebelum lanjut ke modul [n+1]? Tolong cek pemahaman saya
dengan 3 pertanyaan singkat dulu.
```

**Mengapa prompt begitu panjang?** AI yang baik lebih berguna sebagai **pelatih** (bikin kamu berpikir) daripada sebagai *pengganti otak* (ngasih jawaban mentah). Prompt di atas memaksa AI memposisikan diri sebagai pembimbing.

---

## 5. Checklist "bekal" sebelum mulai

Pastikan sudah punya:

- [ ] Terminal (PowerShell / CMD) bisa dibuka di `C:\Users\M S I\jejak-rimba`
- [ ] Browser (Chrome/Edge) dengan **Developer Tools** (F12) — dipakai di modul 1–4
- [ ] Node.js + npm terpasang (cek: `node -v` dan `npm -v` di terminal)
- [ ] Editor kode (VS Code) dengan ekstensi **Prettier** (opsional tapi sangat membantu)

Cek setup bertiga ini dulu di terminal:

```bash
node -v
npm -v
```

Kalau keduanya muncul versi angka, kamu siap. Kalau error "node is not recognized", install dulu Node.js dari nodejs.org, lalu ulangi.

---

## 6. Peta alur belajar (dari mana ke mana)

```
[00 Pengantar] 
      ↓
[01 HTML/CSS]  →  [02 JavaScript]  →  [03 React]  →  [04 TypeScript]
      ↓
[05 Next.js]  →  [06 Server Actions + Supabase]  →  [07 Autentikasi]
      ↓
[08 API + Pembayaran]  →  [09 Middleware + Animas + Deploy]
      ↓
[10 Project Final: gabungkan semuanya]
```

Baris 1–4 = bangunan "fondasi" (halaman statis & logika). Baris 2 = "kerangka" (framework). Baris 3 = "perlengkapan" (data, keamanan, pembayaran). Baris 4 = "gudang final" hasil racikan.

---

## 7. Yang harus kamu lakukan sekarang

1. Buat folder `latihan` (perintah di atas).
2. Jalankan `node -v` & `npm -v`, pastikan tidak error.
3. Baca **Modul 1 (HTML-CSS.md)** dan mulai modul 1.
4. Kalau mentok, tempel prompt bimbingan dari bagian 4.

Selamat membangun! Ingat: **penulis memahami apa yang dia tulis ulang dengan tangannya sendiri**. Jangan serahkan pemahamanmu ke AI, pakai AI hanya sebagai pelatih.

**Lanjut ke [Modul 1 — HTML & CSS & Tailwind](01-HTML-CSS.md).**