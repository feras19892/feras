# الخطة الجزء 2: Frontend — Services + Composables

## القواعد الصارمة
- أي ملف .ts > 200 سطر → فصله
- لا تضع منطق في Pages
- لا تكتب كود من عندك — انقل الأنماط

---

## 2.1 Services

### A. `web/src/services/report.service.ts` (~130 سطر)
**الملف:** `apps/web/src/services/report.service.ts`
**التعديل:** إضافة 7 حقول لـ `Report` interface + دوال جديدة

**Interfaces:**
```ts
export interface Report {
  id: number;
  student_id: number;
  student_name?: string;
  class_id: string;
  experiment_type: string;
  experiment_name: string;
  readings: string;
  params?: string;
  // جديد — 12 حقل:
  student_info?: string;
  conclusion?: string;
  conclusion_errors?: string;
  conclusion_improvements?: string;
  columns?: string;
  equations?: string;
  plots?: string;
  chart_snapshot?: string;
  status: 'draft' | 'submitted' | 'graded' | 'resubmitted';
  version: number;
  teacher_seen: boolean;
  grade?: number;
  feedback?: string;
  graded_by?: number;
  graded_by_name?: string;
  submitted_at?: string;
  graded_at?: string;
  created_at?: string;
}

export interface ReportComment {
  id: number; report_id: number; author_id: number; author_name: string;
  author_role: string; content: string; created_at: string;
}

export interface GradeHistoryEntry {
  id: number; report_id: number; teacher_id: number; teacher_name: string;
  old_grade?: number; new_grade: number; old_feedback?: string; new_feedback?: string;
  created_at: string;
}
```

**Functions:**
| Function | Method | Endpoint | Return |
|----------|--------|----------|--------|
| `createReport(data)` | POST | `/api/reports` | `{ success, report }` |
| `resubmitReport(id, data)` | POST | `/api/reports/{id}/resubmit` | `{ success, report }` |
| `getReports(params?)` | GET | `/api/reports` | `{ success, reports }` |
| `getReport(id)` | GET | `/api/reports/{id}` | `{ success, report }` |
| `markReportSeen(id)` | PATCH | `/api/reports/{id}/seen` | `{ success }` |
| `gradeReport(id, data)` | PATCH | `/api/reports/{id}/grade` | `{ success }` |
| `addComment(reportId, content)` | POST | `/api/reports/{id}/comments` | `{ success, comment }` |
| `getComments(reportId)` | GET | `/api/reports/{id}/comments` | `{ success, comments }` |
| `getGradeHistory(reportId)` | GET | `/api/reports/{id}/history` | `{ success, history }` |

### B. `web/src/services/notification.service.ts` (~40 سطر) NEW
**الملف:** `apps/web/src/services/notification.service.ts`

```ts
export interface Notification {
  id: number; type: string; title: string; message?: string;
  report_id?: number; class_id?: string; is_read: boolean; created_at: string;
}

export async function getNotifications() → GET /api/notifications
export async function getUnreadCount() → GET /api/notifications/unread-count
export async function markAsRead(id) → PATCH /api/notifications/{id}/read
export async function markAllAsRead() → PATCH /api/notifications/read-all
export async function deleteNotification(id) → DELETE /api/notifications/{id}
```

---

## 2.2 Composables

### A. `useNotifications.ts` (~60 سطر) NEW
**الملف:** `apps/web/src/composables/useNotifications.ts`

```ts
export function useNotifications() {
  const notifications = ref<Notification[]>([]);
  const unreadCount = ref(0);
  const loading = ref(false);

  async function loadNotifications();      // GET /api/notifications
  async function refreshUnread();          // GET /api/notifications/unread-count
  async function markAllRead();            // PATCH /read-all
  function startPolling(intervalMs = 30000);  // setInterval
  function stopPolling();                     // clearInterval

  onMounted(() => { loadNotifications(); startPolling(); });
  onUnmounted(() => stopPolling());

  return { notifications, unreadCount, loading, loadNotifications, markAllRead };
}
```

### B. `useReportSubmission.ts` (~80 سطر) NEW
**الملف:** `apps/web/src/composables/useReportSubmission.ts`

```ts
export function useReportSubmission() {
  const submitting = ref(false);
  const error = ref('');

  async function submitReport(data: {
    classId: string;
    experimentType: string;
    experimentName: string;
    readings: Record<string, unknown>[];
    params?: Record<string, unknown>;
    studentInfo: StudentInfo;
    conclusion: { conclusion: string; errors: string; improvements: string };
    columns: AnalysisColumnMeta[];
    equations: AnalysisEquation[];
    plots: AnalysisPlotConfig[];
    chartSnapshot?: string;
  }): Promise<boolean>;

  async function resubmitReport(reportId: number, data: {...}): Promise<boolean>;
}
```

### C. `useReportGrading.ts` (~100 سطر) NEW
**الملف:** `apps/web/src/composables/useReportGrading.ts`

```ts
export function useReportGrading() {
  const reports = ref<Report[]>([]);
  const selectedReport = ref<Report | null>(null);
  const comments = ref<ReportComment[]>([]);
  const history = ref<GradeHistoryEntry[]>([]);
  const loading = ref(false);

  async function loadClassReports(classId: string);
  async function selectReport(report: Report);   // تحميل comments + history
  async function grade(reportId: number, grade: number, feedback: string);
  async function addComment(reportId: number, content: string);
  async function loadComments(reportId: number);
  async function loadHistory(reportId: number);
  async function markSeen(reportId: number);
}
```

---

## 2.3 ملخص Services + Composables (5 ملف)

| # | الملف | النوع | الحجم |
|---|-------|-------|-------|
| 1 | `report.service.ts` | EDIT | 130 سطر |
| 2 | `notification.service.ts` | NEW | 40 سطر |
| 3 | `useNotifications.ts` | NEW | 60 سطر |
| 4 | `useReportSubmission.ts` | NEW | 80 سطر |
| 5 | `useReportGrading.ts` | NEW | 100 سطر |
