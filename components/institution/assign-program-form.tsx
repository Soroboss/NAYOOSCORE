"use client";

import { useTransition } from "react";
import { assignCompanyToProgramAction } from "@/app/actions/institution";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { Program } from "@/types/program";

type Props = {
  companyId: string;
  programs: (Program & { companies_count: number })[];
  currentProgramId: string | null | undefined;
};

export function AssignProgramForm({
  companyId,
  programs,
  currentProgramId,
}: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="mt-6 space-y-3 border-t pt-4"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const programId = new FormData(form).get("program_id") as string;
        startTransition(async () => {
          await assignCompanyToProgramAction(companyId, programId);
        });
      }}
    >
      <Label htmlFor="program_id">Rattacher à un programme</Label>
      <select
        id="program_id"
        name="program_id"
        defaultValue={currentProgramId ?? ""}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        required
      >
        <option value="" disabled>
          Choisir un programme
        </option>
        {programs.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} ({p.companies_count} PME)
          </option>
        ))}
      </select>
      <Button
        type="submit"
        size="sm"
        className="bg-[#00BFA6] text-white hover:bg-[#00a892]"
        disabled={pending}
      >
        {pending ? "Enregistrement..." : "Assigner"}
      </Button>
    </form>
  );
}
