# الخطة الجزء 1: Backend — Database + API

## القواعد الصارمة
- لا تُعدل migration قديم — أنشئ migration جديدة فقط
- أي ملف .ts > 200 سطر → فصله
- لا تكتب كود من عندك — انقل الأنماط الموجودة

---

## 1.1 Database Migration

**الملف:** `apps/api/src/db/migrations/003_enrich_reports.sql`
**الحجم:** ~55 سطر
**التبعيات:** `002_reports.sql` (يجب تطبيقه أولاً)

```sql
-- إثراء experiment_reports بـ 12 حقل جديد
ALTER TABLE experiment_reports ADD COLUMN student_info TEXT;
ALTER TABLE experiment_reports ADD COLUMN conclusion TEXT;
ALTER TABLE experiment_reports ADD COLUMN conclusion_errors TEXT;
ALTER TABLE experiment_reports ADD COLUMN conclusion_improvements TEXT;
ALTER TABLE experiment_reports ADD COLUMN columns TEXT;
ALTER TABLE experiment_reports ADD COLUMN equations TEXT;
ALTER TABLE experiment_reports ADD COLUMN plots TEXT;
ALTER TABLE experiment_reports ADD COLUMN chart_snapshot TEXT;
ALTER TABLE experiment_reports ADD COLUMN version INTEGER DEFAULT 1;
ALTER TABLE experiment_reports ADD COLUMN parent_id INTEGER;
ALTER TABLE experiment_reports ADD COLUMN teacher_seen INTEGER DEFAULT 0;
ALTER TABLE experiment_reports ADD COLUMN graded_by INTEGER;
ALTER TABLE experiment_reports ADD COLUMN graded_by_name TEXT;

-- جدول تعليقات
CREATE TABLE report_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  report_id INTEGER NOT NULL REFERENCES experiment_reports(id) ON DELETE CASCADE,
  author_id INTEGER NOT NULL REFERENCES users(id),
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL CHECK(author_role IN ('student','teacher','admin')),
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_comments_report ON report_comments(report_id);

-- جدول إشعارات
CREATE TABLE notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK(type IN ('report_submitted','report_graded','report_resubmitted','comment_added','class_joined')),
  title TEXT NOT NULL,
  message TEXT,
  report_id INTEGER,
  class_id TEXT,
  is_read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

-- جدول سجل التصحيح
CREATE TABLE grade_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  report_id INTEGER NOT NULL REFERENCES experiment_reports(id) ON DELETE CASCADE,
  teacher_id INTEGER NOT NULL,
  teacher_name TEXT NOT NULL,
  old_grade INTEGER,
  new_grade INTEGER NOT NULL,
  old_feedback TEXT,
  new_feedback TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_grade_history_report ON grade_history(report_id);

INSERT OR IGNORE INTO __migrations (name) VALUES ('003_enrich_reports.sql');
```

---

## 1.2 Reports Module

### A. `reports/schemas.ts` (~45 سطر)
**الملف:** `apps/api/src/modules/reports/schemas.ts`
**التعديل:** إضافة 7 حقول جديدة + `addCommentSchema`

```ts
import { z } from 'zod';

export const createReportSchema = z.object({
  class_id: z.string().min(1),
  experiment_type: z.string().min(1).max(50),
  experiment_name: z.string().min(1).max(100),
  readings: z.string(),
  params: z.string().optional(),
  // جديد — 7 حقول:
  student_info: z.string().optional(),
  conclusion: z.string().optional(),
  conclusion_errors: z.string().optional(),
  conclusion_improvements: z.string().optional(),
  columns: z.string().optional(),
  equations: z.string().optional(),
  plots: z.string().optional(),
  chart_snapshot: z.string().optional(),
});

export const gradeReportSchema = z.object({
  grade: z.number().int().min(0).max(100),
  feedback: z.string().max(2000).optional(),
});

export const addCommentSchema = z.object({
  content: z.string().min(1).max(2000),
});

export const listReportsQuery = z.object({
  class_id: z.string().optional(),
  student_id: z.string().optional(),
  status: z.enum(['draft','submitted','graded','resubmitted']).optional(),
});
```

### B. `reports/services.ts` (~180 سطر)
**الملف:** `apps/api/src/modules/reports/services.ts`
**التعديل:** `createReport` يستقبل 12 حقل + `resubmitReport` + `addComment` + `getComments` + `getGradeHistory` + `markReportAsSeen`

