import { requireAuth } from "@/app/actions/auth";
import { canAccessInstitution } from "@/lib/permissions";

export default async function InstitutionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth(canAccessInstitution);

  return (
    <div className="flex min-h-full flex-1 bg-[#F5F7FA]">
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
