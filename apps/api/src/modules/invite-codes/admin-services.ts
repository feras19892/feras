import { db } from '../../db/index.js';
import { randomBytes } from 'crypto';
import type { InviteCode } from './types.js';

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

export interface SubscriberAccount {
  id: number;
  type: 'user' | 'school';
  role?: string;
  name: string;
  email: string;
  code?: string;
  subscription_status: string;
  total_codes: number;
  unused_codes: number;
  used_codes: number;
  total_members: number;
  student_members: number;
  teacher_members: number;
  created_at: string;
}

export async function getSubscriberAccounts(): Promise<SubscriberAccount[]> {
  const users = await db.all<
    { id: number; name: string; email: string; role: string; created_at: string; subscription_status: string }[]
  >(`
    SELECT u.id, u.name, u.email, u.role, u.created_at, COALESCE(s.status, 'none') as subscription_status
    FROM users u
    LEFT JOIN subscriptions s ON s.owner_id = u.id AND s.owner_type = 'user'
    WHERE u.role IN ('student','teacher')
    ORDER BY u.created_at DESC
  `);

  const schools = await db.all<
    { id: number; name: string; email: string; code: string; created_at: string; subscription_status: string }[]
  >(`
    SELECT sc.id, sc.name, sc.email, sc.code, sc.created_at, COALESCE(s.status, 'none') as subscription_status
    FROM schools sc
    LEFT JOIN subscriptions s ON s.owner_id = sc.id AND s.owner_type = 'school'
    ORDER BY sc.created_at DESC
  `);

  const codes = await db.all<{ owner_id: number; owner_type: string; is_active: number; used_count: number }[]>(
    'SELECT owner_id, owner_type, is_active, used_count FROM invite_codes',
  );

  const members = await db.all<{ tenant_id: number; tenant_type: string; member_role: string }[]>(`
    SELECT tm.tenant_id, tm.tenant_type, u.role as member_role
    FROM tenant_memberships tm
    JOIN users u ON u.id = tm.member_id
    WHERE tm.status = 'active'
  `);

  const result: SubscriberAccount[] = [];

  for (const u of users) {
    const ownerCodes = codes.filter((c) => c.owner_id === u.id && c.owner_type === 'teacher');
    const ownerMembers = members.filter((m) => m.tenant_id === u.id && m.tenant_type === 'teacher');
    result.push({
      id: u.id,
      type: 'user',
      role: u.role,
      name: u.name,
      email: u.email,
      subscription_status: u.subscription_status,
      total_codes: ownerCodes.length,
      unused_codes: ownerCodes.filter((c) => c.used_count === 0 && c.is_active).length,
      used_codes: ownerCodes.filter((c) => c.used_count > 0).length,
      total_members: ownerMembers.length,
      student_members: ownerMembers.filter((m) => m.member_role === 'student').length,
      teacher_members: ownerMembers.filter((m) => m.member_role === 'teacher').length,
      created_at: u.created_at,
    });
  }

  for (const s of schools) {
    const ownerCodes = codes.filter((c) => c.owner_id === s.id && c.owner_type === 'school');
    const ownerMembers = members.filter((m) => m.tenant_id === s.id && m.tenant_type === 'school');
    result.push({
      id: s.id,
      type: 'school',
      name: s.name,
      email: s.email,
      code: s.code,
      subscription_status: s.subscription_status,
      total_codes: ownerCodes.length,
      unused_codes: ownerCodes.filter((c) => c.used_count === 0 && c.is_active).length,
      used_codes: ownerCodes.filter((c) => c.used_count > 0).length,
      total_members: ownerMembers.length,
      student_members: ownerMembers.filter((m) => m.member_role === 'student').length,
      teacher_members: ownerMembers.filter((m) => m.member_role === 'teacher').length,
      created_at: s.created_at,
    });
  }

  return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getInviteCodesByOwner(ownerId: number, ownerType: 'teacher' | 'school'): Promise<InviteCode[]> {
  return db.all<InviteCode[]>(
    'SELECT * FROM invite_codes WHERE owner_id = ? AND owner_type = ? ORDER BY created_at DESC',
    ownerId,
    ownerType,
  );
}

export async function getAllInviteCodes(): Promise<InviteCode[]> {
  return db.all<InviteCode[]>('SELECT * FROM invite_codes ORDER BY created_at DESC');
}

export async function createAdminInviteCode(input: {
  owner_id: number;
  owner_type: 'teacher' | 'school';
  role?: 'student' | 'teacher';
  max_uses?: number | null;
  expires_at?: string | null;
}): Promise<InviteCode> {
  const code = generateCode();
  const result = await db.run(
    `INSERT INTO invite_codes (code, owner_id, owner_type, role, subscription_id, max_uses, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    code,
    input.owner_id,
    input.owner_type,
    input.role ?? 'student',
    null,
    input.max_uses ?? null,
    input.expires_at ?? null,
  );
  const id = Number(result.lastID);
  return db.get<InviteCode>('SELECT * FROM invite_codes WHERE id = ?', id) as Promise<InviteCode>;
}

export async function updateInviteCode(
  id: number,
  data: { is_active?: number; max_uses?: number | null; expires_at?: string | null },
): Promise<InviteCode | undefined> {
  const sets: string[] = [];
  const values: (number | string | null)[] = [];
  if (data.is_active !== undefined) {
    sets.push('is_active = ?');
    values.push(data.is_active);
  }
  if (data.max_uses !== undefined) {
    sets.push('max_uses = ?');
    values.push(data.max_uses ?? null);
  }
  if (data.expires_at !== undefined) {
    sets.push('expires_at = ?');
    values.push(data.expires_at ?? null);
  }
  if (sets.length === 0) return getInviteCodeById(id);
  values.push(id);
  await db.run(`UPDATE invite_codes SET ${sets.join(', ')} WHERE id = ?`, ...values);
  return getInviteCodeById(id);
}

export async function deleteInviteCode(id: number): Promise<void> {
  await db.run('DELETE FROM invite_codes WHERE id = ?', id);
}

export async function getInviteCodeById(id: number): Promise<InviteCode | undefined> {
  return db.get<InviteCode>('SELECT * FROM invite_codes WHERE id = ?', id);
}
