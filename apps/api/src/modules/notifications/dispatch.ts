import { db } from '../../db/index.js';
import { createNotification, createSchoolNotification } from './services.js';
import { logActivity } from '../activity/service.js';
import {
  type Recipient,
  getTeacherForClass, getSchoolForClass, getStudentsForClass,
  getAllAdmins, getAllUsers, getAllSchools, getUsersForSchool,
  getUserSchoolId, getReportAuthor,
} from './dispatch-helpers.js';

export type NotificationEventType =
  | 'report_submitted'
  | 'report_graded'
  | 'report_resubmitted'
  | 'class_created_by_teacher'
  | 'class_created_by_school'
  | 'class_frozen'
  | 'class_unfrozen'
  | 'user_blocked'
  | 'user_unblocked'
  | 'user_banned_admin'
  | 'school_deleted'
  | 'quiz_created'
  | 'quiz_graded'
  | 'warning_sent'
  | 'alert_sent'
  | 'penalty_created'
  | 'badge_awarded'
  | 'rating_given'
  | 'global_announcement'
  | 'system_alert'
  | 'complaint_created'
  | 'complaint_updated'
  | 'subscription_updated'
  | 'subscription_cancelled'
  | 'subscription_created';

export interface DispatchPayload {
  reportId?: number;
  classId?: string;
  studentId?: number;
  userId?: number;
  schoolId?: number;
  quizId?: number;
  message?: string;
  reason?: string;
  severity?: 'info' | 'warning' | 'critical';
  targetType?: 'admin' | 'school' | 'teacher' | 'student' | 'all';
  targetRole?: 'teacher' | 'student' | 'all';
}

export interface DispatchEvent {
  type: NotificationEventType;
  actorId: number;
  actorName: string;
  actorRole: 'student' | 'teacher' | 'school' | 'admin';
  payload?: DispatchPayload;
}

type _Recipient = Recipient;

// ─── Build notification text ───

function buildText(type: NotificationEventType, actorName: string, payload?: DispatchPayload) {
  switch (type) {
    case 'report_submitted':
      return { title: 'تقرير جديد', message: `قام ${actorName} بإرسال تقرير جديد` };
    case 'report_graded':
      return { title: 'تم تصحيح التقرير', message: `قام ${actorName} بتصحيح تقريرك` };
    case 'report_resubmitted':
      return { title: 'تقرير مُعاد إرساله', message: `قام ${actorName} بإعادة إرسال تقرير` };
    case 'class_created_by_teacher':
      return { title: 'فصل جديد', message: `أنشأ المدرس ${actorName} فصلاً جديداً` };
    case 'class_created_by_school':
      return { title: 'فصل جديد', message: `أنشأت المدرسة فصلاً جديداً لك` };
    case 'class_frozen':
      return { title: 'فصول مجمد', message: `تم تجميد الفصل ${payload?.reason ? ` (${payload.reason})` : ''}` };
    case 'class_unfrozen':
      return { title: 'فصول مفعل', message: `تم تفعيل الفصل` };
    case 'user_blocked':
      return { title: 'حساب موقوف', message: `تم تعطيل حسابك ${payload?.reason ? ` (${payload.reason})` : ''}` };
    case 'user_unblocked':
      return { title: 'حساب مفعل', message: `تم تفعيل حسابك` };
    case 'user_banned_admin':
      return { title: 'حساب محظور', message: `تم حظر حسابك ${payload?.reason ? ` (${payload.reason})` : ''}` };
    case 'school_deleted':
      return { title: 'مدرسة محذوفة', message: `تم حذف المدرسة ${payload?.reason ? ` (${payload.reason})` : ''}` };
    case 'quiz_created':
      return { title: 'امتحان جديد', message: `أنشأ المدرس ${actorName} امتحاناً جديداً` };
    case 'quiz_graded':
      return { title: 'تم تصحيح الامتحان', message: `قام ${actorName} بتصحيح امتحانك` };
    case 'penalty_created':
      return { title: 'عقوبة على طالب', message: `قام ${actorName} بتسجيل عقوبة: ${payload?.reason || ''}` };
    case 'badge_awarded':
      return { title: 'وسام لطالب', message: `منح ${actorName} وساماً: ${payload?.message || ''}` };
    case 'rating_given':
      return { title: 'تقييم طالب', message: `قام ${actorName} بتقييم طالب: ${payload?.message || ''}` };
    case 'warning_sent':
      return { title: 'تنبيه لطالب', message: `تنبيه من ${actorName}: ${payload?.message || ''}` };
    case 'alert_sent':
      return { title: 'تنبيه', message: `تنبيه من ${actorName}: ${payload?.message || ''}` };
    case 'global_announcement':
      return { title: 'إعلان عام', message: payload?.message || 'إعلان عام' };
    case 'system_alert':
      return { title: 'تنبيه النظام', message: payload?.message || 'تنبيه نظام' };
    case 'complaint_created':
      return { title: 'شكوى جديدة', message: `من ${actorName}: ${payload?.message || ''}` };
    case 'complaint_updated':
      return { title: 'تحديث شكوى', message: `تم تحديث شكواك: ${payload?.message || ''}` };
    case 'subscription_updated':
      return { title: 'تم تحديث اشتراكك', message: payload?.message || `قام ${actorName} بتحديث اشتراكك` };
    case 'subscription_cancelled':
      return { title: 'تم إلغاء اشتراكك', message: payload?.message || `قام ${actorName} بإلغاء اشتراكك` };
    case 'subscription_created':
      return { title: 'اشتراك جديد', message: payload?.message || `قام ${actorName} بإنشاء اشتراك جديد لك` };
    default:
      return { title: 'إشعار', message: 'حدث جديد في النظام' };
  }
}

