# Modul 7 — Autentikasi (Login & Register)

Di modul ini kamu memahami keamanan dasar website: bagaimana tahu **siapa kamu**, **melacak sesimu**, dan **membatasi halaman/data**. Ini persis yang dilakukan `app/masuk`, `app/daftar`, `app/actions/auth.ts`, dan `middleware.ts` di project asli.

---

## 🥅 Target

Setelah modul ini kamu bisa:
- Menjelaskan 3 konsep inti auth: **authentication**, **session**, **authorization**
- Membaca & menjelaskan alur login/register di project asli
- Membuat form login/register sederhana (memakai Supabase di modul 12, atau simulasi di sini)
- Mengerti kenapa halaman `/profil` & `/booking` dilindungi middleware

---

## 📖 Penjelasan panjang

### 7.1 Tiga konsep inti (jangan dicampur)

Docs resmi memecah auth jadi tiga:

| Konsep | Arti | Analogi |
|---|---|---|
| **Authentication** | Memastikan kamu siapa (masukkan password benar) | Menunjukkan KTP di pintu masuk |
| **Session** | Melacak bahwa kamu masih login di banyak request | Kartu akses yang tinggal tunjukkan setiap berkunjung |
| **Authorization** | Menentukan *apa saja* yang boleh kamu akses | Pintu gerbang yang hanya terbuka untuk karyawan level tertentu |

Kesalahan umum: menganggap auth cuma "login". Padahal login = authentication; **session** & **authorization** (= guarding) sama penting dan sering jadi sumber bug/keamanan.

### 7.2 Flow login di project asli (buka `app/masuk/page.tsx`)

```
1. User isi email + password, klik "Masuk"
        ↓
2. supabase.auth.signInWithPassword({ email, password })   ← authentication
        ↓
3. Supabase menetapkan session (cookie)                    ← session
4. router.push("/")                                          ← redirect
```

Perhatikan file ini `"use client"` dan memakai **browser client** (`app/lib/supabase.ts`), bukan server action. Ada dua gaya di project: prefer `actions/auth.ts` (server) untuk keamanan lebih; form masuk memakai client.

**Kenapa session penting?** Setelah login (misal di beranda), saat kamu buka `/profil`, server harus tahu "ini masih user yang sama". Session tersimpan dalam **cookie** yang dibawa tiap request. Tanpa session, website tidak ingat kamu sudah login.

### 7.3 Supabase Auth membantu

Supabase menangani hal rumit (hashing password, token, cookie refresh) sehingga kamu tidak perlu membuat dari nol. Kamu tinggal memanggil fungsi seperti:
- `signUp({ email, password })` — daftar
- `signInWithPassword({ email, password })` — login
- `signInWithOAuth({ provider: "google" })` — login Google
- `resetPasswordForEmail(email)` — lupa password
- `signOut()` — keluar
- `getUser()` / dari session — cek user saat ini

Perlihatkan saja fungsinya; detail ada di project asli `app/actions/auth.ts`.

### 7.4 Authorization: membatasi halaman & data

Ada dua level pembatasan:

**a) Batas halaman (rute)** — lewat `middleware.ts`:
Project asli melindungi `/profil` dan `/booking`. Jika belum login, redirect ke `/masuk`.

```
middleware.ts
  protectedRoutes = ["/profil", "/booking"]
  if (belum login && path dimulai dari protectedRoutes)
        → redirect ke /masuk
```

**b) Batas data (di dalam action)** — lewat cek di Server Action. Ini **wajib**, karena middleware hanya melindungi rute, sedangkan data/login perlu dicek juga. Contoh di `app/actions/booking.ts` `getBookingById` memeriksa bahwa booking itu milik user yang login (jika bukan, tolak akses).

> **Pelajaran penting:** melindungi halaman (middleware) **tidak cukup**. Data di balik Server Action harus dicek autorisasi lagi (defense in depth). Jangan percaya hanya pada tombol yang disembunyikan di UI.

### 7.5 Mensimulasikan auth tanpa akun (untuk belajar di sini)

Kita bisa membangun **mini auth sendiri** untuk memahami mekanisme, tanpa perlu akun Supabase:
- Simpan "pengguna" di array sisi server.
- Saat login, tandai session dengan cookie (`httpOnly`).
- Middleware mengecek cookie → melindungi route.

Ini mengajarkan inti (authentication + session + authorization) dengan konsep murni, siap-migrasi ke Supabase nanti.

---

## 🛠️ Tutorial step-by-step

Kita bangun login/register sederhana + middleware pelindung di `latihan-next`. (Untuk versi Supabase asli: Modul 12.)

### Langkah 1 — "database user" + fungsi auth (server)

Buat `app/actions/auth-mini.ts`:

