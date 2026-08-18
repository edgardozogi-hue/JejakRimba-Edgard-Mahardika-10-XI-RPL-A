# 11 — Kunci Jawaban Checkpoint

Jawaban ringkas untuk checkpoint Modul 1–10. Gunakan untuk memeriksa diri sendiri **setelah** mencoba menjawab, bukan sebagai bocoran awal. Tujuannya menguji pemahaman, bukan menghafal.

---

## Modul 1 — HTML/CSS

1. **Peran:** HTML = struktur & isi (kerangka), CSS = tampilan & posisi (rias), JS = perilaku/logika (otak).
2. **`:root` & CSS variable:** tempat mendefinisikan nilai reusable (misal warna `--ember`). Dipakai supaya mengubah satu nilai di `:root` otomatis mengubah semua pemakaiannya di seluruh file, memudahkan perubahan tema.
3. **Membuat teks 2x besar:** ubah nilai `font-size` (atau base size) di CSS; dengan variable/base rem, cukup di satu tempat.
4. **Class Tailwind:** `text-4xl` = font-size besar; `flex` = display:flex (sejajar); `px-4` = padding kiri-kanan; `bg-accent` = warna latar dari tema.
5. **`flex-wrap: wrap`:** elemen yang tidak muat turun ke baris baru (layout responsif, tidak melebar/overflow).

## Modul 2 — JavaScript

1. **const/let/var:** `const` nilai tetap (tak bisa di-assign ulang), `let` bisa diubah, `var` cara lama (hindari). Pakai `const` untuk nilai yang tidak berubah, `let` bila nilainya berubah.
2. **Indeks array mulai dari 0.**
3. `[1,2,3].map(x => x*2)` → `[2,4,6]`.
4. `[1,2,3,4].filter(x => x % 2 === 0)` → `[2,4]` (bilangan genap).
5. Contoh object: `const alat = { nama: "Tenda", harga: 50000, stok: 5 };` akses via `alat.nama`, `alat["harga"]`.
6. **Template literal:** memasukkan nilai ke string memakai `` `...${var}...` ``; lebih mudah dibaca & bisa banyak variabel/ekspresi.

## Modul 3 — React

1. **props vs state:** props = data masuk dari parent (read-only, dikirim saat pemanggilan), state = data internal komponen yang bisa diubah & memicu render.
2. **Kenapa useState:** `useState` memberi tahu React "ada yang berubah, render ulang". Variabel biasa tidak memicu render.
3. **key:** membantu React melacak item pada list; harus unik agar update/delete akurat (misal `key={a.nama}`).
4. JSX merah: `<h1 className="text-red-500">Halo</h1>` (pakai `className`, bukan `class`).
5. `useEffect(..., [])` dijalankan **sekali** saat komponen pertama kali tampil (mount). Array dependency menentukan kapan efek berjalan.

## Modul 4 — TypeScript

1. **TS vs JS:** TS = JS + tipe. TS perlu dikompilasi ke JS. Dipakai karena menangkap bug lebih awal, autocomplete, dan kode lebih jelas.
2. `interface` = mendeskripsikan bentuk object. Contoh `interface Alat { nama: string; harga: number; stok: number }`.
3. **Union** membatasi nilai: `type Status = "aktif" | "nonaktif"`.
4. `?` = properti opsional (boleh tidak diisi).
5. `<KartuAlat harga="mahal" />` → error tipe karena `harga` harus `number`; berguna agar bug tipe tertangkap sebelum jalan.

## Modul 5 — Next.js

1. Rute `/katalog/tenda-dome` = folder `app/katalog/[slug]/`.
2. **Server vs Client:** server component = default, jalan di server, akses DB, tanpa state/events. Client = butuh `"use client"` untuk state/events/browser API.
3. **Params Promise:** di versi Next.js ini `params` adalah Promise → harus `await` untuk membaca nilainya.
4. `layout.tsx` = kerangka bersama halaman; root layout wajib memuat `<html>` & `<body>` dan `children`.
5. `<Link>` = navigasi client-side + prefetch tanpa reload penuh; `<a>` = navigasi biasa (reload).
6. `[slug]` = segmen dinamis; nilai URL jadi parameter (misal `slug`).

