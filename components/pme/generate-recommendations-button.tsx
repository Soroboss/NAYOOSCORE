"use client";

import { useActionState } from "react";
import { generateRecommendationsAction, type PmeActionState } from "@/app/actions/pme";
import { Button } from "@/components/ui/button";

const initial: PmeActionState = { success: false };

export function GenerateRecommendationsButton() {
  const [state, action, pending] = useActionState(
    async () => generateRecommendationsAction(),
    initial
  );

  return (
    <form action={action} className="space-y-2">
      <Button
        type="submit"
        className="bg-[#0077B6] text-white hover:bg-[#00629a]"
        disabled={pending}
      >
        {pending ? "Génération..." : "Générer des recommandations IA"}
      </Button>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.message && <p className="text-sm text-[#00BFA6]">{state.message}</p>}
    </form>
  );
}
