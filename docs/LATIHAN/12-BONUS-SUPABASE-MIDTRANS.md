# 12 — BONUS: Nyalakan Supabase & Midtrans Sandbox Asli + Deploy

Modul bonus ini menghubungkan mini project (dan project asli) ke **layanan sungguhan**: Supabase (database + auth) dan Midtrans (sandbox) serta langkah **deploy**. Setelah ini, mini project tidak lagi bergantung data simulasi array.

> **Syarat:** punya akun email untuk membuat akun Supabase & Midtrans (gratis untuk tahap sandbox/development). Jika belum siap membuat akun, tetap bisa menunggu; materi Modul 1–10 sudah mencakup konsepnya.

---

## 🥅 Target

Setelah modul ini kamu bisa:
- Membuat project Supabase, mengambil kunci, mengisi `.env`
- Membuat tabel (`equipment`) & isi data lewat dashboard
- Mengganti data simulasi array dengan query Supabase di Server Action
- Menyiapkan kunci Midtrans sandbox (opsional)
- Melakukan deploy ke hosting (Vercel / Node.js server)

---

## 1. Supabase — Database & Auth Asli

### 1.1 Buat project & ambil kunci

1. Buka **supabase.com** → Sign Up / Log In (pakai akun kamu).
2. Klik **New Project**: beri nama (misal "jejak-rimba"), set password DB, pilih region terdekat, klik Create.
3. Setelah siap, masuk ke **Project Settings → API**. Salin:
   - `Project URL` (misal `https://xxx.supabase.co`)
   - `anon public key`
   - `service_role key` (rahasia — hanya untuk server!)

> **Peringatan:** `service_role` punya akses penuh. **Jangan pernah** taruh di file `"use client"` atau commit ke git. Hanya di server & `.env.local` (yang sudah di `.gitignore`).

### 1.2 Isi `.env.local` di mini project

Di `latihan-next`, buat file `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
```

- `NEXT_PUBLIC_*` → boleh tampil di browser.
- `SUPABASE_SERVICE_ROLE_KEY` → hanya server.

### 1.3 Install Supabase & buat client

```bash
npm install @supabase/supabase-js @supabase/ssr
```

Buat `lib/supabase-server.ts`:

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function getServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );
}
```

*(pola ini meniru `app/lib/supabase-server.ts` project asli.)*

### 1.4 Buat tabel `equipment` di dashboard

Di **Supabase → Table Editor → New table**:

| Column | Type |
|---|---|
| id | uuid (primary key, default gen_random_uuid()) |
| nama | text |
| harga | int4 |
| stok | int4 |
| kategori | text |

Lalu **Insert row** 3 baris contoh (Tenda, Carrier, Sleeping Bag). Ini "data sungguhan" yang tadi berupa array.

### 1.5 Ganti aksi simulasi dengan query Supabase

Ubah `app/actions/katalog.ts`:

```ts
"use server";
import { getServerClient } from "@/lib/supabase-server";

export async function ambilAlat() {
  const supabase = await getServerClient();
  const { data, error } = await supabase.from("equipment").select("*");
  if (error) throw new Error(error.message);
  return data;
}

