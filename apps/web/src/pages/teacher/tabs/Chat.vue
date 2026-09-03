<template>
  <div class="chat-page">
    <h2>الدردشة</h2>

    <SkeletonLoader v-if="store.loading" type="list" :count="4" />
    <ErrorState v-else-if="store.error" :error="store.error || ''" show-retry @retry="store.fetchClasses()" />
    <template v-else>
      <div v-if="store.classes.length" class="class-circles">
        <button
          v-for="c in store.classes"
          :key="c.id"
          class="class-circle"
          :class="{ active: selectedClassId === c.id }"
          @click="selectClass(c)"
        >
          <span class="circle-avatar">{{ c.name?.[0] || 'ف' }}</span>
          <span v-if="unreadCounts[c.id]" class="unread-badge">{{ unreadCounts[c.id] }}</span>
          <span class="circle-name">{{ c.name }}</span>
        </button>
      </div>
      <EmptyState v-else icon="💬" title="لا توجد فصول" />

      <ClassChat
        v-if="selectedClassId && selectedClassName"
        :key="selectedClassId"
        :class-id="selectedClassId"
        :class-name="selectedClassName"
        class="chat-room"
      />
      <EmptyState v-else-if="store.classes.length" icon="💬" title="اختر فصلاً" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import { ref, onMounted } from 'vue'
import { useTeacherStore } from '@/stores/teacher.store'
import ClassChat from '@/components/shared/ClassChat.vue'
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'
import ErrorState from '@/components/shared/ErrorState.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import { getUnreadChatCounts, markChatRead } from '@/services/chat.service'
import type { TeacherClass } from '@/services/core/teacher.api'


const store = useTeacherStore()
const selectedClassId = ref('')
const selectedClassName = ref('')
const unreadCounts = ref<Record<string, number>>({})

function selectClass(c: TeacherClass) {
  selectedClassId.value = c.id
  selectedClassName.value = c.name
  if (unreadCounts.value[c.id]) {
    unreadCounts.value[c.id] = 0
    markChatRead(c.id).catch(() => {})
  }
}

onMounted(async () => {
  await store.fetchClasses()
  try {
    const res = await getUnreadChatCounts()
    if (res.success) unreadCounts.value = res.counts
  } catch { /* ignore */ }
})
</script>

<style scoped>
.chat-page { height: 100%; display: flex; flex-direction: column; padding: 16px; color: var(--as-text); }
.chat-page > h2 { margin: 0 0 12px; font-size: 18px; color: var(--as-text); }
.class-circles { display: flex; gap: 10px; overflow-x: auto; padding: 4px 0 12px; flex-shrink: 0; }
.class-circle { position: relative; flex: 0 0 auto; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 72px; height: 72px; border-radius: 50%; border: 2px solid var(--as-border); background: var(--as-surface); color: var(--as-text); cursor: pointer; transition: all 0.15s; }
.class-circle:hover, .class-circle.active { border-color: var(--as-accent); background: var(--as-raised); }
.circle-avatar { width: 28px; height: 28px; border-radius: 50%; background: var(--as-accent); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; }
.circle-name { margin-top: 4px; font-size: 10px; text-align: center; width: 90%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--as-text-muted); }
.unread-badge { position: absolute; top: -2px; right: -2px; min-width: 18px; height: 18px; border-radius: 999px; background: var(--as-danger); color: #fff; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; padding: 0 4px; }
.chat-room { flex: 1; min-height: 0; margin-top: 8px; }
</style>
