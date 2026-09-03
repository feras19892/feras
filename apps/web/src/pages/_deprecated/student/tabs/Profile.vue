<template>
  <div class="dash-page">
    <h2>ملفي</h2>
    <div v-if="auth.user" class="profile-card">
      <div class="avatar" @click="trigger">
        <img v-if="auth.user.avatar_url" :src="auth.user.avatar_url" />
        <span v-else>🎓</span>
      </div>
      <div class="info">
        <h3>{{ auth.user.name }}</h3>
        <p>{{ auth.user.email }}</p>
        <span class="role-badge">طالب</span>
      </div>
      <input ref="file" type="file" accept="image/*" style="display: none" @change="upload" />
      <button @click="trigger" class="btn-sm btn-success" :disabled="uploading">{{ uploading ? '...' : 'تغيير الصورة' }}</button>
    </div>
    <CompactStats v-if="stats" :stats="stats" />
    <ErrorState v-if="err" :error="err" />
    <UserSettings class="profile-settings" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/modules/auth/stores/auth'
import { useStudentStore } from '@/stores/student.store'
import { updateAvatar } from '@/services/enhancements.service'
import CompactStats from '@/components/shared/CompactStats.vue'
import ErrorState from '@/components/shared/ErrorState.vue'
import UserSettings from '@/pages/shared/UserSettings.vue'

const auth = useAuthStore()
const store = useStudentStore()
const file = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const err = ref('')

const stats = computed(() => [
  { value: store.reports.length, label: 'التقارير' },
  { value: store.reports.filter(r => r.status === 'graded').length, label: 'المصحّح' },
  { value: store.classes.length, label: 'الفصول' },
  { value: store.reports.filter(r => r.status === 'submitted').length, label: 'المعلّق' },
])

function trigger() { file.value?.click() }

async function upload(e: Event) {
  const input = e.target as HTMLInputElement
  const f = input.files?.[0]
  if (!f) return
  if (f.size > 2 * 1024 * 1024) { err.value = 'الصورة كبيرة'; return }
  uploading.value = true
  err.value = ''
  const r = new FileReader()
  r.onload = async () => {
    try {
      const res = await updateAvatar(r.result as string)
      if (res.success && auth.user) auth.user.avatar_url = r.result as string
    } catch (e: any) { err.value = e?.message || 'فشل' }
    finally { uploading.value = false }
  }
  r.readAsDataURL(f)
  input.value = ''
}

onMounted(async () => { await store.refreshAll() })
</script>

<style scoped>
@import '@/assets/styles/dashboard-shared.css';
.profile-card { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; padding: 16px; background: var(--as-surface); border-radius: 14px; border: 1px solid var(--as-border); }
.profile-settings :deep(.settings-page) { padding: 0; overflow-y: visible; }
.avatar { width: 64px; height: 64px; border-radius: 50%; background: #4f46e5; display: flex; align-items: center; justify-content: center; cursor: pointer; overflow: hidden; font-size: 24px; }
.avatar img { width: 100%; height: 100%; object-fit: cover; }
.info { flex: 1; }
.role-badge { padding: 4px 10px; border-radius: 20px; background: rgba(99,102,241,0.15); color: #a5b4fc; font-size: 12px; }
</style>