```ts
"use server";
import { cookies } from "next/headers";

const DB_USER = [{ email: "test@mail.com", password: "rahasia123" }];

// authentication: cek credentials
export async function login(email: string, password: string) {
  const user = DB_USER.find(u => u.email === email && u.password === password);
  if (!user) return { ok: false };

  // session: simpan tanda login di cookie httpOnly
  const cookieStore = await cookies();
  cookieStore.set("session", user.email, { httpOnly: true, path: "/" });
  return { ok: true };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

// digunakan middleware/server untuk cek login
export async function isLoggedIn() {
  const cookieStore = await cookies();
  return Boolean(cookieStore.get("session"));
}
```

### Langkah 2 — halaman login (client)

Buat `app/masuk/page.tsx` (Client, memakai `useRouter` untuk redirect):

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "../actions/auth-mini";

export default function MasukPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasil = await login(email, password);
    if (hasil.ok) router.push("/profil");
    else setError("Email atau password salah");
  };

  return (
    <form onSubmit={submit} className="max-w-sm mx-auto mt-10 space-y-3">
      <h1 className="text-2xl font-bold">Masuk</h1>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="border p-2 rounded w-full" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="border p-2 rounded w-full" />
      <button className="bg-orange-500 text-white px-4 py-2 rounded w-full">Masuk</button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </form>
  );
}
```

### Langkah 3 — halaman profil yang dilindungi

Buat `app/profil/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import { isLoggedIn, logout } from "../actions/auth-mini";

export default async function ProfilPage() {
  if (!(await isLoggedIn())) redirect("/masuk");   // authorization: batas halaman

  return (
    <div className="max-w-sm mx-auto mt-10 text-center">
      <h1 className="text-2xl font-bold">Profil Anda</h1>
      <p>Anda sedang login.</p>
      <form action={logout}>
        <button type="submit" className="mt-4 bg-gray-500 text-white px-4 py-2 rounded">Keluar</button>
      </form>
    </div>
  );
}
```

### Langkah 4 — middleware melindungi rute

Buat `middleware.ts` di root `latihan-next`:

```ts
import { NextRequest, NextResponse } from "next/server";

// himbauan: mencocokkan dengan file yang dilindungi project asli
const protectedRoutes = ["/profil", "/booking"];

export function middleware(request: NextRequest) {
  const session = request.cookies.get("session");
  const { pathname } = request.nextUrl;

  const dilindungi = protectedRoutes.some(p => pathname.startsWith(p));
  if (dilindungi && !session) {
    const url = request.nextUrl.clone();
    url.pathname = "/masuk";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/profil/:path*", "/booking/:path*"],
};
```

Uji: buka `/profil` saat belum login → redirect ke `/masuk`. Setelah `login` lewat `/masuk` → bisa buka `/profil`. Klik "Keluar" → `/profil` tertutup lagi.

> Perhatikan perbedaan: middleware cek cookie pada **request**; halaman profil cek lagi lewat action (`isLoggedIn`). Kedua lapis pelindung ini = **defense in depth**.

---

## ✋ Tugas Manual (TANPA AI)

1. **Gambar diagram 3 konsep** (authentication, session, authorization) dengan contoh kejadian nyata untuk tiap konsep di mini project ini.
2. **Baca `app/middleware.ts` asli** project dan tuliskan: rute apa yang dilindungi, apa yang dilakukan jika belum login, dan ke mana redirect-nya.
3. **Tambah fitur register**: buat fungsi `register(email, password)` di `auth-mini.ts` yang menambah user ke `DB_USER` (boleh di memori), lalu buat form daftar. Setelah register sukses, set session & ke `/profil`. Jelaskan tiap langkah.

---

## 🤖 Prompt ke AI (bimbingan)

```text
Saya di modul 7 auth. Saya bingung beda melindungi halaman di middleware vs
memeriksa user di dalam Server Action. Mengapa interned towards "defense in depth"?
Jelaskan pakai analogi dan beri saya 1 latihan kecil untuk saya ketik, tanpa jawaban final.
```

```text
Saya error di app/masuk (login tidak redirect ke profil meski sukses). Ini kode [tempel],
ini console [tempel]. Bantu saya menemukan penyebab lewat pertanyaan bertingkat.
```

---

## ✅ Checkpoint (jawaban di `11-JAWABAN-CHECKPOINT.md`)

1. Jelaskan ringkas authentication, session, dan authorization beserta analogi masing-masing.
2. Mengapa session disimpan dalam cookie `httpOnly`?
3. Apa beda melindungi halaman (middleware) dan melindungi data (cek di action)? Mengapa keduanya dibutuhkan?
4. Fungsi Supabase apa yang dipakai untuk login, daftar, login Google, dan keluar?
5. Di project asli, mengapa `/booking` dilindungi? Apa yang mungkin terjadi jika tidak?

---

## 🧠 Refleksi (tulis di notes-mu)

- Kenapa tidak cukup hanya menyembunyikan tombol "Pengaturan" bagi yang belum login? (lihat authorization data)
- Apa kelemahan "simulasi DB" kita (array di memori)? Kenapa Supabase/tempat penyimpanan nyata lebih baik?
- Sebutkan satu rute di project asli yang kamu rasa harus dilindungi dan alasannya.

---

**Lanjut ke [Modul 8 — API Route + Pembayaran](08-API-PEMBAYARAN.md).**