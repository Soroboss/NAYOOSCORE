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

function calculateScore(input: Record<string, boolean>) {
  const management =
    (input.profileComplete ? 5 : 0) +
    (input.salesRegular ? 5 : 0) +
    (input.expensesRegular ? 5 : 0) +
    (input.documentsAdded ? 5 : 0);

  const financial =
    (input.positiveRevenue ? 8 : 0) +
    (input.positiveMargin ? 8 : 0) +
    (input.positiveTreasury ? 7 : 0) +
    (input.controlledExpenses ? 7 : 0);

  const growth =
    (input.revenueGrowth ? 10 : 0) +
    (input.recurringCustomers ? 5 : 0) +
    (input.jobsCreated ? 5 : 0);

  const compliance =
    (input.rccmAdded ? 5 : 0) +
    (input.taxIdAdded ? 5 : 0) +
    (input.fiscalDocumentsAdded ? 5 : 0);

  const governance =
    (input.objectivesSet ? 5 : 0) +
    (input.teamDocumented ? 5 : 0) +
    (input.regularFollowUp ? 5 : 0);

  const global = Math.min(
    100,
    management + financial + growth + compliance + governance
  );

  let status = "Non prêt";
  if (global >= 85) status = "Finançable";
  else if (global >= 75) status = "Pré-finançable";
  else if (global >= 60) status = "En progression";
  else if (global >= 40) status = "À structurer";

  return {
    management_score: management,
    financial_score: financial,
    growth_score: growth,
    compliance_score: compliance,
    governance_score: governance,
    funding_readiness_score: global,
    global_score: global,
    status,
  };
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

  const { data: company } = await client.database
    .from("companies")
    .select("id, rccm, tax_id")
    .eq("id", companyId)
    .maybeSingle();

  if (!company) {
    return jsonResponse({ error: "Entreprise introuvable" }, 404);
  }

  const [salesRes, expensesRes, docsRes, employeesRes, customersRes] =
    await Promise.all([
      client.database.from("sales").select("amount").eq("company_id", companyId),
      client.database.from("expenses").select("amount").eq("company_id", companyId),
      client.database.from("documents").select("id").eq("company_id", companyId),
      client.database.from("employees").select("id").eq("company_id", companyId),
      client.database
        .from("customers")
        .select("is_recurring")
        .eq("company_id", companyId),
    ]);

  const salesTotal =
    salesRes.data?.reduce((sum, row) => sum + Number(row.amount), 0) ?? 0;
  const expensesTotal =
    expensesRes.data?.reduce((sum, row) => sum + Number(row.amount), 0) ?? 0;

  const scoreInput = {
    profileComplete: Boolean(company.rccm && company.tax_id),
    salesRegular: (salesRes.data?.length ?? 0) >= 2,
    expensesRegular: (expensesRes.data?.length ?? 0) >= 2,
    documentsAdded: (docsRes.data?.length ?? 0) > 0,
    positiveRevenue: salesTotal > 0,
    positiveMargin: salesTotal > expensesTotal,
    positiveTreasury: salesTotal >= expensesTotal,
    controlledExpenses: expensesTotal <= salesTotal * 1.2,
    revenueGrowth: salesTotal > 0,
    recurringCustomers:
      customersRes.data?.some((c) => c.is_recurring === true) ?? false,
    jobsCreated: (employeesRes.data?.length ?? 0) > 0,
    rccmAdded: Boolean(company.rccm),
    taxIdAdded: Boolean(company.tax_id),
    fiscalDocumentsAdded: (docsRes.data?.length ?? 0) > 0,
    objectivesSet: true,
    teamDocumented: (employeesRes.data?.length ?? 0) > 0,
    regularFollowUp: (salesRes.data?.length ?? 0) > 0,
  };

  const scores = calculateScore(scoreInput);

  const { data: saved, error } = await client.database
    .from("scores")
    .insert([
      {
        company_id: companyId,
        ...scores,
        calculated_at: new Date().toISOString(),
      },
    ])
    .select()
    .maybeSingle();

  if (error) {
    return jsonResponse({ error: error.message }, 500);
  }

  await client.database.from("score_history").insert([
    {
      company_id: companyId,
      global_score: scores.global_score,
      management_score: scores.management_score,
      financial_score: scores.financial_score,
      growth_score: scores.growth_score,
      compliance_score: scores.compliance_score,
      governance_score: scores.governance_score,
    },
  ]);

  return jsonResponse({ data: saved, input: scoreInput });
}
