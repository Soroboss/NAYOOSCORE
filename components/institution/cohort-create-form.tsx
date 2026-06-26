"use client";

import { useActionState } from "react";
import {
  createCohortAction,
  type InstitutionActionState,
} from "@/app/actions/institution";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: InstitutionActionState = { success: false };

type ProgramOption = { id: string; name: string };

export function CohortCreateForm({ programs }: { programs: ProgramOption[] }) {
  const [state, formAction, pending] = useActionState(createCohortAction, initialState);

  if (programs.length === 0) {
    return (
      <p className="rounded-xl border border-dashed bg-white p-4 text-sm text-muted-foreground">
        Créez d&apos;abord un programme pour ajouter une cohorte.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4 rounded-xl border bg-white p-6">
      <h3 className="font-semibold text-[#0B1D2A]">Nouvelle cohorte</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="program_id">Programme</Label>
          <select
            id="program_id"
            name="program_id"
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Sélectionner…</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Nom de la cohorte</Label>
          <Input id="name" name="name" placeholder="Ex. Promo 2026 — Lot A" required />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Input id="description" name="description" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="start_date">Date de début</Label>
          <Input id="start_date" name="start_date" type="date" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_date">Date de fin</Label>
          <Input id="end_date" name="end_date" type="date" />
        </div>
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.message && <p className="text-sm text-[#00BFA6]">{state.message}</p>}
      <Button
        type="submit"
        className="bg-[#00BFA6] text-white hover:bg-[#00a892]"
        disabled={pending}
      >
        {pending ? "Création..." : "Créer la cohorte"}
      </Button>
    </form>
  );
}
