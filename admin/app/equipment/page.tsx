import { listAllEquipment } from "@/actions/admin";
import EquipmentClient from "@/components/EquipmentClient";

export const dynamic = "force-dynamic";

export default async function AdminEquipmentPage() {
  const { equipment, error } = await listAllEquipment();
  return <EquipmentClient items={equipment} error={error} />;
}