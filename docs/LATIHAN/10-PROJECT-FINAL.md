# Modul 10 — Mini Project Final: Merangkai Semuanya

Ini "ujian terakhir" dan proyek utuh: menggabungkan semua konsep dari Modul 1–9 menjadi **satu aplikasi Jejak Rimba Mini yang lengkap dan berjalan**. Kamu akan melihat bagaimana fondasi (HTML/CSS/JS/React/TS), framework (Next.js), data (Supabase/simulasi), auth, pembayaran, dan animasi bekerja bersama.

---

## 🥅 Target

Setelah modul ini kamu bisa:
- Menjelaskan **arsitektur penuh** aplikasi full-stack sederhana
- Merangkai halaman + Server Action + proteksi + animasi jadi satu alur utuh
- Mengenali, pada project asli Jejak Rimba, di mana tiap konsep diletakkan
- Melakukan **siklus**: baca kebutuhan → rancang → bangun → uji → refactor

---

## 📖 Penjelasan panjang

### 10.1 Bagaimana "satu aplikasi" disusun

Aplikasi full-stack = gabungan lapisan yang sudah kamu pelajari. Jangan dipikir sebagai "satu hal", tapi sebagai **aliran data**:

```
Pengguna → [UI/komponen React] → [Server Action] → [Data/Supabase] → balik lagi
                ↑                                    ↓
          [tampilan & animasi]           [keamanan: auth, webhook]
```

| Lapisan | Modul sumber | Di project asli |
|---|---|---|
| Tampilan (HTML/CSS/Tailwind, komponen) | 1, 3 | `app/`, `components/` |
| Logika client (state, event, animasi) | 2, 3, 9 | komponen `"use client"`, `animations.ts` |
| Routing (Next.js) | 5 | folder `app/*` |
| Tipe (TypeScript) | 4 | `lib/database.types.ts` |
| Data & logika server (Server Action + Supabase) | 6 | `app/actions/*`, `lib/supabase*` |
| Auth & proteksi | 7 | `app/masuk`, `middleware.ts`, `actions/auth.ts` |
| API & pembayaran | 8 | `api/midtrans-webhook`, `actions/midtrans.ts` |

### 10.2 Prinsip perancangan aplikasi kecil

- **Mulai dari alur data**, bukan dari tampilan. Tanyakan: "apa yang harus dihitung/diproses?" lalu "bagaimana menampilkannya?"
- **Fokus satu fitur utuh** dulu (misal: katalog → detail → sewa → bayar simulasi), baru fitur lain.
- **Jaga keamanan sejak awal** (auth di server action, jangan percaya client).
- **Jangan over-engineer**; mulailah dengan data statis/simulasi, migrasi ke Supabase bila perlu.

### 10.3 Peta aplikasi yang akan kita rangkai

```
latihan-next/app/
  layout.tsx              → kerangka + animasi global (opsional)
  page.tsx                → beranda (server, ambil data + animasi)
  katalog/page.tsx        → daftar alat (server) + Filter (client) + FormSewa
  katalog/[slug]/page.tsx → detail alat (server, dinamis)
  masuk/page.tsx          → login (client) → auth-mini
  profil/page.tsx         → profil (server, dilindungi)
  api/pembayaran/mini-webhook/route.ts → terima konfirmasi bayar
  actions/
    katalog.ts            → ambil & sewa (server actions)
    auth-mini.ts          → login/logout/isLoggedIn (server + cookie)
  components/
    KartuAnimasi.tsx      → animasi Framer Motion
  middleware.ts           → proteksi /profil & /booking
```

---

## 🛠️ Tutorial step-by-step

Kita rangkai komponen dari modul-modul sebelumnya menjadi satu. Lakukan berurutan; jika suatu langkah terasa sudah pernah dibangun, tinggal pakai/rapikan.

### Langkah 1 — siapkan struktur

Pastikan semua file berikut ada dari modul sebelumnya:
- `app/page.tsx` (beranda)
- `app/katalog/page.tsx` + `FilterMurah.tsx` + `FormSewa.tsx`
- `app/katalog/[slug]/page.tsx`
- `app/masuk/page.tsx` + `app/profil/page.tsx`
- `app/actions/katalog.ts`, `app/actions/auth-mini.ts`
- `app/api/pembayaran/mini-webhook/route.ts`
- `app/components/KartuAnimasi.tsx`
- `middleware.ts`

Jika ada yang belum dibuat, buat dulu mengikuti modul sebelumnya.

### Langkah 2 — beranda merangkum data + animasi

Ubah `app/page.tsx` menjadi halaman yang mengambil data dari action dan menampilkan kartu animasi:

```tsx
import { ambilAlat } from "./actions/katalog";
import KartuAnimasi from "./components/KartuAnimasi";

export default async function HomePage() {
  const daftar = await ambilAlat();
  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-4">Jejak Rimba Mini</h1>
      <p className="mb-6">Total alat: {daftar.length}</p>
      <KartuAnimasi />
    </main>
  );
}
```

