<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from '../composables/useI18n'
import { useAuthStore } from '../modules/auth/stores/auth'
import BranchCard from '../components/ui/BranchCard.vue'
import ClassManager from '../components/teacher/ClassManager.vue'
import TeacherGrading from '../components/teacher/TeacherGrading.vue'
import TeacherStats from '../components/teacher/TeacherStats.vue'
import TeacherDashboard from '../components/teacher/TeacherDashboard.vue'
import StudentDashboard from '../components/student/StudentDashboard.vue'
import AccountSettingsModal from '../components/shared/AccountSettingsModal.vue'
import NotificationBell from '../components/shared/NotificationBell.vue'
import ApprovalPanel from '../components/shared/ApprovalPanel.vue'
import PanelShell from '../components/shared/PanelShell.vue'
import type { DockItem } from '../components/shared/PanelShell.vue'
import { fetchHomeCards } from '../services/home.service'
import { fetchJson } from '../services/http'
import type { HomeCard } from '../types/physics'

const router = useRouter()
const route = useRoute()
const { t, locale } = useI18n()
const auth = useAuthStore()

const activeTab = ref<'experiments' | 'classes' | 'approvals' | 'settings'>('experiments')
const cards = ref<HomeCard[]>([])
const loading = ref(false)

const dockItems = computed<DockItem[]>(() => {
  const items: DockItem[] = [{ id: 'experiments', icon: '🔬', label: 'التجارب' }]
  if (!auth.isAdmin) items.push({ id: 'classes', icon: '📚', label: 'فصولي' })
  if (!auth.isAdmin) items.push({ id: 'approvals', icon: '📋', label: auth.isTeacher ? 'الموافقات' : 'الاعتراضات' })
  if (!auth.isAdmin) items.push({ id: 'settings', icon: '⚙️', label: 'الإعدادات' })
  return items
})

const activeLabel = computed(() => dockItems.value.find(d => d.id === activeTab.value)?.label || '')

// Settings state
const editName = ref('')
const savingName = ref(false)
const nameMsg = ref('')
const newPwd = ref('')
const savingPwd = ref(false)
const pwdMsg = ref('')
const newEmail = ref('')
const savingEmail = ref(false)
const emailMsg = ref('')

const dateLocaleStr = computed(() => locale.value === 'ar' ? 'ar-SA' : locale.value === 'es' ? 'es-ES' : 'en-US')

const translatedCards = computed(() => cards.value.map(card => ({
  ...card,
  title: t(`dashboard.${card.id}Title`),
  desc: t(`dashboard.${card.id}Desc`),
  stats: t(`dashboard.${card.id}Stats`),
})))

const goToBranch = (branchId: string) => {
  if (branchId === 'physics') router.push('/physics')
  if (branchId === 'chemistry') router.push('/chemistry')
  if (branchId === 'mathematics') router.push('/math')
  if (branchId === 'general') router.push('/biology')
}

const loadCards = async () => {
  loading.value = true
  try { cards.value = await fetchHomeCards() } catch { /* ignore */ } finally { loading.value = false }
}

async function handleSaveName() {
  if (editName.value.trim().length < 2) return
  savingName.value = true; nameMsg.value = ''
  try {
    const res = await fetchJson<{ success: boolean; user?: any }>('/api/auth/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName.value.trim() }),
    })
    if (res.success) { nameMsg.value = '✅ تم الحفظ'; if (res.user) auth.user = res.user }
    else nameMsg.value = 'فشل الحفظ'
  } catch { nameMsg.value = 'فشل الحفظ' }
  savingName.value = false
}

async function handleChangePassword() {
  if (newPwd.value.length < 8) { pwdMsg.value = 'كلمة المرور قصيرة جداً'; return }
  savingPwd.value = true; pwdMsg.value = ''
  try {
    const res = await fetchJson<{ success: boolean }>('/api/auth/password', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: auth.user!.id, new_password: newPwd.value }),
    })
    if (res.success) { pwdMsg.value = '✅ تم التغيير'; newPwd.value = '' }
    else pwdMsg.value = 'فشل التغيير'
  } catch { pwdMsg.value = 'فشل التغيير' }
  savingPwd.value = false
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
    if (res.success) { emailMsg.value = '✅ تم إرسال الطلب للأدمن'; newEmail.value = '' }
    else emailMsg.value = res.message || 'فشل الطلب'
  } catch (e: any) {
    emailMsg.value = e?.message || 'فشل الطلب'
  }
  savingEmail.value = false
}

onMounted(async () => {
  if (!auth.isGuest) { await auth.fetchMe() }
  if (auth.isAdmin && route.query.view !== 'experiments') { router.push('/admin'); return }
  if (auth.user) editName.value = auth.user.name
  await loadCards()
})
</script>

<template>
  <PanelShell
    :dock-items="dockItems"
    :active-id="activeTab"
    :title="activeLabel"
    :role="auth.isAdmin ? 'admin' : auth.isTeacher ? 'teacher' : 'student'"
    :user-name="auth.user?.name || ''"
    @select="activeTab = $event as any"
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
      <TeacherDashboard v-if="auth.isTeacher" @navigate="activeTab = 'experiments'" />
      <StudentDashboard v-else-if="auth.isStudent" @navigate="activeTab = 'experiments'" />
      <ClassManager v-if="auth.isTeacher" />
      <TeacherGrading v-if="auth.isTeacher" />
      <TeacherStats v-if="auth.isTeacher" />
    </div>

    <!-- Approvals Tab -->
    <div v-if="activeTab === 'approvals' && !auth.isAdmin" class="tab-panel">
      <ApprovalPanel :mode="auth.isTeacher ? 'teacher' : 'student'" />
    </div>

    <!-- Settings Tab -->
    <div v-if="activeTab === 'settings'" class="tab-panel">
      <div class="settings-grid">
        <div class="settings-card">
          <h3>📝 تعديل الاسم</h3>
          <input v-model="editName" type="text" class="settings-input" placeholder="الاسم" />
          <button class="settings-btn" :disabled="savingName" @click="handleSaveName">{{ savingName ? '...' : 'حفظ' }}</button>
          <p v-if="nameMsg" class="settings-msg">{{ nameMsg }}</p>
        </div>
        <div class="settings-card">
          <h3>🔑 تغيير كلمة المرور</h3>
          <input v-model="newPwd" type="password" class="settings-input" placeholder="كلمة المرور الجديدة" />
          <button class="settings-btn" :disabled="savingPwd" @click="handleChangePassword">{{ savingPwd ? '...' : 'تغيير' }}</button>
          <p v-if="pwdMsg" class="settings-msg">{{ pwdMsg }}</p>
        </div>
        <div class="settings-card">
          <h3>📧 طلب تغيير البريد</h3>
          <p class="settings-hint">البريد الحالي: <strong>{{ auth.user?.email }}</strong></p>
          <p class="settings-hint">تغيير البريد يتطلب موافقة الأدمن.</p>
          <input v-model="newEmail" type="email" class="settings-input" placeholder="البريد الجديد" />
          <button class="settings-btn" :disabled="savingEmail" @click="handleEmailChange">{{ savingEmail ? '...' : 'إرسال الطلب' }}</button>
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
</style>
