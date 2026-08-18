# Modul 3 — React

Di modul ini kamu melangkah dari "halaman HTML yang dikuasai JavaScript" ke **React** — pustaka yang dipakai project asli untuk membangun komponen UI seperti `Navbar`, `Footer`, `EquipmentCard`. React adalah alasan file-file `.tsx` bisa punya banyak komponen dalam satu file.

---

## 🥅 Target

Setelah modul ini kamu bisa:
- Menjelaskan apa itu React & kenapa dipakai
- Menjelaskan **komponen** (function yang mengembalikan UI)
- Menggunakan **props** (cara mengirim data antar komponen)
- Menggunakan **state** (`useState`) & **efek** (`useEffect`)
- Menggunakan **JSX** (cara menulis HTML di dalam JavaScript)

---

## 📖 Penjelasan panjang

### 3.1 Apa itu React?

React = pustaka JavaScript untuk **membangun antarmuka dari blok kecil yang bisa dipakai ulang**.

**Masalah tanpa React:** kalau punya 10 kartu alat di 3 halaman, kamu menyalin HTML 3 kali. Saat ingin ubah gaya kartu, ubah di banyak tempat. Tidak efisien dan rawan lupa.

**Solusi React:** kamu buat **satu** komponen `KartuAlat`, lalu "memanggil"nya berkali-kali dengan data berbeda. Ubah gaya di satu tempat, semua kartu berubah.

```
Tanpa React:      <div class=kartu>...</div>  <div class=kartu>...</div>  ...
Dengan React:     <KartuAlat data={tenda} />  <KartuAlat data={carrier} />  ...
```

**Analogi:** komponen = **cetakan kue**. Kamu buat satu cetakan (komponen `KartuAlat`), lalu mencetak banyak kue (beri data beda) tanpa membuat ulang cetakannya.

### 3.2 JSX: menulis HTML di dalam JavaScript

React memakai **JSX** — sintaks yang membuatmu menulis HTML dalam file JavaScript/TypeScript. Inspirasi: file project asli berakhiran `.tsx` (TypeScript + JSX → `ts` + `x`).

```jsx
function Sapa() {
  return <h1>Halo, Jejak Rimba!</h1>;  // ini JSX
}
```

**Aturan penting JSX:**
1. Satu komponen harus mengembalikan **satu** elemen pembungkus (pakai `<>...</>` atau `<div>`).
2. Atribut HTML memakai **camelCase**: `class` → `className`, `for` → `htmlFor`.
3. Menyisipkan nilai JavaScript memakai `{ ... }`.
4. Tag harus **ditutup**: `<img />`, `<br />` (self-closing).

### 3.3 Komponen: function yang mengembalikan UI

```jsx
function KartuAlat() {
  return (
    <div className="kartu">
      <h2>Tenda Dome</h2>
      <p>Rp 50.000/hari</p>
    </div>
  );
}
```

Lalu dipakai seperti:
```jsx
<KartuAlat />
```

### 3.4 Props: memasukkan data ke komponen

Supaya kartu bisa menampilkan data berbeda, kita kirim data lewat **props** (parameter fungsi):

```jsx
function KartuAlat({ nama, harga }) {   // terima props
  return (
    <div className="kartu">
      <h2>{nama}</h2>
      <p>Rp {harga}/hari</p>
    </div>
  );
}

// pemakaian
<KartuAlat nama="Tenda Dome" harga={50000} />
<KartuAlat nama="Carrier 60L" harga={40000} />
```

**Analogi:** props = **santunan pesanan** yang kamu berikan ke tukang saat mengisi cetakan kue (jenis adonan, topping). Cetakan sama, isi beda.

### 3.5 State: data yang bisa berubah & memicu ulang tampilan

**State** = memori yang dimiliki komponen. Saat state berubah, React **otomatis** menggambar ulang komponen.

