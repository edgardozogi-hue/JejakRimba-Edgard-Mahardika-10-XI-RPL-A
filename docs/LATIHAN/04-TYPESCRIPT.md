# Modul 4 — TypeScript

Project Jejak Rimba ditulis dalam **TypeScript** (bukan JavaScript polos). TypeScript adalah JavaScript yang diberi **tipe data**. Modul ini menjelaskan mengapa project asli memilih TS dan bagaimana cara membacanya, termasuk tipe-tipe di `app/lib/database.types.ts`.

---

## 🥅 Target

Setelah modul ini kamu bisa:
- Menjelaskan apa itu TypeScript & kenapa dipakai
- Menulis tipe primitif, `interface`, tipe union, `enum`
- Memahami `Database`/`DatabaseType` di project asli
- Menangkap error tipe saat menulis

---

## 📖 Penjelasan panjang

### 4.1 Apa itu TypeScript?

TypeScript = **JavaScript + sistem tipe**. Browser tidak bisa menjalankan TS langsung; TS harus **dikompilasi** (diterjemahkan) ke JavaScript dulu. Tools (Vite, Next.js) melakukan ini otomatis saat kamu `npm run dev` atau `build`.

**Analogi:** TS = "JavaScript yang memakai label di kotak". Setiap kotak (variabel/fungsi) diberi label "ini angka", "ini teks". Saat kamu menaruh hal yang salah, TS berteriak **sebelum** program jalan, bukan saat crash di tengah.

### 4.2 Kenapa dipakai di project asli?

1. **Menangkap bug lebih awal.** Typos nama properti (misal `harga` vs `harga2`) ketahuan saat menulis, bukan saat runtime.
2. **Autocomplete & dokumentasi.** Editor tahu bentuk data, sehingga menampilkan saran properti yang benar.
3. **Kode lebih "berbicara".** Bentuk data dinyatakan eksplisit; orang lain (atau kamu sendiri nanti) langsung paham isi object.

### 4.3 Tipe primitif

```ts
const nama: string = "Tenda";          // teks
const harga: number = 50000;           // angka
const ready: boolean = true;           // true/false
const nilai: null = null;              // kosong
```

TS **menyimpulkan tipe** bila tidak diberi anotasi. `const a = 5` → TS tahu `a` bertipe number. Anotasi eksplisit (`: number`) berguna saat bentuk tidak jelas.

### 4.4 `interface` — mendefinisikan bentuk object

```ts
interface Alat {
  nama: string;
  harga: number;
  stok: number;
  kategori: string;
}
```

Lalu dipakai:

```ts
const tenda: Alat = {
  nama: "Tenda Dome",
  harga: 50000,
  stok: 5,
  kategori: "Tenda"
};
```

Jika `tenda` lupa properti `stok` atau mengisi `harga` dengan teks, TS error. **Ini jaring pengaman saat data dari database.**

### 4.5 Tipe union & optional

```ts
type Hasil = "berhasil" | "gagal";     // hanya dua nilai itu
let status: Hasil = "berhasil";        // ok
// status = "sukses"  // ❌ error: "sukses" tidak ada di union

interface Profil {
  nama: string;
  nomorHP?: string;   // "?" = opsional, boleh tidak diisi
}
```

**Union** sering dipakai untuk membatasi pilihan (misal status booking). **Optional** (`?`) untuk properti yang boleh kosong.

### 4.6 `enum` — daftar nilai tetap bernama

```ts
enum Kondisi {
  Baru = "baru",
  SangatBaik = "sangat_baik",
  Baik = "baik",
}
```
`enum` memberi nama yang jelas untuk sekumpulan nilai tetap, menghindari salah ketik string. (Project asli memakai object dengan pola mirip — lihat `CATEGORY_MAP` di `database.types.ts`.)

### 4.7 TypeScript untuk props React

Props diketik supaya pemakaian komponen tidak salah:

```tsx
interface KartuProps {
  nama: string;
  harga: number;
}

function KartuAlat({ nama, harga }: KartuProps) {
  return (
    <div>
      <h3>{nama}</h3>
      <p>Rp {harga}/hari</p>
    </div>
  );
}

// pemakaian
<KartuAlat nama="Tenda" harga={50000} />
```

Jika kamu menulis `<KartuAlat nama="Tenda" harga="mahal" />`, TS error karena `harga` harus number.

### 4.8 Hubungan dengan `database.types.ts` di project asli

Buka `app/lib/database.types.ts`. Di dalamnya ada `export type Database = { public: { Tables: { profiles: {...}, equipment: {...}, bookings: {...}, ... } } }`.

**Ini "kontrak" data.** TypeScript memberitahu seluruh project bentuk baris di tiap tabel Supabase. Saat kamu menulis kode yang mengambil data, TS "tahu" kolom apa yang ada (misal `price_per_day: number`, `status`), sehingga kesalahan nama kolom terdeteksi sejak menulis.

> **Pesan kunci:** `database.types.ts` bukan data, melainkan **deskripsi bentuk data**. Ini dipakai sebagai pengaman agar kode di `actions/*` selaras dengan schema database.

