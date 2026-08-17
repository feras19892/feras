<script setup lang="ts">
import { onMounted, ref, computed, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '../composables/useI18n'
import { useGoToBranch } from '../composables/useGoToBranch'
import { useAuthStore } from '../modules/auth/stores/auth'
import { useUrlTab } from '../composables/useUrlTab'
import BranchCard from '../components/ui/BranchCard.vue'
import ApprovalPanel from '../components/shared/ApprovalPanel.vue'
import PanelShell from '../components/shared/PanelShell.vue'
import type { DockItem } from '../components/shared/PanelShell.vue'
import SystemBanner from '../components/shared/SystemBanner.vue'
import LiveToastContainer from '../components/shared/LiveToastContainer.vue'
import { fetchHomeCards } from '../services/home.service'
import { fetchJson } from '../services/http'
import { getSystemStatus, type SystemStatus } from '../services/system-status.service'
import type { HomeCard } from '../types/physics'

const router = useRouter()
const { t } = useI18n()
const { goToBranch } = useGoToBranch()
const auth = useAuthStore()

const activeTab = useUrlTab('tab', 'experiments', ['experiments', 'classes', 'approvals', 'settings']) as Ref<'experiments' | 'classes' | 'approvals' | 'settings'>
const cards = ref<HomeCard[]>([])
const loading = ref(false)
const systemStatus = ref<SystemStatus | null>(null)

const dockItems = computed<DockItem[]>(() => {
  const items: DockItem[] = [{ id: 'experiments', icon: '🔬', label: t('shared.navExperiments') }]
  if (!auth.isAdmin) items.push({ id: 'classes', icon: '📚', label: t('shared.navMyClasses') })
  if (!auth.isAdmin) items.push({ id: 'approvals', icon: '📋', label: auth.isTeacher ? t('shared.navApprovals') : t('shared.navObjections') })
  if (!auth.isAdmin) items.push({ id: 'settings', icon: '⚙️', label: t('shared.navSettings') })
  return items
})

const activeLabel = computed(() => dockItems.value.find(d => d.id === activeTab.value)?.label || '')

// Email change state (not in AccountSettingsModal)
const newEmail = ref('')
const savingEmail = ref(false)
const emailMsg = ref('')

const translatedCards = computed(() => {
  let filtered = cards.value
  if (systemStatus.value) {
    filtered = filtered.filter(c => {
      if (c.id === 'physics') return systemStatus.value!.experiment_physics_enabled
      if (c.id === 'chemistry') return systemStatus.value!.experiment_chemistry_enabled
      if (c.id === 'general') return systemStatus.value!.experiment_biology_enabled
      if (c.id === 'math') return systemStatus.value!.experiment_math_enabled
      return true
    })
  }
  return filtered.map(card => ({
    ...card,
    title: t(`dashboard.${card.id}Title`),
    desc: t(`dashboard.${card.id}Desc`),
    stats: t(`dashboard.${card.id}Stats`),
  }))
})

const loadCards = async () => {
  loading.value = true
  try { cards.value = await fetchHomeCards() } catch { /* ignore */ } finally { loading.value = false }
}

async function handleEmailChange() {
  if (!newEmail.value.trim()) return
  savingEmail.value = true; emailMsg.value = ''
  try {
    const res = await fetchJson<{ success: boolean; message?: string }>('/api/auth/email-change-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requested_email: newEmail.value.trim() }),
    })
    if (res.success) { emailMsg.value = t('shared.dsEmailRequestSent'); newEmail.value = '' }
    else emailMsg.value = res.message || t('shared.dsEmailRequestFailed')
  } catch (e: unknown) {
    emailMsg.value = e instanceof Error ? e.message : t('shared.dsEmailRequestFailed')
  }
  savingEmail.value = false
}

onMounted(async () => {
  if (!auth.isGuest) { await auth.fetchMe() }
  await loadCards()
  try { systemStatus.value = await getSystemStatus() } catch { /* ignore */ }
})
</script>

