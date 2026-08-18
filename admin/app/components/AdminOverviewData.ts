export type OverviewData = {
  error: null;
  users: number;
  vendors: number;
  activeVendors: number;
  equipment: number;
  bookings: number;
  transactions: number;
  reviews: number;
  revenue: number;
  revenueThisMonth: number;
  revenueByMonth: { key: string; label: string; value: number }[];
  bookingCountByStatus: Record<string, number>;
};