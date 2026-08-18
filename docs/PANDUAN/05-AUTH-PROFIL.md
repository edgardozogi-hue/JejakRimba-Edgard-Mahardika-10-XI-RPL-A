# 05 — Autentikasi & Profil

Bagian ini membahas **login (masuk), register (daftar), lupa password**, serta **halaman profil** dan **dashboard vendor**.

## Peta Halaman Autentikasi & Profil

```
/masuk                → login email/password + login Google
/daftar               → register akun (penyewa / vendor)
/lupa-password        → kirim email reset password
/profil               → profil user (menu: booking, vendor, pengaturan)
/profil/dashboard-vendor → panel vendor (masih "segera hadir")
/profil/pengaturan    → ubah nama & kata sandi
```

---

## 1. Halaman Login — `app/masuk/page.tsx`

**Fungsi:** Form login email + password, plus **login Google**.

**Jenis file:** `"use client"`.

### 1.1 Bagian yang Berubah

#### a) Judul & Teks
**Lokasi:** **baris 64–69** ("Selamat datang kembali", "Masuk buat lanjut sewa alat petualanganmu.").

#### b) Placeholder Field
- Email `nama@email.com` → **baris 79**.
- Password `......` → **baris 97**.

#### c) Link "Lupa password?"
**Lokasi:** **baris 87** (`href="/lupa-password"`). Teks di baris itu.

#### d) Teks Tombol
- "Masuk" → **baris 123** (teks tombol).
- "Atau masuk dengan" → **baris 131**.
- "Masuk dengan Google" → **baris 141**.

#### e) Link "Daftar di sini"
**Lokasi:** **baris 147–149**.

#### f) Pesan Error Login
**Lokasi:** **baris 40** (`"Email atau password salah. Coba periksa lagi."`).

### 1.2 Alur Login
Fungsi `handleLogin` (**baris 31–44**) memanggil `supabase.auth.signInWithPassword`. Jika berhasil → `router.push("/")` (ke beranda). Login Google dipanggil lewat `handleGoogleLogin` (baris 46–55) → `signInWithOAuth({ provider: "google" })`.

> **Catatan:** Perilaku login (validasi, ke mana redirect) bisa diubah di sini, atau pada file `app/actions/auth.ts` (untuk versi Server Action).

---

## 2. Halaman Daftar — `app/daftar/page.tsx`

**Fungsi:** Register akun baru. Ada **2 langkah**:
- **Langkah 1:** pilih peran (Penyewa/Vendor) + isi data diri.
- **Langkah 2 (hanya vendor):** informasi bisnis.

**Jenis file:** `"use client"`.

### 2.1 Bagian yang Berubah

#### a) Teks Pilihan Peran (Penyewa / Vendor)
**Lokasi:** **baris 163–192** (dua tombol besar). Label "Penyewa" (baris 175) & "Vendor" (baris 189).

#### b) Label & Placeholder Field (Langkah 1)
- "Nama Lengkap" placeholder "Masukkan nama lengkap" → **baris 195**.
- "Email" placeholder "contoh@email.com" → **baris 196**.
- "Nomor Telepon" placeholder "0812xxxx" → **baris 197**.
- "Password" placeholder "Min. 8 karakter" → **baris 205**.
- "Konfirmasi Password" → **baris 218**.

#### c) Pesan Validasi
**Lokasi:** fungsi `validateStep1()` **baris 41–48**.
```tsx
if (!fullName.trim()) return "Nama lengkap wajib diisi.";
if (password.length < 8) return "Password minimal 8 karakter.";
if (password !== confirmPassword) return "Konfirmasi password tidak cocok.";
```

#### d) Label Field Bisnis (Langkah 2, hanya vendor)
**Lokasi:** **baris 279–323**. "Nama Bisnis", "Deskripsi Bisnis", "Nomor WhatsApp", "Alamat Bisnis", "Titik Lokasi". Placeholder masing-masing di baris tersebut.

#### e) Teks Tombol
- Langkah 1: "Buat Akun" / "Lanjutkan" → **baris 232–236**.
- Langkah 2: "Selesaikan Pendaftaran" → **baris 337**.

#### f) Link "Masuk di sini"
**Lokasi:** **baris 350–352**.

### 2.2 Alur Register
Fungsi `registerAccount` (**baris 50–103**):
1. `supabase.auth.signUp({ email, password })` → buat akun.
2. `supabase.from("profiles").insert(...)` → simpan profil.
3. Jika peran `vendor`, `supabase.from("vendors").insert(...)` → simpan data usaha.
4. Redirect ke `/`.

> **Catatan:** File ini memakai **client Supabase** (`app/lib/supabase.ts`). Ada versi server action (`signUp` di `app/actions/auth.ts`) yang tidak dipakai halaman ini — lihat **07-BACKEND-DATA.md** untuk detailnya.

---

## 3. Halaman Lupa Password — `app/lupa-password/page.tsx`

**Fungsi:** Form memasukkan email untuk **mengirim link reset password**.

**Jenis file:** `"use client"`.

### 3.1 Bagian yang Berubah

#### a) Judul & Teks
**Lokasi:** **baris 54–59** ("Lupa password?", "Masukkan email kamu dan kami akan kirim link buat reset password.").

#### b) Placeholder Email
**Lokasi:** **baris 80** (`nama@email.com`).

#### c) Teks Sukses (setelah kirim)
**Lokasi:** **baris 64–67**. "Link reset password udah dikirim ke..." dsb.

#### d) Teks Tombol
- "Kirim Link Reset" → **baris 97**.
- Panel kanan ("Jangan Khawatir", "Kami bantu balikin akses kamu.") → **baris 114–124**.

