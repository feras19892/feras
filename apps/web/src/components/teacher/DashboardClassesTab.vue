<script setup lang="ts">
import { useI18n } from '../../composables/useI18n'
import type { ClassRow } from '../../composables/teacher/useTeacherDashboard'

defineProps<{ rows: ClassRow[]; activeChatId?: string | null; unreadChatCounts?: Record<string, number> }>()
const emit = defineEmits<{ (e: 'navigate', tab: string): void; (e: 'open-chat', cls: { id: string; name: string }): void }>()
const { t } = useI18n()
</script>

<template>
  <div class="tab-panel">
    <div class="panel-card">
      <div class="pc-header"><h3>🏫 {{ t('dashboard.dash.classesReport') }}</h3></div>
      <div class="full-table">
        <table>
          <thead><tr>
            <th>{{ t('dashboard.dash.className') }}</th><th>{{ t('dashboard.dash.students') }}</th><th>{{ t('dashboard.dash.reports') }}</th><th>{{ t('dashboard.dash.graded') }}</th><th>{{ t('dashboard.dash.pending') }}</th><th>{{ t('dashboard.dash.average') }}</th><th>💬</th>
          </tr></thead>
          <tbody>
            <tr v-for="c in rows" :key="c.id" class="t-row">
              <td><span class="t-name">{{ c.name }}</span><code class="t-code">{{ c.code }}</code></td>
              <td>{{ c.studentCount }}</td><td>{{ c.totalReports }}</td>
              <td class="t-graded">{{ c.gradedCount }}</td>
              <td :class="{ 't-pending': c.pendingCount > 0 }">{{ c.pendingCount }}</td>
              <td :class="{ 't-avg': c.classAverage > 0 }">{{ c.classAverage > 0 ? c.classAverage + '%' : '—' }}</td>
              <td><button :class="['chat-td-btn', { active: activeChatId === c.id }]" @click.stop="emit('open-chat', { id: c.id, name: c.name })">💬
                <span v-if="unreadChatCounts && unreadChatCounts[c.id] > 0" class="chat-td-badge">{{ unreadChatCounts[c.id] }}</span>
              </button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel-card { background: rgba(15,23,42,0.5); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.8rem; padding: 1rem; margin-bottom: 0.8rem; }
.pc-header { margin-bottom: 0.6rem; }
.pc-header h3 { margin: 0; font-size: 0.9rem; font-weight: 700; color: #e5e7eb; }
.full-table { overflow-x: auto; }
.full-table table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
.full-table th { padding: 0.5rem 0.6rem; text-align: center; color: #475569; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.08); white-space: nowrap; }
.full-table th:first-child { text-align: start; }
.full-table td { padding: 0.45rem 0.6rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.04); color: #e2e8f0; }
.full-table td:first-child { text-align: start; }
.t-row { cursor: pointer; transition: background 0.12s; }
.t-row:hover { background: rgba(99,102,241,0.04); }
.t-name { font-weight: 700; color: #f1f5f9; display: block; }
.t-code { font-size: 0.68rem; color: #67e8f9; }
.t-graded { color: #4ade80; font-weight: 700; }
.t-pending { color: #fbbf24; font-weight: 700; }
.t-avg { color: #a5b4fc; font-weight: 700; }
.chat-td-btn { position: relative; width: 30px; height: 30px; border-radius: 0.4rem; border: 1px solid rgba(99,102,241,0.15); background: rgba(99,102,241,0.06); color: #c7d2fe; font-size: 0.9rem; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all 0.15s; padding: 0; }
.chat-td-btn:hover { background: rgba(99,102,241,0.15); border-color: rgba(99,102,241,0.3); }
.chat-td-btn.active { background: rgba(99,102,241,0.25); border-color: rgba(99,102,241,0.4); }
.chat-td-badge { position: absolute; top: -5px; inset-inline-end: -5px; min-width: 16px; height: 16px; border-radius: 999px; background: #ef4444; color: #fff; font-size: 0.6rem; font-weight: 800; display: flex; align-items: center; justify-content: center; padding: 0 3px; }
</style>
