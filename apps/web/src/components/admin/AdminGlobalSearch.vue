<script setup lang="ts">
import { ref, computed } from 'vue';

interface SearchUser { id: number; name: string; email: string; role: string }
interface SearchClass { id: string; name: string; code: string; teacher_name?: string }
interface SearchReport { id: number; student_name: string; experiment_name: string; status: string }
interface SearchFeedback { id: number; user_name: string; message: string; type: string }

const props = defineProps<{
  users: SearchUser[];
  classes: SearchClass[];
  reports: SearchReport[];
  feedback: SearchFeedback[];
}>();

const emit = defineEmits<{
  (e: 'selectUser', id: number): void;
}>();

const query = ref('');
const showResults = ref(false);

const results = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q || q.length < 2) return [];

  const list: { type: string; title: string; subtitle: string; id: number | string }[] = [];

  // Users
  for (const u of props.users) {
    if ((u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q) || String(u.id).includes(q)) {
      list.push({ type: 'user', title: u.name, subtitle: `${u.email} (${u.role})`, id: u.id });
    }
  }

  // Classes
  for (const c of props.classes) {
    if ((c.name || '').toLowerCase().includes(q) || (c.code || '').toLowerCase().includes(q)) {
      list.push({ type: 'class', title: c.name, subtitle: `كود: ${c.code} — ${c.teacher_name || ''}`, id: c.id });
    }
  }

  // Reports
  for (const r of props.reports) {
    if ((r.student_name || '').toLowerCase().includes(q) || (r.experiment_name || '').toLowerCase().includes(q)) {
      list.push({ type: 'report', title: r.experiment_name, subtitle: `طالب: ${r.student_name} — ${r.status}`, id: r.id });
    }
  }

  // Feedback
  for (const f of props.feedback) {
    if ((f.user_name || '').toLowerCase().includes(q) || (f.message || '').toLowerCase().includes(q)) {
      list.push({ type: 'feedback', title: f.user_name, subtitle: `${f.type}: ${f.message?.slice(0, 40) || ''}...`, id: f.id });
    }
  }

  return list.slice(0, 15);
});

function iconFor(type: string) {
  switch (type) {
    case 'user': return '👤';
    case 'class': return '🏫';
    case 'report': return '📋';
    case 'feedback': return '💬';
    default: return '•';
  }
}

function onSelect(r: { type: string; id: number | string }) {
  if (r.type === 'user') emit('selectUser', Number(r.id));
  query.value = '';
  showResults.value = false;
}

function onBlur() {
  setTimeout(() => { showResults.value = false; }, 200);
}
</script>

<template>
  <div class="global-search">
    <input
      v-model="query"
      placeholder="🔍 بحث سريع عن مستخدم، فصل، تقرير..."
      @focus="showResults = true"
      @blur="onBlur"
    />
    <div v-if="showResults && query.trim().length >= 2" class="results-dropdown">
      <div v-if="results.length === 0" class="no-results">لا توجد نتائج</div>
      <div
        v-for="r in results"
        :key="r.type + r.id"
        class="result-item"
        @click="onSelect(r)"
      >
        <span class="result-icon">{{ iconFor(r.type) }}</span>
        <div class="result-text">
          <div class="result-title">{{ r.title }}</div>
          <div class="result-subtitle">{{ r.subtitle }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.global-search { position: relative; max-width: 400px; flex: 1; }
.global-search input {
  width: 100%; padding: 0.5rem 1rem; border-radius: 0.5rem;
  border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3);
  color: #e2e8f0; font-family: inherit; font-size: 0.9rem;
}
.global-search input::placeholder { color: #64748b; }
.results-dropdown {
  position: absolute; top: calc(100% + 4px); left: 0; right: 0;
  background: #111827; border: 1px solid rgba(255,255,255,0.08);
  border-radius: 0.5rem; box-shadow: 0 12px 32px rgba(0,0,0,0.5);
  z-index: 100; max-height: 300px; overflow-y: auto;
}
.result-item {
  display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem 0.8rem;
  cursor: pointer; transition: background 0.15s; border-bottom: 1px solid rgba(255,255,255,0.04);
}
.result-item:hover { background: rgba(99,102,241,0.1); }
.result-icon { font-size: 1.1rem; flex-shrink: 0; }
.result-text { flex: 1; min-width: 0; }
.result-title { font-weight: 700; font-size: 0.85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.result-subtitle { font-size: 0.75rem; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.no-results { padding: 1rem; text-align: center; color: #64748b; font-size: 0.85rem; }
</style>
