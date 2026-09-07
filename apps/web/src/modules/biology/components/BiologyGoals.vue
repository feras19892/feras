<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();

interface Goal {
  id: string;
  label: string;
  completed: boolean;
}

const props = defineProps<{
  title: string;
  goals: Goal[];
}>();
</script>

<template>
  <div class="bio-goals">
    <h5 class="bio-goals-title">{{ title }}</h5>
    <ul class="bio-goals-list">
      <li
        v-for="goal in props.goals"
        :key="goal.id"
        class="bio-goal-item"
        :class="{ completed: goal.completed }"
      >
        <span class="bio-goal-check" aria-hidden="true">{{ goal.completed ? '✅' : '⭕' }}</span>
        <span class="bio-goal-label">{{ goal.label }}</span>
        <span class="sr-only">{{ goal.completed ? `(${t('biology.completed')})` : `(${t('biology.notCompleted')})` }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.bio-goals {
  margin-top: 0.85rem;
  padding: 0.75rem;
  border-radius: 0.6rem;
  background: rgba(30, 41, 59, 0.55);
  border: 1px solid rgba(74, 222, 128, 0.15);
}
.bio-goals-title {
  margin: 0 0 0.5rem;
  font-size: 0.82rem;
  font-weight: 700;
  color: #4ade80;
}
.bio-goals-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.bio-goal-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.78rem;
  color: #cbd5e1;
  opacity: 0.85;
}
.bio-goal-item.completed {
  opacity: 1;
  color: #86efac;
}
.bio-goal-check {
  flex-shrink: 0;
  font-size: 0.9rem;
}
.bio-goal-label {
  line-height: 1.4;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
