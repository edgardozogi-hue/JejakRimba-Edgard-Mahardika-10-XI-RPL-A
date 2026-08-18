# Modul 1 — HTML & CSS & Tailwind

Di modul ini kamu membangun **fondasi tampilan** Jejak Rimba Mini: halaman HTML yang dibentuk dengan CSS (dan sedikit pengenalan Tailwind, yang dipakai project aslimu). Setelah modul ini, kamu tahu persis apa yang terjadi di `app/globals.css` dan class-class Tailwind di kode asli.

---

## 🥅 Target

Setelah modul ini kamu bisa:
- Menjelaskan apa itu HTML, CSS, dan perannya
- Membaca/menulis file HTML & CSS dasar
- Memakai selector, class, dan CSS variable
- Mengenali arti class Tailwind seperti `flex`, `bg-orange-500`, `px-4`

---

## 📖 Penjelasan panjang

### 1.1 Web itu tiga bahasa dalam satu file

Bayangkan kamu ingin membuat iklan sewa alat camping. Kamu butuh tiga hal:

1. **HTML = kerangka/boneka.** Menentukan *apa saja* yang ada: judul, gambar tenda, tombol "Sewa Sekarang", daftar harga. Semua ini "isinya".
2. **CSS = pakaian & riasan.** Menentukan *bagaimana tampilnya*: warnanya oranye apa biru, tulisannya besar atau kecil, gambar diredam kiri atau kanan.
3. **JavaScript = otot/otak.** Menentukan *perilakunya*: kalau tombol diklik apa yang terjadi (dipelajari di modul 2).

```
Sebuah halaman web  =  HTML (isi)  +  CSS (tampilan)  +  JS (perilaku)
```

| Bahasa | Peran | Analogi |
|---|---|---|
| HTML | Struktur & isi | Rangka + isi ruangan (dinding, pintu, sofa) |
| CSS | Tampilan & posisi | Cat, wallpaper, pencahayaan ruangan |
| JS | Perilaku & logika | Penghuni ruangan yang menyalakan lampu |

File HTML berisi teks yang "membungkus" elemen lewat **tag** seperti `<h1>`, `<p>`, `<div>`.

### 1.2 Bagaimana HTML dibaca browser

Browser membaca HTML dari atas ke bawah, membangun "pohon elemen" (disebut **DOM**). Coba buka halaman apa pun, tekan **F12 → Console/Console**, ketik:

```js
document.body.innerHTML = "Halo dari konsol!";
```

Perhatikan: seluruh isi halaman berubah jadi teks itu. Itu bukti kamu sedang "memegang" kerangka halaman lewat JavaScript.

### 1.3 CSS: memilih elemen lalu menghiasnya

CSS bekerja dengan pola:

```css
selector { properti: nilai;  properti: nilai; }
```

Contoh:

```css
h1 {                /* selector: semua tag <h1> */
  color: orange;    /* properti warna teks */
  font-size: 40px;  /* properti ukuran huruf */
  text-align: center; /* properti perataan */
}
```

### 1.4 Tiga cara memberi CSS

1. **Inline** — langsung di atribut elemen: `<p style="color:red">`. Cepat tapi berantakan.
2. **Internal** — di dalam `<style>` pada file HTML.
3. **External** — file `.css` terpisah yang di-link. Ini yang paling rapi dan **yang dipakai project asli** (`app/globals.css`).

```
Cara 3 (terbaik):
index.html  ──<link rel="stylesheet" href="style.css">──▶  style.css
```

### 1.5 CSS Variable (penting! dipakai asli)

CSS Variable = "wadah warna" yang bisa dipakai ulang. Project asli Jejak Rimba memakai ini di `app/globals.css`.

```css
:root {
  --ember: #c4622d;      /* warna utama oranye */
  --hutan: #1b3a2b;      /* warna hijau gelap */
  --pasir: #f5ede0;      /* warna latar krem */
}

p {
  color: var(--hutan);         /* pakai nilai dari variabel */
  background: var(--pasir);
}
```

**Kenapa penting?** Karena jika kamu ingin mengubah *seluruh* warna oranye di aplikasi menjadi biru, kamu cukup mengubah **satu baris** di `:root`. Tanpa variable, kamu harus mencari puluhan `orange` di banyak file.

### 1.6 Pengenalan Tailwind (yang sebenarnya dipakai project)

Project asli **tidak** menulis CSS satu-satu. Ia memakai **Tailwind CSS** — sekumpulan CSS yang sudah jadi, disebut lewat *class* di dalam tag HTML.

```html
<!-- Cara biasa (vanilla CSS) -->
<p class="judul">Halo</p>
```
```css
.judul { color: orange; font-size: 40px; text-align: center; }
```

```html
<!-- Cara Tailwind -->
<p class="text-orange-500 text-4xl text-center">Halo</p>
```

Arti `text-orange-500` = warna teks oranye, `text-4xl` = ukuran huruf sangat besar, `text-center` = rata tengah. **Buildnya (Tailwind) membuat class itu otomatis berubah jadi CSS** saat halaman dimuat.

| Class Tailwind | CSS yang dihasilkan |
|---|---|
| `text-orange-500` | `color: var(--color-orange-500)` (oranye) |
| `text-4xl` | `font-size: 2.25rem` |
| `text-center` | `text-align: center` |
| `flex` | `display: flex` (tata letak sejajar) |
| `px-4` | `padding-left: 1rem; padding-right: 1rem` |
| `bg-accent` | `background-color: <warna tema>` |

