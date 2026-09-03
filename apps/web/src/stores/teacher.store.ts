import { defineStore } from 'pinia'
import { computed, reactive, toRefs } from 'vue'
import * as teacherApi from '@/services/core/teacher.api'
import type { TeacherClass } from '@/services/core/teacher.api'
import type { Report } from '@/services/report.service'
import { cacheService } from '@/services/core/cache.service'
import { subscribeEvent } from '@/composables/shared/useEventBus'

let listenersRegistered = false
let cleanupFns: (() => void)[] = []

export const useTeacherStore = defineStore('teacher', () => {
  const state = reactive({
    classes: [] as TeacherClass[],
    reports: [] as Report[],
    stats: null as any,
    loading: false,
    loadingClasses: false,
    loadingReports: false,
    error: null as string | null,
    lastUpdated: null as Date | null
  })
  
  const totalClasses = computed(() => state.classes.length)
  const pendingReports = computed(() => state.reports.filter(r => r.status === 'submitted'))
  
  if (!listenersRegistered) {
    listenersRegistered = true
    cleanupFns = [
      subscribeEvent('report:submitted', () => {
        cacheService.invalidatePattern('teacher:reports')
        fetchReports(true).catch(() => {})
      }),
      subscribeEvent('report:graded', () => {
        cacheService.invalidatePattern('teacher:reports')
        fetchReports(true).catch(() => {})
      }),
      subscribeEvent('class:created', () => {
        cacheService.invalidatePattern('teacher:classes')
        fetchClasses(true).catch(() => {})
      }),
      subscribeEvent('class:updated', () => {
        cacheService.invalidatePattern('teacher:classes')
        fetchClasses(true).catch(() => {})
      }),
      subscribeEvent('cache:invalidate', (e) => {
        if (e.pattern.includes('teacher')) {
          cacheService.invalidatePattern(e.pattern)
        }
      }),
    ]
  }
  
  async function fetchClasses(force = false) {
    if (!force && cacheService.has('teacher:classes')) {
      state.classes = cacheService.get('teacher:classes') ?? []
      return
    }
    state.loadingClasses = true
    state.loading = true
    try {
      const res = await teacherApi.getMyClasses()
      if (res.success) {
        state.classes = res.classes
        cacheService.set('teacher:classes', res.classes, { ttl: 300000 })
      }
    } catch (error: any) {
      state.error = error.message
    } finally {
      state.loadingClasses = false
      if (!state.loadingReports) state.loading = false
    }
  }
  
  async function fetchReports(force = false) {
    if (!force && cacheService.has('teacher:reports')) {
      state.reports = cacheService.get('teacher:reports') ?? []
      return
    }
    state.loadingReports = true
    state.loading = true
    try {
      const res = await teacherApi.getReports()
      if (res.success) {
        state.reports = res.reports
        cacheService.set('teacher:reports', res.reports, { ttl: 300000 })
      }
    } catch (error: any) {
      state.error = error.message
    } finally {
      state.loadingReports = false
      if (!state.loadingClasses) state.loading = false
    }
  }
  
  async function refreshAll() {
    await Promise.all([
      fetchClasses(true),
      fetchReports(true)
    ])
    state.lastUpdated = new Date()
  }
  
  function $reset() {
    state.classes = []
    state.reports = []
    state.stats = null
    state.loading = false
    state.loadingClasses = false
    state.loadingReports = false
    state.error = null
    state.lastUpdated = null
    // إزالة مستمعينا فقط — وليس كل المستمعين
    cleanupFns.forEach(fn => fn())
    cleanupFns = []
    listenersRegistered = false
  }
  
  return {
    ...toRefs(state),
    totalClasses,
    pendingReports,
    fetchClasses,
    fetchReports,
    refreshAll,
    $reset
  }
})
