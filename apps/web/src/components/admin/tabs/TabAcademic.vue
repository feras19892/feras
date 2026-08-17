<script setup lang="ts">
import type { AcademicTracking } from '../dashboard/useAdminDashboard';
import { healthLabel, healthClass } from '../dashboard/useAdminDashboard';

defineProps<{
  academic: AcademicTracking | null;
  academicGlobal: AcademicTracking['global'] | null;
  classHealth: AcademicTracking['class_health'] | null;
}>();
</script>

<template>
  <div class="tab-content">
    <div v-if="academic">
      <div class="hero-stats" v-if="academicGlobal">
        <div class="hero-card primary">
          <div class="hero-icon">🎓</div>
          <div class="hero-body">
            <div class="hero-label">إجمالي الطلاب</div>
            <div class="hero-value">{{ academicGlobal.total_students }}</div>
          </div>
        </div>
        <div class="hero-card">
          <div class="hero-icon">👨‍🏫</div>
          <div class="hero-body">
            <div class="hero-label">إجمالي المدرسين</div>
            <div class="hero-value">{{ academicGlobal.total_teachers }}</div>
          </div>
        </div>
        <div class="hero-card">
          <div class="hero-icon">📚</div>
          <div class="hero-body">
            <div class="hero-label">إجمالي الفصول</div>
            <div class="hero-value">{{ academicGlobal.total_classes }}</div>
          </div>
        </div>
        <div class="hero-card">
          <div class="hero-icon">📄</div>
          <div class="hero-body">
            <div class="hero-label">إجمالي التقارير</div>
            <div class="hero-value">{{ academicGlobal.total_reports }}</div>
            <div class="hero-sub">{{ academicGlobal.total_graded }} مصحح • {{ academicGlobal.total_pending }} معلق • {{ academicGlobal.total_overdue }} متأخر</div>
          </div>
        </div>
        <div class="hero-card accent">
          <div class="hero-icon">🎯</div>
          <div class="hero-body">
            <div class="hero-label">المتوسط العام</div>
            <div class="hero-value">{{ academicGlobal.global_avg }}%</div>
          </div>
        </div>
      </div>

      <div class="class-health-grid" v-if="classHealth">
        <div class="health-badge success">
          <div class="health-badge-icon">✅</div>
          <div class="health-badge-count">{{ classHealth.healthy }}</div>
          <div class="health-badge-label">فصول سليمة</div>
        </div>
        <div class="health-badge warn">
          <div class="health-badge-icon">⚠️</div>
          <div class="health-badge-count">{{ classHealth.warning }}</div>
          <div class="health-badge-label">فصول تحت تحذير</div>
        </div>
        <div class="health-badge danger">
          <div class="health-badge-icon">🚨</div>
          <div class="health-badge-count">{{ classHealth.critical }}</div>
          <div class="health-badge-label">فصول حرجة</div>
        </div>
        <div class="health-badge inactive">
          <div class="health-badge-icon">💤</div>
          <div class="health-badge-count">{{ classHealth.inactive }}</div>
          <div class="health-badge-label">فصول غير نشطة</div>
        </div>
      </div>

      <div class="modern-card full">
        <h3>📋 الأداء الأكاديمي للفصول</h3>
        <div class="academic-table-header">
          <div class="academic-col-h name">الفصل</div>
          <div class="academic-col-h">المدرس</div>
          <div class="academic-col-h">الطلاب</div>
          <div class="academic-col-h">التقارير</div>
          <div class="academic-col-h">معلق</div>
          <div class="academic-col-h">متأخر</div>
          <div class="academic-col-h">اختبارات</div>
          <div class="academic-col-h">المتوسط</div>
          <div class="academic-col-h">الحالة</div>
        </div>
        <div class="academic-table">
          <div v-for="cls in academic.classes" :key="cls.id" class="academic-row">
            <div class="academic-col name">
              {{ cls.name }}
              <span class="academic-code" v-if="cls.code">({{ cls.code }})</span>
            </div>
            <div class="academic-col">{{ cls.teacher_name || '—' }}</div>
            <div class="academic-col">{{ cls.student_count }}</div>
            <div class="academic-col">{{ cls.report_count }}</div>
            <div class="academic-col warn" v-if="cls.pending_count > 0">{{ cls.pending_count }}</div>
            <div class="academic-col" v-else>0</div>
            <div class="academic-col danger" v-if="cls.overdue_count > 0">{{ cls.overdue_count }}</div>
            <div class="academic-col" v-else>0</div>
            <div class="academic-col">{{ cls.quiz_count }}</div>
            <div class="academic-col grade" :class="{ success: cls.avg_grade >= 70, warn: cls.avg_grade < 70 && cls.avg_grade >= 50, danger: cls.avg_grade < 50 }">
              {{ cls.avg_grade }}%
            </div>
            <div class="academic-col">
              <span class="health-tag" :class="healthClass(cls.health_status)">{{ healthLabel(cls.health_status) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="empty-state">
      <div class="empty-icon">🎓</div>
      <h3>لا توجد بيانات أكاديمية</h3>
      <p>لم يتم تحميل بيانات تتبع الفصول</p>
    </div>
  </div>
</template>

<style scoped>
.hero-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.2rem; margin-bottom: 1.5rem; }
.hero-card { display: flex; align-items: center; gap: 1rem; background: rgba(255,255,255,0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); border-radius: 1rem; padding: 1.5rem; transition: all 0.3s; }
.hero-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
.hero-card.primary { background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1)); border-color: rgba(99,102,241,0.3); }
.hero-card.accent { background: linear-gradient(135deg, rgba(34,211,238,0.1), rgba(59,130,246,0.1)); border-color: rgba(34,211,238,0.3); }
.hero-icon { font-size: 2rem; flex-shrink: 0; }
.hero-body { flex: 1; min-width: 0; }
.hero-label { font-size: 0.8rem; color: #94a3b8; font-weight: 500; margin-bottom: 0.5rem; }
.hero-value { font-size: 2.2rem; font-weight: 800; color: #e2e8f0; line-height: 1; margin-bottom: 0.5rem; }
.hero-sub { font-size: 0.75rem; color: #64748b; }
.class-health-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
.health-badge { display: flex; flex-direction: column; align-items: center; gap: 0.3rem; padding: 1.2rem; border-radius: 0.8rem; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.02); }
.health-badge.success { border-color: rgba(52,211,153,0.3); background: rgba(52,211,153,0.05); }
.health-badge.warn { border-color: rgba(251,191,36,0.3); background: rgba(251,191,36,0.05); }
.health-badge.danger { border-color: rgba(239,68,68,0.3); background: rgba(239,68,68,0.05); }
.health-badge.inactive { border-color: rgba(148,163,184,0.3); background: rgba(148,163,184,0.05); }
.health-badge-icon { font-size: 1.5rem; }
.health-badge-count { font-size: 2rem; font-weight: 800; color: #e2e8f0; }
.health-badge.success .health-badge-count { color: #34d399; }
.health-badge.warn .health-badge-count { color: #fbbf24; }
.health-badge.danger .health-badge-count { color: #f87171; }
.health-badge.inactive .health-badge-count { color: #94a3b8; }
.health-badge-label { font-size: 0.8rem; color: #94a3b8; }
.modern-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 1rem; padding: 1.5rem; }
.modern-card.full { grid-column: 1 / -1; }
.modern-card h3 { margin: 0 0 1rem; font-size: 1rem; font-weight: 700; color: #e2e8f0; }
.academic-table-header { display: grid; grid-template-columns: 2fr 1.2fr 0.8fr 0.8fr 0.6fr 0.6fr 0.6fr 0.8fr 0.8fr; gap: 0.5rem; padding: 0.75rem; background: rgba(99,102,241,0.08); border-radius: 0.5rem; margin-bottom: 0.5rem; font-size: 0.75rem; font-weight: 700; color: #a5b4fc; }
.academic-table { display: flex; flex-direction: column; gap: 0.4rem; }
.academic-row { display: grid; grid-template-columns: 2fr 1.2fr 0.8fr 0.8fr 0.6fr 0.6fr 0.6fr 0.8fr 0.8fr; gap: 0.5rem; padding: 0.75rem; background: rgba(255,255,255,0.02); border-radius: 0.5rem; align-items: center; }
.academic-row:hover { background: rgba(255,255,255,0.04); }
.academic-col { font-size: 0.8rem; color: #cbd5e1; }
.academic-col.name { font-weight: 600; color: #e2e8f0; }
.academic-col.grade { font-weight: 700; font-size: 0.9rem; }
.academic-col.success { color: #34d399; }
.academic-col.warn { color: #fbbf24; }
.academic-col.danger { color: #f87171; }
.academic-code { font-size: 0.7rem; color: #64748b; }
.academic-col-h { text-align: center; }
.academic-col-h.name { text-align: right; }
.health-tag { display: inline-block; padding: 0.15rem 0.6rem; border-radius: 1rem; font-size: 0.7rem; font-weight: 700; }
.health-tag.success { background: rgba(52,211,153,0.15); color: #34d399; }
.health-tag.warn { background: rgba(251,191,36,0.15); color: #fbbf24; }
.health-tag.danger { background: rgba(239,68,68,0.15); color: #f87171; }
.health-tag.inactive { background: rgba(148,163,184,0.15); color: #94a3b8; }
.empty-state { text-align: center; padding: 4rem 2rem; }
.empty-icon { font-size: 4rem; margin-bottom: 1rem; }
.empty-state h3 { font-size: 1.5rem; color: #e2e8f0; margin-bottom: 0.5rem; }
.empty-state p { color: #94a3b8; font-size: 0.95rem; }
</style>
