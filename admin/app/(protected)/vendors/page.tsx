import { listVendors } from "@/actions/admin";
import VendorsClient from "@/components/VendorsClient";

export const dynamic = "force-dynamic";

export default async function AdminVendorsPage() {
  const { vendors, error } = await listVendors();
  return <VendorsClient vendors={vendors} error={error} />;
}