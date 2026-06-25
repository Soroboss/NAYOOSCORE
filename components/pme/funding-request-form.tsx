"use client";

import { useActionState } from "react";
import { submitFundingRequestAction, type PmeActionState } from "@/app/actions/pme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: PmeActionState = { success: false };

type Institution = { id: string; name: string };

export function FundingRequestForm({ institutions }: { institutions: Institution[] }) {
  const [state, action, pending] = useActionState(submitFundingRequestAction, initial);

  if (institutions.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-6 text-sm text-muted-foreground">
        Aucune institution disponible. Contactez votre accompagnateur pour être rattaché à un programme.
      </div>
    );
  }

  return (
    <form action={action} className="max-w-2xl space-y-4 rounded-xl border bg-white p-6">
      <h3 className="font-semibold text-[#0B1D2A]">Soumettre une demande</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="institution_id">Institution destinataire</Label>
          <select
            id="institution_id"
            name="institution_id"
            className="flex h-10 w-full rounded-md border px-3 text-sm"
            required
          >
            <option value="">Choisir...</option>
            {institutions.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount_requested">Montant demandé (FCFA)</Label>
          <Input id="amount_requested" name="amount_requested" type="number" min={1} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="purpose">Objet de la demande</Label>
          <textarea
            id="purpose"
            name="purpose"
            rows={4}
            required
            className="flex w-full rounded-md border px-3 py-2 text-sm"
            placeholder="Décrivez l'utilisation des fonds..."
          />
        </div>
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.message && <p className="text-sm text-[#00BFA6]">{state.message}</p>}
      <Button type="submit" className="bg-[#0077B6] text-white hover:bg-[#00629a]" disabled={pending}>
        {pending ? "Envoi..." : "Soumettre la demande"}
      </Button>
    </form>
  );
}
