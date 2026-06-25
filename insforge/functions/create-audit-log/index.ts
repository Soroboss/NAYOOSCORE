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
  const { action, entity_type, entity_id, metadata } = body;

  if (!action) {
    return jsonResponse({ error: "action requise" }, 400);
  }

  const { data: user } = await client.auth.getCurrentUser();
  if (!user) {
    return jsonResponse({ error: "Utilisateur non authentifié" }, 401);
  }

  const { data, error } = await client.database
    .from("audit_logs")
    .insert([
      {
        user_id: user.id,
        action,
        entity_type: entity_type ?? null,
        entity_id: entity_id ?? null,
        metadata: metadata ?? {},
      },
    ])
    .select()
    .maybeSingle();

  if (error) {
    return jsonResponse({ error: error.message }, 500);
  }

  return jsonResponse({ data });
}
