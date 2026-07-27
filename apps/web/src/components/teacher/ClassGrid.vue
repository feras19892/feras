<script setup lang="ts">
import { useI18n } from '../../composables/useI18n'
import type { ClassItem } from '../../services/class.service'

interface ClassStatItem { student_count: number; total_reports: number; pending_count: number; class_average: number }

defineProps<{
  classes: ClassItem[]
  activeId: string | null
  classStats: Record<string, ClassStatItem>
}>()

const emit = defineEmits<{
  (e: 'open', id: string): void
  (e: 'copy', code: string): void
  (e: 'delete', id: string): void
  (e: 'rename', cls: ClassItem): void
}>()

const { t } = useI18n()
</script>

<template>
  <section class="classes-section">
    <h3 class="section-title">{{ t('teacher.myClassesTitle') }}</h3>
    <div class="classes-grid">
      <button
        v-for="cls in classes"
        :key="cls.id"
        class="class-card"
        :class="{ active: activeId === cls.id }"
        type="button"
        @click="emit('open', cls.id)"
      >
        <div class="class-card-header">
          <span class="class-card-icon">📚</span>
          <div class="class-card-text">
            <span class="class-card-name">{{ cls.name }}</span>
            <span class="class-card-meta">
              <span class="badge-code">{{ cls.code }}</span>
              <span v-if="classStats[cls.id]" class="badge-soft">
                {{ classStats[cls.id].student_count }} {{ t('teacher.studentsLabel') }} ·
                {{ classStats[cls.id].total_reports }} {{ t('teacher.reportsStat') }}
              </span>
            </span>
          </div>
        </div>
        <div class="class-card-footer">
          <button class="card-action" type="button" @click.stop="emit('copy', cls.code)" :title="t('dashboard.copyCode')">📋</button>
          <button class="card-action" type="button" @click.stop="emit('rename', cls)" :title="t('dashboard.renameClass')">✏️</button>
          <button class="card-action danger" type="button" @click.stop="emit('delete', cls.id)" :title="t('dashboard.deleteClass')">🗑️</button>
        </div>
      </button>
    </div>
  </section>
</template>

<style scoped>
.classes-section { margin-bottom: 1.5rem; }
.section-title { margin: 0 0 0.75rem; font-size: 0.95rem; color: #9ca3af; font-weight: 600; }
.classes-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.9rem; }

.class-card {
  position: relative; display: flex; flex-direction: column; justify-content: space-between;
  padding: 0.9rem 1rem; border-radius: 0.9rem; border: 1px solid rgba(148, 163, 184, 0.4);
  background: radial-gradient(circle at top left, rgba(59, 130, 246, 0.18), rgba(15, 23, 42, 0.98));
  color: #e5e7eb; cursor: pointer;
  transition: transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease;
}
.class-card:hover { transform: translateY(-2px); border-color: rgba(129, 140, 248, 0.9); box-shadow: 0 14px 30px rgba(15, 23, 42, 0.9); }
.class-card.active { border-color: rgba(96, 165, 250, 1); box-shadow: 0 18px 40px rgba(15, 23, 42, 0.95); }
.class-card-header { display: flex; gap: 0.6rem; }
.class-card-icon { font-size: 1.3rem; }
.class-card-text { display: flex; flex-direction: column; gap: 0.15rem; }
.class-card-name { font-size: 0.98rem; font-weight: 700; }
.class-card-meta { display: flex; flex-wrap: wrap; gap: 0.3rem; align-items: center; }
.badge-code { font-size: 0.78rem; padding: 0.15rem 0.55rem; border-radius: 999px; border: 1px solid rgba(56, 189, 248, 0.6); background: rgba(15, 23, 42, 0.9); font-family: monospace; letter-spacing: 1px; }
.badge-soft { font-size: 0.78rem; color: #9ca3af; }
.class-card-footer { margin-top: 0.6rem; display: flex; justify-content: flex-end; gap: 0.35rem; }
.card-action { border: none; border-radius: 0.5rem; padding: 0.25rem 0.5rem; background: rgba(15, 23, 42, 0.9); color: #9ca3af; font-size: 0.8rem; cursor: pointer; transition: all 0.15s; }
.card-action:hover { background: rgba(148, 163, 184, 0.2); color: #e5e7eb; }
.card-action.danger:hover { background: rgba(239, 68, 68, 0.18); color: #fecaca; }
</style>
