export type PlanType = 'student' | 'teacher' | 'school';
export type BillingInterval = 'month' | 'year';
export type SubscriptionStatus = 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'CANCELLED' | 'PENDING' | 'SUSPENDED';
export type OwnerType = 'user' | 'school';

export interface Plan {
  id: number;
  type: PlanType;
  name: string;
  currency: string;
  features: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface PlanPackage {
  id: number;
  plan_id: number;
  teacher_count: number;
  student_count: number;
  price_cents_monthly: number;
  price_cents_yearly: number;
  currency: string;
  stripe_product_id: string | null;
  stripe_price_id_monthly: string | null;
  stripe_price_id_yearly: string | null;
  archived_at: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface PlanWithPackages extends Plan {
  packages: PlanPackage[];
}

export interface ActivationCode {
  id: number;
  code: string;
  subscription_id: number | null;
  created_by_user_id: number;
  used_by_user_id: number | null;
  status: 'active' | 'used' | 'revoked' | 'expired';
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: number;
  owner_id: number;
  owner_type: OwnerType;
  plan_id: number | null;
  status: SubscriptionStatus;
  starts_at: string;
  expires_at: string | null;
  last_payment_at: string | null;
  next_billing_at: string | null;
  cancelled_at: string | null;
  payment_provider: string | null;
  payment_reference: string | null;
  max_students: number | null;
  max_teachers: number | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionWithPlan extends Subscription {
  plan_name?: string | null;
  plan_type?: PlanType | null;
  price_cents?: number | null;
}

export interface CreateSubscriptionInput {
  owner_id: number;
  owner_type: OwnerType;
  plan_id?: number | null;
  status?: SubscriptionStatus;
  starts_at?: string;
  expires_at?: string | null;
  next_billing_at?: string | null;
  payment_provider?: string | null;
  payment_reference?: string | null;
  max_students?: number | null;
  max_teachers?: number | null;
}
