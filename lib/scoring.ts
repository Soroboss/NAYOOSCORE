import { SCORE_THRESHOLDS, SCORE_WEIGHTS } from "@/lib/constants";
import type { ScoringBreakdown } from "@/types/scoring";

export type ScoringInput = {
  profileComplete: boolean;
  salesRegular: boolean;
  expensesRegular: boolean;
  documentsAdded: boolean;
  positiveRevenue: boolean;
  positiveMargin: boolean;
  positiveTreasury: boolean;
  controlledExpenses: boolean;
  revenueGrowth: boolean;
  recurringCustomers: boolean;
  jobsCreated: boolean;
  rccmAdded: boolean;
  taxIdAdded: boolean;
  fiscalDocumentsAdded: boolean;
  objectivesSet: boolean;
  teamDocumented: boolean;
  regularFollowUp: boolean;
};

function getScoreStatus(globalScore: number): {
  status: string;
  statusLabel: string;
} {
  const entry = Object.values(SCORE_THRESHOLDS).find(
    (threshold) =>
      globalScore >= threshold.min && globalScore <= threshold.max
  );

  return {
    status: entry?.color ?? "danger",
    statusLabel: entry?.label ?? "Non prêt",
  };
}

export function calculateCompanyScore(input: ScoringInput): ScoringBreakdown {
  const management =
    (input.profileComplete ? 5 : 0) +
    (input.salesRegular ? 5 : 0) +
    (input.expensesRegular ? 5 : 0) +
    (input.documentsAdded ? 5 : 0);

  const financial =
    (input.positiveRevenue ? 8 : 0) +
    (input.positiveMargin ? 8 : 0) +
    (input.positiveTreasury ? 7 : 0) +
    (input.controlledExpenses ? 7 : 0);

  const growth =
    (input.revenueGrowth ? 10 : 0) +
    (input.recurringCustomers ? 5 : 0) +
    (input.jobsCreated ? 5 : 0);

  const compliance =
    (input.rccmAdded ? 5 : 0) +
    (input.taxIdAdded ? 5 : 0) +
    (input.fiscalDocumentsAdded ? 5 : 0);

  const governance =
    (input.objectivesSet ? 5 : 0) +
    (input.teamDocumented ? 5 : 0) +
    (input.regularFollowUp ? 5 : 0);

  const global = Math.min(
    100,
    management + financial + growth + compliance + governance
  );

  const { status, statusLabel } = getScoreStatus(global);

  return {
    management,
    financial,
    growth,
    compliance,
    governance,
    global,
    status,
    statusLabel,
  };
}

export { SCORE_WEIGHTS };