export async function sewaAlat(formData: FormData) {
  const nama = formData.get("nama")?.toString() ?? "";
  const jumlahHari = Number(formData.get("jumlahHari") ?? 0);
  const supabase = await getServerClient();
  const { data } = await supabase.from("equipment").select("*").eq("nama", nama).single();
  if (!data) return { ok: false, pesan: "Alat tidak ditemukan" };
  return { ok: true, pesan: `Total Rp ${data.harga * jumlahHari}` };
}
```

Halaman tidak perlu diubah — karena tetap memanggil `ambilAlat`/`sewaAlat`. Inilah keuntungan memisahkan data di `app/actions/`: **ganti sumber data tanpa ubah tampilan**.

### 1.6 Auth asli (opsional, pengganti simulasi `auth-mini`)

Untuk login/register sungguhan, ganti `auth-mini` dengan fungsi Supabase seperti di project asli: `signInWithPassword`, `signUp`, `signInWithOAuth` di Server Action atau client, dan set session via Supabase (cookie) + middleware. Pola lengkap ada di project asli (`app/actions/auth.ts`, `app/masuk/page.tsx`, `middleware.ts`, `app/auth/callback/route.ts`).

---

## 2. Midtrans Sandbox (opsional)

Pembayaran sungguhan butuh akun Midtrans. Untuk **percobaan/development**, pakai **sandbox** (uang palsu).

1. Daftar **Midtrans** (midtrans.com) → pilih **Sandbox / Test** environment.
2. Di dashboard sandbox, ambil **Server Key** & **Client Key** (di Settings → Access Keys).
3. Isi di `.env.local`:
   ```env
   MIDTRANS_IS_PRODUCTION=false
   MIDTRANS_SERVER_KEY=<server key sandbox>
   NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=<client key sandbox>
   ```
4. Pasang `@midtrans/client` (atau pakai Snap API seperti project asli).
5. Ganti `mini-webhook` dengan `app/api/midtrans-webhook` asli project:
   - Terima data, **verifikasi signature**, petakan status, update tabel.

> Mulai sandbox; `MIDTRANS_IS_PRODUCTION=false`. Jangan pernah ubah ke `true` sebelum siap produksi & key produksi terpasang.

---

## 3. Deploy

Mini project kini butuh server (Server Actions + Supabase). Opsi:

### Opsi A — Vercel (paling mudah, rekomen untuk belajar)

```bash
npm i -g vercel
vercel
```

- Vercel mendeteksi Next.js, meminta koneksi Git (opsional), lalu build & beri URL.
- **PENTING:** isi **Environment Variables** di dashboard Vercel (Project → Settings → Environment Variables) dengan kunci yang sama seperti `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `ANON`, `SERVICE_ROLE`, Midtrans).
- Setelah deploy, webhook Midtrans memakai URL produksi (misal `https://app.vercel.app/api/midtrans-webhook`) di dashboard Midtrans.

### Opsi B — Node.js server (self-host)

- Di server: `npm install`, `npm run build`, `npm run start`.
- Set env vars di lingkungan server (bukan commit).
- Atur reverse proxy/HTTPS bila perlu.

### Peringatan env di deploy

- **Jangan commit** `.env.local` (sudah di `.gitignore`).
- Isi env di hosting, bukan menaruh key nyata di file di repo.
- Selalu `npm run build` untuk verifikasi sebelum deploy.

---

## 4. Checklist penyelesaian

- [ ] Akun Supabase & project dibuat, kunci di `.env.local` (service role hanya server)
- [ ] Tabel `equipment` ada & berisi data
- [ ] `ambilAlat`/`sewaAlat` memakai Supabase; halaman tetap jalan
- [ ] (Opsional) Auth Supabase & Midtrans sandbox terpasang
- [ ] `npm run build` sukses
- [ ] Deploy ke Vercel/Node.js & env terisi

---

## ✅ Checkpoint (bonus)

1. Mana dari kunci Supabase yang boleh tampil di browser? (jawab: yang berprefix `NEXT_PUBLIC_`)
2. Kenapa `service_role key` tidak boleh di file `"use client"`?
3. Kenapa mengganti data dari array ke Supabase tidak perlu mengubah halaman? (jawab: karena data dipisah di `app/actions/`; halaman hanya memanggil action)
4. Apa peran `MIDTRANS_IS_PRODUCTION`?
5. Di mana env variables diisi saat deploy (bukan `.env.local` lokal)?

---

## 🧠 Refleksi akhir (tulis di notes-mu)

- Bandingkan arsitektur mini project final dengan project asli Jejak Rimba: sebutkan 3 kesamaan & 3 perbedaan.
- Apa bagian yang paling menantang sepanjang kurikulum ini?
- Buat satu rencana kecil: fitur apa berikutnya yang ingin kamu bangun/pelajari (misal menyempurnakan dashboard vendor, menambah kategori, upload gambar di Supabase Storage)?

---

**Selamat! Kamu telah menyelesaikan seluruh kurikulum Jejak Rimba Mini.** Sekarang kamu punya bekal untuk membaca & mengubah project asli dengan lebih percaya diri. Kembali ke [00-PENGANTAR.md](00-PENGANTAR.md) bila ingin mengulang, atau buka `docs/PANDUAN/00-README.md` untuk panduan project aslinya.