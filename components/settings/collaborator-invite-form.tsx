"use client";

import { useActionState } from "react";
import {
  inviteCollaboratorAction,
  type SettingsActionState,
} from "@/app/actions/settings";
import type { CollaboratorRoleDefinition } from "@/lib/collaborator-roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, ShieldOff } from "lucide-react";
import { useMemo, useState } from "react";

const initial: SettingsActionState = { success: false };

type CollaboratorInviteFormProps = {
  roleOptions: CollaboratorRoleDefinition[];
  description: string;
  canInvite?: boolean;
};

export function CollaboratorInviteForm({
  roleOptions,
  description,
  canInvite = true,
}: CollaboratorInviteFormProps) {
  const [state, action, pending] = useActionState(inviteCollaboratorAction, initial);
  const [selectedRole, setSelectedRole] = useState<string>(roleOptions[0]?.value ?? "");

  const selected = useMemo(
    () => roleOptions.find((r) => r.value === selectedRole),
    [roleOptions, selectedRole]
  );

  if (!canInvite) return null;

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
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          {roleOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {selected && (
        <div className="rounded-lg border border-[#0B1D2A]/10 bg-[#F5F7FA]/60 p-4 text-sm">
          <p className="font-medium text-[#0B1D2A]">{selected.label}</p>
          <p className="mt-1 text-muted-foreground">{selected.description}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase text-[#00BFA6]">
                <Check className="size-3" /> Permissions
              </p>
              <ul className="space-y-1 text-xs text-[#0B1D2A]/80">
                {selected.permissions.map((p) => (
                  <li key={p}>• {p}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase text-amber-700">
                <ShieldOff className="size-3" /> Restrictions
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {selected.restrictions.map((r) => (
                  <li key={r}>• {r}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <Button type="submit" disabled={pending} className="bg-[#00BFA6] hover:bg-[#00a892]">
        {pending ? "Création…" : "Créer le collaborateur"}
      </Button>
    </form>
  );
}
