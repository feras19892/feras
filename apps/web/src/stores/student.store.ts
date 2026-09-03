import { defineStore } from 'pinia'
import { computed, reactive, toRefs } from 'vue'
import * as studentApi from '@/services/core/student.api'
import type { StudentClass } from '@/services/core/student.api'
import type { Report } from '@/services/report.service'
import { cacheService } from '@/services/core/cache.service'
import { subscribeEvent } from '@/composables/shared/useEventBus'

let listenersRegistered = false
let cleanupFns: (() => void)[] = []

export const useStudentStore = defineStore('student', () => {
  const state = reactive({
    reports: [] as Report[],
    classes: [] as StudentClass[],
    stats: null as any,
    loading: false,
    loadingClasses: false,
    loadingReports: false,
    error: null as string | null,
    lastUpdated: null as Date | null
  })
  
  const totalReports = computed(() => state.reports.length)
  const totalClasses = computed(() => state.classes.length)
  const pendingApprovals = computed(() => state.reports.filter(r => r.status === 'submitted'))
  
  if (!listenersRegistered) {
    listenersRegistered = true
    cleanupFns = [
      subscribeEvent('report:graded', () => {
        cacheService.invalidatePattern('student:reports')
        fetchReports(true).catch(() => {})
      }),
      subscribeEvent('class:created', () => {
        cacheService.invalidatePattern('student:classes')
        fetchClasses(true).catch(() => {})
      }),
      subscribeEvent('class:updated', () => {
        cacheService.invalidatePattern('student:classes')
        fetchClasses(true).catch(() => {})
      }),
      subscribeEvent('cache:invalidate', (e) => {
        if (e.pattern.includes('student')) {
          cacheService.invalidatePattern(e.pattern)
        }
      }),
    ]
  }
  
  async function fetchReports(force = false) {
    if (!force && cacheService.has('student:reports')) {
      state.reports = cacheService.get('student:reports') ?? []
      return
    }
    state.loadingReports = true
    state.loading = true
    try {
      const res = await studentApi.getReports()
      if (res.success) {
        state.reports = res.reports
        cacheService.set('student:reports', res.reports, { ttl: 300000 })
      }
    } catch (error: any) {
      state.error = error.message
    } finally {
      state.loadingReports = false
      if (!state.loadingClasses) state.loading = false
    }
  }
  
  async function fetchClasses(force = false) {
    if (!force && cacheService.has('student:classes')) {
      state.classes = cacheService.get('student:classes') ?? []
      return
    }
    state.loadingClasses = true
    state.loading = true
    try {
      const res = await studentApi.getMyClasses()
      if (res.success) {
        state.classes = res.classes
        cacheService.set('student:classes', res.classes, { ttl: 300000 })
      }
    } catch (error: any) {
      state.error = error.message
    } finally {
      state.loadingClasses = false
      if (!state.loadingReports) state.loading = false
    }
  }
  
  async function refreshAll() {
    await Promise.all([
      fetchReports(true),
      fetchClasses(true)
    ])
    state.lastUpdated = new Date()
  }
  
  function $reset() {
    state.reports = []
    state.classes = []
    state.stats = null
    state.loading = false
    state.loadingClasses = false
    state.loadingReports = false
    state.error = null
    state.lastUpdated = null
    // إزالة مستمعينا فقط
    cleanupFns.forEach(fn => fn())
    cleanupFns = []
    listenersRegistered = false
  }
  
  return {
    ...toRefs(state),
    totalReports,
    totalClasses,
    pendingApprovals,
    fetchReports,
    fetchClasses,
    refreshAll,
    $reset
  }
})
