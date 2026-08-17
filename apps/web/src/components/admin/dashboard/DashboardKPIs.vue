<script setup lang="ts">
interface Props {
  users: number;
  classes: number;
  reports: number;
  avgGrade: number;
  activeNow: number;
}
defineProps<Props>();
</script>

<template>
  <div class="kpis">
    <div class="kpi"><div class="kpi-n">{{ users }}</div><div class="kpi-l">إجمالي المستخدمين</div></div>
    <div class="kpi"><div class="kpi-n">{{ classes }}</div><div class="kpi-l">الفصول النشطة</div></div>
    <div class="kpi"><div class="kpi-n">{{ reports }}</div><div class="kpi-l">التقارير الكلية</div></div>
    <div class="kpi highlight"><div class="kpi-n">{{ avgGrade }}%</div><div class="kpi-l">المتوسط العام</div></div>
    <div class="kpi success"><div class="kpi-n">{{ activeNow }}</div><div class="kpi-l">نشط الآن</div></div>
  </div>
</template>

<style scoped>
.kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.8rem; margin-bottom: 1rem; }
.kpi { background: linear-gradient(135deg, rgba(15,23,42,0.6), rgba(30,41,59,0.4)); border: 1px solid rgba(255,255,255,0.1); border-radius: 0.6rem; padding: 1.2rem; text-align: center; transition: all 0.3s; }
.kpi:hover { transform: translateY(-2px); border-color: rgba(103,232,249,0.3); }
.kpi.highlight { border-color: #67e8f9; box-shadow: 0 0 20px rgba(103,232,249,0.15); }
.kpi.success { border-color: #34d399; box-shadow: 0 0 20px rgba(52,211,153,0.15); }
.kpi-n { font-size: 2.2rem; font-weight: 800; color: #67e8f9; line-height: 1; margin-bottom: 0.4rem; }
.kpi-l { font-size: 0.75rem; color: #94a3b8; font-weight: 500; }
</style>
