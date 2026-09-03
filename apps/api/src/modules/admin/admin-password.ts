import { comparePassword } from '../auth/crypto.js'
import { db } from '../../db/index.js'
import type { User } from '@my-modern-app/shared-types'

export async function verifyAdminPassword(
  admin: User,
  password: string | undefined,
): Promise<{ success: false; message: string } | null> {
  if (!admin || !admin.id) {
    return { success: false, message: 'المستخدم غير موجود' }
  }
  if (typeof password !== 'string' || password.trim().length === 0) {
    return { success: false, message: 'كلمة مرور الإدمن مطلوبة' }
  }
  const row = await db.get<{ password_hash: string }>(
    'SELECT password_hash FROM users WHERE id = ? AND role = ?',
    admin.id,
    'admin',
  )
  if (!row) return { success: false, message: 'المستخدم غير موجود' }
  const valid = await comparePassword(password, row.password_hash)
  if (!valid) return { success: false, message: 'كلمة مرور الإدمن غير صحيحة' }
  return null
}
