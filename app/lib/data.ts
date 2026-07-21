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
  },
];

export const locations = Array.from(new Set(equipmentList.map((e) => e.location)));
export const categories = Array.from(new Set(equipmentList.map((e) => e.category)));
