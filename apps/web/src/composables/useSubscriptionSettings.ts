import { ref, onMounted } from 'vue'
import { getSubscriptionSettings, type SubscriptionSettings } from '@/services/core/school.api'

export function useSubscriptionSettings() {
  const settings = ref<SubscriptionSettings | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function load() {
    loading.value = true
    try {
      const res = await getSubscriptionSettings()
      if (res.success) settings.value = res.data
    } catch (e: any) { error.value = e.message || 'فشل تحميل الإعدادات' } finally { loading.value = false }
  }

  onMounted(load)

  function get(key: string, fallback: string | number): string | number {
    const raw = settings.value?.[key]
    if (raw == null) return fallback
    if (typeof fallback === 'number') return Number(raw) || fallback
    return raw
  }

  return { settings, loading, error, load, get }
}