### 3.2 Alur
Fungsi `handleReset` (**baris 14–30**) memanggil `supabase.auth.resetPasswordForEmail`, dengan redirect ke `/masuk`.

---

## 4. Halaman Profil — `app/profil/page.tsx`

**Fungsi:** Menampilkan profil user (nama, email, peran). Jika **belum login** → ajakan masuk/daftar. Jika **sudah login** → menu (Booking Saya, Dashboard Vendor, Pengaturan) + tombol Keluar.

**Jenis file:** `"use client"`.

### 4.1 Bagian yang Berubah

#### a) Menu Link (Booking, Dashboard, Pengaturan)
**Lokasi:** **baris 21–40** (`links`).
```tsx
const links = [
  { href: "/booking", icon: ClipboardList, label: "Booking Saya", desc: "Lihat riwayat dan status sewa" },
  { href: "/profil/dashboard-vendor", icon: Package, label: "Dashboard Vendor", desc: "Kelola alat dan booking masuk" },
  { href: "/profil/pengaturan", icon: Settings, label: "Pengaturan", desc: "Ubah profil dan preferensi" },
];
```
**Cara ubah:** Tambah/hapus item, ganti `label` & `desc`, atau ganti `href`.

#### b) Teks "Kamu belum masuk"
**Lokasi:** **baris 249–257** (saat belum login) + tombol "Masuk"/"Daftar" (baris 262–274).

#### c) Tombol "Keluar"
**Lokasi:** **baris 139–146** (mobile) & **baris 206–213** (desktop). Logika logout `handleLogout` di **baris 84–86** (memanggil `supabase.auth.signOut()`).

#### d) Statistik "Total Booking" & "Bergabung sejak"
**Lokasi:** **baris 185–195**. Saat ini "Total Booking" masih 0 (belum diisi logika).

### 4.2 Perbedaan Tampilan Mobile vs Desktop
Halaman ini menampilkan **dua tampilan**: `mobileView` (baris 107–149) & `desktopView` (baris 152–218). Keduanya muncul bersamaan; yang tampil sesuai ukuran layar (CSS `md:hidden` / `hidden md:block`). Jika mengubah sesuatu, kadang perlu mengubah **kedua** tampilan.

---

## 5. Dashboard Vendor — `app/profil/dashboard-vendor/page.tsx`

**Fungsi:** Halaman untuk vendor mengelola alat & booking masuk. **Saat ini masih placeholder** — menampilkan komponen `ComingSoon`.

**Jenis file:** Server component (tidak memakai `"use client"`).

**Isi file saat ini:**
```tsx
import PageShell from "../../components/PageShell";
import ComingSoon from "../../components/ComingSoon";

export default function DashboardVendorPage() {
  return (
    <PageShell>
      <ComingSoon title="Dashboard Vendor" description="Kelola alat dan booking masuk akan tampil di sini." />
    </PageShell>
  );
}
```

### 5.1 Cara Mengubah
- **Ubah teks** judul/deskripsi → sunting `title` & `description` pada `ComingSoon`.
- **Membangun dashboard sesungguhnya** → ganti isi `return` dengan komponen/UI vendor. Logika data yang bisa dipakai sudah ada di `app/actions/booking.ts` (`getVendorBookings` & `updateBookingStatus`). Lihat **07-BACKEND-DATA.md**.

---

## 6. Pengaturan — `app/profil/pengaturan/page.tsx`

**Fungsi:** Mengubah **nama lengkap** dan **kata sandi**, plus beberapa toggle notifikasi (placeholder).

**Jenis file:** `"use client"`.

### 6.1 Bagian yang Berubah

#### a) Teks "Pengaturan" & Header
**Lokasi:** **baris 138–147** (judul "Pengaturan", tombol kembali).

#### b) Section Profil (ubah nama)
**Lokasi:** **baris 163–200**.
- Label "Nama Lengkap" → baris 166.
- Email (disabled, tidak bisa diubah) → baris 178–190.
- Tombol "Simpan Profil" → baris 197.
- Logika `handleUpdateProfile` (baris 56–73) memanggil `supabase.auth.updateUser({ data: { full_name } })`.

#### c) Section Kata Sandi
**Lokasi:** **baris 203–238**.
- Label "Kata Sandi Baru", "Minimal 6 karakter." → baris 206, 227.
- Tombol "Ubah Kata Sandi" → baris 235.
- Logika `handleUpdatePassword` (baris 75–93) memanggil `supabase.auth.updateUser({ password })`.

#### d) Section Notifikasi (toggle)
**Lokasi:** **baris 241–247** (`Toggle`). Label tombol bisa diubah; saat ini toggle-nya **belum terhubung** ke backend (hanya tampilan).

### 6.2 Catatan
File ini memakai komponen bantu `Section` (baris 254–276) dan `Toggle` (baris 279–307) di dalam file yang sama.

---

## 7. Ringkasan Cepat — File Auth & Profil

| Ingin mengubah | Buka file | Lokasi |
|---|---|---|
| Pesan error login | `masuk/page.tsx` | baris 40 |
| Tombol "Masuk dengan Google" | `masuk/page.tsx` | baris 141 |
| Label peran Penyewa/Vendor | `daftar/page.tsx` | baris 175, 189 |
| Pesan validasi daftar | `daftar/page.tsx` | baris 41–48 |
| Teks sukses reset | `lupa-password/page.tsx` | baris 64–67 |
| Menu profil | `profil/page.tsx` | baris 21–40 |
| Teks dashboard vendor | `profil/dashboard-vendor/page.tsx` | baris 7–9 |
| Section pengaturan | `profil/pengaturan/page.tsx` | baris 163–247 |

---

Lanjut ke **[06-HALAMAN-STATIS.md](06-HALAMAN-STATIS.md)** untuk halaman-halaman teks.