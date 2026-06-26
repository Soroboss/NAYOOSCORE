export type Subscription = {
  id: string;
  institution_id: string;
  plan_name: string;
  status: string;
  amount: number | null;
  started_at: string;
  ends_at: string | null;
};

export type SubscriptionWithInstitution = Subscription & {
  institution_name: string;
};
