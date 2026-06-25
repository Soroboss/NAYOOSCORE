import { createInsforgeClient } from "@/lib/insforge";

export type EdgeFunctionName =
  | "calculate-company-score"
  | "create-audit-log"
  | "generate-company-report"
  | "generate-ai-recommendations";

export async function invokeEdgeFunction<T = unknown>(
  name: EdgeFunctionName,
  body: Record<string, unknown>,
  accessToken: string
): Promise<{ data: T | null; error: string | null }> {
  const client = createInsforgeClient();

  const { data, error } = await client.functions.invoke(name, {
    method: "POST",
    body,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as T, error: null };
}
