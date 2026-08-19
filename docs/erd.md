# ERD — Jejak Rimba (Notasi Chen)

Dokumen ini berisi Entity Relationship Diagram aplikasi Jejak Rimba menggunakan
notasi Chen. Setiap entitas digambarkan sebagai persegi panjang, atribut sebagai
elips, dan relasi sebagai belah ketupat (diamond). Kunci utama (Primary Key)
digarisbawahi, kunci asing (Foreign Key) ditandai (FK).

---

## 1. Daftar Entitas

| No | Entitas | Keterangan |
|---|---|---|
| 1 | **profiles** | Data pengguna (penyewa, vendor, admin) |
| 2 | **vendors** | Profil penyedia alat (terhubung 1:1 ke profiles) |
| 3 | **equipment** | Data alat yang disewakan |
| 4 | **equipment_images** | Gambar untuk tiap alat |
| 5 | **bookings** | Pemesanan (parent, bisa berisi banyak item) |
| 6 | **booking_items** | Rincian item dalam satu booking (multi-item) |
| 7 | **transactions** | Pembayaran untuk satu booking |
| 8 | **reviews** | Ulasan penyewa terhadap alat |
| 9 | **notifications** | Notifikasi untuk pengguna |

> Catatan: versi sebelumnya menyebut "delapan tabel". Dengan penambahan
> `booking_items`, kini terdapat **sembilan** entitas.

---

## 2. Atribut per Entitas

Kunci utama digarisbawahi (`__id__`). Tanda `?` berarti opsional.

### 2.1 profiles
```
__id__ (uuid)
full_name (text)
phone_number (text)?
role (user_role: renter|vendor|admin)
avatar_url (text)?
address (text)?
latitude (float)?
longitude (float)?
notification_prefs (jsonb)?
created_at (timestamptz)
updated_at (timestamptz)
```

### 2.2 vendors
```
__id__ (uuid)
profile_id (FK -> profiles.id)
business_name (text)
business_description (text)?
address (text)
latitude (float)
longitude (float)
whatsapp_number (text)
is_verified (bool)
is_active (bool)?
created_at (timestamptz)
updated_at (timestamptz)
```

### 2.3 equipment
```
__id__ (uuid)
vendor_id (FK -> vendors.id)
name (text)
category (equipment_category: tenda|carrier|sleeping_bag|kompor|matras|jaket)
description (text)?
price_per_day (numeric)
total_stock (int)
condition (equipment_condition: baru|sangat_baik|baik)
capacity (text)?
elevation (text)?        <-- ketinggian alat (mdpl)
is_active (bool)
created_at (timestamptz)
updated_at (timestamptz)
```

### 2.4 equipment_images
```
__id__ (uuid)
equipment_id (FK -> equipment.id)
image_url (text)          <-- di kode dipakai nama kolom `url`
is_primary (bool)
sort_order (int)
created_at (timestamptz)
```

### 2.5 bookings
```
__id__ (uuid)
renter_id (FK -> profiles.id)
equipment_id (FK -> equipment.id)?   <-- null untuk booking multi-item
quantity (int)
start_date (date)
end_date (date)
total_price (numeric)
status (booking_status: menunggu_konfirmasi|dikonfirmasi|sedang_berjalan|selesai|dibatalkan)
notes (text)?
created_at (timestamptz)
updated_at (timestamptz)
```

### 2.6 booking_items
```
__id__ (uuid)
booking_id (FK -> bookings.id)
equipment_id (FK -> equipment.id)
quantity (int) CHECK > 0
price_per_day (numeric)
subtotal (numeric)
created_at (timestamptz)
```

### 2.7 transactions
```
__id__ (uuid)
booking_id (FK -> bookings.id)
amount (numeric)
payment_method (text)?
payment_status (payment_status: menunggu|berhasil|gagal|kedaluwarsa)
midtrans_transaction_id (text)?
midtrans_order_id (text)?
paid_at (timestamptz)?
created_at (timestamptz)
updated_at (timestamptz)
```

### 2.8 reviews
```
__id__ (uuid)
booking_id (FK -> bookings.id)
reviewer_id (FK -> profiles.id)
equipment_id (FK -> equipment.id)
rating (int 1-5)
comment (text)?
created_at (timestamptz)
```

### 2.9 notifications
```
__id__ (uuid)
profile_id (FK -> profiles.id)
booking_id (FK -> bookings.id)?
type (notification_type: konfirmasi_booking|pengingat_pengembalian|pembayaran_berhasil|pembayaran_gagal)
message (text)
is_read (bool)
sent_at (timestamptz)?
created_at (timestamptz)
```

---

## 3. Daftar Relasi dan Kardinalitas

