"use client";

import { useActionState } from "react";
import {
  inviteCollaboratorAction,
  type SettingsActionState,
} from "@/app/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: SettingsActionState = { success: false };

type CollaboratorInviteFormProps = {
  roleOptions: { value: string; label: string }[];
  description: string;
};

export function CollaboratorInviteForm({
  roleOptions,
  description,
}: CollaboratorInviteFormProps) {
  const [state, action, pending] = useActionState(inviteCollaboratorAction, initial);

  return (
    <form action={action} className="space-y-4 rounded-xl border bg-white p-6">
      <div>
        <h2 className="font-semibold text-[#0B1D2A]">Collaborateurs</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      {state.message && (
        <p className="rounded-lg bg-[#00BFA6]/10 px-3 py-2 text-sm text-[#0077B6] whitespace-pre-wrap">
          {state.message}
        </p>
      )}
      {state.error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="full_name">Nom complet</Label>
        <Input id="full_name" name="full_name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Rôle</Label>
        <select
          id="role"
          name="role"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          defaultValue={roleOptions[0]?.value}
        >
          {roleOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" disabled={pending} className="bg-[#00BFA6] hover:bg-[#00a892]">
        {pending ? "Création…" : "Créer le collaborateur"}
      </Button>
    </form>
  );
}