<template>
  <SystemBanner />
  <LiveToastContainer />
  <PanelShell
    :dock-items="dockItems"
    :active-id="activeTab"
    :title="activeLabel"
    :role="auth.isAdmin ? 'admin' : auth.isSchool ? 'school' : auth.isTeacher ? 'teacher' : 'student'"
    :user-name="auth.user?.name || ''"
    @select="activeTab = $event as 'experiments' | 'classes' | 'approvals' | 'settings'"
    @home="router.push('/home')"
    @logout="auth.logout(); router.push('/')"
  >
    <!-- Experiments Tab -->
    <div v-if="activeTab === 'experiments'" class="tab-panel">
      <p v-if="loading" class="loading-text">...</p>
      <div v-else class="cards-grid">
        <BranchCard
          v-for="card in translatedCards"
          :key="card.id"
          :id="card.id"
          :icon="card.icon"
          :title="card.title"
          :desc="card.desc"
          :stats="card.stats"
          :action="() => goToBranch(card.branchId)"
        />
      </div>
    </div>

    <!-- Classes Tab (teacher/student only) -->
    <div v-if="activeTab === 'classes' && !auth.isAdmin" class="tab-panel">
      <div v-if="auth.isStudent" class="empty-classes">
        <div class="empty-icon">📚</div>
        <p class="empty-title">{{ t('shared.navMyClasses') }}</p>
        <p class="empty-hint">{{ t('shared.dsClassesRedirect', 'يمكنك إدارة فصولك من لوحة الطالب') }}</p>
        <button class="settings-btn" @click="router.push('/student')">{{ t('shared.dsGoToDashboard', 'الذهاب للوحة الطالب') }}</button>
      </div>
      <div v-else class="empty-classes">
        <div class="empty-icon">📚</div>
        <p class="empty-title">{{ t('shared.navMyClasses') }}</p>
        <p class="empty-hint">{{ t('shared.dsClassesEmpty') }}</p>
      </div>
    </div>

    <!-- Approvals Tab -->
    <div v-if="activeTab === 'approvals' && !auth.isAdmin" class="tab-panel">
      <ApprovalPanel :mode="auth.isSchool ? 'school' : auth.isTeacher ? 'teacher' : 'student'" />
    </div>

    <!-- Settings Tab (email change only — name/password/avatar via AccountSettingsModal in top bar) -->
    <div v-if="activeTab === 'settings' && !auth.isAdmin" class="tab-panel">
      <div class="settings-grid">
        <div class="settings-card">
          <h3>{{ t('shared.dsEmailChange') }}</h3>
          <p class="settings-hint">{{ t('shared.dsCurrentEmail') }} <strong>{{ auth.user?.email }}</strong></p>
          <p class="settings-hint">{{ t('shared.dsEmailHint') }}</p>
          <input v-model="newEmail" type="email" class="settings-input" :placeholder="t('shared.dsNewEmailPlaceholder')" />
          <button class="settings-btn" :disabled="savingEmail" @click="handleEmailChange">{{ savingEmail ? '...' : t('shared.dsSendRequest') }}</button>
          <p v-if="emailMsg" class="settings-msg">{{ emailMsg }}</p>
        </div>
      </div>
    </div>
  </PanelShell>
</template>

<style scoped>
.tab-panel { animation: fadeIn 0.2s; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.loading-text { text-align: center; color: #94a3b8; font-size: 1.1rem; }
.cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; justify-items: center; max-width: 1000px; width: 100%; margin: 0 auto; }

.settings-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; max-width: 900px; }
.settings-card { background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.8rem; padding: 1.2rem; display: flex; flex-direction: column; gap: 0.6rem; }
.settings-card h3 { margin: 0 0 0.3rem; font-size: 1rem; color: #e2e8f0; }
.settings-input { width: 100%; padding: 0.6rem 0.8rem; border-radius: 0.5rem; border: 1px solid #334155; background: #0f172a; color: #e2e8f0; font-size: 0.85rem; box-sizing: border-box; }
.settings-input:focus { outline: none; border-color: #818cf8; }
.settings-btn { padding: 0.5rem 1rem; border-radius: 0.5rem; border: none; background: linear-gradient(135deg, #6366f1, #4f46e5); color: #fff; font-weight: 700; cursor: pointer; font-family: inherit; font-size: 0.85rem; }
.settings-btn:disabled { opacity: 0.6; cursor: wait; }
.settings-msg { font-size: 0.8rem; margin: 0; }
.settings-hint { font-size: 0.78rem; color: #94a3b8; margin: 0; }

.empty-classes { text-align: center; padding: 3rem 1rem; }
.empty-classes .empty-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }
.empty-classes .empty-title { font-size: 1rem; color: #e2e8f0; margin: 0 0 0.3rem; }
.empty-classes .empty-hint { font-size: 0.82rem; color: #64748b; margin: 0; }
</style>
