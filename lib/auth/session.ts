import { getServerSession } from "next-auth";
import { authOptions } from "./auth-options";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (!user.isAdmin) {
    throw new Error("Forbidden");
  }
  return user;
}
