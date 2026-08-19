-- =========================================================
-- MIGRATION v2 — JEJAK RIMBA (Revisi Guru)
--  1) Tabel `booking_items` untuk sewa multi-item
--  2) Kolom `equipment.elevation` untuk elevasi per alat
-- Jalankan SELURUH file ini di Supabase Dashboard > SQL Editor > Run.
-- Idempotent: aman dijalankan berulang.
-- =========================================================

-- ── 1) booking_items ──
CREATE TABLE IF NOT EXISTS public.booking_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id    uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  equipment_id  uuid NOT NULL REFERENCES public.equipment(id),
  quantity      integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price_per_day numeric NOT NULL,
  subtotal      numeric NOT NULL,
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_booking_items_booking ON public.booking_items(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_items_equipment ON public.booking_items(equipment_id);

ALTER TABLE public.booking_items ENABLE ROW LEVEL SECURITY;

-- Penyewa bisa insert item ke booking miliknya
DROP POLICY IF EXISTS "booking_items_insert_own" ON public.booking_items;
CREATE POLICY "booking_items_insert_own" ON public.booking_items
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT renter_id FROM public.bookings WHERE id = booking_id)
  );

-- Penyewa bisa baca item booking miliknya; vendor bisa baca item alatnya; admin baca semua
DROP POLICY IF EXISTS "booking_items_select" ON public.booking_items;
CREATE POLICY "booking_items_select" ON public.booking_items
  FOR SELECT USING (
    auth.uid() = (SELECT renter_id FROM public.bookings WHERE id = booking_id)
    OR auth.uid() IN (
      SELECT profile_id FROM public.vendors v
      WHERE v.id IN (SELECT vendor_id FROM public.equipment WHERE id = booking_items.equipment_id)
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ── 2) transactions (pembayaran Midtrans) ──
-- Tabel ini dipakai createSnapToken (insert saat token dibuat),
-- midtrans-webhook (update status pembayaran), dan admin (jumlah transaksi).
CREATE TABLE IF NOT EXISTS public.transactions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id    uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  amount        numeric NOT NULL DEFAULT 0,
  status        text NOT NULL DEFAULT 'menunggu',
  payment_method text,
  paid_at       timestamptz,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_booking ON public.transactions(booking_id);

-- ── 3) equipment.elevation ──
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='equipment' AND column_name='elevation') THEN
    ALTER TABLE public.equipment ADD COLUMN elevation text;
  END IF;
END $$;

-- Backfill nilai elevasi untuk data lama berdasarkan nama alat (dari seed)
DO $$ BEGIN
  UPDATE public.equipment SET elevation = v.elevation FROM (
    VALUES
      ('Tenda Dome Consina 4P', '≥ 0800 mdpl'),
      ('Tenda Ultralight Eiger 2P', '≥ 0850 mdpl'),
      ('Carrier Avtech 60L', '≥ 1200 mdpl'),
      ('Carrier Deuter 80L', '≥ 1250 mdpl'),
      ('Sleeping Bag Naturehike M400', '≥ 1600 mdpl'),
      ('Kompor Portable + Gas Windproof', '≥ 1900 mdpl'),
      ('Matras Lipat Aluminium Foil', '≥ 2100 mdpl'),
      ('Jaket Gunung Waterproof Eiger', '≥ 2400 mdpl'),
      ('Tenda Kapasitas Besar 6P', '≥ 2700 mdpl')
  ) AS v(name, elevation)
  WHERE public.equipment.name = v.name AND public.equipment.elevation IS NULL;
END $$;