async function resolveRecipients(event: DispatchEvent): Promise<Recipient[]> {
  const p = event.payload || {};
  const recipients: Recipient[] = [];

  switch (event.type) {
    case 'report_submitted':
      if (p.classId) {
        const teacherId = await getTeacherForClass(p.classId);
        if (teacherId) recipients.push({ kind: 'user', id: teacherId, priority: 'immediate' });
        const schoolId = await getSchoolForClass(p.classId);
        if (schoolId) recipients.push({ kind: 'school', id: schoolId, priority: 'cumulative' });
      }
      for (const adminId of await getAllAdmins()) recipients.push({ kind: 'user', id: adminId, priority: 'periodic' });
      break;

    case 'report_graded':
    case 'report_resubmitted':
      if (p.studentId) recipients.push({ kind: 'user', id: p.studentId, priority: 'immediate' });
      if (p.classId) {
        const schoolId = await getSchoolForClass(p.classId);
        if (schoolId) recipients.push({ kind: 'school', id: schoolId, priority: 'cumulative' });
        for (const s of await getStudentsForClass(p.classId)) {
          if (s !== p.studentId) recipients.push({ kind: 'user', id: s, priority: 'cumulative' });
        }
      }
      for (const adminId of await getAllAdmins()) recipients.push({ kind: 'user', id: adminId, priority: 'periodic' });
      break;

    case 'class_created_by_teacher':
      if (p.classId) {
        const schoolId = await getSchoolForClass(p.classId);
        if (schoolId) recipients.push({ kind: 'school', id: schoolId, priority: 'immediate' });
      }
      for (const adminId of await getAllAdmins()) recipients.push({ kind: 'user', id: adminId, priority: 'periodic' });
      break;

    case 'class_created_by_school':
      if (p.classId) {
        const teacherId = await getTeacherForClass(p.classId);
        if (teacherId) recipients.push({ kind: 'user', id: teacherId, priority: 'immediate' });
      }
      for (const adminId of await getAllAdmins()) recipients.push({ kind: 'user', id: adminId, priority: 'periodic' });
      break;

    case 'class_frozen':
    case 'class_unfrozen':
      if (p.classId) {
        const teacherId = await getTeacherForClass(p.classId);
        const schoolId = await getSchoolForClass(p.classId);
        const students = await getStudentsForClass(p.classId);
        if (event.actorRole === 'school') {
          if (teacherId) recipients.push({ kind: 'user', id: teacherId, priority: 'immediate' });
          for (const s of students) recipients.push({ kind: 'user', id: s, priority: 'immediate' });
          if (schoolId) recipients.push({ kind: 'school', id: schoolId, priority: 'cumulative' });
        } else {
          for (const s of students) recipients.push({ kind: 'user', id: s, priority: 'immediate' });
          if (schoolId) recipients.push({ kind: 'school', id: schoolId, priority: 'cumulative' });
        }
      }
      for (const adminId of await getAllAdmins()) recipients.push({ kind: 'user', id: adminId, priority: 'periodic' });
      break;

    case 'user_blocked':
      if (p.userId) recipients.push({ kind: 'user', id: p.userId, priority: 'immediate' });
      if (p.schoolId) recipients.push({ kind: 'school', id: p.schoolId, priority: 'immediate' });
      for (const adminId of await getAllAdmins()) recipients.push({ kind: 'user', id: adminId, priority: 'periodic' });
      break;

    case 'user_unblocked':
      if (p.userId) recipients.push({ kind: 'user', id: p.userId, priority: 'immediate' });
      break;

    case 'user_banned_admin':
      if (p.userId) {
        recipients.push({ kind: 'user', id: p.userId, priority: 'immediate' });
        const schoolId = await getUserSchoolId(p.userId);
        if (schoolId) {
          recipients.push({ kind: 'school', id: schoolId, priority: 'immediate' });
          for (const teacherId of await getUsersForSchool(schoolId, 'teacher')) {
            recipients.push({ kind: 'user', id: teacherId, priority: 'cumulative' });
          }
        }
      }
      break;

    case 'school_deleted':
      if (p.schoolId) {
        recipients.push({ kind: 'school', id: p.schoolId, priority: 'immediate' });
        for (const userId of await getUsersForSchool(p.schoolId)) recipients.push({ kind: 'user', id: userId, priority: 'immediate' });
      }
      break;

    case 'quiz_created':
      if (p.classId) {
        for (const s of await getStudentsForClass(p.classId)) recipients.push({ kind: 'user', id: s, priority: 'immediate' });
        const schoolId = await getSchoolForClass(p.classId);
        if (schoolId) recipients.push({ kind: 'school', id: schoolId, priority: 'cumulative' });
      }
      break;

    case 'quiz_graded':
      if (p.studentId) recipients.push({ kind: 'user', id: p.studentId, priority: 'immediate' });
      if (p.classId) {
        const schoolId = await getSchoolForClass(p.classId);
        if (schoolId) recipients.push({ kind: 'school', id: schoolId, priority: 'cumulative' });
      }
      break;

    case 'penalty_created':
    case 'badge_awarded':
    case 'rating_given':
    case 'warning_sent':
      if (p.studentId) recipients.push({ kind: 'user', id: p.studentId, priority: 'immediate' });
      if (p.classId) {
        for (const s of await getStudentsForClass(p.classId)) {
          if (s !== p.studentId) recipients.push({ kind: 'user', id: s, priority: 'cumulative' });
        }
      }
      break;

    case 'alert_sent':
      if (p.classId) {
        const schoolId = await getSchoolForClass(p.classId);
        if (schoolId) recipients.push({ kind: 'school', id: schoolId, priority: 'cumulative' });
        for (const studentId of await getStudentsForClass(p.classId)) recipients.push({ kind: 'user', id: studentId, priority: 'immediate' });
      } else if (p.schoolId) {
        const targetRole = p.targetRole || 'teacher';
        if (targetRole === 'all') {
          for (const userId of await getUsersForSchool(p.schoolId)) recipients.push({ kind: 'user', id: userId, priority: 'immediate' });
        } else if (targetRole === 'teacher' || targetRole === 'student') {
          for (const userId of await getUsersForSchool(p.schoolId, targetRole)) recipients.push({ kind: 'user', id: userId, priority: 'immediate' });
        }
      }
      for (const adminId of await getAllAdmins()) recipients.push({ kind: 'user', id: adminId, priority: 'periodic' });
      break;

    case 'global_announcement':
      for (const userId of await getAllUsers()) recipients.push({ kind: 'user', id: userId, priority: 'immediate' });
      for (const schoolId of await getAllSchools()) recipients.push({ kind: 'school', id: schoolId, priority: 'immediate' });
      break;

    case 'system_alert':
      if (p.targetType === 'all' || !p.targetType) {
        for (const userId of await getAllUsers()) recipients.push({ kind: 'user', id: userId, priority: 'immediate' });
        for (const schoolId of await getAllSchools()) recipients.push({ kind: 'school', id: schoolId, priority: 'immediate' });
      } else if (p.targetType === 'admin') {
        for (const adminId of await getAllAdmins()) recipients.push({ kind: 'user', id: adminId, priority: 'immediate' });
      } else if (p.targetType === 'school' && p.schoolId) {
        recipients.push({ kind: 'school', id: p.schoolId, priority: 'immediate' });
      } else if (p.targetType === 'teacher' && p.schoolId) {
        for (const teacherId of await getUsersForSchool(p.schoolId, 'teacher')) recipients.push({ kind: 'user', id: teacherId, priority: 'immediate' });
      } else if (p.targetType === 'student' && p.schoolId) {
        for (const studentId of await getUsersForSchool(p.schoolId, 'student')) recipients.push({ kind: 'user', id: studentId, priority: 'immediate' });
      }
      break;

    case 'complaint_created':
      if (p.userId) recipients.push({ kind: 'user', id: p.userId, priority: 'immediate' });
      for (const adminId of await getAllAdmins()) recipients.push({ kind: 'user', id: adminId, priority: 'periodic' });
      break;

    case 'complaint_updated':
      if (p.userId) recipients.push({ kind: 'user', id: p.userId, priority: 'immediate' });
      break;

    case 'subscription_updated':
    case 'subscription_cancelled':
    case 'subscription_created':
      if (p.userId) recipients.push({ kind: 'user', id: p.userId, priority: 'immediate' });
      if (p.schoolId) recipients.push({ kind: 'school', id: p.schoolId, priority: 'immediate' });
      break;
  }

  // Deduplicate and exclude actor from same-kind recipients
  const seen = new Set<string>();
  const unique: Recipient[] = [];
  for (const r of recipients) {
    const key = `${r.kind}:${r.id}`;
    if (seen.has(key)) continue;
    if (r.kind === 'user' && r.id === event.actorId && (event.actorRole !== 'school')) continue;
    if (r.kind === 'school' && r.id === event.actorId && event.actorRole === 'school') continue;
    seen.add(key);
    unique.push(r);
  }
  return unique;
}

