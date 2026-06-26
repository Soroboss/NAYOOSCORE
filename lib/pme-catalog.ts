export const SALE_TYPES = [
  { id: "product", label: "Article physique" },
  { id: "service", label: "Prestation / Service" },
  { id: "subscription", label: "Abonnement récurrent" },
  { id: "mixed", label: "Mixte (produit + service)" },
] as const;

export type SaleTypeId = (typeof SALE_TYPES)[number]["id"];

export const PAYMENT_METHODS = [
  { id: "cash", label: "Espèces" },
  { id: "mobile_money", label: "Mobile Money" },
  { id: "bank_transfer", label: "Virement bancaire" },
  { id: "card", label: "Carte bancaire" },
  { id: "cheque", label: "Chèque" },
  { id: "credit", label: "À crédit / échéancier" },
] as const;

export const EXPENSE_CATEGORIES = [
  { id: "salary", label: "Salaires" },
  { id: "bonus", label: "Primes & bonus" },
  { id: "rent", label: "Loyer & charges" },
  { id: "supplies", label: "Fournitures & consommables" },
  { id: "marketing", label: "Marketing & publicité" },
  { id: "field", label: "Actions terrain & déplacements" },
  { id: "inventory", label: "Achats marchandises / stock" },
  { id: "tax", label: "Impôts & taxes" },
  { id: "maintenance", label: "Entretien & réparations" },
  { id: "other", label: "Autre" },
] as const;

export const BONUS_TYPES = [
  { id: "prime", label: "Prime" },
  { id: "commission", label: "Commission" },
  { id: "gratification", label: "Gratification" },
  { id: "performance", label: "Prime de performance" },
] as const;

export const MARKETING_CHANNELS = [
  { id: "social", label: "Réseaux sociaux" },
  { id: "radio", label: "Radio / TV" },
  { id: "print", label: "Affichage / Print" },
  { id: "event", label: "Événement / Salon" },
  { id: "digital", label: "Publicité digitale" },
  { id: "sms", label: "SMS / WhatsApp" },
  { id: "influencer", label: "Influenceur / Partenariat" },
  { id: "other", label: "Autre" },
] as const;

export const ACTION_STATUSES = [
  { id: "planned", label: "Planifié" },
  { id: "active", label: "En cours" },
  { id: "completed", label: "Terminé" },
  { id: "cancelled", label: "Annulé" },
] as const;

export const FIELD_STATUSES = [
  { id: "planned", label: "Planifié" },
  { id: "in_progress", label: "En cours" },
  { id: "done", label: "Réalisé" },
  { id: "cancelled", label: "Annulé" },
] as const;

export function labelFor<T extends { id: string; label: string }>(
  list: readonly T[],
  id: string | null | undefined
): string {
  return list.find((item) => item.id === id)?.label ?? id ?? "—";
}
