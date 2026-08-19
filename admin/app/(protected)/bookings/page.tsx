import { listBookings } from "@/actions/admin";
import BookingsClient from "@/components/BookingsClient";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const { bookings, error } = await listBookings();
  return <BookingsClient bookings={bookings} error={error} />;
}