export async function dispatchEvent(event: DispatchEvent): Promise<void> {
  const { title, message } = buildText(event.type, event.actorName, event.payload);
  const recipients = await resolveRecipients(event);

  // Log the activity once
  const p = event.payload || {};
  const targetType = p.reportId ? 'report' : p.classId ? 'class' : p.userId ? 'user' : p.schoolId ? 'school' : p.quizId ? 'quiz' : 'system';
  const targetId = String(p.reportId || p.classId || p.userId || p.schoolId || p.quizId || event.actorId);
  await logActivity(
    event.actorRole === 'school' ? null : event.actorId,
    event.actorName,
    event.actorRole,
    `notification:${event.type}`,
    targetType,
    targetId,
    JSON.stringify(p)
  ).catch(() => {});

  await Promise.all(
    recipients.map(async (r) => {
      try {
        if (r.kind === 'user') {
          await createNotification({
            user_id: r.id,
            type: event.type,
            title,
            message,
            report_id: p.reportId,
            class_id: p.classId,
            priority: r.priority,
            quiz_id: p.quizId,
          });
        } else {
          await createSchoolNotification({
            school_id: r.id,
            type: event.type,
            title,
            message,
            priority: r.priority,
          });
        }
      } catch (err) {
        // Fail-safe: do not break the calling action
        console.error('[dispatch] failed to create notification', err);
      }
    })
  );
}
