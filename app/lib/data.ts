export type Equipment = {
  id: string;
  name: string;
  category: "Tenda" | "Carrier" | "Sleeping Bag" | "Kompor" | "Matras" | "Jaket";
  pricePerDay: number;
  stock: number;
  location: string;
  provider: string;
  capacity?: string;
  condition: "Baru" | "Sangat Baik" | "Baik";
  elevation: string;
    rating: number;
    reviewCount: number;
};

export type Testimonial = {
  id: string;
  name: string;
  asal: string;
  rating: number;
  komentar: string;
  avatar: string;
};

export const equipmentList: Equipment[] = [
  {
    id: "tnd-01",
    name: "Tenda Dome Consina 4P",
    category: "Tenda",
    pricePerDay: 35000,
    stock: 6,
    location: "Malang Kota",
    provider: "Rimba Gear Malang",
    capacity: "4 orang",
    condition: "Sangat Baik",
    elevation: "0800",
    rating: 4.5,
    reviewCount: 12,
  },
  {
    id: "tnd-02",
    name: "Tenda Ultralight Eiger 2P",
    category: "Tenda",
    pricePerDay: 45000,
    stock: 3,
    location: "Batu",
    provider: "Alas Camp Batu",
    capacity: "2 orang",
    condition: "Baru",
    elevation: "0850",
    rating: 5,
    reviewCount: 8,
  },
  {
    id: "car-01",
    name: "Carrier Avtech 60L",
    category: "Carrier",
    pricePerDay: 20000,
    stock: 10,
    location: "Malang Kota",
    provider: "Rimba Gear Malang",
    capacity: "60 liter",
    condition: "Baik",
    elevation: "1200",
    rating: 4,
    reviewCount: 15,
  },
  {
    id: "car-02",
    name: "Carrier Deuter 80L",
    category: "Carrier",
    pricePerDay: 28000,
    stock: 4,
    location: "Lawang",
    provider: "Basecamp Lawang",
    capacity: "80 liter",
    condition: "Sangat Baik",
    elevation: "1250",
    rating: 4.5,
    reviewCount: 6,
  },
  {
    id: "sb-01",
    name: "Sleeping Bag Naturehike M400",
    category: "Sleeping Bag",
    pricePerDay: 15000,
    stock: 12,
    location: "Malang Kota",
    provider: "Rimba Gear Malang",
    condition: "Baik",
    elevation: "1600",
    rating: 4,
    reviewCount: 20,
  },
  {
    id: "kmp-01",
    name: "Kompor Portable + Gas Windproof",
    category: "Kompor",
    pricePerDay: 12000,
    stock: 8,
    location: "Batu",
    provider: "Alas Camp Batu",
    condition: "Sangat Baik",
    elevation: "1900",
    rating: 4.5,
    reviewCount: 10,
  },
  {
    id: "mtr-01",
    name: "Matras Lipat Aluminium Foil",
    category: "Matras",
    pricePerDay: 8000,
    stock: 15,
    location: "Lawang",
    provider: "Basecamp Lawang",
    condition: "Baik",
    elevation: "2100",
    rating: 3.5,
    reviewCount: 18,
  },
  {
    id: "jkt-01",
    name: "Jaket Gunung Waterproof Eiger",
    category: "Jaket",
    pricePerDay: 25000,
    stock: 0,
    location: "Malang Kota",
    provider: "Rimba Gear Malang",
    condition: "Sangat Baik",
    elevation: "2400",
    rating: 4.5,
    reviewCount: 7,
  },
  {
    id: "tnd-03",
    name: "Tenda Kapasitas Besar 6P",
    category: "Tenda",
    pricePerDay: 55000,
    stock: 2,
    location: "Batu",
    provider: "Alas Camp Batu",
    capacity: "6 orang",
    condition: "Baik",
    elevation: "2700",
    rating: 4,
    reviewCount: 5,
  },
];

export const locations = Array.from(new Set(equipmentList.map((e) => e.location)));
export const categories = Array.from(new Set(equipmentList.map((e) => e.category)));

export const testimonials: Testimonial[] = [
  {
    id: "t-01",
    name: "Rafi Ahmad",
    asal: "Malang",
    rating: 5,
    komentar: "Barangnya lengkap dan kualitasnya bagus banget. Proses sewa gampang, tinggal ambil di lokasi. Recommended buat yang mau naik gunung pertama kali!",
    avatar: "RA",
  },
  {
    id: "t-02",
    name: "Siska Dewi",
    asal: "Batu",
    rating: 4,
    komentar: "Sudah 3x sewa di sini, selalu puas. Tenda dan sleeping bag bersih, harganya juga ramah di kantong pelajar.",
    avatar: "SD",
  },
  {
    id: "t-03",
    name: "Dimas Prayoga",
    asal: "Surabaya",
    rating: 5,
    komentar: "Pertama kali camping dan bingung bawa perlengkapan sendiri. Di sini ada semua, tinggal datang dan ambil. Hemat banget!",
    avatar: "DP",
  },
  {
    id: "t-04",
    name: "Nurul Aini",
    asal: "Lawang",
    rating: 4.5,
    komentar: "Carrier 80L-nya nyaman dipakai pendakian 3 hari. Kondisi barang benar-benar terawat. Pasti balik lagi buat sewa next time.",
    avatar: "NA",
  },
  {
    id: "t-05",
    name: "Bayu Saputra",
    asal: "Malang",
    rating: 5,
    komentar: "Pelayanan ramah, barang ready, dan lokasi gampang dijangkau. Cocok banget buat anak-anak muda yang hobi outdoor.",
    avatar: "BS",
  },
  {
    id: "t-06",
    name: "Putra Wicaksono",
    asal: "Blitar",
    rating: 4,
    komentar: "Kompor portable-nya ringan dan gasnya awet. Harga sewa murah meriah. Sayang stok terbatas pas weekend.",
    avatar: "PW",
  },
];
