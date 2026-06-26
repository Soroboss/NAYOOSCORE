"use client";

import { useState, useTransition } from "react";
import { PlanUpsertForm } from "@/components/admin/plan-upsert-form";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { deletePricingPlanAction } from "@/app/actions/pricing";
import type { PricingPlanAdminRow } from "@/lib/pricing-store";
import { Lock, Pencil, Power } from "lucide-react";

type PlanUpdateActionsProps = {
  plan: PricingPlanAdminRow;
  canUpdate: boolean;
  restrictionMessage?: string | null;
};

export function PlanUpdateActions({
  plan,
  canUpdate,
  restrictionMessage,
}: PlanUpdateActionsProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleDeactivate = () => {
    if (!confirm(`Désactiver le plan « ${plan.name} » ? Il ne sera plus visible sur la landing.`)) {
      return;
    }
    startTransition(async () => {
      await deletePricingPlanAction(plan.id);
      setOpen(false);
    });
  };

  if (!canUpdate) {
    return (
      <div className="mt-4 border-t pt-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full gap-2 text-muted-foreground"
                disabled
              >
                <Lock className="size-4" />
                Modifier le plan
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              {restrictionMessage ?? "Modification non autorisée pour votre rôle."}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-col gap-2 border-t pt-4">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button type="button" variant="outline" size="sm" className="w-full gap-2">
            <Pencil className="size-4" />
            Mettre à jour le plan
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Modifier {plan.name}</SheetTitle>
            <SheetDescription>
              Les changements sont publiés sur la landing et le parcours d&apos;inscription.
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-6">
            <PlanUpsertForm plan={plan} embedded />
            {plan.active && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-4 w-full gap-2 text-destructive hover:text-destructive"
                disabled={pending}
                onClick={handleDeactivate}
              >
                <Power className="size-4" />
                {pending ? "Désactivation…" : "Désactiver ce plan"}
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>
      {!plan.active && (
        <p className="text-center text-xs text-amber-700">Plan inactif — non visible publiquement</p>
      )}
    </div>
  );
}
