type InsforgeAuthUser = {
  email: string;
  profile?: { name?: string } | null;
};

export function getUserDisplayName(user: InsforgeAuthUser, fallback?: string) {
  const profile = user.profile as { name?: string } | null | undefined;
  return profile?.name ?? fallback ?? user.email;
}
