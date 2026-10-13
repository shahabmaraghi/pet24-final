export function accountOwnerKey(session: { user?: { id?: string; email?: string | null } } | null | undefined) {
  const email = session?.user?.email?.trim().toLowerCase();
  if (email) return `email:${email}`;
  const id = session?.user?.id?.trim();
  if (id) return `id:${id}`;
  return "";
}
