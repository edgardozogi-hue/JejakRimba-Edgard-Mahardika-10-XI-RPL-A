-- =========================================================
-- MIGRATION v3 — JEJAK RIMBA (Revisi Guru)
--  RLS policy untuk tabel `bookings`.
--
-- Masalah: `bookings` telah ENABLE ROW LEVEL SECURITY, tetapi tidak
-- ada policy vendor/admin, sehingga query vendor (getVendorOverview,
-- getVendorBookings, updateBookingStatus) dikembalikan kosong oleh
-- Postgres. Renter sudah bisa membaca booking miliknya sendiri.
--
-- Jalankan SELURUH file ini di Supabase Dashboard > SQL Editor > Run.
-- Idempotent: aman dijalankan berulang.
-- =========================================================

-- Pastikan RLS aktif (jika belum)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- ── Helper: fungsi penentu vendor untuk sebuah booking ──
-- Dideklarasikan SEBELUM policy yang mereferensikannya.
-- Mengembalikan vendor_id dari alat booking. Untuk booking single memakai
-- bookings.equipment_id; untuk booking multi (equipment_id NULL) memakai
-- booking_items.equipment_id. SECURITY DEFINER agar pembacaannya tidak
-- diblokir RLS booking_items saat dipanggil dari policy bookings.
CREATE OR REPLACE FUNCTION public.bookings_equipment_owner(book_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT vendor_id
  FROM public.equipment
  WHERE id = (
    SELECT COALESCE(
      b.equipment_id,
      (SELECT equipment_id FROM public.booking_items WHERE booking_id = b.id LIMIT 1)
    )
    FROM public.bookings b WHERE b.id = book_id
  )
  LIMIT 1;
$$;

-- Izin eksekusi fungsi untuk authenticated (dipakai policy RLS)
GRANT EXECUTE ON FUNCTION public.bookings_equipment_owner(uuid) TO authenticated;

-- ── INSERT: hanya renter yang membuat booking untuk dirinya ──
DROP POLICY IF EXISTS "bookings_insert_own" ON public.bookings;
CREATE POLICY "bookings_insert_own" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = renter_id);

-- ── SELECT ──
-- 1) Renter melihat booking sendiri
-- 2) Vendor melihat booking yang alatnya (langsung atau via booking_items) miliknya
-- 3) Admin melihat semua
DROP POLICY IF EXISTS "bookings_select_vendor_renter" ON public.bookings;
CREATE POLICY "bookings_select_vendor_renter" ON public.bookings
  FOR SELECT USING (
    auth.uid() = renter_id
    OR auth.uid() IN (
      SELECT profile_id FROM public.vendors v
      WHERE v.id = public.bookings_equipment_owner(public.bookings.id)
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ── UPDATE: vendor terkait & admin bisa ubah status; renter update data sendiri ──
DROP POLICY IF EXISTS "bookings_update_vendor_renter" ON public.bookings;
CREATE POLICY "bookings_update_vendor_renter" ON public.bookings
  FOR UPDATE USING (
    auth.uid() = renter_id
    OR auth.uid() IN (
      SELECT profile_id FROM public.vendors v
      WHERE v.id = public.bookings_equipment_owner(public.bookings.id)
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );