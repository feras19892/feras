import { randomBytes } from 'crypto';
import { db } from '../../db/index.js';
import { createNotification } from '../notifications/services.js';
import type { InviteCode, TenantMembership, CreateInviteInput, JoinByCodeInput } from './types.js';

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = randomBytes(4);
  let part1 = '';
  for (let i = 0; i < 4; i++) part1 += chars[bytes[i] % chars.length];
  const bytes2 = randomBytes(4);
  let part2 = '';
  for (let i = 0; i < 4; i++) part2 += chars[bytes2[i] % chars.length];
  return `${part1}-${part2}`;
}

export async function createInviteCode(input: CreateInviteInput): Promise<InviteCode> {
  const code = generateCode();
  const result = await db.run(
    `INSERT INTO invite_codes (code, owner_id, owner_type, role, subscription_id, max_uses, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    code,
    input.owner_id,
    input.owner_type,
    input.role ?? 'student',
    input.subscription_id ?? null,
    input.max_uses ?? null,
    input.expires_at ?? null,
  );
  const id = Number(result.lastID);
  return db.get<InviteCode>('SELECT * FROM invite_codes WHERE id = ?', id) as Promise<InviteCode>;
}

export async function getInviteCodesByOwner(ownerId: number, ownerType: 'teacher' | 'school'): Promise<InviteCode[]> {
  return db.all<InviteCode[]>(
    'SELECT * FROM invite_codes WHERE owner_id = ? AND owner_type = ? ORDER BY created_at DESC',
    ownerId,
    ownerType,
  );
}

export async function countInviteCodesByOwnerAndRole(
  ownerId: number,
  ownerType: 'teacher' | 'school',
  role: 'student' | 'teacher',
): Promise<number> {
  const row = await db.get<{ cnt: number }>(
    'SELECT COUNT(*) as cnt FROM invite_codes WHERE owner_id = ? AND owner_type = ? AND role = ?',
    ownerId,
    ownerType,
    role,
  );
  return row?.cnt ?? 0;
}

export async function getInviteCodeByCode(code: string): Promise<InviteCode | undefined> {
  return db.get<InviteCode>('SELECT * FROM invite_codes WHERE code = ?', code);
}

export async function getActiveSubscriptionForOwner(
  ownerId: number,
  ownerType: 'teacher' | 'school',
): Promise<{ id: number; status: string; max_students: number | null; max_teachers: number | null } | undefined> {
  return db.get<{ id: number; status: string; max_students: number | null; max_teachers: number | null }>(
    `SELECT id, status, max_students, max_teachers FROM subscriptions
     WHERE owner_id = ? AND owner_type = ? AND status IN ('ACTIVE','TRIAL')
     ORDER BY created_at DESC LIMIT 1`,
    ownerId,
    ownerType === 'teacher' ? 'user' : 'school',
  );
}

async function countActiveMembers(tenantId: number, tenantType: 'teacher' | 'school', role: 'student' | 'teacher'): Promise<number> {
  const row = await db.get<{ cnt: number }>(
    `SELECT COUNT(*) as cnt FROM tenant_memberships tm
     JOIN users u ON u.id = tm.member_id
     WHERE tm.tenant_id = ? AND tm.tenant_type = ? AND tm.status = 'active' AND u.role = ?`,
    tenantId,
    tenantType,
    role,
  );
  return row?.cnt ?? 0;
}

async function checkMemberLimit(
  invite: InviteCode,
  sub: { id: number; status: string; max_students: number | null; max_teachers: number | null },
  excludeMemberId?: number,
): Promise<string | null> {
  const max = invite.role === 'teacher' ? sub.max_teachers : sub.max_students;
  if (max == null) return null;
  const current = await countActiveMembers(invite.owner_id, invite.owner_type, invite.role as 'student' | 'teacher');
  // If this member is already counted (e.g. reactivating), they should not block themselves
  const existing = await db.get<{ id: number }>(
    'SELECT id FROM tenant_memberships WHERE member_id = ? AND tenant_id = ? AND tenant_type = ? AND status = "active"',
    excludeMemberId,
    invite.owner_id,
    invite.owner_type,
  );
  const effective = existing ? current - 1 : current;
  if (effective >= max) {
    return `تم الوصول للحد الأقصى لعدد ${invite.role === 'teacher' ? 'المعلمين' : 'الطلاب'}`;
  }
  return null;
}
export async function validateInviteCode(code: string): Promise<{ ok: false; message: string } | { ok: true; invite: InviteCode }> {
  const invite = await getInviteCodeByCode(code);
  if (!invite) return { ok: false, message: 'رمز الدعوة غير صالح' };
  if (!invite.is_active) return { ok: false, message: 'رمز الدعوة معطل' };
  if (invite.expires_at && new Date(invite.expires_at) < new Date()) return { ok: false, message: 'انتهت صلاحية رمز الدعوة' };
  if (invite.max_uses !== null && invite.used_count >= invite.max_uses) return { ok: false, message: 'تم استنفاد رمز الدعوة' };

  const sub = await getActiveSubscriptionForOwner(invite.owner_id, invite.owner_type);
  if (!sub) return { ok: false, message: 'صاحب رمز الدعوة لا يملك اشتراكاً فعالاُ' };
  if (sub.status !== 'ACTIVE' && sub.status !== 'TRIAL') return { ok: false, message: 'اشتراك صاحب الدعوة غير نشط' };

  const limitMsg = await checkMemberLimit(invite, sub);
  if (limitMsg) return { ok: false, message: limitMsg };

  return { ok: true, invite };
}

export async function useInviteCode(input: JoinByCodeInput): Promise<{ success: boolean; message: string; membership?: TenantMembership }> {
  const validation = await validateInviteCode(input.code);
  if (!validation.ok) return { success: false, message: validation.message };
  const invite = validation.invite;

  const sub = await getActiveSubscriptionForOwner(invite.owner_id, invite.owner_type);
  const limitMsg = sub ? await checkMemberLimit(invite, sub, input.member_id) : null;
  if (limitMsg) return { success: false, message: limitMsg };

  const existing = await db.get<TenantMembership>(
    `SELECT * FROM tenant_memberships WHERE member_id = ? AND tenant_id = ? AND tenant_type = ?`,
    input.member_id,
    invite.owner_id,
    invite.owner_type,
  );

  if (existing) {
    if (existing.status === 'active') return { success: false, message: 'أنت منضم بالفعل إلى هذا المستأجر' };
    await db.run(
      `UPDATE tenant_memberships SET status = 'active', invite_code_id = ?, joined_at = ? WHERE id = ?`,
      invite.id,
      new Date().toISOString(),
      existing.id,
    );
    await db.run('UPDATE invite_codes SET used_count = used_count + 1 WHERE id = ?', invite.id);
    const row = await db.get<TenantMembership>('SELECT * FROM tenant_memberships WHERE id = ?', existing.id);
    if (invite.owner_type === 'school') {
      await db.run('UPDATE users SET school_id = ? WHERE id = ?', invite.owner_id, input.member_id);
    }
    return { success: true, message: 'تم إعادة تفعيل الانضمام', membership: row };
  }

  const result = await db.run(
    `INSERT INTO tenant_memberships (member_id, tenant_id, tenant_type, invite_code_id, joined_at, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    input.member_id,
    invite.owner_id,
    invite.owner_type,
    invite.id,
    new Date().toISOString(),
    'active',
  );
  await db.run('UPDATE invite_codes SET used_count = used_count + 1 WHERE id = ?', invite.id);
  const row = await db.get<TenantMembership>('SELECT * FROM tenant_memberships WHERE id = ?', result.lastID);
  if (invite.owner_type === 'school') {
    await db.run('UPDATE users SET school_id = ? WHERE id = ?', invite.owner_id, input.member_id);
  }
  await notifyActivation(input.member_id, invite.owner_id, invite.owner_type);
  return { success: true, message: 'تم الانضمام بنجاح', membership: row };
}

export async function getTenantMembers(
  tenantId: number,
  tenantType: 'teacher' | 'school',
): Promise<{ member_id: number; name: string; email: string; joined_at: string; status: string; invite_code_id?: number | null; blocked_at?: string | null; block_until?: string | null; block_reason?: string | null }[]> {
  const userTable = tenantType === 'school' ? 'users' : 'users';
  return db.all(
    `SELECT tm.member_id, u.name, u.email, u.role, u.blocked_at, u.block_until, u.block_reason, tm.invite_code_id, tm.joined_at, tm.status
     FROM tenant_memberships tm
     JOIN users u ON u.id = tm.member_id
     WHERE tm.tenant_id = ? AND tm.tenant_type = ?
     ORDER BY tm.joined_at DESC`,
    tenantId,
    tenantType,
  );
}

export async function getTenantMembershipId(memberId: number, tenantId: number, tenantType: 'teacher' | 'school'): Promise<number | undefined> {
  const row = await db.get<{ id: number }>(
    'SELECT id FROM tenant_memberships WHERE member_id = ? AND tenant_id = ? AND tenant_type = ?',
    memberId,
    tenantId,
    tenantType,
  );
  return row?.id;
}

export async function updateTenantMembershipStatus(
  memberId: number,
  tenantId: number,
  tenantType: 'teacher' | 'school',
  status: 'active' | 'suspended' | 'removed',
): Promise<void> {
  await db.run(
    `UPDATE tenant_memberships SET status = ? WHERE member_id = ? AND tenant_id = ? AND tenant_type = ?`,
    status,
    memberId,
    tenantId,
    tenantType,
  );
}

export async function removeTenantMember(
  memberId: number,
  tenantId: number,
  tenantType: 'teacher' | 'school',
): Promise<void> {
  await db.run(
    `DELETE FROM tenant_memberships WHERE member_id = ? AND tenant_id = ? AND tenant_type = ?`,
    memberId,
    tenantId,
    tenantType,
  );
}

async function notifyActivation(
  memberId: number,
  ownerId: number,
  ownerType: 'teacher' | 'school',
): Promise<void> {
  await db.run(
    'UPDATE users SET blocked_at = NULL, block_reason = NULL WHERE id = ?',
    memberId,
  );
  const owner =
    ownerType === 'school'
      ? await db.get<{ name: string }>('SELECT name FROM schools WHERE id = ?', ownerId)
      : await db.get<{ name: string }>('SELECT name FROM users WHERE id = ?', ownerId);
  const ownerName = owner?.name ?? '';
  await createNotification({
    user_id: memberId,
    type: 'account_activated',
    title: 'تم تفعيل حسابك',
    message: ownerName ? `أنت الآن منضم ومفعل في ${ownerName}` : 'تم تفعيل حسابك بنجاح',
  });
}
