import { requirePmeCompany } from "@/app/actions/company";
import { isModuleEnabled } from "@/lib/business-modules";
import { redirect } from "next/navigation";

export default async function PmeInventoryPage() {
  const { company } = await requirePmeCompany();

  if (!isModuleEnabled(company.modules, "inventory")) {
    redirect("/pme/dashboard");
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1D2A]">Stocks</h1>
        <p className="text-muted-foreground">
          Gestion des stocks — module activé pour votre type d&apos;activité.
        </p>
      </div>
      <div className="rounded-xl border bg-white p-8 text-center text-sm text-muted-foreground">
        Interface stocks à compléter à l&apos;étape suivante.
      </div>
    </div>
  );
}