```jsx
import { useState } from "react";

function Penghitung() {
  const [jumlah, setJumlah] = useState(0);   // [nilai, fungsiPengubah]

  const tambah = () => setJumlah(jumlah + 1);

  return (
    <div>
      <p>Dipesan: {jumlah}</p>
      <button onClick={tambah}>Tambah</button>
    </div>
  );
}
```

- `const [jumlah, setJumlah] = useState(0)` — deklarasi state awal 0.
- `setJumlah(x)` — ubah state → React render ulang.
- `onClick={tambah}` — event handler.

> **Kenapa bukan variabel biasa?** Kalau pakai `let jumlah = 0` lalu mengubahnya, React **tidak tahu** tampilan perlu diubah. `useState` memberi sinyal: "ada yang berubah, gambar ulang". Ini kunci kenapa kecepatan data lewat `useState`.

### 3.6 Effect: menjalankan sesuatu saat "waktu tertentu"

`useEffect` menjalankan kode setelah render / saat ada yang berubah.

```jsx
import { useEffect, useState } from "react";

function DataAlat() {
  const [data, setData] = useState([]);

  useEffect(() => {
    // jalankan sekali saat komponen pertama kali tampil
    console.log("Komponen dimuat, ambil data");
    setData(["Tenda", "Carrier"]);
  }, []);   // array kosong = jalankan sekali saat mount

  return <ul>{data.map(d => <li key={d}>{d}</li>)}</ul>;
}
```

**Penting:** array kedua (`dependencies`) menentukan kapan efek dijalankan:
- `[]` → sekali saat pertama tampil (mount)
- `[data]` → tiap kali `data` berubah
- tidak ada argumen → tiap render

**Di project asli**, `useEffect` sering dipakai untuk memuat sesuatu saat halaman dibuka (misal login, data profil). Tanpa ini, tampilan tidak akan mengambil data.

### 3.7 Memakai array data + map (gabungan pola)

```jsx
const daftarAlat = [
  { nama: "Tenda", harga: 50000 },
  { nama: "Carrier", harga: 40000 },
];

function Katalog() {
  return (
    <>
      {daftarAlat.map(a => (
        <KartuAlat key={a.nama} nama={a.nama} harga={a.harga} />
      ))}
    </>
  );
}
```

**Tips `key`:** React butuh atribut `key` unik untuk tiap item dalam list agar bisa melacak elemen saat data berubah. Pakai `key={a.nama}` atau `key={a.id}`.

### 3.8 Komponen di project asli (hubungkan ke sini)

Coba buka `app/components/`. File seperti `Navbar.tsx`, `Footer.tsx`, `GameCard/ProductCard` konsepnya persis komponen di atas. Simpel, function yang mengembalikan JSX, kadang terima props, kadang punya state. Begitu kamu paham pola komponen + props + state, kamu sudah bisa membaca *sebagian besar* `.tsx` di project.

---

## 🛠️ Tutorial step-by-step

Kita bangun versi React dari katalog. React perlu pemasangan (package). Kita lakukan cepat dengan `create-vite` (template ringan) di folder `latihan/katalog-react`.

### Langkah 1 — scaffold proyek React

Di terminal, dari `latihan/`:

```bash
npm create vite@latest katalog-react -- --template react
cd katalog-react
npm install
```

*Catatan:* bila diminta, pilih template **React**.

### Langkah 2 — bersihkan boilerplate

Buka `src/App.jsx`, hapus isi `return` sehingga jadi kosong (bisa `return <div>Jejak Rimba Mini</div>;`). Ini membersihkan contoh bawaan.

### Langkah 3 — buat komponen KartuAlat

Buat file `src/KartuAlat.jsx`:

```jsx
export default function KartuAlat({ nama, harga }) {
  return (
    <div style={{
      border: "1px solid #ddd",
      borderRadius: 12,
      padding: 16,
      marginBottom: 12
    }}>
      <h3>{nama}</h3>
      <p>Rp {harga}/hari</p>
    </div>
  );
}
```

### Langkah 4 — pakai di App + data

Di `src/App.jsx`:

