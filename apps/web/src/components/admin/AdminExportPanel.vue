<script setup lang="ts">
import { ref } from 'vue';
import { useAdminExport } from '../../composables/admin/useAdminExport';

const { download } = useAdminExport();
const exporting = ref<string | null>(null);

async function doExport(type: string) {
  exporting.value = type;
  await download(type);
  exporting.value = null;
}

const types = [
  { key: 'users', label: '👥 المستخدمين', desc: 'كل المستخدمين مع أدوارهم' },
  { key: 'reports', label: '📋 التقارير', desc: 'كل التقارير مع درجاتها' },
  { key: 'classes', label: '🏫 الفصول', desc: 'كل الفصول مع طلابها' },
  { key: 'feedback', label: '💬 التقييمات', desc: 'كل التقييمات والشكاوى' },
  { key: 'activity', label: '📜 النشاط', desc: 'سجل النشاط كاملاً' },
];
</script>

<template>
  <div class="export-section">
    <h3>📤 تصدير البيانات</h3>
    <div class="export-grid">
      <div v-for="t in types" :key="t.key" class="export-card">
        <div class="export-icon">{{ t.label.split(' ')[0] }}</div>
        <div class="export-title">{{ t.label }}</div>
        <div class="export-desc">{{ t.desc }}</div>
        <button class="btn-export" :disabled="exporting === t.key" @click="doExport(t.key)">
          {{ exporting === t.key ? '⏳ ...' : '⬇️ تنزيل CSV' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.export-section { color: #e2e8f0; }
.export-section h3 { margin: 0 0 1rem; font-size: 1.1rem; }
.export-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
.export-card { background: rgba(15,23,42,0.5); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.6rem; padding: 1rem; text-align: center; }
.export-icon { font-size: 1.5rem; margin-bottom: 0.3rem; }
.export-title { font-weight: 700; font-size: 0.95rem; margin-bottom: 0.2rem; }
.export-desc { font-size: 0.8rem; color: #94a3b8; margin-bottom: 0.75rem; }
.btn-export { padding: 0.4rem 0.8rem; border-radius: 0.4rem; border: none; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; cursor: pointer; font-family: inherit; font-weight: 700; font-size: 0.8rem; }
.btn-export:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
