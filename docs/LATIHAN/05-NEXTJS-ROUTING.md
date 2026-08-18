# Modul 5 — Next.js App Router

Di modul ini kamu masuk ke **framework**: cara project asli menyusun halaman-halamannya menjadi URL-URL (`/`, `/katalog`, `/katalog/[slug]`). Next.js memakai **file-system routing** — lokasi file menentukan alamat URL.

---

## 🥅 Target

Setelah modul ini kamu bisa:
- Menjelaskan file-system routing Next.js (folder = URL)
- Membuat `page.tsx`, `layout.tsx`, rute dinamis `[slug]`
- Membedakan **Server Component** & **Client Component** (`"use client"`)
- Menggunakan `<Link>` untuk navigasi antar halaman
- Memahami kenapa file besar `page.tsx` sempat bingung (berbagai jenis file di folder `app/`)

---

## 📖 Penjelasan panjang

### 5.1 Folder = URL (file-system routing)

Di Next.js App Router, **folder** menandai segmen URL, dan file `page.tsx` adalah "konten halaman" untuk folder itu.

```
app/
├── page.tsx                 →  halaman "/"
├── layout.tsx               →  kerangka untuk SEMUA halaman
└── katalog/
    ├── page.tsx             →  halaman "/katalog"
    └── [slug]/
        └── page.tsx         →  halaman "/katalog/<apa-saja>"
```

Lihat project asli: `app/page.tsx` (beranda `/`), `app/katalog/page.tsx` (`/katalog`), `app/katalog/[slug]/page.tsx` (`/katalog/tenda-dome` dsb). **Kotak bertanda `[...]`** = rute dinamis: nilai di URL menjadi parameter (`slug`).

### 5.2 `page.tsx` — wajib default export

Setiap halaman harus keluar dengan **default export** sebuah komponen React. Itulah kenapa file berakhir ".tsx" (TypeScript + JSX).

```tsx
// app/katalog/page.tsx
export default function KatalogPage() {
  return <h1>Katalog Alat</h1>;
}
```

**Aturan kunci:** file harus `page.tsx` (huruf kecil). File terdenggar seperti `CatalogClient.tsx` di project asli bukan halaman — itu komponen bantu yang dipakai di dalam `page.tsx`.

### 5.3 `layout.tsx` — kerangka bersama

`layout.tsx` membungkus halaman-halaman di sekitarnya. Kerangka root (`app/layout.tsx`) wajib memuat tag `<html>` dan `<body>` dan menerima `children`.

```tsx
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
```

Coba buka `app/layout.tsx` asli — di dalamnya ada `<html>`, `<body>`, pemuatan font, `ThemeProvider`, dsb. Semua halaman "terbungkus" kerangka itu.

**Kenapa penting?** Navbar & Footer yang sama di semua halaman biasanya diletakkan di layout, sehingga tidak perlu ditulis ulang tiap halaman.

### 5.4 Server Components (default) vs Client Components (`"use client"`)

**Penting & sering membingungkan.** Di Next.js, halaman `page.tsx` **secara default adalah Server Component**: berjalan di server, bisa akses database & kunci rahasia, tapi **tidak bisa** memakai `useState`, `useEffect`, atau event `onClick`.

**Client Component** (`"use client"` di baris pertama) berjalan di browser: bisa memakai state, efek, event handler. Dipakai untuk hal interaktif.

| Kebutuhan | Boleh di Server? | Harus Client (`"use client"`)? |
|---|---|---|
| Ambil data dari database | ✅ | — |
| Pakai API key rahasia | ✅ (tidak bocor) | ❌ (bocor ke browser) |
| `useState`, `useEffect` | ❌ | ✅ |
| `onClick`, `onChange` | ❌ | ✅ |
| `window`, `localStorage` | ❌ | ✅ |

Contoh project asli: `app/page.tsx` mengambil data alat (server), sementara `app/masuk/page.tsx` dan `CatalogClient.tsx` memakai `"use client"` karena butuh state & interaksi.

> **Aturan praktis:** Mulai sebagai Server Component. Tambahkan `"use client"` **hanya saat** kamu butuh interaktivitas. Ini menjaga kecepatan (lebih sedikit JS dikirim ke browser).

### 5.5 Rute dinamis `[slug]` & `params`

Di rute dinamis, `page.tsx` menerima `params` untuk tahu nilai dari URL.

> **Note version Next.js ini:** `params` adalah **Promise** — harus di-`await`. Ini perubahan dari versi lama yang langsung punya `params.slug`.

```tsx
// app/katalog/[slug]/page.tsx
export default async function DetailAlatPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <h1>Detail: {slug}</h1>;
}
```

`generateStaticParams()` bisa dipakai untuk "prerender" semua rute dinamis saat build (berguna untuk halaman yang datanya statis).

### 5.6 Navigasi dengan `<Link>`

Daripada `<a>` biasa, Next.js memakai `<Link>` agar pindah halaman **tanpa reload penuh** (client-side navigation) & prefetch:

```tsx
import Link from "next/link";

export default function KatalogPage() {
  return (
    <ul>
      <li><Link href="/katalog/tenda-dome">Tenda Dome</Link></li>
    </ul>
  );
}
```

Gunakan `href` dinamis sesuai data: `` <Link href={`/katalog/${alat.slug}`}>``

### 5.7 `useRouter` — navigasi dari kode

Untuk pindah halaman dari dalam function (misal setelah submit), pakai `useRouter` (harus di Client Component):

```tsx
"use client";
import { useRouter } from "next/navigation";

export default function SetelahSubmit() {
  const router = useRouter();
  const pergi = () => router.push("/katalog");   // pindah
  return <button onClick={pergi}>Ke Katalog</button>;
}
```