| No | Entitas A | Relasi (diamond) | Entitas B | Kardinalitas |
|---|---|---|---|---|
| 1 | profiles | MEMILIKI | vendors | 1 : (0..1) |
| 2 | vendors | MENYEDIAKAN | equipment | 1 : (0..N) |
| 3 | equipment | MEMILIKI_GAMBAR | equipment_images | 1 : (0..N) |
| 4 | profiles | MEMESAN | bookings | 1 : (0..N) |
| 5 | bookings | MEMILIKI_ITEM | booking_items | 1 : (0..N) |
| 6 | equipment | DIPESAN_DALAM | booking_items | 1 : (0..N) |
| 7 | bookings | DICATAT | transactions | 1 : (0..1) |
| 8 | profiles | MENULIS | reviews | 1 : (0..N) |
| 9 | bookings | DIDASARI | reviews | 1 : (0..N) |
| 10 | equipment | DINILAI | reviews | 1 : (0..N) |
| 11 | profiles | MENERIMA | notifications | 1 : (0..N) |
| 12 | bookings | TERKAIT | notifications | 1 : (0..N) |

> **Catatan:** booking multi-item dimodelkan lewat entitas `booking_items`
> (relasi no. 5 dan 6). `bookings.equipment_id` bersifat opsional dan bernilai
> null untuk booking yang terdiri dari beberapa alat. Untuk booking single-item,
> alat bisa langsung diakses lewat `bookings.equipment_id`.

---

## 4. Diagram ERD (Notasi Chen) — ASCII Art

```
   (persegi panjang = ENTITAS, elips = ATRIBUT, belah ketupat = RELASI)

   ════ ENTITAS 1:1 ════

        [profiles]  =1= ( MEMILIKI ) =0..1= [vendors]

        [vendors]   =1= (MENYEDIAKAN) =0..N= [equipment]

        [equipment] =1= (MEMILIKI_GAMBAR) =0..N= [equipment_images]


   ════ ENTITAS 1:N ════

        [profiles]  =1= ( MEMESAN ) =0..N= [bookings]
                                                  |
                                                  |  MEMILIKI_ITEM (1:N)
                                                  v
        [bookings]  =1= ( MEMILIKI_ITEM ) =0..N= [booking_items]
        [equipment] =1= ( DIPESAN_DALAM ) =0..N= [booking_items]


   ════ PEMBAYARAN ════

        [bookings] =1= ( DICATAT ) =0..1= [transactions]


   ════ ULASAN ════

        [profiles]  =1= ( MENULIS ) =0..N= [reviews]
        [bookings]  =1= ( DIDASARI ) =0..N= [reviews]
        [equipment] =1= ( DINILAI ) =0..N= [reviews]


   ════ NOTIFIKASI ════

        [profiles]  =1= ( MENERIMA ) =0..N= [notifications]
        [bookings]  =1= ( TERKAIT ) =0..N= [notifications]
```

### 4.1 Ringkasan kardinalitas dalam satu diagram

```
  profiles ───────────(MEMILIKI)─────────── vendors
      │  1:1                                    │
      │                                         │ 1:N
      │ 1:N                                     ▼
      │                                   equipment ──(MEMILIKI_GAMBAR)── equipment_images
      ▼                                          │
  bookings ────────────────────────              │ 1:N
      │  1:N                                     │
      │                                         │
      ├──(MEMILIKI_ITEM)── booking_items ◄──(DIPESAN_DALAM)── equipment
      │
      ├──(DICATAT)── transactions
      │
      ├──(DIDASARI)── reviews ◄──(MENULIS)── profiles
      │                        ◄──(DINILAI)── equipment
      │
      └──(TERKAIT)── notifications ◄──(MENERIMA)── profiles
```

---

## 5. Penjelasan Relasi Kunci

1. **profiles → vendors (1:0..1)** : Satu pengguna boleh memiliki maksimal satu
   profil vendor. Tidak semua pengguna adalah vendor.
2. **vendors → equipment (1:N)** : Satu vendor menyediakan banyak alat.
3. **bookings → booking_items (1:N)** : Satu booking berisi satu atau banyak item.
   Ini mendukung sewa multi-item dalam satu kali pesanan.
4. **bookings → transactions (1:0..1)** : Satu booking dicatat dalam satu transaksi
   pembayaran (opsional sebelum pembayaran dibuat).
5. **profiles → reviews (1:N)** : Satu penyewa dapat menulis banyak ulasan.
6. **bookings → reviews (1:N)** : Sebuah booking mendasari ulasan yang ditulis
   penyewa terhadap alat yang dipesan.
7. **equipment → reviews (1:N)** : Satu alat dapat menerima banyak ulasan.

---