الدوال المطلوبة:
- `createReport(data)` — INSERT مع 16 حقل
- `resubmitReport(reportId, data)` — INSERT نسخة جديدة مع parent_id + version++
- `getReports(filters)` — SELECT موجود
- `getReportById(id)` — SELECT موجود
- `gradeReport(id, data, teacherId, teacherName)` — UPDATE + INSERT grade_history
- `markReportAsSeen(id)` — UPDATE teacher_seen = 1
- `addComment(reportId, data)` — INSERT report_comments
- `getComments(reportId)` — SELECT WHERE report_id
- `getGradeHistory(reportId)` — SELECT WHERE report_id ORDER BY created_at DESC
- `deleteReport(id, studentId?)` — موجود

### C. `reports/handlers.ts` (~160 سطر)
**الملف:** `apps/api/src/modules/reports/handlers.ts`
**التعديل:** إضافة 6 endpoints جديدة

| Method | Path | الوصف | RBAC |
|--------|------|-------|------|
| POST | `/api/reports` | إنشاء | student |
| POST | `/api/reports/:id/resubmit` | إعادة إرسال | student |
| GET | `/api/reports` | قائمة | student/teacher |
| GET | `/api/reports/:id` | تفاصيل | student/teacher |
| PATCH | `/api/reports/:id/seen` | كمفتوح | anyone |
| PATCH | `/api/reports/:id/grade` | تصحيح | teacher/admin |
| POST | `/api/reports/:id/comments` | تعليق | student/teacher |
| GET | `/api/reports/:id/comments` | تعليقات | student/teacher |
| GET | `/api/reports/:id/history` | سجل | teacher/admin |
| DELETE | `/api/reports/:id` | حذف | student (draft) |

---

## 1.3 Notifications Module (جديد)

### A. `notifications/schemas.ts` (~15 سطر)
**الملف:** `apps/api/src/modules/notifications/schemas.ts`

```ts
import { z } from 'zod';
export const createNotificationSchema = z.object({
  user_id: z.number().int(),
  type: z.enum(['report_submitted','report_graded','report_resubmitted','comment_added','class_joined']),
  title: z.string().min(1).max(200),
  message: z.string().max(1000).optional(),
  report_id: z.number().int().optional(),
  class_id: z.string().optional(),
});
```

### B. `notifications/services.ts` (~60 سطر)
**الملف:** `apps/api/src/modules/notifications/services.ts`

الدوال:
- `createNotification(data)` — INSERT
- `getUserNotifications(userId, limit=50)` — SELECT ORDER BY created_at DESC
- `getUnreadCount(userId)` — SELECT COUNT WHERE is_read = 0
- `markAsRead(id, userId)` — UPDATE
- `markAllAsRead(userId)` — UPDATE
- `deleteNotification(id, userId)` — DELETE

### C. `notifications/handlers.ts` (~60 سطر)
**الملف:** `apps/api/src/modules/notifications/handlers.ts`

| Method | Path | الوصف |
|--------|------|-------|
| GET | `/api/notifications` | قائمة |
| GET | `/api/notifications/unread-count` | العدد |
| PATCH | `/api/notifications/:id/read` | مقروء |
| PATCH | `/api/notifications/read-all` | الكل مقروء |
| DELETE | `/api/notifications/:id` | حذف |

### D. تسجيل في `api/src/index.ts`
```ts
import { notificationRoutes } from './modules/notifications/handlers.js';
app.route('/api/notifications', notificationRoutes);
```

---

## 1.4 ملخص Backend (12 ملف)

| # | الملف | النوع | الحجم |
|---|-------|-------|-------|
| 1 | `003_enrich_reports.sql` | NEW | 55 سطر |
| 2 | `reports/schemas.ts` | EDIT | 45 سطر |
| 3 | `reports/services.ts` | EDIT | 180 سطر |
| 4 | `reports/handlers.ts` | EDIT | 160 سطر |
| 5 | `notifications/schemas.ts` | NEW | 15 سطر |
| 6 | `notifications/services.ts` | NEW | 60 سطر |
| 7 | `notifications/handlers.ts` | NEW | 60 سطر |
| 8 | `api/src/index.ts` | EDIT | +1 سطر |
