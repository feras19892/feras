<script setup lang="ts">
defineProps<{ daily: Record<string, unknown> | null }>();
</script>

<template>
  <div v-if="daily" class="daily-report">
    <div class="stats-grid">
      <div class="stat-card"><span class="val">{{ (daily.summary as any)?.total_classes }}</span><span class="lbl">فصول</span></div>
      <div class="stat-card"><span class="val">{{ (daily.summary as any)?.reports_today }}</span><span class="lbl">تقارير اليوم</span></div>
      <div class="stat-card"><span class="val">{{ (daily.summary as any)?.graded_today }}</span><span class="lbl">صححت اليوم</span></div>
      <div class="stat-card warn" v-if="(daily.summary as any)?.pending_reports > 0"><span class="val">{{ (daily.summary as any)?.pending_reports }}</span><span class="lbl">معلقة</span></div>
      <div class="stat-card danger" v-if="(daily.summary as any)?.overdue_reports > 0"><span class="val">{{ (daily.summary as any)?.overdue_reports }}</span><span class="lbl">متأخرة</span></div>
    </div>

    <div class="section-title">تفاصيل الفصول — {{ (daily as any).date }}</div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>الفصل</th><th>المدرس</th><th>المدرسة</th><th>الطلاب</th><th>نشط اليوم</th><th>تقارير اليوم</th><th>صححت اليوم</th><th>معلقة</th><th>متأخرة</th><th>اختبارات اليوم</th><th>المشاكل</th></tr></thead>
        <tbody>
          <tr v-for="c in (daily.classes as any[])" :key="c.class_id" :class="{ 'row-frozen': c.is_frozen, 'row-inactive': !c.is_active }">
            <td class="name-cell"><div>{{ c.class_name }}</div><div class="code">{{ c.class_code }}</div></td>
            <td>{{ c.teacher_name }}</td><td>{{ c.school_name || '—' }}</td>
            <td>{{ c.student_count }}</td><td>{{ c.active_today }}</td>
            <td>{{ c.reports_today }}</td><td>{{ c.graded_today }}</td>
            <td :class="{ 'warn-text': c.pending_reports > 5 }">{{ c.pending_reports }}</td>
            <td :class="{ 'danger-text': c.overdue_reports > 0 }">{{ c.overdue_reports }}</td>
            <td>{{ c.quiz_submissions_today }}</td>
            <td>
              <div v-if="c.issues?.length" class="issues-list">
                <span v-for="(issue, i) in c.issues" :key="i" class="issue-tag">{{ issue }}</span>
              </div>
              <span v-else class="ok-tag">✓</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped src='../AdminDetailedReports.css'></style>
