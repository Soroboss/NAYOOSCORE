import { createClient } from "npm:@insforge/sdk@latest";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const client = createClient({
    baseUrl: Deno.env.get("INSFORGE_BASE_URL")!,
    anonKey: Deno.env.get("ANON_KEY")!,
    edgeFunctionToken: authHeader.replace("Bearer ", ""),
  });

  const body = await req.json();
  const companyId = body.company_id as string;
  if (!companyId) {
    return jsonResponse({ error: "company_id requis" }, 400);
  }

  const { data: score } = await client.database
    .from("scores")
    .select("*")
    .eq("company_id", companyId)
    .order("calculated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const globalScore = score?.global_score ?? 0;
  const recommendations: Array<{
    title: string;
    content: string;
    priority: string;
  }> = [];

  if (!score || score.compliance_score < 15) {
    recommendations.push({
      title: "Compléter la conformité légale",
      content:
        "Ajoutez votre RCCM, NIF et documents fiscaux pour améliorer votre score de conformité.",
      priority: "high",
    });
  }

  if (!score || score.financial_score < 20) {
    recommendations.push({
      title: "Structurer vos données financières",
      content:
        "Renseignez régulièrement vos ventes, dépenses et trésorerie pour démontrer une gestion saine.",
      priority: "high",
    });
  }

  if (!score || score.management_score < 15) {
    recommendations.push({
      title: "Documenter votre activité",
      content:
        "Téléversez des preuves de ventes et de dépenses pour renforcer la crédibilité de vos données.",
      priority: "medium",
    });
  }

  if (globalScore >= 75) {
    recommendations.push({
      title: "Prêt pour une demande de financement",
      content:
        "Votre score indique une bonne préparation. Vous pouvez soumettre une demande de financement.",
      priority: "low",
    });
  } else {
    recommendations.push({
      title: "Plan d'action finançabilité",
      content: `Score actuel: ${globalScore}/100. Ciblez 75+ pour devenir pré-finançable.`,
      priority: "medium",
    });
  }

  const inserts = recommendations.map((rec) => ({
    company_id: companyId,
    ...rec,
  }));

  const { data, error } = await client.database
    .from("recommendations")
    .insert(inserts)
    .select();

  if (error) {
    return jsonResponse({ error: error.message }, 500);
  }

  return jsonResponse({
    data,
    financability_answer:
      globalScore >= 85
        ? "Cette entreprise est finançable."
        : globalScore >= 75
          ? "Cette entreprise est pré-finançable avec quelques améliorations."
          : "Cette entreprise n'est pas encore finançable — structuration nécessaire.",
  });
}