### Langkah 3 — detail alat memakai rute dinamis

Ubah `app/katalog/[slug]/page.tsx` agar menampilkan info satu alat dari `ambilAlat` (cari berdasarkan slug/nama):

```tsx
import { ambilAlat } from "../../actions/katalog";

export default async function DetailAlatPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const daftar = await ambilAlat();
  const alat = daftar.find(a => a.nama.toLowerCase().includes(slug.toLowerCase()));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{alat ? alat.nama : "Tidak ditemukan"}</h1>
      {alat && <p>Rp {alat.harga}/hari</p>}
    </div>
  );
}
```

### Langkah 4 — buat alur "sewa" jadi konfirmasi bayar

Hubungkan `FormSewa` (modul 6) ke webhook mini (modul 8) agar setelah menyewa, muncul status "menunggu konfirmasi pembayaran". Di `FormSewa.tsx`, pada bagian submit, tambahkan panggilan `fetch` ke `/api/pembayaran/mini-webhook` dengan status `"pending"`.

```tsx
const res = await fetch("/api/pembayaran/mini-webhook", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ orderId: "JR-" + Date.now(), status: "pending", token: "RAHASIA-MINI" }),
});
const data = await res.json();
setPesan(`Pesanan dibuat: ${JSON.stringify(data)}`);
```

### Langkah 5 — gabungkan proteksi & login

Pastikan `/profil` memakai `isLoggedIn` (modul 7) dan middleware melindunginya. Login via `/masuk` → set session → bisa buka `/profil`. Uji seluruh alur.

### Langkah 6 — verifikasi build

```bash
npm run build
npm run start
```

Buka `http://localhost:3000`, coba: beranda → katalog → detail → sewa → masuk → profil. Jika semua berjalan, aplikasi utuh sudah jadi!

---

## ✋ Tugas Manual (TANPA AI)

1. **Gambar arsitektur penuh** aplikasi final di satu lembar: dari `page.tsx` → `actions/katalog.ts` → (data simulasi) → balik ke UI, plus `masuk`/`profil`/`middleware`/`webhook`. Beri label "server" vs "client" pada tiap simpul.
2. **Tulis di notes**: untuk tiap lapisan, file mana di project asli Jejak Rimba yang setara. (Contoh: `FormSewa` ≈ `booking/page.tsx` + `actions/booking.ts`.) Ini menghubungkan mini project ke project asli.
3. **Refactor kecil**: pindahkan `data` alat dari `App.tsx`/halaman ke `app/actions/katalog.ts` (sudah dilakukan), lalu tambahkan **validasi** di `sewaAlat` (misal jumlah hari > 0, alat ada). Jelaskan kenapa validasi di server itu penting.

---

## 🤖 Prompt ke AI (bimbingan)

```text
Saya baru selesai modul 10, aplikasi Jejak Rimba Mini. Ini hasilnya [jelaskan/tempel].
Bandingkan dengan arsitektur project asli jejak-rimba: di mana letak konsep yang setara
pada [daftar konsep]? Tolong review pendek: apa yang saya pahami baik dan apa yang belum,
tanpa menulis ulang kode.
```

```text
Saya ingin menambahkan fitur [X] ke mini project. Rancang bersama saya: data apa yang
dibutuhkan, rute/halaman apa, Server Action apa, dan proteksi apa. Jangan langsung tulis
kode penuh; bimbing saya langkah demi langkah.
```

---

## ✅ Checkpoint (jawaban di `11-JAWABAN-CHECKPOINT.md`)

1. Sebutkan lapisan arsitektur aplikasi full-stack dan modul yang mempelajarinya.
2. Mengapa alur data (bukan tampilan) dijadikan titik awal perancangan?
3. Di file apa saja sebuah "pemesanan" berpindah dari UI ke data di mini project? Sebutkan rute & action.
4. Apa yang terjadi bila `middleware.ts` tidak ada tapi `/profil` masih memakai `isLoggedIn`?
5. Bagaimana cara mengubah mini project dari data simulasi (array) ke Supabase tanpa mengubah halaman secara drastis? (Lihat Modul 6 & 12.)

---

## 🧠 Refleksi (tulis di notes-mu)

- Buat ringkasan satu paragraf: "Aplikasi web itu berisi ..." menggunakan kata-katamu sendiri.
- Apa konsep yang paling sulit selama 10 modul ini? Apa yang membuatnya jadi lebih mudah?
- Bagaimana perasaanmu sekarang terhadap project asli Jejak Rimba dibanding awal?

---

**Lanjut ke [File Bonus: 12-BONUS-SUPABASE-MIDTRANS.md](12-BONUS-SUPABASE-MIDTRANS.md)** untuk menyiapkan Supabase & Midtrans sandbox asli. Jawaban semua checkpoint ada di [11-JAWABAN-CHECKPOINT.md](11-JAWABAN-CHECKPOINT.md).