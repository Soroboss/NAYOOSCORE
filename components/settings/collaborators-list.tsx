"use client";

import { useActionState } from "react";
import {
  updateCollaboratorRoleAction,
  type SettingsActionState,
} from "@/app/actions/settings";
import type { CollaboratorRoleDefinition } from "@/lib/collaborator-roles";
import type { CollaboratorRow } from "@/lib/collaborators";
import { ROLE_LABELS } from "@/lib/nav-config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const initial: SettingsActionState = { success: false };

type CollaboratorsListProps = {
  collaborators: CollaboratorRow[];
  roleOptions: CollaboratorRoleDefinition[];
  canManage: boolean;
  currentUserId: string;
  space: "admin" | "institution" | "pme";
};

export function CollaboratorsList({
  collaborators,
  roleOptions,
  canManage,
  currentUserId,
  space,
}: CollaboratorsListProps) {
  const [state, action, pending] = useActionState(updateCollaboratorRoleAction, initial);

  if (collaborators.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-6 text-sm text-muted-foreground">
        Aucun collaborateur pour le moment.
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border bg-white p-6">
      <div>
        <h2 className="font-semibold text-[#0B1D2A]">Équipe</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {canManage
            ? "Modifiez le rôle d'un collaborateur pour ajuster ses permissions."
            : "Liste des membres et leurs rôles."}
        </p>
      </div>

      {state.message && (
        <p className="rounded-lg bg-[#00BFA6]/10 px-3 py-2 text-sm text-[#0077B6]">
          {state.message}
        </p>
      )}
      {state.error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <div className="divide-y rounded-lg border">
        {collaborators.map((member) => {
          const isSelf = member.user_id === currentUserId;
          return (
            <div
              key={member.link_id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-[#0B1D2A]">
                  {member.full_name}
                  {isSelf && (
                    <span className="ml-2 text-xs text-muted-foreground">(vous)</span>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">{member.email}</p>
              </div>
              {canManage && !isSelf ? (
                <form action={action} className="flex items-center gap-2">
                  <input type="hidden" name="space" value={space} />
                  <input type="hidden" name="link_id" value={member.link_id} />
                  <input type="hidden" name="user_id" value={member.user_id} />
                  <select
                    name="role"
                    defaultValue={member.role}
                    className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                  >
                    {roleOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <Button type="submit" size="sm" variant="outline" disabled={pending}>
                    Mettre à jour
                  </Button>
                </form>
              ) : (
                <Badge variant="secondary">
                  {ROLE_LABELS[member.role] ?? member.role}
                </Badge>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
