import type { OpenLabReportOptions } from './lab-report.types'

/**
 * Builds the "Send to Teacher" inline script for the popup report window.
 *
 * For logged-in students it POSTs the report to the real reports API
 * (`POST /api/reports`), matching the `createReportSchema` payload so the
 * report reaches the teacher dashboard, reports store and grading queue.
 * Guests (no access token / no class) keep the legacy local fallback.
 */
export function buildSendScript(options: OpenLabReportOptions): string {
  const apiBase = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '')

  const payload = {
    title: options.title,
    experimentName: options.experimentName || options.title,
    experimentType: options.experimentType || 'physics',
    params: options.params || [],
    summaryStats: options.summaryStats || [],
    tables: options.tables || [],
    htmlBlocks: (options.htmlBlocks || []).map(b => ({ title: b.title || '', html: b.html })),
    canvasSnapshot: options.canvasSnapshot?.startsWith('data:image') ? options.canvasSnapshot : null,
    submittedAt: new Date().toISOString(),
  }

  // Embed the payload as a JavaScript object literal. We escape <, > and &
  // so the HTML parser can never break out of the inline <script> tag, and
  // `&quot;`-style entity escaping (broken in scripts) is avoided entirely.
  function safeJs(src: string): string {
    return src
      .replace(/</g, '\\u003c')
      .replace(/>/g, '\\u003e')
      .replace(/&/g, '\\u0026')
      .replace(/\u2028/g, '\\u2028')
      .replace(/\u2029/g, '\\u2029')
  }
  const dataLiteral = safeJs(JSON.stringify(payload))
  const apiBaseLiteral = safeJs(JSON.stringify(apiBase))

  const s = options.strings || {}
  const btnLabel = s.sendToTeacherBtn ?? '📤 Send to Teacher'
  const guestStudent = s.guestStudent ?? 'Guest Student'
  const joinClassMsg = s.joinClassFirst ?? 'You must join a class first'
  const sentLabel = s.sentSuccessfully ?? '✅ Sent'
  const sentSuccessMsg = s.reportSentSuccess ?? 'Report sent to teacher successfully!'
  const errorLabel = s.errorLabel ?? 'Error: '
  const loginFirstMsg = s.loginFirst ?? 'Please sign in and join a class to share your report'

  return `<button id="btn-send" class="btn-send-teacher" type="button" onclick="sendToTeacher()">${btnLabel}</button>
<script>
const data = ${dataLiteral};
const API_BASE = ${apiBaseLiteral};
function __stripReportTags(html) {
  try {
    const div = document.createElement('div');
    div.innerHTML = html || '';
    return (div.textContent || '').replace(/\\s+/g, ' ').trim();
  } catch (e) { return ''; }
}
async function sendToTeacher() {
  const btn = document.getElementById('btn-send');
  if (!btn || btn.disabled) return;
  try {
    const accessToken = localStorage.getItem('auth_access_token') || null;
    const rawClasses = localStorage.getItem('auth_classes');
    let classInfo = null;
    if (rawClasses) {
      try { classInfo = (JSON.parse(rawClasses) || [])[0] || null; } catch (e) { classInfo = null; }
    }

    const readings = [];
    (data.tables || []).forEach(function (t) {
      (t.rows || []).forEach(function (row, i) {
        const obj = { '#': i + 1 };
        (t.headers || []).forEach(function (h, hi) {
          obj[String(h)] = row[hi] !== undefined && row[hi] !== null ? String(row[hi]) : '';
        });
        readings.push(obj);
      });
    });

    const notesText = (data.htmlBlocks || [])
      .map(b => (b.title || '') + '\\n' + __stripReportTags(b.html))
      .join('\\n\\n').slice(0, 5000);

    const studentInfo = {};
    try {
      const rawUser = localStorage.getItem('auth_user');
      if (rawUser) {
        const u = JSON.parse(rawUser);
        if (u.name) studentInfo.name = u.name;
        if (u.email) studentInfo.email = u.email;
      }
      if (classInfo && classInfo.name) studentInfo.class = classInfo.name;
    } catch (e) { /* ignore */ }

    if (accessToken && classInfo && classInfo.id) {
      const body = {
        class_id: String(classInfo.id),
        experiment_type: String(data.experimentType || 'physics').slice(0, 50),
        experiment_name: String(data.experimentName || data.title || 'Experiment').slice(0, 100),
        readings: JSON.stringify(readings),
        params: data.params && data.params.length ? JSON.stringify(data.params) : undefined,
        student_info: Object.keys(studentInfo).length ? JSON.stringify(studentInfo) : undefined,
        conclusion: notesText || undefined,
        chart_snapshot: data.canvasSnapshot || undefined,
      };
      const headers = {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Authorization': 'Bearer ' + accessToken,
      };
      const res = await fetch(API_BASE + '/api/reports', {
        method: 'POST',
        headers: headers,
        credentials: 'include',
        body: JSON.stringify(body),
      });
      let json = {};
      try { json = await res.json(); } catch (e) { json = {}; }
      if (res.ok && json.success) {
        btn.disabled = true;
        btn.className = 'btn-sent';
        btn.textContent = '${sentLabel}';
        alert('${sentSuccessMsg}');
      } else if (res.status === 401 || res.status === 403) {
        alert('${loginFirstMsg}');
      } else {
        alert('${errorLabel}' + (json.message || ('HTTP ' + res.status)));
      }
      return;
    }

    // Guest fallback: keep a local copy so guest dashboards still work.
    const report = {
      id: 'guest-report-' + Date.now(),
      attemptId: Date.now(),
      experimentId: 0,
      experimentTitle: data.experimentName || data.title,
      branch: String(data.experimentType || 'physics'),
      studentName: '${guestStudent}',
      classCode: classInfo ? classInfo.code || '' : '',
      classId: classInfo ? classInfo.id || '' : '',
      notes: notesText,
      readings: readings,
      completedSteps: [],
      status: 'submitted',
      submittedAt: data.submittedAt,
    };
    if (classInfo && classInfo.code) {
      try {
        const reports = JSON.parse(localStorage.getItem('physlab_guest_reports') || '[]');
        reports.push(report);
        localStorage.setItem('physlab_guest_reports', JSON.stringify(reports));
        const teacherClasses = JSON.parse(localStorage.getItem('physlab_guest_classes') || '[]');
        const cls = teacherClasses.find(c => c.id === classInfo.id || c.code === classInfo.code);
        if (cls && cls.students) {
          const stu = cls.students.find(ss => ss.name === '${guestStudent}');
          if (stu) {
            if (!stu.reports) stu.reports = [];
            stu.reports.push(report);
            stu.reportCount = stu.reports.length;
            localStorage.setItem('physlab_guest_classes', JSON.stringify(teacherClasses));
          }
        }
      } catch (e) { /* ignore */ }
      btn.disabled = true;
      btn.className = 'btn-sent';
      btn.textContent = '${sentLabel}';
      alert('${sentSuccessMsg}');
    } else {
      alert('${joinClassMsg}');
    }
  } catch (e) {
    alert('${errorLabel}' + (e && e.message ? e.message : e));
  }
}
</script>`
}