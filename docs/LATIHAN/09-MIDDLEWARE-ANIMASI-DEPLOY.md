# Modul 9 — Middleware, Animasi (Framer Motion), & Deploy

Modul ini merangkai tiga hal yang membuat project asli "hidup" dan bisa "dibawa keluar": **middleware** (satpam global), **animasi** (Framer Motion untuk transisi), dan **deploy** (mengunggah aplikasi agar bisa diakses online). Modul ini juga menutup sebagian besar konsep inti.

---

## 🥅 Target

Setelah modul ini kamu bisa:
- Menjelaskan **middleware** & cara memakai `matcher`
- Menjelaskan & menerapkan **Framer Motion** (transisi, animasi masuk)
- Menjelaskan langkah **deploy** (`npm run build`, hosting Node.js / Vercel)
- Mengerti alur "development → production"

---

## 📖 Penjelasan panjang

### 9.1 Middleware — "satpam" sebelum halaman dimuat

**Middleware** adalah kode yang berjalan **sebelum** setiap permintaan halaman, di "tepi" aplikasi. Ia bisa memeriksa cookie/session, memblokir, mengalihkan, atau memodifikasi request/response.

**Analogi:** penjaga pintu di depan gedung yang mengecek kartu akses *setiap* orang masuk, sebelum mereka sampai ke ruang mana pun.

Di project asli, `middleware.ts` mengecek cookie session dan melindungi `/profil` & `/booking`. Di modul 7 kita sudah membangun ini. Di sini kita perkuat konsep `matcher`.

```ts
export const config = {
  matcher: ["/profil/:path*", "/booking/:path*"],
};
```

- `matcher` memberitahu **path mana** yang diproses middleware (agar tidak menjalankan middleware untuk semua file/gambar).
- `/:path*` artinya semua turunan path (misal `/profil/dashboard-vendor`).

### 9.2 Framer Motion — membuat UI bergerak

**Framer Motion** adalah pustaka animasi React yang dipakai project asli (misal `app/lib/animations.ts` & komponen seperti `PageTransition`, `StarRating`).

Dasar-dasar:

```tsx
"use client";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}      // awal: transparan & turun
      animate={{ opacity: 1, y: 0 }}        // akhir: tampil penuh & posisi normal
      transition={{ duration: 0.5 }}
    >
      Halo
    </motion.div>
  );
}
```

Konsep kunci:
- **`initial`** — keadaan sebelum animasi.
- **`animate`** — keadaan akhir yang dituju.
- **`transition`** — durasi, easing, delay.
- Variants dapat menyatukan initial/animate (project asli memakai pola ini di `animations.ts` — `fadeUp`, `staggerContainer`).

**`stagger`** membuat elemen muncul berurutan (misal kartu alat muncul satu per satu), memberi kesan halus.

### 9.3 Kenapa "use client" untuk animasi?

`framer-motion` bergantung pada interaksi browser (state, events), jadi komponen yang memakainya **harus Client Component** (`"use client"`). Itu sebabnya komponen animasi di project asli ditandai `"use client"`.

### 9.4 Development vs Production & Deploy

- **Development** (`npm run dev`): server cepat, auto-reload saat simpan. Untuk mengembangkan.
- **Production** (`npm run build` lalu `npm run start`): kompilasi dioptimalkan, siap untuk publik. `build` juga menjalankan type-checking sehingga error tipe tertangkap.

**Deploy = menempatkan build di server hosting agar bisa diakses online.**

Opsi (dari docs Next.js):
- **Node.js server** (pakai `npm run build` + `npm run start`) — support semua fitur.
- **Vercel** (buatan pembuat Next.js) — paling mudah, terintegrasi Git: `git push` → otomatis build & deploy.
- Docker, Railway, Render, dll.

> Untuk **project asli** Jejak Rimba (menggunakan Server Actions, Supabase, webhook), dibutuhkan **Node.js server** (bukan static export). Vercel atau Node.js hosting sesuai.

### 9.5 Env untuk production

Saat deploy, kamu **tidak memakai** `.env.local` lokal. Kamu mengisi environment variables di dashboard hosting (Supabase & Midtrans keys). Jangan commit kunci nyata ke git. Lihat Modul 12 untuk panduan kunci.

