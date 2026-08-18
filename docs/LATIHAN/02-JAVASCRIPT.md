# Modul 2 — JavaScript ES6+

Di modul ini kamu menyalakan "otak" halamanmu. JavaScript lah yang membuat tombol bereaksi, data alat dikelola, dan halaman jadi hidup. Konsep modul ini dipakai di **seluruh** file project asli Jejak Rimba (`actions/`, `components/`, `page.tsx`).

---

## 🥅 Target

Setelah modul ini kamu bisa:
- Menjelaskan variabel `let`, `const`, `var`
- Menggunakan string, number, boolean, array, object
- Memakai fungsi, `map`, `filter`, `find`, template literal
- Menulis ulang kegiatan "catalog" dari HTML-hardcode menjadi JavaScript-driven

---

## 📖 Penjelasan panjang

### 2.1 Variabel: kotak penyimpanan

Variabel = kotak bernama yang menyimpan nilai.

```js
const namaAlat = "Tenda Dome";   // nilai tetap, tidak bisa diubah
let harga = 50000;               // nilai bisa diubah nanti
harga = 60000;                   // ok, let bisa diubah
```

- **`const`** = konstanta, tidak bisa di-assign ulang. Dipakai untuk hal yang tidak berubah.
- **`let`** = bisa diubah. Dipakai untuk counter / nilai berubah.
- **`var`** = cara lama, jangan dipakai (kecuali kode kuno).

**Analogi:** `const` seperti tanggal lahir (tetap), `let` seperti umur (berubah tiap tahun).

### 2.2 Tipe data dasar

```js
const nama = "Tenda";        // string  (teks)
const harga = 50000;         // number  (angka)
const ready = true;          // boolean (true/false)
const kategori = null;       // null    (kosong sengaja)
```

**Trik penting:** cek tipe dengan `typeof`:  `typeof "abc"` → "string". Berguna saat debugging.

### 2.3 Array: daftar

```js
const hargaXtampil = [50000, 40000, 20000];   // array angka
const namaAlat = ["Tenda", "Carrier", "Sleeping Bag"];

namaAlat[0];            // "Tenda" (indeks mulai dari 0)
namaAlat.length;        // 3  (jumlah elemen)
namaAlat.push("Jaket"); // tambah di akhir
```

**Perangkap umum:** indeks mulai dari **0**. Elemen pertama ada di posisi `[0]`, bukan `[1]`. Ini jadi sumber banyak bug pemula.

### 2.4 Object: "kartu alat" yang rapi

Object mengelompokkan data dalam satu nilai berisi banyak properti:

```js
const tenda = {
  nama: "Tenda Dome",
  harga: 50000,
  kategori: "Tenda",
  kondisi: "baru",
  stok: 5
};

tenda.nama;      // "Tenda Dome"
tenda["harga"];  // 50000 (cara lain)
```

**Analogi:** object = lembar KTP: ada kolom nama, umur, alamat dalam satu kartu.

### 2.5 Array of objects (pola utama project asli!)

Ini **pola yang paling sering** kamu lihat. Katalog Jejak Rimba asli adalah *array yang berisi banyak object* (`equipmentList` di `app/lib/data.ts`, dan data dari Supabase).

```js
const alat = [
  { nama: "Tenda Dome", harga: 50000, stok: 5 },
  { nama: "Carrier 60L", harga: 40000, stok: 3 },
  { nama: "Sleeping Bag", harga: 20000, stok: 10 }
];
```

### 2.6 Fungsi: "resep" yang bisa dipanggil

```js
function hitungTotal(hari, hargaSemalam) {
  const total = hari * hargaSemalam;
  return total;
}

const biaya = hitungTotal(3, 50000);   // 150000
console.log(biaya);
```

**Arrow function** (cara modern, dipakai project):
```js
const hitungTotal = (hari, hargaSemalam) => hari * hargaSemalam;
```

### 2.7 `map`, `filter`, `find` (tiga sahabat terpenting)

Ini rutin dipakai untuk mengolah daftar data.

- **`map`** = buat **array baru** dengan mengubah tiap elemen.

```js
const daftarNama = alat.map(a => a.nama);
// ["Tenda Dome", "Carrier 60L", "Sleeping Bag"]
```

- **`filter`** = saring elemen yang **memenuhi syarat**.

```js
const murah = alat.filter(a => a.harga < 45000);
// [ { Carrier, 40000 }, { Sleeping Bag, 20000 } ]
```

- **`find`** = ambil **satu** elemen pertama yang cocok.

```js
const tendaDome = alat.find(a => a.nama === "Tenda Dome");
```

**Mengapa wajib dikuasai?** Dua-duanya dipakai di `app/actions/equipment.ts` (misal `getEquipmentList` memfilter berdasarkan kategori & lokasi) dan di banyak halaman untuk menampilkan daftar. Kalau kamu paham `map`/`filter`, kamu sudah membuka setengah pintu memahami project asli.

