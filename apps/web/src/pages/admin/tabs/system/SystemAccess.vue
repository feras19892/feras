<template>
  <div>
    <h2 class="panel__title">{{ t('admin.accessAndSecurity') }}</h2>
    <SkeletonLoader v-if="loading" type="cards" :count="4" />
    <ErrorState v-else-if="error" :error="error" show-retry @retry="load" />
    <template v-else>
      <div class="metric-cards">
        <div v-for="c in cards" :key="c.label" class="metric-card" :style="{ borderTopColor: c.color }">
          <div class="metric-card__value" :style="{ color: c.color }">{{ c.value }}</div>
          <div class="metric-card__label">{{ c.label }}</div>
        </div>
      </div>

      <div class="charts-row">
        <div class="chart-panel wide">
          <h3 class="chart-title">{{ t('admin.activeSessions') }}</h3>
          <div v-if="activeSessions.length" class="table-scroll">
            <table class="data-table">
              <thead><tr><th>{{ t('admin.thUser') }}</th><th>{{ t('admin.thRole') }}</th><th>{{ t('admin.thLoginAt') }}</th><th>{{ t('admin.thIP') }}</th></tr></thead>
              <tbody>
                <tr v-for="s in activeSessions" :key="s.id">
                  <td>{{ s.name }}<br><small>{{ s.email }}</small></td>
                  <td>{{ s.role }}</td>
                  <td>{{ formatDate(s.login_at) }}</td>
                  <td>{{ s.ip || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="empty">{{ t('admin.noActiveSessions') }}</p>
        </div>
      </div>

      <div class="charts-row">
        <div class="chart-panel">
          <h3 class="chart-title">{{ t('admin.impersonateUser') }}</h3>
          <select v-model="impersonateUserId" class="input">
            <option :value="0">{{ t('admin.selectUser') }}</option>
            <option v-for="u in store.users" :key="u.id" :value="u.id">{{ u.name }} ({{ u.email }})</option>
          </select>
          <input v-model="impersonatePassword" type="password" class="input" :placeholder="t('admin.adminPassword')" />
          <button class="btn" :disabled="!canImpersonate" @click="doImpersonate">{{ t('admin.loginAsUser') }}</button>
        </div>

        <div class="chart-panel">
          <h3 class="chart-title">{{ t('admin.banUnban') }}</h3>
          <select v-model="manageUserId" class="input">
            <option :value="0">{{ t('admin.selectUser') }}</option>
            <option v-for="u in store.users" :key="u.id" :value="u.id">{{ u.name }} ({{ u.email }})</option>
          </select>
          <input v-model="banReason" class="input" :placeholder="t('admin.banReason')" />
          <div class="btn-row">
            <button class="btn" :disabled="!canBan" @click="doBan">{{ t('admin.ban') }}</button>
            <button class="btn btn-secondary" :disabled="!canUnban" @click="doUnban">{{ t('admin.unban') }}</button>
          </div>
        </div>
      </div>

      <div class="charts-row">
        <div class="chart-panel">
          <h3 class="chart-title">{{ t('admin.bannedUsers') }}</h3>
          <div v-if="bannedUsers.length" class="mini-list">
            <div v-for="u in bannedUsers" :key="u.id" class="mini-row">
              <span>{{ u.name }}</span>
              <span class="small">{{ u.block_reason || '—' }}</span>
              <button class="btn-small" @click="unbanUserById(u.id)">{{ t('admin.unbanAction') }}</button>
            </div>
          </div>
          <p v-else class="empty">{{ t('admin.noBannedUsers') }}</p>
        </div>

        <div class="chart-panel">
          <h3 class="chart-title">{{ t('admin.unverifiedUsers') }}</h3>
          <div v-if="unverifiedUsers.length" class="mini-list">
            <div v-for="u in unverifiedUsers" :key="u.id" class="mini-row">
              <span>{{ u.name }}</span>
              <span class="small">{{ u.email }}</span>
            </div>
          </div>
          <p v-else class="empty">{{ t('admin.noUnverifiedUsers') }}</p>
        </div>
      </div>

    </template>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction, locale } = useI18n();
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin.store'
import { useAuthStore } from '@/modules/auth/stores/auth'
import { useToast } from '@/composables/useToast'

import { useAdminPasswordConfirm } from '@/composables/useAdminPasswordConfirm'
import { setTokens } from '@/services/http'
import {


  getActiveSessions, banUser, unbanUser, impersonateUser,
  type ActiveSession,
} from '@/services/admin.service'
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'
import ErrorState from '@/components/shared/ErrorState.vue'




const store = useAdminStore()
const auth = useAuthStore()
const router = useRouter()
const toast = useToast()
const { adminPasswordConfirm } = useAdminPasswordConfirm()
const loading = ref(true)
const error = ref('')
const activeSessions = ref<ActiveSession[]>([])
const impersonateUserId = ref(0)
const impersonatePassword = ref('')
const manageUserId = ref(0)
const banReason = ref('')

const cards = computed(() => [
  { label: t('admin.cardActiveSessions'), value: activeSessions.value.length, color: '#3b82f6' },
  { label: t('admin.cardBanned'), value: bannedUsers.value.length, color: '#ef4444' },
  { label: t('admin.cardUnverified'), value: unverifiedUsers.value.length, color: '#f59e0b' },
  { label: t('admin.cardTodayLogins'), value: store.health?.today.logins ?? 0, color: '#10b981' },
])
const bannedUsers = computed(() => store.users.filter(u => u.blocked_at))
const unverifiedUsers = computed(() => store.users.filter(u => !u.email_verified_at))
const manageUser = computed(() => store.users.find(u => u.id === manageUserId.value))
const canImpersonate = computed(() => impersonateUserId.value && impersonatePassword.value.length >= 1)
const canBan = computed(() => manageUserId.value && manageUser.value && !manageUser.value.blocked_at && banReason.value.trim().length >= 1)
const canUnban = computed(() => manageUserId.value && manageUser.value && !!manageUser.value.blocked_at)

function formatDate(d?: string) { return d ? new Date(d).toLocaleString(locale.value) : '—' }

async function load() {
  loading.value = true
  error.value = ''
  try {
    await store.loadAll()
    const s = await getActiveSessions()
    if (s.success) activeSessions.value = s.sessions
  } catch (e) {
    error.value = String(e)
  } finally {
    loading.value = false
  }
}

async function doImpersonate() {
  try {
    const res = await impersonateUser(impersonateUserId.value, impersonatePassword.value)
    if (!res.success) throw new Error((res as any).message || t('admin.toastImpersonateFailed'))
    if (!res.token) throw new Error(t('admin.toastTokenMissing'))
    setTokens(res.token, res.refreshToken)
    auth.setSession(res.user as any)
    auth.clearSchoolSession()
    toast.success(t('admin.toastImpersonated'))
    await router.push(`/${res.user.role}`)
  } catch (e) {
    toast.error(e instanceof Error ? e.message : t('admin.toastImpersonateFailed'))
  }
}

async function doBan() {
  if (!manageUser.value) return
  const adminPassword = await adminPasswordConfirm({ message: 'أدخل كلمة مرور الأدمن لتأكيد الحظر' })
  if (!adminPassword) return
  try {
    await banUser(manageUser.value.id, banReason.value.trim(), adminPassword)
    toast.success(t('admin.toastBanSuccess'))
    banReason.value = ''
    manageUserId.value = 0
    await store.loadAll()
  } catch (e) {
    toast.error(t('admin.toastBanFailed'))
  }
}

async function doUnban() {
  if (!manageUser.value) return
  const adminPassword = await adminPasswordConfirm({ message: 'أدخل كلمة مرور الأدمن لتأكيد إلغاء الحظر' })
  if (!adminPassword) return
  try {
    await unbanUser(manageUser.value.id, adminPassword)
    toast.success(t('admin.toastUnbanSuccess'))
    manageUserId.value = 0
    await store.loadAll()
  } catch (e) {
    toast.error(t('admin.toastUnbanFailed'))
  }
}

async function unbanUserById(id: number) {
  const adminPassword = await adminPasswordConfirm({ message: 'أدخل كلمة مرور الأدمن لتأكيد إلغاء الحظر' })
  if (!adminPassword) return
  try {
    await unbanUser(id, adminPassword)
    toast.success(t('admin.toastUnbanSuccess'))
    await store.loadAll()
  } catch (e) {
    toast.error(t('admin.toastUnbanFailed'))
  }
}

onMounted(load)
</script>

<style scoped>
@import '@/assets/styles/dashboard-shared.css';

.metric-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; margin-bottom: 1.2rem; }
.metric-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.7rem; padding: 1rem; text-align: center; border-top: 3px solid transparent; }
.metric-card__value { font-size: 1.5rem; font-weight: 800; margin-bottom: 0.3rem; }
.metric-card__label { font-size: 0.75rem; color: #94a3b8; }

.charts-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom: 1.2rem; }
.chart-panel { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.7rem; padding: 1rem; }
.chart-panel.wide { grid-column: 1 / -1; }
.chart-title { margin: 0 0 0.8rem; font-size: 0.9rem; font-weight: 700; color: #e2e8f0; }
.empty { padding: 2rem; text-align: center; color: #64748b; font-size: 0.85rem; }

.table-scroll { max-height: 300px; overflow-y: auto; border-radius: 6px; }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; color: #cbd5e1; }
.data-table th { position: sticky; top: 0; background: #0f172a; z-index: 1; text-align: right; padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.08); color: #94a3b8; }
.data-table td { padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.04); }
.data-table small { color: #64748b; }

.input { width: 100%; margin-bottom: 0.6rem; padding: 8px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: #fff; font-family: inherit; }
.input option { background: #0f172a; }
.btn { padding: 8px 14px; border: none; border-radius: 6px; background: #6366f1; color: #fff; cursor: pointer; font-family: inherit; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-secondary { background: #475569; }
.btn-small { padding: 4px 8px; border-radius: 4px; border: none; background: #10b981; color: #fff; cursor: pointer; font-size: 0.75rem; }
.btn-row { display: flex; gap: 8px; }

.mini-list { display: flex; flex-direction: column; gap: 0.5rem; }
.mini-row { display: grid; grid-template-columns: 1fr 1fr auto; align-items: center; gap: 8px; font-size: 0.85rem; color: #cbd5e1; }
.mini-row .small { color: #94a3b8; font-size: 0.75rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

</style>
