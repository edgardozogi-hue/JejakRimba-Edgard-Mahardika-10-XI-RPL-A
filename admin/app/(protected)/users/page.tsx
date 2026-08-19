import { listUsers } from "@/actions/admin";
import UsersClient from "@/components/UsersClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const { users, error } = await listUsers();
  return <UsersClient users={users} error={error} />;
}