> Pada modul ini kamu berlatih **vanilla CSS** dulu (tanpa Tailwind) agar paham fondasinya. Saat masuk modul 5 (Next.js), kamu baru memakai Tailwind seperti project asli. Kenapa? Karena kalau langsung Tailwind tanpa paham CSS, kamu tidak mengerti apa yang "di belakang" class itu.

### 1.7 Layout dengan Flexbox (dasar)

Flexbox = cara menyusun elemen **berjajar / sejajar dan menyesuaikan ruang**, seperti mengatur kotak di rak.

```css
.kartu-container {
  display: flex;            /* anak-anaknya jadi sejajar horizontal */
  gap: 20px;               /* jarak antar kotak */
  flex-wrap: wrap;         /* kalau penuh, turun ke baris baru */
}
```

Setiap elemen di dalamnya (misal kartu alat) akan berjajar, dan jika layar mengecil maka kartu pindah ke bawah otomatis. Ini kunci membuat "katalog" yang responsif di aplikasimu.

---

## 🛠️ Tutorial step-by-step

Kita buat halaman beranda statis Jejak Rimba Mini pakai HTML + CSS murni.

### Langkah 1 — buat file index.html

Di `latihan/`, buat file `index.html`. Ketik (jangan salin-tempel):

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Jejak Rimba Mini</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Tenda Gunung -2derajat</h1>
  <p class="deskripsi">Kuat dan ringan untuk pendakian.</p>
  <button id="tombol-sewa">Sewa Sekarang</button>
</body>
</html>
```

### Langkah 2 — buat file style.css

File `style.css` di folder yang sama:

```css
:root {
  --ember: #c4622d;
  --hutan: #1b3a2b;
  --pasir: #f5ede0;
}

body {
  font-family: Arial, sans-serif;
  background: var(--pasir);
  color: var(--hutan);
  padding: 40px;
}

h1 {
  color: var(--ember);
  font-size: 48px;
}

.deskripsi {
  font-size: 20px;
  line-height: 1.6;
}

#tombol-sewa {
  background: var(--ember);
  color: #fff;
  border: none;
  padding: 14px 24px;
  font-size: 18px;
  border-radius: 8px;
  cursor: pointer;
}
```

### Langkah 3 — jalankan di browser

Buka `index.html` di browser (klik ganda, atau drag ke jendela browser). Kamu akan melihat judul oranye, teks hijau gelap di latar krem, dan tombol oranye.

### Langkah 4 — ulangi pola untuk "katalog"

Buat 3 kartu alat dengan **flexbox**. Ganti isi `<body>` dengan:

```html
<div class="kartu-container">
  <div class="kartu">
    <h2>Tenda Dome</h2>
    <p>Rp 50.000/hari</p>
  </div>
  <div class="kartu">
    <h2>Carrier 60L</h2>
    <p>Rp 40.000/hari</p>
  </div>
  <div class="kartu">
    <h2>Sleeping Bag</h2>
    <p>Rp 20.000/hari</p>
  </div>
</div>
```

Tambahkan di `style.css`:

```css
.kartu-container {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  margin-top: 30px;
}

.kartu {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 20px;
  width: 200px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
}
```

Simpan, buka lagi di browser. Selamat! Kamu baru saja membuat **katalog de facto** ala Jejak Rimba Mini versi HTML/CSS.

---

## ✋ Tugas Manual (KERJAKAN TANPA AI)

1. **Tulis ulang** (tidak menyalin-tempel) `style.css` dari awal di file baru `style2.css`. Setelah selesai, ubah link di `index.html` ke `style2.css`.
2. **Ganti warna tema.** Ubah nilai `--ember` menjadi `#2e6b4f` (hijau) dan `--hutan` menjadi `#333`. Amati seluruh halaman berubah. Ini membuktikan kekuatan CSS variable.
3. **Gambar di selembar kertas** diagram Flexbox: tulis 3 kotak berjajar, lalu panah menunjukkan arah penyusunan + jarak `gap`. Tujuannya bukan gambar bagus, tapi mengeluarkan pemahaman ke tangan/kertas.

---

## 🤖 Prompt ke AI (bimbingan)

**Kalau bingung CSS variable:**
```text
Saya belajar dari docs/LATIHAN/01-HTML-CSS.md. Saya tidak paham kenapa
mengubah satu nilai di :root mengubah semua warna. Jelaskan dengan analogi
"wadah cat" lalu beri saya 1 contoh kecil untuk saya ketik sendiri tanpa
langsung kasih jawabannya.
```

**Kalau error:**
```text
File saya di latihan/style.css tidak menerapkan warna. Isi file: [tempel].
Layar saya tampil hitam putih. Jangan langsung kasih kode final, bantu saya
menemukan sendiri dulu apa yang salah lewat pertanyaan.
```

---

## ✅ Checkpoint (jawaban di `11-JAWABAN-CHECKPOINT.md`)

1. Apa perbedaan peran HTML vs CSS vs JavaScript?
2. Apa gunanya `:root` dan CSS variable seperti `--ember`? Kenapa dipakai di project asli?
3. Jika ingin semua teks dalam aplikasi menjadi besar 2x, apa saja yang harus diubah?
4. Sebutkan arti class Tailwind ini: `text-4xl`, `flex`, `px-4`, `bg-accent`.
5. Apa fungsi `flex-wrap: wrap`?

---

## 🧠 Refleksi (tulis di notes-mu sendiri)

- Dalam satu kalimat, apa beda HTML dan CSS?
- Kenapa project asli tombolnya oranye (`--ember`)? Kira-kira kenapa dipilih?
- Sebutkan satu hal yang tadinya bingung, sekarang sudah jelas setelah modul ini.

---

**Lanjut ke [Modul 2 — JavaScript ES6+](02-JAVASCRIPT.md).**