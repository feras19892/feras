<template>
  <div class="dash-page">
    <h2>🏫 ربط المدرسة</h2>
    <p class="page-desc">مركز التواصل بين المدرس وإدارة المدرسة</p>

    <div class="info-grid">
      <div class="info-card">
        <h4>📋 طلبات الانضمام</h4>
        <p>طلبات الطلاب للانضمام لفصولك المعلقة للموافقة</p>
        <span class="badge">قريباً</span>
      </div>

      <div class="info-card">
        <h4>📨 رسائل إدارة المدرسة</h4>
        <p>الرسائل والتعليمات الواردة من إدارة المدرسة</p>
        <span class="badge">قريباً</span>
      </div>

      <div class="info-card">
        <h4>📊 تقارير الأداء</h4>
        <p>تقارير أداء الفصول المرسلة لإدارة المدرسة</p>
        <span class="badge">قريباً</span>
      </div>

      <div class="info-card">
        <h4>📅 الجدول الدراسي</h4>
        <p>الجدول الدراسي المحدد من إدارة المدرسة</p>
        <span class="badge">قريباً</span>
      </div>

      <div class="info-card">
        <h4>📢 إعلانات المدرسة</h4>
        <p>الإعلانات والتعاميم الصادرة من إدارة المدرسة</p>
        <span class="badge">قريباً</span>
      </div>

      <div class="info-card">
        <h4>⚙️ صلاحيات المدرس</h4>
        <p>الصلاحيات الممنوحة من إدارة المدرسة للمدرس</p>
        <span class="badge">قريباً</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
@import '@/assets/styles/dashboard-shared.css';
.dash-page { padding: 16px; color: var(--as-text); }
.dash-page > h2 { margin: 0 0 4px; font-size: 18px; color: var(--as-text); }
.page-desc { margin: 0 0 16px; font-size: 13px; color: var(--as-text-muted); }
.info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; }
.info-card { padding: 16px; border-radius: 14px; background: var(--as-surface); border: 1px solid var(--as-border); }
.info-card h4 { margin: 0 0 8px; font-size: 15px; color: var(--as-text); }
.info-card p { margin: 0 0 10px; font-size: 13px; color: var(--as-text-soft); }
.badge { display: inline-block; padding: 3px 10px; border-radius: 999px; background: rgba(139,92,246,0.15); color: var(--as-accent); font-size: 11px; font-weight: 600; }
</style>
