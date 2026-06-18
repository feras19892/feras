import type { OpenLabReportOptions } from './lab-report.types'

export function buildSendScript(options: OpenLabReportOptions): string {
  const payload = {
    title: options.title,
    experimentName: options.experimentName || options.title,
    params: options.params || [],
    summaryStats: options.summaryStats || [],
    tables: options.tables || [],
    images: (options.images || []).map(img => ({ caption: img.caption || '', src: img.src.slice(0, 100) })),
    htmlBlocks: (options.htmlBlocks || []).map(b => ({ title: b.title || '', html: b.html.slice(0, 500) })),
    canvasSnapshot: options.canvasSnapshot ? '[snapshot]' : null,
    submittedAt: new Date().toISOString(),
  }
  const payloadJson = JSON.stringify(payload).replace(/"/g, '&quot;')

  return `<button id="btn-send" class="btn-send-teacher" type="button" onclick="sendToTeacher()">📤 إرسال للمدرس</button>
<script>
function sendToTeacher() {
  const btn = document.getElementById('btn-send');
  if (btn.disabled) return;
  try {
    const data = JSON.parse("${payloadJson}");
    const studentName = 'طالب ضيف';
    const classInfoRaw = localStorage.getItem('auth_classes');
    const classes = classInfoRaw ? JSON.parse(classInfoRaw) : [];
    const classInfo = classes[0] || null;
    if (!classInfo || !classInfo.code) {
      alert('يجب الانضمام لفصل أولاً');
      return;
    }
    const report = {
      id: 'guest-report-' + Date.now(),
      attemptId: Date.now(),
      experimentId: 0,
      experimentTitle: data.experimentName || data.title,
      branch: 'فيزياء',
      studentName: studentName,
      classCode: classInfo.code,
      classId: classInfo.id,
      notes: data.htmlBlocks.map(b => (b.title || '') + '\\n' + b.html).join('\\n\\n'),
      readings: data.tables.flatMap(t => t.rows.map((row, i) => {
        const obj = { '#': i + 1 };
        t.headers.forEach((h, hi) => { obj[String(h)] = row[hi] !== undefined ? String(row[hi]) : ''; });
        return obj;
      })),
      completedSteps: [],
      status: 'submitted',
      submittedAt: data.submittedAt,
    };
    const reports = JSON.parse(localStorage.getItem('physlab_guest_reports') || '[]');
    reports.push(report);
    localStorage.setItem('physlab_guest_reports', JSON.stringify(reports));
    const teacherClasses = JSON.parse(localStorage.getItem('physlab_guest_classes') || '[]');
    const cls = teacherClasses.find(c => c.code === classInfo.code);
    if (cls && cls.students) {
      const stu = cls.students.find(s => s.name === studentName);
      if (stu) {
        if (!stu.reports) stu.reports = [];
        stu.reports.push(report);
        stu.reportCount = stu.reports.length;
        localStorage.setItem('physlab_guest_classes', JSON.stringify(teacherClasses));
      }
    }
    btn.disabled = true;
    btn.className = 'btn-sent';
    btn.textContent = '✅ تم الإرسال';
    alert('تم إرسال التقرير للمدرس بنجاح!');
  } catch (e) {
    alert('خطأ: ' + e.message);
  }
}
</script>`
}
