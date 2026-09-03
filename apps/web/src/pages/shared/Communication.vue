<template>
  <div class="dash-page communication-page">
    <h2>{{ t('dashboard.dashNew.communication', 'التواصل') }}</h2>

    <div v-if="loading" class="loading-label">{{ t('dashboard.dashNew.loadingContent') }}</div>
    <ErrorState v-else-if="error" :error="error" show-retry @retry="load" />
    <EmptyState
      v-else-if="classes.length === 0"
      icon="💬"
      :title="t('dashboard.dash.noWaitClasses', 'لا توجد فصول')"
      :description="t('dashboard.dash.noChannelsToChat', 'انضم إلى فصل أو اطلب من المشرف إضافة فصل لعرض الدردشات')"
    />
    <div v-else class="comm-layout">
      <!-- قائمة الفصول -->
      <aside class="comm-classes">
        <div class="comm-classes__title">{{ t('dashboard.dashNew.classesLabel', 'الفصول') }}</div>
        <button
          v-for="cls in classes"
          :key="cls.id"
          class="comm-class-btn"
          :class="{ active: selectedClassId === cls.id }"
          @click="selectClass(cls.id)"
        >
          <span class="comm-class-icon">📚</span>
          <span class="comm-class-name">{{ cls.name }}</span>
          <span v-if="cls.is_frozen" class="comm-frozen">🧊</span>
        </button>
      </aside>

      <!-- غرفة الدردشة -->
      <div class="comm-chat">
        <ClassChat
          v-if="selectedClass"
          :key="selectedClass.id"
          :class-id="selectedClass.id"
          :class-name="selectedClass.name"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import { ref, computed, onMounted } from 'vue'

import ClassChat from '@/components/shared/ClassChat.vue'
import ErrorState from '@/components/shared/ErrorState.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import { getMyClasses, type ClassItem } from '@/services/class.service'





const classes = ref<ClassItem[]>([])
const selectedClassId = ref('')
const loading = ref(false)
const error = ref('')

const selectedClass = computed(() =>
  classes.value.find(c => c.id === selectedClassId.value) || null
)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const res = await getMyClasses()
    if (res.success) {
      classes.value = res.classes || []
      if (classes.value.length > 0 && !classes.value.find(c => c.id === selectedClassId.value)) {
        selectedClassId.value = classes.value[0].id
      }
    } else {
      error.value = t('dashboard.dashNew.classesLoadFailed', 'فشل تحميل الفصول')
    }
  } catch (e: any) {
    error.value = e?.message || t('dashboard.dashNew.classesLoadFailed', 'فشل تحميل الفصول')
  } finally {
    loading.value = false
  }
}

function selectClass(id: string) {
  selectedClassId.value = id
}

onMounted(load)
</script>

<style scoped>
@import '@/assets/styles/dashboard-shared.css';

.communication-page { min-height: 400px; }
.loading-label { padding: 40px; text-align: center; color: var(--text-muted, #9ca3af); }

.comm-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 16px;
  margin-top: 16px;
}

.comm-classes {
  background: var(--bg-card, #111827);
  border: 1px solid var(--border-color, #374151);
  border-radius: 12px;
  padding: 12px;
  align-self: start;
  max-height: 480px;
  overflow-y: auto;
}
.comm-classes__title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-secondary, #9ca3af);
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color, #374151);
}
.comm-class-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: none;
  border-radius: 8px;
  cursor: pointer;
  text-align: start;
  margin-bottom: 4px;
  font-size: 14px;
  color: var(--text-primary, #e5e7eb);
  transition: background 0.15s;
}
.comm-class-btn:hover { background: var(--bg-hover, #1f2937); }
.comm-class-btn.active { background: var(--accent-bg, #3b82f6); color: #fff; }
.comm-class-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.comm-frozen { font-size: 13px; }

.comm-chat {
  min-height: 480px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border-color, #374151);
}

@media (max-width: 640px) {
  .comm-layout { grid-template-columns: 1fr; }
  .comm-classes { max-height: 200px; }
}
</style>
