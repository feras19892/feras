<script setup lang="ts">
defineProps<{ stats: Record<string, unknown> | null }>();
</script>

<template>
  <div v-if="stats" class="overview">
    <!-- Users Section -->
    <div class="section-title">👥 المستخدمون</div>
    <div class="stats-grid">
      <div class="stat-card"><span class="val">{{ (stats.totals as any)?.users }}</span><span class="lbl">إجمالي المستخدمين</span></div>
      <div class="stat-card"><span class="val">{{ (stats.totals as any)?.students }}</span><span class="lbl">طلاب</span></div>
      <div class="stat-card"><span class="val">{{ (stats.totals as any)?.teachers }}</span><span class="lbl">مدرسين</span></div>
      <div class="stat-card"><span class="val">{{ (stats.totals as any)?.schools }}</span><span class="lbl">مدارس</span></div>
      <div class="stat-card success"><span class="val">{{ (stats.totals as any)?.active_users }}</span><span class="lbl">مستخدمين نشطين</span></div>
      <div class="stat-card active-now"><span class="val">{{ (stats.totals as any)?.active_now }}</span><span class="lbl">نشط الآن</span></div>
      <div class="stat-card success"><span class="val">{{ (stats.totals as any)?.today_logins }}</span><span class="lbl">دخول اليوم</span></div>
      <div class="stat-card"><span class="val">{{ (stats.totals as any)?.sessions }}</span><span class="lbl">إجمالي الجلسات</span></div>
    </div>

    <!-- Academic Section -->
    <div class="section-title">📚 الأكاديمي</div>
    <div class="stats-grid">
      <div class="stat-card"><span class="val">{{ (stats.totals as any)?.classes }}</span><span class="lbl">فصول</span></div>
      <div class="stat-card"><span class="val">{{ (stats.totals as any)?.reports }}</span><span class="lbl">تقارير</span></div>
      <div class="stat-card"><span class="val">{{ (stats.totals as any)?.graded }}</span><span class="lbl">صححت</span></div>
      <div class="stat-card warn" v-if="(stats.totals as any)?.pending > 0"><span class="val">{{ (stats.totals as any)?.pending }}</span><span class="lbl">معلقة</span></div>
      <div class="stat-card danger" v-if="(stats.totals as any)?.overdue > 0"><span class="val">{{ (stats.totals as any)?.overdue }}</span><span class="lbl">متأخرة</span></div>
      <div class="stat-card"><span class="val">{{ (stats.totals as any)?.avg_grade }}</span><span class="lbl">المتوسط العام</span></div>
    </div>

    <!-- Activity Charts -->
    <div class="section-title">📊 النشاط</div>
    <div class="two-col">
      <div class="panel-box">
        <h4>⏰ النشاط بالساعة (اليوم)</h4>
        <div class="bar-chart" v-if="(stats.hourly_activity as any[])?.length">
          <div v-for="h in (stats.hourly_activity as any[])" :key="h.hour" class="bar-item">
            <div class="bar" :style="{ height: `${Math.min(100, (h.count / Math.max(1, ...((stats.hourly_activity as any[]).map(x => x.count)))) * 100)}px` }"></div>
            <span class="bar-label">{{ h.hour }}</span>
          </div>
        </div>
        <p v-else class="no-data">لا يوجد نشاط اليوم</p>
      </div>
      <div class="panel-box daily-panel">
        <h4>📅 النشاط اليومي (آخر 30 يوم)</h4>
        <div class="daily-chart" v-if="(stats.daily_activity as any[])?.length">
          <div class="daily-bars">
            <div
              v-for="d in (stats.daily_activity as any[])"
              :key="d.date"
              class="daily-bar-col"
              :class="{ today: d.date === new Date().toISOString().slice(0, 10) }"
            >
              <div class="daily-bar-tooltip">{{ d.date }} — {{ d.count }} نشاط</div>
              <div
                class="daily-bar-fill"
                :style="{ height: `${Math.max(4, (d.count / Math.max(1, ...((stats.daily_activity as any[]).map(x => x.count)))) * 120)}px` }"
              ></div>
              <span class="daily-bar-label">{{ d.date.slice(8) }}</span>
            </div>
          </div>
          <div class="daily-chart-axis">
            <span>أقدم</span>
            <span>اليوم</span>
          </div>
        </div>
        <p v-else class="no-data">لا يوجد نشاط</p>
      </div>
    </div>

    <!-- Distribution -->
    <div class="section-title">📋 التوزيع</div>
    <div class="two-col">
      <div class="panel-box">
        <h4>📝 التقارير حسب الحالة</h4>
        <div class="status-list" v-if="(stats.reports_by_status as any[])?.length">
          <div v-for="s in (stats.reports_by_status as any[])" :key="s.status" class="status-row">
            <span class="status-label">{{ s.status }}</span><span class="status-count">{{ s.count }}</span>
          </div>
        </div>
        <p v-else class="no-data">لا توجد تقارير</p>
      </div>
      <div class="panel-box">
        <h4>👤 المستخدمون حسب الدور</h4>
        <div class="status-list" v-if="(stats.users_by_role as any[])?.length">
          <div v-for="r in (stats.users_by_role as any[])" :key="r.role" class="status-row">
            <span class="status-label">{{ r.role }}</span><span class="status-count">{{ r.count }}</span>
          </div>
        </div>
        <p v-else class="no-data">لا توجد بيانات</p>
      </div>
    </div>

    <!-- Rankings -->
    <div class="section-title">🏆 الأكثر نشاطاً</div>
    <div class="two-col">
      <div class="panel-box">
        <h4>🏫 أكثر المدارس نشاطاً</h4>
        <table class="mini-table" v-if="(stats.top_schools as any[])?.length">
          <thead><tr><th>المدرسة</th><th>مستخدمين</th><th>فصول</th><th>تقارير</th><th>جلسات</th></tr></thead>
          <tbody><tr v-for="s in (stats.top_schools as any[])" :key="s.id"><td>{{ s.name }}</td><td>{{ s.user_count }}</td><td>{{ s.class_count }}</td><td>{{ s.report_count }}</td><td>{{ s.session_count }}</td></tr></tbody>
        </table>
        <p v-else class="no-data">لا توجد مدارس نشطة</p>
      </div>
      <div class="panel-box">
        <h4>📖 أكثر الفصول تقارير</h4>
        <table class="mini-table" v-if="(stats.top_classes as any[])?.length">
          <thead><tr><th>الفصل</th><th>المدرس</th><th>طلاب</th><th>تقارير</th></tr></thead>
          <tbody><tr v-for="c in (stats.top_classes as any[])" :key="c.id"><td>{{ c.name }}</td><td>{{ c.teacher_name }}</td><td>{{ c.student_count }}</td><td>{{ c.report_count }}</td></tr></tbody>
        </table>
        <p v-else class="no-data">لا توجد فصول لها تقارير</p>
      </div>
    </div>
  </div>
</template>

<style scoped src='../AdminDetailedReports.css'></style>
