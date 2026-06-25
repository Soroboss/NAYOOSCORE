import { getAdminAuditLogs } from "@/lib/admin-context";

export default async function AdminAuditLogsPage() {
  const logs = await getAdminAuditLogs();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1D2A]">Logs d&apos;audit</h1>
        <p className="text-muted-foreground">Dernières actions sur la plateforme.</p>
      </div>
      <div className="overflow-hidden rounded-xl border bg-white">
        {logs.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">Aucun log pour le moment.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#F5F7FA] text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Entité</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-4 py-3 font-medium">{log.action}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {log.entity_type} {log.entity_id ? `· ${String(log.entity_id).slice(0, 8)}…` : ""}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(log.created_at).toLocaleString("fr-FR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
