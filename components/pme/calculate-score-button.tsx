"use client";

import { useActionState } from "react";
import { calculateScoreAction, type PmeActionState } from "@/app/actions/pme";
import { Button } from "@/components/ui/button";

const initialState: PmeActionState = { success: false };

export function CalculateScoreButton() {
  const [state, formAction, pending] = useActionState(
    async () => calculateScoreAction(),
    initialState
  );

  return (
    <form action={formAction} className="space-y-2">
      <Button
        type="submit"
        className="bg-[#0077B6] text-white hover:bg-[#00629a]"
        disabled={pending}
      >
        {pending ? "Calcul en cours..." : "Recalculer mon score"}
      </Button>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.message && <p className="text-sm text-[#00BFA6]">{state.message}</p>}
    </form>
  );
}
