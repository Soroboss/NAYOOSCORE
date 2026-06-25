import { requireAuth } from "@/app/actions/auth";
import { canAccessPme } from "@/lib/permissions";

export default async function PmeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth(canAccessPme);

  return (
    <div className="flex min-h-full flex-1 bg-[#F5F7FA]">
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
