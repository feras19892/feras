<script setup lang="ts">
defineProps<{ academic: Record<string, unknown> | null }>();

function healthColor(status: string): string {
  switch (status) {
    case 'healthy': return '#22c55e';
    case 'warning': return '#f59e0b';
    case 'critical': return '#ef4444';
    case 'inactive': return '#64748b';
    default: return '#64748b';
  }
}

function healthLabel(status: string): string {
  switch (status) {
    case 'healthy': return 'سليم';
    case 'warning': return 'تحذير';
    case 'critical': return 'حرج';
    case 'inactive': return 'خامل';
    default: return status;
  }
}
</script>

<template>
  <div v-if="academic" class="academic">
    <div class="stats-grid">
      <div class="stat-card"><span class="val">{{ (academic.global as any)?.total_students }}</span><span class="lbl">طلاب</span></div>
      <div class="stat-card"><span class="val">{{ (academic.global as any)?.total_teachers }}</span><span class="lbl">مدرسين</span></div>
      <div class="stat-card"><span class="val">{{ (academic.global as any)?.total_classes }}</span><span class="lbl">فصول</span></div>
      <div class="stat-card"><span class="val">{{ (academic.global as any)?.total_reports }}</span><span class="lbl">تقارير</span></div>
      <div class="stat-card warn"><span class="val">{{ (academic.global as any)?.total_pending }}</span><span class="lbl">معلقة</span></div>
      <div class="stat-card danger"><span class="val">{{ (academic.global as any)?.total_overdue }}</span><span class="lbl">متأخرة</span></div>
      <div class="stat-card"><span class="val">{{ (academic.global as any)?.global_avg }}</span><span class="lbl">المتوسط العام</span></div>
    </div>

    <div class="health-grid">
      <div class="health-card healthy"><span class="val">{{ (academic.class_health as any)?.healthy }}</span><span class="lbl">سليمة</span></div>
      <div class="health-card warning"><span class="val">{{ (academic.class_health as any)?.warning }}</span><span class="lbl">تحذير</span></div>
      <div class="health-card critical"><span class="val">{{ (academic.class_health as any)?.critical }}</span><span class="lbl">حرجة</span></div>
      <div class="health-card inactive"><span class="val">{{ (academic.class_health as any)?.inactive }}</span><span class="lbl">خاملة</span></div>
    </div>

    <div class="section-title">حالة جميع الفصول</div>
    <div class="table-wrap" v-if="(academic.classes as any[])?.length">
      <table>
        <thead><tr><th>الفصل</th><th>المدرس</th><th>المدرسة</th><th>الطلاب</th><th>التقارير</th><th>معلقة</th><th>متأخرة</th><th>المتوسط</th><th>اختبارات</th><th>الحالة</th></tr></thead>
        <tbody>
          <tr v-for="c in (academic.classes as any[])" :key="c.id">
            <td class="name-cell"><div>{{ c.name }}</div><div class="code">{{ c.code }}</div></td>
            <td>{{ c.teacher_name }}</td><td>{{ c.school_name || '—' }}</td>
            <td>{{ c.student_count }}</td><td>{{ c.report_count }}</td>
            <td :class="{ 'warn-text': c.pending_count > 5 }">{{ c.pending_count }}</td>
            <td :class="{ 'danger-text': c.overdue_count > 0 }">{{ c.overdue_count }}</td>
            <td>{{ c.avg_grade || '—' }}</td><td>{{ c.quiz_count }}</td>
            <td><span class="health-badge" :style="{ background: healthColor(c.health_status) + '22', color: healthColor(c.health_status) }">{{ healthLabel(c.health_status) }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else class="no-data">لا توجد فصول</p>
  </div>
</template>

<style scoped src='../AdminDetailedReports.css'></style>
