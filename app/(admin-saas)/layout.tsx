import { canAccessAdmin } from "@/lib/permissions";
import { requireAuth } from "@/app/actions/auth";

export default async function AdminSaasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth(canAccessAdmin);

  return (
    <div className="flex min-h-full flex-1 bg-[#F5F7FA]">
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
