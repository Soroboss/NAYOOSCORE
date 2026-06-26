import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getInstitutionForUser } from "@/lib/institution-context";
import { getInstitutionCompanies } from "@/lib/institution-context";
import { getAccessToken } from "@/lib/auth-cookies";

function csvEscape(value: string | number | null | undefined): string {
  const str = String(value ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const token = await getAccessToken();
  const institution = await getInstitutionForUser(user.id, token ?? undefined);
  if (!institution) {
    return NextResponse.json({ error: "Institution introuvable" }, { status: 403 });
  }

  const companies = await getInstitutionCompanies(institution.id, token ?? undefined);

  const header = ["Nom", "Secteur", "Ville", "Score", "Programme", "Statut"];
  const rows = companies.map((c) =>
    [
      csvEscape(c.name),
      csvEscape(c.sector),
      csvEscape(c.city),
      csvEscape(c.global_score ?? ""),
      csvEscape(c.program_name),
      csvEscape(c.score_status),
    ].join(",")
  );

  const csv = [header.join(","), ...rows].join("\n");
  const filename = `nayooscore-portefeuille-${institution.name.replace(/\s+/g, "-").toLowerCase()}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