```jsx
import KartuAlat from "./KartuAlat";

const daftar = [
  { nama: "Tenda Dome", harga: 50000 },
  { nama: "Carrier 60L", harga: 40000 },
];

export default function App() {
  return (
    <main>
      <h1>Katalog Jejak Rimba Mini</h1>
      {daftar.map(a => (
        <KartuAlat key={a.nama} nama={a.nama} harga={a.harga} />
      ))}
    </main>
  );
}
```

### Langkah 5 — jalankan

```bash
npm run dev
```

Buka URL yang muncul (biasanya `http://localhost:5173`) → kamu melihat 2 kartu. **Ubah** data di `App.jsx` (tambah alat) → simpan → kartu bertambah otomatis. Inilah kepintaran React: **update data, UI menyesuaikan tanpa refresh manual.**

### Langkah 6 — tambah state (tombol "Saring Murah")

```jsx
import { useState } from "react";

export default function App() {
  const semua = [
    { nama: "Tenda Dome", harga: 50000 },
    { nama: "Carrier 60L", harga: 40000 },
    { nama: "Sleeping Bag", harga: 20000 },
  ];
  const [murahOnly, setMurahOnly] = useState(false);

  const tampil = murahOnly ? semua.filter(a => a.harga < 45000) : semua;

  return (
    <main>
      <h1>Katalog</h1>
      <button onClick={() => setMurahOnly(!murahOnly)}>
        {murahOnly ? "Tampilkan Semua" : "Saring Murah"}
      </button>
      {tampil.map(a => <KartuAlat key={a.nama} nama={a.nama} harga={a.harga} />)}
    </main>
  );
}
```

Klik tombol: hanya alat murah yang tampil. Inilah **state** mengendalikan tampilan.

---

## ✋ Tugas Manual (TANPA AI)

1. **Tulis ulang** `KartuAlat.jsx` dengan tangan di file `latihan/katalog-react/src/KartuAlat-tulisulang.jsx`, lalu jelaskan tiap baris dalam komentar (apa ini, apa fungsinya, kenapa).
2. **Gambar di kertas** alur `useState`: tulis "nilai state 0" → panah ke "klik tombol" → "setJumlah baru" → "React render ulang". Bisa digambar sebagai siklus.
3. **Ubah App** sehingga ada tombol **"Urutkan Harga Terendah"** yang memakai `.sort()` (pelajari dulu sintaks `sort`) dan toggle `useState`. Jelaskan apa yang dilakukan di tiap baris.

---

## 🤖 Prompt ke AI (bimbingan)

```text
Saya sedang belajar React di modul 3. Saya tidak paham kenapa tombol butuh
useState supaya tampilan ikut berubah, padahal kalau var biasa juga bisa ubah nilainya.
Jelaskan pakai analogi "papan tulis vs kertas catatan" dan beri saya 1 praktik kecil
untuk saya ketik. Jangan kasih jawaban final dahulu.
```

```text
Di src/App.jsx saya error [tempel error]. Ini kode saya [tempel]. Bantu saya
mengerti penyebab lewat pertanyaan berurutan, tanpa langsung menulis kode perbaikannya.
```

---

## ✅ Checkpoint (jawaban di `11-JAWABAN-CHECKPOINT.md`)

1. Apa perbedaan utama props dan state?
2. Mengapa memakai `useState` dan bukan `let jumlah = 0` untuk nilai yang memicu tampilan?
3. Apa fungsi `key` dalam list (`map`) dan kenapa harus unik?
4. Tulis JSX yang menampilkan "Halo" berwarna merah memakai `className`.
5. Kapan `useEffect(..., [])` dijalankan? Apa arti array dependency-nya?

---

## 🧠 Refleksi (tulis di notes-mu)

- Komponen mana di project asli (`app/components/`) yang mirip `KartuAlat`? Kira-kira terima props apa?
- Mengapa React bakal memudahkan memelihara katalog di project asli?
- Apa beda "menampilkan data" waktu JS murni (modul 2) vs React (modul 3)?

---

**Lanjut ke [Modul 4 — TypeScript](04-TYPESCRIPT.md).**