### 2.8 Template literal (penyangga teks dinamis)

Dipakai untuk memasukkan variabel ke dalam teks. Memakai backtick (`` ` ``) dan `${}`:

```js
const nama = "Carrier";
console.log(`Katalog: ${nama}, harga ${40000}/hari`);
// "Katalog: Carrier, harga 40000/hari"
```

### 2.9 Event listener: reaksi terhadap klik

```js
const tombol = document.getElementById("tombol-sewa");
tombol.addEventListener("click", () => {
  alert("Halo, Anda memilih tenda.");
});
```

---

## 🛠️ Tutorial step-by-step

Kita ubah katalog di Modul 1 menjadi **didorong data JavaScript** supaya menambah alat cukup mengubah satu array, bukan menyalin HTML.

### Langkah 1 — buka index.html dari modul 1, ganti kartu

Hapus 3 blok `<div class="kartu">...</div>` dan ganti `<div class="kartu-container"></div>` menjadi **kosong**. Juga tambahkan `<script src="app.js"></script>` sebelum `</body>`.

Hasil `body`:
```html
<div class="kartu-container"></div>
<script src="app.js"></script>
```

### Langkah 2 — buat app.js di folder yang sama

```js
// 1. DATA
const alat = [
  { nama: "Tenda Dome", harga: 50000 },
  { nama: "Carrier 60L", harga: 40000 },
  { nama: "Sleeping Bag", harga: 20000 }
];

// 2. TAMPILKAN dengan map
const wadah = document.querySelector(".kartu-container");
const html = alat.map(a => `
  <div class="kartu">
    <h2>${a.nama}</h2>
    <p>Rp ${a.harga}/hari</p>
  </div>
`).join("");

wadah.innerHTML = html;
```

### Langkah 3 — uji

Buka `index.html`. Kartunya harus sama. Sekarang **tambah** satu alat dengan menambahkan 1 elemen ke array `alat` di `app.js`. Refresh. Kartu baru muncul otomatis. Ini kekuatan data-driven: **ubah data, tampilan ikut**.

### Langkah 4 — tambahkan tombol interaktif

Tambahkan tombol di `index.html` sebelum `<script>`:
```html
<button onclick="tampilkanCount()">Hitung Alat</button>
```

Di `app.js` tambahkan:
```js
function tampilkanCount() {
  alert(`Ada ${alat.length} jenis alat.`);
}
```

Klik tombolnya; muncul popup jumlah. Kamu baru saja mengubah **kerangka statis** jadi **perilaku**.

---

## ✋ Tugas Manual (TANPA AI)

1. **Tulis ulang** dengan tangan (bukan salin-tempel) blok `map` dari Langkah 2 di selembar kertas atau file kosong `latihan/latihan.js`, lalu jelaskan dalam komentar apa yang terjadi di tiap baris.
2. Buat array `harga` angka, lalu pakai `filter` untuk menampilkan hanya alat yang harganya di bawah 45000, dan `map` untuk mengubahnya jadi string `"Nama - Rp X"`. Tampilkan lewat `console.log`.
3. Tambahkan tombol **"Saring Murah"** yang memakai `filter` untuk menampilkan hanya alat murah (reuse keterampilan filter). Sertakan komentar yang menjelaskan tiap baris.

---

## 🤖 Prompt ke AI (bimbingan)

```text
Saya di modul 2 JavaScript. Saya sudah menulis [tempel kode / jelaskan bagiannya].
Saya tidak paham beda map dan forEach. Jelaskan memakai analogi "gudang barang"
lalu beri saya 1 latihan kecil untuk saya ketik sendiri. Jangan kasih jawaban penuh dulu.
```

```text
Kode saya: [tempel]. Ketika tombol diklik tidak muncul apa-apa dan tidak ada error.
Bantu saya menemukan masalah lewat pertanyaan, jangan langsung kasih kode perbaikan.
```

---

## ✅ Checkpoint (jawaban di `11-JAWABAN-CHECKPOINT.md`)

1. Apa beda `const`, `let`, `var`? Kapan memakai `const`?
2. Array index dimulai dari angka berapa?
3. Apa hasil dari `[1,2,3].map(x => x * 2)`?
4. Apa hasil dari `[1,2,3,4].filter(x => x % 2 === 0)`?
5. Tuliskan 1 object dengan 3 properti, lalu cara mengakses propertinya.
6. Apa fungsi template literal? Kenapa dipakai ketimbang tanda kutip biasa?

---

## 🧠 Refleksi (tulis di notes-mu)

- Sebutkan satu tempat di project asli Jejak Rimba yang kemungkinan besar memakai `map` dan `filter`. Kira-kira apa datanya?
- Mengapa kita lebih baik membuat 3 kartu lewat `map` (dari data) daripada menulis 3 HTML statis?
- Apa beda "menampilkan data" dan "data diproses" dalam bayanganmu?

---

**Lanjut ke [Modul 3 — React](03-REACT.md).**