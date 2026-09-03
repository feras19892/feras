<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSchoolHelp } from '@/composables/school/useSchoolHelp'
import HelpModal from '@/components/shared/HelpModal.vue'

const props = defineProps<{
  tabId: string
}>()

const show = ref(false)
const help = computed(() => useSchoolHelp(props.tabId))
</script>

<template>
  <button class="student-help-btn" :title="help.title" @click="show = true">
    <span class="help-icon">❓</span>
    <span class="help-label">مساعدة</span>
  </button>
  <HelpModal
    v-if="show"
    :title="help.title"
    :sections="help.sections"
    @close="show = false"
  />
</template>

<style scoped>
.student-help-btn {
  height: 32px;
  border-radius: 999px;
  border: 1px solid rgba(99,102,241,0.35);
  background: rgba(99,102,241,0.15);
  color: #c7d2fe;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0 0.75rem;
  transition: all 0.15s;
  flex-shrink: 0;
}
.student-help-btn:hover {
  background: rgba(99,102,241,0.25);
  color: #e0e7ff;
  transform: translateY(-1px);
}
.help-icon { font-size: 0.85rem; }
.help-label { font-family: inherit; }
</style>
