export type InviteOwnerType = 'teacher' | 'school';
export type TenantType = 'teacher' | 'school';
export type MembershipStatus = 'active' | 'suspended' | 'removed';

export interface InviteCode {
  id: number;
  code: string;
  owner_id: number;
  owner_type: InviteOwnerType;
  role: 'student' | 'teacher';
  subscription_id: number | null;
  max_uses: number | null;
  used_count: number;
  is_active: number;
  created_at: string;
  expires_at: string | null;
}

export interface TenantMembership {
  id: number;
  member_id: number;
  tenant_id: number;
  tenant_type: TenantType;
  invite_code_id: number | null;
  joined_at: string;
  status: MembershipStatus;
}

export interface CreateInviteInput {
  owner_id: number;
  owner_type: InviteOwnerType;
  role?: 'student' | 'teacher';
  subscription_id?: number | null;
  max_uses?: number | null;
  expires_at?: string | null;
}

export interface JoinByCodeInput {
  member_id: number;
  code: string;
}
