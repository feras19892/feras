<template>
  <div class="dash-page">
    <h2>{{ t('common.activityLog') }}</h2>
    <CompactStats v-if="stats" :stats="activityStats" />
    <SkeletonLoader v-if="loading" type="table" :count="5" />
    <ErrorState v-else-if="error" :error="error" show-retry @retry="load" />
    <div v-else-if="activities.length" class="compact-list">
      <div v-for="a in activities" :key="a.id" class="compact-row">
        <span class="cr-icon">📋</span>
        <span class="cr-name">{{ a.actor_name }}</span>
        <span class="cr-meta">
          <span>{{ a.actor_role }}</span>
          <span>{{ a.action }}</span>
          <span>{{ a.target_type || t('common.ip') }}</span>
          <span>{{ a.target_id || t('common.ip') }}</span>
          <span>{{ fmtDate(a.created_at) }}</span>
        </span>
      </div>
    </div>
    <EmptyState v-else icon="📋" :title="t('shared.noData')" />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, locale } = useI18n();
import { ref, computed, onMounted } from 'vue'

import { getAdminActivity, getAdminActivityStats } from '@/services/admin.service'
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'
import ErrorState from '@/components/shared/ErrorState.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import CompactStats from '@/components/shared/CompactStats.vue'





const activities = ref<any[]>([])
const stats = ref<any>(null)
const loading = ref(false)
const error = ref('')

const dateLocale = computed(() => locale.value === 'ar' ? 'ar' : locale.value === 'es' ? 'es-ES' : 'en-US')

const activityStats = computed(() => {
  if (!stats.value) return []
  return [
    { value: stats.value.today ?? 0, label: t('common.today') },
    { value: stats.value.logins ?? 0, label: t('common.logins') },
    { value: stats.value.signups ?? 0, label: t('common.signups') },
    { value: stats.value.reports ?? 0, label: t('common.reports') },
    { value: stats.value.classes ?? 0, label: t('common.classes') },
    { value: stats.value.feedback ?? 0, label: t('common.feedback') },
    { value: stats.value.activeNow ?? 0, label: t('common.activeNow') },
  ]
})

function fmtDate(s: string) { return s ? new Date(s).toLocaleString(dateLocale.value) : t('common.ip') }

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [aRes, sRes] = await Promise.all([getAdminActivity(), getAdminActivityStats()])
    activities.value = aRes.activities || []
    stats.value = sRes.stats || null
  } catch (e: any) { error.value = e?.message || t('common.loadFailed') }
  finally { loading.value = false }
}

onMounted(load)
</script>

<style scoped>
@import '@/assets/styles/dashboard-shared.css';
</style>
