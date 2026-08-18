<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Standar Dokumen Laporan PjBL (Jejak Rimba)

Pedoman format & penulisan laporan. Ringkasan lengkap di `docs/CATATAN-FORMAT-LAPORAN.md`.

## Cara menghasilkan dokumen Word
- Laporan dibangun dari skrip Python + python-docx: `docs/buat_laporan_docx.py`.
- Jalankan: `python "docs\buat_laporan_docx.py"` (butuh `pip install python-docx`).
- Karena file lama sering terkunci saat terbuka di Word, setiap build pakai nama file baru (`OUT` di script).
- Setelah build, daftar isi di Word otomatis ter-update (setting `updateFields` aktif).

## Format wajib (jangan diubah)
- A4; margin: atas 3 cm, bawah 3 cm, kiri 3 cm, kanan 4 cm.
- Huruf: Times New Roman. Judul 14 pt, subjudul 12 pt bold, isi 12 pt. Spasi 1,5.
- Paragraf: justify + indentasi baris pertama 1,25 cm; nomor halaman di footer tengah (field PAGE).
- Judul BAB dua baris rata tengah: baris 1 "BAB 1", baris 2 "PENDAHULUAN". Bagian non-BAB satu baris.
- Daftar Isi / Tabel / Gambar / Lampiran: daftar titik pemandu (dot leader) + nomor halaman.
- Daftar Pustaka: gaya Chicago, urut alfabetis, hanging indent 1,25 cm.
- Gambar: lebar 14,5 cm, rata tengah, keterangan di bawah (11 pt), bernomor `Gambar x.y`.

## Standar penulisan (humanizer + KBBI)
- Dilarang em/en dash (`—`); pakai titik, koma, titik dua, atau kurung.
- Hindari kata AI-slop: crucial, seamless, robust, comprehensive, delve, showcase, leverage, utilize, facilitate, transformative.
- Hindari frasa template: "tidak hanya… tetapi juga", "perlu dicatat", "berperan penting", "merupakan bukti".
- Vary panjang kalimat; jangan selalu tutup dengan "Kesimpulan".
- Istilah baku KBBI; gunakan data konkret (harga, lokasi, nama alat) bukan klaim samar.
- Register formal: kata ganti "penulis".
