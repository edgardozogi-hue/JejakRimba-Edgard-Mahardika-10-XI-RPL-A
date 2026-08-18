# Catatan Format & Riwayat Dokumen Laporan Jejak Rimba

Dokumen ini mencatat seluruh format dan riwayat pembuatan dokumen laporan PjBL
"Website Jejak Rimba" agar bisa dipakai ulang untuk laporan lain (mengganti konten
saja, format tetap).

---

## 1. Riwayat Versi (Terlama → Terbaru)

### v0 — Markdown (draf sumber teks)
- **File:** `docs/laporan-jejak-rimba.md`
- **Isi:** draf lengkap laporan dalam Markdown, placeholder memakai `[...]`.
- **Fungsi:** sumber teks yang bisa diedit cepat; lalu dikonversi ke Word.
- **Script pembangun:** `docs/buat_laporan_docx.py` (Python + python-docx).

### v1 — "Laporan Jejak Rimba.docx"
- Format dasar pertama: TNR, spasi 1,5, belum ada nomor halaman/indent.
- Daftar isi manual (tabel), daftar tabel/gambar/lampiran berbentuk tabel.
- **Status:** superseded.

### v2 — "Laporan Jejak Rimba v2.docx"
Perbaikan format:
- Judul = 14, subjudul = 12 bold, isi = 12.
- Paragraf diberi indentasi baris pertama 1,25 cm.
- Nomor halaman (field PAGE) di footer tengah.
- Rata kanan-kiri (justify) untuk seluruh isi.
- Daftar isi otomatis Word (TOC field) + auto-update saat dibuka.

### v3 — "Laporan Jejak Rimba v3.docx" (TERBARU)
- Judul BAB dibuat dua baris rata tengah: "BAB 1" lalu "PENDAHULUAN".
- Daftar Tabel, Gambar, Lampiran diubah menjadi daftar titik pemandu (dot
  leader) + nomor halaman (bukan tabel).
- Halaman kosong di halaman depan dihapus (tiap daftar di halaman sendiri).
- DAFTAR RUJUKAN → DAFTAR PUSTAKA gaya Chicago + hanging indent.
- Diagram dipasang: ERD, Use Case, Activity.

---

## 2. Spesifikasi Format Final (Reusable)

### Ukuran Halaman & Margin
- Kertas: A4.
- Margin: atas 3 cm, bawah 3 cm, kiri 3 cm, **kanan 4 cm**.

### Huruf
- Jenis: **Times New Roman** di seluruh dokumen.
- Judul (BAB/bagian): 14 pt, bold.
- Subjudul (x.x): 12 pt, bold.
- Isi teks: 12 pt, regular.
- Spasi baris: 1,5.

### Paragraf
- Rata **justify** (rata kanan-kiri) untuk seluruh isi.
- Indentasi baris pertama 1,25 cm pada paragraf isi.
- Nomor halaman di **footer tengah** (field PAGE otomatis).

### Judul BAB
- Dua baris, rata tengah:
  - Baris 1: `BAB 1`
  - Baris 2: `PENDAHULUAN`
- Bagian non-BAB (KATA PENGANTAR, DAFTAR ISI, DAFTAR PUSTAKA, PROFIL PENULIS)
  tetap satu baris.

### Daftar Isi / Tabel / Gambar / Lampiran
- Semua memakai **titik pemandu (dot leader) + nomor halaman**.
- Daftar Isi = TOC field Word (auto-update saat dibuka / klik kanan → Update Field).
- Daftar Tabel/Gambar/Lampiran = daftar dot leader biasa (konsisten dengan isi).

### Daftar Pustaka
- Gaya **Chicago** (bibliography), urut alfabetis, hanging indent 1,25 cm.
- Format: `Organisasi. "Judul Halaman." Accessed Tanggal, Tahun. URL.`

### Gambar & Diagram
- Lebar gambar: 14,5 cm, rata tengah, keterangan di bawah (11 pt).
- Penomoran gambar: `Gambar 3.1`, `Gambar 4.1`, dst.

---

## 3. Cara Menjalankan Ulang (Build Script)

```powershell
python "C:\Users\M S I\jejak-rimba\docs\buat_laporan_docx.py"
```

Hasil tersimpan sesuai variabel `OUT` di dalam script.
Karena file lama sering terkunci (sedang terbuka di Word), setiap build baru
disarankan memakai nama file baru.

### Catatan Penting
- `python-docx` harus terpasang: `pip install python-docx`.
- Font pastikan TNR (di set di `Normal`, `Heading 1/2`, tabel, footer, cover).
- Jika daftar isi tidak tampil otomatis di Word: klik kanan daftar isi →
  *Update Field* (setting `updateFields` sudah aktif di script).
- Nomor halaman di daftar isi bisa bergeser jika gambar/screenshot ditambah;
  cukup *Update Field* setelahnya.

---

## 4. Struktur Isi Laporan

1. Cover
2. Kata Pengantar
3. Daftar Isi (auto)
4. Daftar Tabel / Gambar / Lampiran
5. BAB 1 Pendahuluan (Latar Belakang, Tujuan, Manfaat)
6. BAB 2 Kajian Pustaka (Website, Jejak Rimba, Next.js, Supabase, Midtrans)
7. BAB 3 Proses Kerja (Desain, Alur, Alat & Bahan, Jadwal)
8. BAB 4 Hasil Proyek (halaman + tabel data + screenshot)
9. BAB 5 Penutup (Kesimpulan, Saran)
10. Daftar Pustaka (Chicago)
11. Profil Penulis
12. Lampiran (struktur DB, foto kegiatan)

---

## 5. Standar Penulisan (Humanizer + KBBI)

- Dilarang em/en dash (`—`); gunakan titik, koma, titik dua, atau kurung.
- Hindari kata AI-slop: *crucial, seamless, robust, comprehensive, delve,
  showcase, leverage, utilize, facilitate, transformative*.
- Hindari frasa template: *"tidak hanya… tetapi juga"*, *"perlu dicatat"*,
  *"berperan penting"*, *"merupakan bukti"*.
- Vary panjang kalimat (pendek-panjang); jangan selalu tutup dengan "Kesimpulan".
- Istilah baku KBBI: *pengguna, penyedia, ketersediaan, daring, perangkat,
  pembayaran, katalog, gambar* (bukan istilah asing di tengah kalimat).
- Gunakan angka & data konkret (harga, lokasi, nama alat) bukan klaim samar.
- Register formal laporan: kata ganti "penulis", tanpa partikel santai.
