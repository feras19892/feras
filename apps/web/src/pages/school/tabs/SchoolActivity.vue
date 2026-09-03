<template>
  <div class="dash-page">
    <h2>سجل النشاطات</h2>
    <div class="tabs">
      <button class="tab-btn" :class="{ active: mode === 'activity' }" @click="mode = 'activity'">الأحداث</button>
      <button class="tab-btn" :class="{ active: mode === 'sessions' }" @click="mode = 'sessions'">الجلسات</button>
    </div>

    <div class="compact-toolbar" style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 12px;">
      <input v-model="search" class="form-input search-input" :placeholder="mode === 'sessions' ? 'بحث باسم أو IP...' : 'بحث بإجراء أو تفاصيل...'" style="max-width: 260px;" />
    </div>
    <SkeletonLoader v-if="loading" type="cards" :count="4" />
    <ErrorState v-else-if="error" :error="error" show-retry @retry="load" />
    <div v-else-if="pagedItems.length" class="compact-list">
      <div v-for="(item, i) in pagedItems" :key="i" class="compact-row">
        <span class="cr-icon">{{ mode === 'sessions' ? '🔑' : '⏱️' }}</span>
        <span class="cr-name" v-if="mode === 'activity'">{{ item.action }}</span>
        <span class="cr-name" v-else>{{ item.user_name || '—' }}</span>
        <span class="cr-meta">
          <span v-if="mode === 'sessions'">IP: {{ item.ip || '—' }}</span>
          <span v-else>{{ item.details || '—' }}</span>
          <span>{{ formatDate(item.created_at || (item as any).login_at) }}</span>
        </span>
      </div>
    </div>
    <EmptyState v-else icon="⏱️" :title="mode === 'sessions' ? 'لا توجد جلسات' : 'لا توجد أحداث'" />
    <Pagination
      v-if="filteredItems.length"
      :page="currentPage"
      :limit="pageLimit"
      :total="filteredItems.length"
      @change="currentPage = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { getSchoolActivity, getSchoolSessions, type SchoolActivityItem, type SchoolSessionItem } from '@/services/school.service'
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'
import ErrorState from '@/components/shared/ErrorState.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import Pagination from '@/components/shared/Pagination.vue'

const mode = ref<'activity' | 'sessions'>('activity')
const activity = ref<SchoolActivityItem[]>([])
const sessions = ref<SchoolSessionItem[]>([])
const loading = ref(false)
const error = ref('')
const search = ref('')
const currentPage = ref(1)
const pageLimit = ref(10)

const items = computed(() => mode.value === 'activity' ? activity.value : sessions.value as any[])

const filteredItems = computed(() => {
  const q = search.value.toLowerCase()
  if (!q) return items.value
  if (mode.value === 'activity') {
    return activity.value.filter(a => a.action?.toLowerCase().includes(q) || a.details?.toLowerCase().includes(q))
  }
  return sessions.value.filter((s: any) => (s.user_name && s.user_name.toLowerCase().includes(q)) || (s.ip && s.ip.toLowerCase().includes(q)))
})

const pagedItems = computed(() => {
  const start = (currentPage.value - 1) * pageLimit.value
  return filteredItems.value.slice(start, start + pageLimit.value)
})

watch([search, mode], () => { currentPage.value = 1 })

function formatDate(d?: string | null) { return d ? new Date(d).toLocaleString('ar') : '—' }

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [aRes, sRes] = await Promise.all([getSchoolActivity(), getSchoolSessions()])
    if (aRes.success) activity.value = aRes.activity || []
    if (sRes.success) sessions.value = sRes.sessions || []
  } catch (e: any) { error.value = e?.message || 'فشل التحميل' }
  finally { loading.value = false }
}

onMounted(load)
</script>

<style scoped>
@import '@/assets/styles/dashboard-shared.css';
.tabs { display: flex; gap: 8px; margin-bottom: 12px; }
.tab-btn { padding: 8px 16px; border-radius: 8px; border: 1px solid var(--as-border); background: var(--as-raised); color: var(--as-text-muted); cursor: pointer; }
.tab-btn.active { background: var(--as-accent); color: white; border-color: var(--as-accent); }
.search-input { max-width: 260px; }
</style>
