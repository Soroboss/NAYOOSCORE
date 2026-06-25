import { getAdminPrograms } from "@/lib/admin-context";

function relationName(value: unknown): string {
  if (!value) return "—";
  if (Array.isArray(value)) return (value[0] as { name?: string })?.name ?? "—";
  return (value as { name?: string }).name ?? "—";
}

export default async function AdminProgramsPage() {
  const programs = await getAdminPrograms();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1D2A]">Programmes</h1>
        <p className="text-muted-foreground">Tous les programmes de la plateforme.</p>
      </div>
      <div className="divide-y rounded-xl border bg-white">
        {programs.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">Aucun programme.</p>
        ) : (
          programs.map((p) => (
            <div key={p.id} className="flex justify-between px-4 py-4">
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-muted-foreground">
                  {relationName(p.institutions)} · {p.objective ?? p.description ?? "—"}
                </p>
              </div>
              <span className="rounded-full bg-[#00BFA6]/10 px-3 py-1 text-xs text-[#00BFA6]">
                {p.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
