import { accountOwnerKey } from "@/lib/account-owner";
import { dbConnect } from "@/lib/db";
import Vet from "@/lib/models/Vet";

export async function findVetForSession(session: { user?: { email?: string | null } } | null | undefined) {
  const email = session?.user?.email?.trim().toLowerCase();
  if (!email) return null;
  await dbConnect();
  return Vet.findOne({ accountEmail: email });
}

export function sessionOwnerKey(session: { user?: { id?: string; email?: string | null } } | null | undefined) {
  return accountOwnerKey(session);
}
