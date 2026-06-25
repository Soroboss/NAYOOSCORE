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

  const [companyRes, scoreRes, salesRes, expensesRes] = await Promise.all([
    client.database.from("companies").select("*").eq("id", companyId).maybeSingle(),
    client.database
      .from("scores")
      .select("*")
      .eq("company_id", companyId)
      .order("calculated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    client.database.from("sales").select("amount").eq("company_id", companyId),
    client.database.from("expenses").select("amount").eq("company_id", companyId),
  ]);

  if (!companyRes.data) {
    return jsonResponse({ error: "Entreprise introuvable" }, 404);
  }

  const salesTotal =
    salesRes.data?.reduce((sum, row) => sum + Number(row.amount), 0) ?? 0;
  const expensesTotal =
    expensesRes.data?.reduce((sum, row) => sum + Number(row.amount), 0) ?? 0;

  const report = {
    company: companyRes.data,
    score: scoreRes.data,
    financials: {
      revenue: salesTotal,
      expenses: expensesTotal,
      profit: salesTotal - expensesTotal,
    },
    generated_at: new Date().toISOString(),
    summary: `Rapport PME pour ${companyRes.data.name} — score global: ${scoreRes.data?.global_score ?? "N/A"}`,
  };

  return jsonResponse({ data: report });
}