---

## 🛠️ Tutorial step-by-step

### Langkah 1 — animasi sederhana dengan Framer Motion

Install di `latihan-next`:

```bash
npm install framer-motion
```

Buat `app/components/KartuAnimasi.tsx`:

```tsx
"use client";
import { motion } from "framer-motion";

const data = ["Tenda Dome", "Carrier 60L", "Sleeping Bag"];

export default function KartuAnimasi() {
  return (
    <div className="space-y-2">
      {data.map((nama, i) => (
        <motion.div
          key={nama}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="border p-3 rounded bg-white"
        >
          {nama}
        </motion.div>
      ))}
    </div>
  );
}
```

Panggil di `app/page.tsx`. Refresh: kartu muncul satu per satu (stagger via `delay: i * 0.1`).

### Langkah 2 — pastikan middleware `matcher`

Di `middleware.ts` yang dibuat modul 7, pastikan `config.matcher` memakai pola path. Coba ubah `protectedRoutes` jadi array dinamis; jelaskan peran `matcher`.

### Langkah 3 — build produksi

Di terminal `latihan-next`:

```bash
npm run build
```

Perhatikan: Next.js me-render halaman, melakukan type-check, menghasilkan build di folder `.next`. Bila ada error (misal tipe salah), build gagal dan memberi tahu. Perbaiki, ulangi sampai sukses.

```bash
npm run start
```

Buka `http://localhost:3000` — kini kamu menjalankan **versi produksi** (lebih cepat, tidak ada auto-reload).

### Langkah 4 — siapkan deploy (opsional, lanjutkan di Modul 12)

- Untuk **Vercel**: pasang `vercel`, jalankan `vercel` di folder `latihan-next`, ikuti prompt (import Git repo opsional).
- Untuk Node.js hosting lain: pakai `npm run build` + `npm run start` di server, dan set env vars di dashboard hosting.

---

## ✋ Tugas Manual (TANPA AI)

1. **Gambar alur** development vs production: `kode sumber → npm run dev (lokal) → npm run build → npm run start (produksi) → hosting/Vercel`. Labeli peran masing-masing.
2. **Tulis ulang** `KartuAnimasi.tsx` di file latihan dengan komentar tiap baris (apa itu `motion`, `initial`, `animate`, `transition`, kenapa `"use client"`).
3. **Eksperimen variasi**: ubah `x: -20` jadi `scale: 0.8`, dan tambah `transition={{ duration: 0.8, delay: i * 0.15 }}`. Amati perubahannya. Jelaskan.

---

## 🤖 Prompt ke AI (bimbingan)

```text
Saya di modul 9. Saya bingung kenapa komponen animasi harus "use client" dan apa beda
initial/animate/transition. Jelaskan pakai analogi dan beri saya 1 latihan kecil untuk
saya ketik sendiri, tanpa jawaban final dulu.
```

```text
npm run build saya gagal dengan error: [tempel]. Ini sebagian kode [tempel].
Bantu saya mengerti error tipe/runtime ini lewat pertanyaan, tanpa menulis fix final.
```

---

## ✅ Checkpoint (jawaban di `11-JAWABAN-CHECKPOINT.md`)

1. Apa fungsi middleware & apa peran `matcher`?
2. Mengapa komponen Framer Motion harus `"use client"`?
3. Jelaskan arti `initial`, `animate`, `transition` pada `motion.div`.
4. Apa beda `npm run dev` dan `npm run build` + `npm run start`?
5. Kenapa project Jejak Rimba asli butuh Node.js server (bukan static export) saat deploy?

---

## 🧠 Refleksi (tulis di notes-mu)

- Menurutmu, di bagian mana project asli memakai animasi `fadeUp`/`stagger`? (misal saat katalog dimuat)
- Kenapa build produksi penting sebelum deploy? Apa saja yang dicek saat build?
- Sebutkan satu perbedaan penting antara environment lokal dan environment produksi (kunci/env vars).

---

**Lanjut ke [Modul 10 — Mini Project Final](10-PROJECT-FINAL.md).**