## Modul 6 — Server Actions + Supabase

1. **Server Action** = fungsi `"use server"` yang jalan di server; dipakai untuk akses data & logika karena kunci rahasia aman.
2. **Browser client vs server client:** browser dipakai di `"use client"` (login/form interaktif); server (`getServerClient`) dipakai di Server Actions untuk akses data dengan kunci aman.
3. **Harus cek auth di action:** karena Server Action bisa dipanggil langsung lewat POST, bukan hanya lewat UI; tanpa cek, data bisa diakses siapa pun.
4. Setelah mutasi: `revalidatePath`/`revalidateTag`/`refresh` (sering + `redirect`).
5. `getEquipmentList` mengubah sumber data dari array → `.from("equipment").select(...)`; pola halaman (server component memanggil action) tetap sama.

## Modul 7 — Autentikasi

1. Authentication (verifikasi identitas), session (melacak login lintas request), authorization (batas akses).
2. Cookie `httpOnly` mencegah JavaScript membaca nilai cookie (lebih aman dari XSS).
3. Middleware melindungi **halaman**; cek di action melindungi **data**. Keduanya butuh (defense in depth).
4. Login `signInWithPassword`, daftar `signUp`, Google `signInWithOAuth({provider:"google"})`, keluar `signOut`.
5. `/booking` dilindungi karena isi booking user spesifik; tanpa proteksi, user lain bisa melihat data booking.

## Modul 8 — API + Pembayaran

1. `page.tsx` = mengirim HTML (halaman); `route.ts` = mengirim JSON/response untuk API.
2. **Webhook** = layanan pihak ketiga memanggil URL-mu saat ada kejadian (misal status pembayaran). Dibutuhkan agar server tahu status nyata yang terpercaya.
3. `POST` + tidak di-cache karena menerima status berubah & membutuhkan data masuk.
4. Tanpa verifikasi signature, server bisa diperdaya status palsu (misal "sudah bayar" padahal tidak).
5. Keduanya menyimpan status pesanan; perbedaan: `Map` memori (simulasi) vs tabel `transactions`/`bookings` di Supabase (asli).

## Modul 9 — Middleware + Animasi + Deploy

1. Middleware berjalan sebelum halaman dimuat; `matcher` menentukan path yang diproses (menghemat kerja, misal hanya `/profil` & `/booking`).
2. Framer Motion butuh state/events browser → komponen harus `"use client"`.
3. `initial` = keadaan awal, `animate` = keadaan akhir, `transition` = durasi/easing/delay.
4. `dev` = pengembangan (auto-reload), `build`+`start` = versi produksi teroptimasi.
5. Butuh Node.js server karena memakai Server Actions, Supabase, webhook (fitur yang butuh server), bukan static export.

## Modul 10 — Final

1. Lapisan: tampilan (1,3), logika client/animasi (2,3,9), routing (5), tipe (4), data & server action (6), auth/proteksi (7), API/pembayaran (8).
2. Alur data jadi titik awal karena menentukan apa yang dihitung/disimpan sebelum memikirkan tampilan.
3. Pemesanan: UI (`FormSewa.tsx`) → action (`sewaAlat`) → webhook (`/api/pembayaran/mini-webhook`).
4. Tanpa middleware tapi memakai `isLoggedIn` di halaman: `/profil` masih aman (data dicek), tapi request ekstra & tidak "redirect penjaga" di tepi; middleware menambah lapisan pelindung dan UX (redirect).
5. Ubah `ambilAlat`/`sewaAlat` agar memakai Supabase (`getServerClient().from("equipment")`) tanpa mengubah halaman; halaman tetap memanggil action yang sama.

---

Semua jawaban di atas dirancang **ringkas**; bandingkan dengan pemahamanmu sendiri. Bila jawabanmu berbeda tapi logis, diskusikan — sering ada lebih dari satu cara yang benar.

**Lanjut ke [12-BONUS-SUPABASE-MIDTRANS.md](12-BONUS-SUPABASE-MIDTRANS.md).**