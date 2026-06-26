import { BILLING_MODEL } from "@/lib/pricing";
import { Building2, Briefcase, Info } from "lucide-react";

export function BillingModelBanner() {
  return (
    <div className="rounded-xl border border-[#0077B6]/20 bg-gradient-to-br from-[#0077B6]/5 to-[#00BFA6]/5 p-6">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-white p-2 shadow-sm">
          <Info className="size-5 text-[#0077B6]" />
        </div>
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-[#0B1D2A]">{BILLING_MODEL.headline}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{BILLING_MODEL.summary}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-white/80 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#0B1D2A]">
                <Building2 className="size-4 text-[#0077B6]" />
                Institutions (client SaaS)
              </div>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {BILLING_MODEL.institutionPays.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg bg-white/80 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#0B1D2A]">
                <Briefcase className="size-4 text-[#00BFA6]" />
                PME accompagnées
              </div>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {[...BILLING_MODEL.pmeIncluded, ...BILLING_MODEL.pmeDirect].map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
