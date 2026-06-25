"use client";

import { useActionState } from "react";
import {
  createProgramAction,
  type InstitutionActionState,
} from "@/app/actions/institution";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: InstitutionActionState = { success: false };

export function ProgramCreateForm() {
  const [state, formAction, pending] = useActionState(
    createProgramAction,
    initialState
  );

  return (
    <form action={formAction} className="space-y-4 rounded-xl border bg-white p-6">
      <h3 className="font-semibold text-[#0B1D2A]">Nouveau programme</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Nom du programme</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="objective">Objectif</Label>
          <Input id="objective" name="objective" />
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
        {pending ? "Création..." : "Créer le programme"}
      </Button>
    </form>
  );
}