---

## 🛠️ Tutorial step-by-step

Kita ubah `latihan/` menjadi aplikasi Next.js sungguhan (ini "tonggak" masuk ke project asli). Jalankan langkah di terminal, dari `C:\Users\M S I\jejak-rimba`.

### Langkah 1 — buat app Next.js di `latihan`

```bash
npm create next-app@latest latihan-next -- --typescript --app --tailwind --no-eslint --import-alias "@/*"
cd latihan-next
```

*Catatan:* jawab prompt sesuai kebutuhan (paling praktis: pilih TypeScript = Yes, Tailwind = Yes, App Router = Yes, dan sisanya default/No). Folder `latihan-next/` muncul sebagai aplikasi Next.js mandiri.

### Langkah 2 — buat halaman katalog

Di dalam `latihan-next/app/`, buat folder `katalog/` dan file `page.tsx`:

```tsx
export default function KatalogPage() {
  return <h1 className="text-2xl font-bold">Katalog Alat</h1>;
}
```

Buka `http://localhost:3000/katalog` setelah `npm run dev` → tampil judul. **Folder yang kamu buat jadi URL.**

### Langkah 3 — rute dinamis `[slug]`

Buat folder `katalog/[slug]/` dan file `page.tsx`:

```tsx
export default async function DetailAlatPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <h1 className="text-2xl font-bold">Detail: {slug}</h1>;
}
```

Kunjungi `/katalog/tenda-dome`. Judul berubah sesuai bagian URL. Itulah rute dinamis.

### Langkah 4 — tambahkan Client Component

Buat `app/katalog/FilterMurah.tsx`:

```tsx
"use client";
import { useState } from "react";

const data = [
  { nama: "Tenda", harga: 50000 },
  { nama: "Carrier", harga: 40000 },
  { nama: "Sleeping Bag", harga: 20000 },
];

export default function FilterMurah() {
  const [murahOnly, setMurahOnly] = useState(false);
  const tampil = murahOnly ? data.filter(d => d.harga < 45000) : data;

  return (
    <div>
      <button onClick={() => setMurahOnly(!murahOnly)} className="p-2 bg-orange-500 text-white rounded">
        {murahOnly ? "Semua" : "Murah"}
      </button>
      <ul>
        {tampil.map(d => <li key={d.nama}>{d.nama} - Rp {d.harga}/hari</li>)}
      </ul>
    </div>
  );
}
```

Panggil di `app/katalog/page.tsx`:
```tsx
import FilterMurah from "./FilterMurah";
export default function KatalogPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Katalog Alat</h1>
      <FilterMurah />
    </div>
  );
}
```

Buka `/katalog`, klik tombol. Karena `FilterMurah` memakai `useState` dan `onClick`, ia **wajib** `"use client"`. Coba **hapus** baris `"use client";` → simpan → error muncul. Itu bukti konsep Server vs Client.

### Langkah 5 — tautkan halaman dengan `<Link>`

Di `app/katalog/page.tsx` tambah navigasi ke beranda:

```tsx
import Link from "next/link";
// ... di dalam return:
<Link href="/" className="text-blue-600">Ke Beranda</Link>
```

Klik dan perhatikan: berpindah tanpa reload penuh halaman.

---

## ✋ Tugas Manual (TANPA AI)

1. **Gambar peta folder** `app/` project asli (dari `app/page.tsx`, `katalog/`, `booking/`, `profil/`, `faq/`) dan tulis URL apa yang dihasilkan tiap folder. Tandai mana yang dinamis (`[slug]` / `[id]`).
2. **Buka `app/layout.tsx` asli**, daftar 5 hal yang diletakkan di kerangka root (misal font, provider). Tuliskan di notes-mu.
3. **Uji batas Server/Client:** pindahkan `FilterMurah.tsx` agar dipakai dari `app/katalog/[slug]/page.tsx` juga. Pastikan tetap jalan. Beri komentar kenapa bisa (komponen di-import, bukan inline state di Server Component).

---

## 🤖 Prompt ke AI (bimbingan)

```text
Saya di modul 5 Next.js. Saya tidak paham kenapa file tertentu perlu "use client"
dan yang lain tidak. Jelaskan pakai analogi "dapur restoran (server) vs ruang
makan (client)" lalu beri saya 1 latihan kecil untuk saya ketik sendiri, jangan
langsung kasih jawaban akhir.
```

```text
Error saya di app/katalog/[slug]/page.tsx: [tempel error]. Ini kode [tempel].
Bantu saya mengerti penyebabnya lewat pertanyaan bertingkat, tanpa menulis perbaikan final.
```

---

## ✅ Checkpoint (jawaban di `11-JAWABAN-CHECKPOINT.md`)

1. Rute `/katalog/tenda-dome` ditentukan oleh folder mana di `app/`?
2. Apa beda Server Component dan Client Component? Kapan butuh `"use client"`?
3. Mengapa di Next.js versi ini `params` harus di-`await`?
4. Apa fungsi `layout.tsx`? Mengapa root layout harus menampung `<html>` & `<body>`?
5. Apa beda `<Link>` dan `<a>` di Next.js?
6. Jelaskan arti folder `[slug]` dalam konteks katalog.

---

## 🧠 Refleksi (tulis di notes-mu)

- Sebutkan satu file di project asli yang kemungkinan Server Component dan satu yang Client Component. Alasanmu apa?
- Kenapa Next.js memilih pola "folder jadi URL"? Apa keuntungannya bagi developer?
- Apa yang membedakan `page.tsx` dengan file `CatalogClient.tsx` yang bukan `page`?

---

**Lanjut ke [Modul 6 — Server Actions + Supabase](06-SERVER-ACTIONS-SUPABASE.md).**