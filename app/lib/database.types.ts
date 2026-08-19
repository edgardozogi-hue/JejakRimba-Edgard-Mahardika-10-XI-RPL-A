// =========================================================
// DATABASE TYPES — JEJAK RIMBA
// TypeScript types yang cocok dengan schema Supabase
// =========================================================

// ── ENUMS ──

export type UserRole = "renter" | "vendor" | "admin";

// UI memakai "penyewa", DB enum pakai "renter". Map dua arah.
export const ROLE_TO_DB: Record<string, UserRole> = {
  penyewa: "renter",
  renter: "renter",
  vendor: "vendor",
  admin: "admin",
};
export const ROLE_TO_UI: Record<string, string> = {
  renter: "Penyewa",
  vendor: "Vendor",
  admin: "Admin",
};
export type EquipmentCategory =
  | "tenda"
  | "carrier"
  | "sleeping_bag"
  | "kompor"
  | "matras"
  | "jaket";
export type EquipmentCondition = "baru" | "sangat_baik" | "baik";
export type BookingStatus =
  | "menunggu_konfirmasi"
  | "dikonfirmasi"
  | "sedang_berjalan"
  | "selesai"
  | "dibatalkan";
export type PaymentStatus = "menunggu" | "berhasil" | "gagal" | "kedaluwarsa";
export type NotificationType =
  | "konfirmasi_booking"
  | "pengingat_pengembalian"
  | "pembayaran_berhasil"
  | "pembayaran_gagal";

// ── TABEL: PROFILES ──

export type Profile = {
  id: string;
  full_name: string;
  phone_number: string | null;
  role: UserRole;
  avatar_url: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
};

// ── TABEL: VENDORS ──

export type Vendor = {
  id: string;
  profile_id: string;
  business_name: string;
  business_description: string | null;
  address: string;
  latitude: number;
  longitude: number;
  whatsapp_number: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
};

// ── TABEL: EQUIPMENT ──

export type EquipmentRow = {
  id: string;
  vendor_id: string;
  name: string;
  category: EquipmentCategory;
  description: string | null;
  price_per_day: number;
  total_stock: number;
  condition: EquipmentCondition;
  capacity: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

// ── TABEL: EQUIPMENT_IMAGES ──

export type EquipmentImage = {
  id: string;
  equipment_id: string;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
};

// ── TABEL: BOOKINGS ──

export type Booking = {
  id: string;
  renter_id: string;
  equipment_id: string;
  quantity: number;
  start_date: string;
  end_date: string;
  total_price: number;
  status: BookingStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

// ── TABEL: TRANSACTIONS ──

export type Transaction = {
  id: string;
  booking_id: string;
  amount: number;
  payment_method: string | null;
  status: string;
  midtrans_transaction_id: string | null;
  midtrans_order_id: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string | null;
};

// ── TABEL: REVIEWS ──

export type Review = {
  id: string;
  booking_id: string;
  reviewer_id: string;
  equipment_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

// ── TABEL: NOTIFICATIONS ──

export type Notification = {
  id: string;
  profile_id: string;
  booking_id: string | null;
  type: NotificationType;
  message: string;
  is_read: boolean;
  sent_at: string | null;
  created_at: string;
};

// ── COMPOSITE TYPES (hasil JOIN) ──

export type EquipmentWithVendor = EquipmentRow & {
  vendor: Pick<Vendor, "business_name" | "address" | "whatsapp_number">;
  primary_image: string | null;
  avg_rating: number;
  review_count: number;
};

export type BookingWithDetails = Booking & {
  equipment: Pick<
    EquipmentRow,
    "name" | "category" | "price_per_day" | "capacity"
  >;
  vendor: Pick<Vendor, "business_name" | "address" | "whatsapp_number">;
  transaction: Transaction | null;
};

export type VendorWithProfile = Vendor & {
  profile: Pick<Profile, "full_name" | "phone_number" | "avatar_url">;
};

// ── HELPER: Category mapping frontend ↔ DB ──

export const CATEGORY_MAP: Record<string, EquipmentCategory> = {
  Tenda: "tenda",
  Carrier: "carrier",
  "Sleeping Bag": "sleeping_bag",
  Kompor: "kompor",
  Matras: "matras",
  Jaket: "jaket",
};

export const CATEGORY_MAP_REVERSE: Record<string, string> = {
  tenda: "Tenda",
  carrier: "Carrier",
  sleeping_bag: "Sleeping Bag",
  kompor: "Kompor",
  matras: "Matras",
  jaket: "Jaket",
};

export const CONDITION_MAP: Record<string, EquipmentCondition> = {
  Baru: "baru",
  "Sangat Baik": "sangat_baik",
  Baik: "baik",
};

export const CONDITION_MAP_REVERSE: Record<string, string> = {
  baru: "Baru",
  sangat_baik: "Sangat Baik",
  baik: "Baik",
};

// ── DATABASE TYPE (untuk template nanti) ──

// ── FRONTEND TYPES (untuk komponen client) ──

export type EquipmentFrontend = {
  id: string;
  name: string;
  category: string;
  pricePerDay: number;
  stock: number;
  location: string;
  provider: string;
  capacity: string | null;
  condition: string;
  image: string;
  rating: number;
  reviewCount: number;
  elevation?: string | null;
};

export type TestimonialFrontend = {
  id: string;
  name: string;
  asal: string;
  rating: number;
  komentar: string;
  avatar: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile };
      vendors: { Row: Vendor };
      equipment: { Row: EquipmentRow };
      equipment_images: { Row: EquipmentImage };
      bookings: { Row: Booking };
      transactions: { Row: Transaction };
      reviews: { Row: Review };
      notifications: { Row: Notification };
    };
    Enums: {
      user_role: UserRole;
      equipment_category: EquipmentCategory;
      equipment_condition: EquipmentCondition;
      booking_status: BookingStatus;
      payment_status: PaymentStatus;
      notification_type: NotificationType;
    };
  };
};