### 4.9 Generics (pengenalan ringan)

**Generic** = "tipe yang bisa menerima tipe lain". Contoh `Array<Alat>` artinya array yang isinya Alat.

```ts
const daftar: Array<Alat> = [tenda, carrier];
```

Ini memastikan kamu tidak memasukkan angka ke dalam array yang seharusnya berisi object Alat. (Ada pula generics di fungsi-fungsi Supabase — kamu cukup mengenali polanya, tidak perlu menguasai dalam.)

---

## 🛠️ Tutorial step-by-step

Kita tambahkan tipe ke project React kita dari modul 3 (ubah ke .tsx). Supaya ringkas, kita pakai Vite React + TS.

### Langkah 1 — buat project TypeScript

Dari `latihan/`:

```bash
npm create vite@latest katalog-ts -- --template react-ts
cd katalog-ts
npm install
```

*Catatan:* template `react-ts` membuat file `.tsx` dan `tsconfig.json` siap pakai.

### Langkah 2 — definisikan interface Alat

Buka `src/App.tsx`. Di atas komponen, tambahkan:

```ts
interface Alat {
  nama: string;
  harga: number;
  stok: number;
}
```

### Langkah 3 — data bertipe

```ts
const daftar: Alat[] = [
  { nama: "Tenda Dome", harga: 50000, stok: 5 },
  { nama: "Carrier 60L", harga: 40000, stok: 3 },
  { nama: "Sleeping Bag", harga: 20000, stok: 10 },
];
```

### Langkah 4 — komponen dengan props bertipe

Buat `src/KartuAlat.tsx`:

```tsx
interface KartuProps {
  nama: string;
  harga: number;
}

export default function KartuAlat({ nama, harga }: KartuProps) {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16, marginBottom: 12 }}>
      <h3>{nama}</h3>
      <p>Rp {harga}/hari</p>
    </div>
  );
}
```

### Langkah 5 — tampilkan

Di `src/App.tsx`:

```tsx
import KartuAlat from "./KartuAlat";

export default function App() {
  return (
    <main>
      <h1>Katalog TS</h1>
      {daftar.map(a => (
        <KartuAlat key={a.nama} nama={a.nama} harga={a.harga} />
      ))}
    </main>
  );
}
```

### Langkah 6 — buktikan TS menangkap bug

Di `App.tsx`, ubah satu pemakaian jadi salah: `<KartuAlat nama="Tenda" harga="mahal" />`. Jalankan `npm run dev` — terminal/editor menampilkan error tipe ("Type 'string' is not assignable to type 'number'"). **Kembalikan** ke benar (`harga={50000}`) setelah melihat error. Itulah bukti TS menahan bug sejak dini.

---

## ✋ Tugas Manual (TANPA AI)

1. Tulis ulang `interface Alat` dan `interface KartuProps` dengan tangan di file `latihan/latihan-ts.ts`, lalu **jelaskan tiap properti** dalam komentar: apa artinya & tipe apa yang diterima.
2. Buat `enum` `Kondisi` (Baru, SangatBaik, Baik), lalu buat 1 `interface Alat` yang memakai `kondisi: Kondisi`. Ketik dan uji di file.
3. **Gambar di kertas** perbedaan "JavaScript tanpa tipe" vs "TypeScript dengan label tipe" memakai 2 kotak (satu polos, satu berlabel). Tuliskan 1 contoh bug yang bisa dicegah TS.

---

## 🤖 Prompt ke AI (bimbingan)

```text
Saya belajar TypeScript di modul 4. Saya bingung beda interface dan type alias,
serta kenapa project asli memakai banyak interface. Jelaskan pakai analogi sederhana
dan beri saya 2 contoh kecil untuk saya ketik sendiri, jangan kasih jawaban penuh dulu.
```

```text
Di src/App.tsx ada error tipe: [tempel error]. Ini kode [tempel]. Bantu saya
menemukan baris yang salah dan kenapa, tanpa langsung menulis kode perbaikan final.
```

---

## ✅ Checkpoint (jawaban di `11-JAWABAN-CHECKPOINT.md`)

1. Apa perbedaan TypeScript dan JavaScript? Kenapa project asli memilih TS?
2. Apa fungsi `interface`? Tulis contoh `interface Alat` dengan 3 properti.
3. Apa itu tipe union? Beri contoh yang membatasi pilihan status.
4. Apa arti `?` pada `nomorHP?: string`?
5. Jika `<KartuAlat harga="mahal" />` padahal `harga: number`, apa yang terjadi dan mengapa berguna?

---

## 🧠 Refleksi (tulis di notes-mu)

- Temukan 3 `interface` di `app/lib/database.types.ts` dan tulis 1–2 properti masing-masing. Pahami bahwa ini "kontrak" data.
- Mengapa menulis "tipe" sejak awal menghemat waktu debug di project sebesar Jejak Rimba?
- Apa beda "data" dan "deskripsi bentuk data"?

---

**Lanjut ke [Modul 5 — Next.js App Router](05-NEXTJS-ROUTING.md).**