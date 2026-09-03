import { defineStore } from 'pinia'
import { computed, reactive, toRefs } from 'vue'
import * as schoolApi from '@/services/core/school.api'
import { cacheService } from '@/services/core/cache.service'
import { subscribeEvent } from '@/composables/shared/useEventBus'

let listenersRegistered = false
let cleanupFns: (() => void)[] = []

export const useSchoolStore = defineStore('school', () => {
  const state = reactive({
    stats: null as any,
    users: [] as any[],
    classes: [] as any[],
    loading: false,
    error: null as string | null,
    lastUpdated: null as Date | null
  })
  
  const totalUsers = computed(() => state.users.length)
  const totalClasses = computed(() => state.classes.length)
  
  if (!listenersRegistered) {
    listenersRegistered = true
    cleanupFns = [
      subscribeEvent('user:banned', () => {
        cacheService.invalidatePattern('school:users')
        fetchUsers(true).catch(() => {})
      }),
      subscribeEvent('cache:invalidate', (e) => {
        if (e.pattern.includes('school')) {
          cacheService.invalidatePattern(e.pattern)
        }
      }),
    ]
  }
  
  async function fetchStats(force = false) {
    if (!force && cacheService.has('school:stats')) {
      state.stats = cacheService.get('school:stats') ?? null
      return
    }
    state.loading = true
    try {
      const res = await schoolApi.getStats()
      if (res.success) {
        state.stats = { stats: res.stats, school: res.school }
        cacheService.set('school:stats', state.stats, { ttl: 300000 })
      }
    } catch (error: any) {
      state.error = error.message
    } finally {
      state.loading = false
    }
  }
  
  async function fetchUsers(force = false) {
    if (!force && cacheService.has('school:users')) {
      state.users = cacheService.get('school:users') ?? []
      return
    }
    state.loading = true
    try {
      const res = await schoolApi.getUsers()
      if (res.success) {
        state.users = res.users
        cacheService.set('school:users', res.users, { ttl: 300000 })
      }
    } catch (error: any) {
      state.error = error.message
    } finally {
      state.loading = false
    }
  }
  
  async function fetchClasses(force = false) {
    if (!force && cacheService.has('school:classes')) {
      state.classes = cacheService.get('school:classes') ?? []
      return
    }
    state.loading = true
    try {
      const res = await schoolApi.getClasses()
      if (res.success) {
        state.classes = res.classes
        cacheService.set('school:classes', res.classes, { ttl: 300000 })
      }
    } catch (error: any) {
      state.error = error.message
    } finally {
      state.loading = false
    }
  }
  
  async function refreshAll() {
    await Promise.all([
      fetchStats(true),
      fetchUsers(true),
      fetchClasses(true)
    ])
    state.lastUpdated = new Date()
  }
  
  function $reset() {
    state.stats = null
    state.users = []
    state.classes = []
    state.loading = false
    state.error = null
    state.lastUpdated = null
    // إزالة مستمعينا فقط
    cleanupFns.forEach(fn => fn())
    cleanupFns = []
    listenersRegistered = false
  }
  
  return {
    ...toRefs(state),
    totalUsers,
    totalClasses,
    fetchStats,
    fetchUsers,
    fetchClasses,
    refreshAll,
    $reset
  }
})
