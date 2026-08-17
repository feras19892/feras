<script setup lang="ts">
import { ref, computed, onMounted, watch, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '../composables/useI18n'
import { useGoToBranch } from '../composables/useGoToBranch'
import { useAuthStore } from '../modules/auth/stores/auth'
import { useTeacherDashboard } from '../composables/teacher/useTeacherDashboard'
import AppSidebar from '../components/shared/AppSidebar.vue'
import type { SidebarGroup } from '../components/shared/AppSidebar.vue'
import NotificationBell from '../components/shared/NotificationBell.vue'
import LiveToastContainer from '../components/shared/LiveToastContainer.vue'
import AccountSettingsModal from '../components/shared/AccountSettingsModal.vue'
import NameRequestBadge from '../components/shared/NameRequestBadge.vue'
import BranchCard from '../components/ui/BranchCard.vue'
import DashboardOverviewTab from '../components/teacher/DashboardOverviewTab.vue'
import DashboardDailyTab from '../components/teacher/DashboardDailyTab.vue'
import SystemBanner from '../components/shared/SystemBanner.vue'
import { fetchHomeCards } from '../services/home.service'
import { getUnreadChatCounts, markChatRead } from '../services/chat.service'
import { useApprovalBadge } from '../composables/useApprovalBadge'
import { useSubTabs } from '../composables/useSubTabs'
import type { HomeCard } from '../types/physics'

const ApprovalPanel = defineAsyncComponent(() => import('../components/shared/ApprovalPanel.vue'))
const ClassChat = defineAsyncComponent(() => import('../components/shared/ClassChat.vue'))
const DashboardStudentsTab = defineAsyncComponent(() => import('../components/teacher/DashboardStudentsTab.vue'))
const TeacherGrading = defineAsyncComponent(() => import('../components/teacher/TeacherGrading.vue'))
const ClassManager = defineAsyncComponent(() => import('../components/teacher/ClassManager.vue'))
const TeacherStats = defineAsyncComponent(() => import('../components/teacher/TeacherStats.vue'))
const TeacherQuizBuilder = defineAsyncComponent(() => import('../components/teacher/TeacherQuizBuilder.vue'))
const TeacherEnhancementsTab = defineAsyncComponent(() => import('../components/teacher/TeacherEnhancementsTab.vue'))
const TeacherDeadlinesPanel = defineAsyncComponent(() => import('../components/teacher/TeacherDeadlinesPanel.vue'))
import TeacherAnnouncementsTab from '../components/teacher/TeacherAnnouncementsTab.vue'
import TeacherSettingsTab from '../components/teacher/TeacherSettingsTab.vue'

const router = useRouter()
const { t, locale } = useI18n()
const { goToBranch } = useGoToBranch()
const auth = useAuthStore()
const { kpi, classRows, studentRows, todayUnopened, overdueUngraded, loading, reload } = useTeacherDashboard()

type Section = 'home' | 'grading' | 'settings'
type HomeSub = 'overview' | 'daily' | 'experiments' | 'classes' | 'students' | 'stats' | 'quizzes' | 'enhancements' | 'deadlines' | 'announcements'
type SettingsSub = 'settings' | 'approvals'
const validSections: Section[] = ['home', 'grading', 'settings']
const savedTab = localStorage.getItem('teacher-active-tab') as Section | null
const active = ref<Section>(savedTab && validSections.includes(savedTab) ? savedTab : 'home')
watch(active, (v) => { localStorage.setItem('teacher-active-tab', v) })
const { subTab: homeSub, setSubTab: setHomeSub } = useSubTabs<HomeSub>('overview', ['overview','daily','experiments','classes','students','stats','quizzes','enhancements','deadlines','announcements'])
const { subTab: settingsSub, setSubTab: setSettingsSub } = useSubTabs<SettingsSub>('settings', ['settings','approvals'])
watch(homeSub, (v) => { if (v === 'daily' || v === 'overview') reload() })

function navigateHome(tab: string) { setHomeSub(tab as HomeSub) }
const sidebarCollapsed = ref(false)
const cards = ref<HomeCard[]>([])
const chatClassId = ref<string | null>(null)
const chatClassName = ref('')
const unreadChatCounts = ref<Record<string, number>>({})
const { pendingCount: approvalPendingCount } = useApprovalBadge()

const dateLocaleStr = computed(() => locale.value === 'ar' ? 'ar-SA' : locale.value === 'es' ? 'es-ES' : 'en-US')

const translatedCards = computed(() => cards.value.map(card => ({
  ...card,
  title: t(`dashboard.${card.id}Title`),
  desc: t(`dashboard.${card.id}Desc`),
  stats: t(`dashboard.${card.id}Stats`),
})))

const groups = computed<SidebarGroup[]>(() => [
  {
    id: 'main',
    title: t('shared.navHome'),
    icon: '🏠',
    items: [
      { id: 'home', icon: '🏠', label: t('shared.navOverview') },
      { id: 'grading', icon: '✅', label: t('shared.navGrading'), badge: kpi.value.pendingCount > 0 ? kpi.value.pendingCount : undefined },
      { id: 'settings', icon: '�', label: t('shared.navSettings'), badge: approvalPendingCount.value > 0 ? approvalPendingCount.value : undefined },
    ],
  },
])

const activeLabel = computed(() => {
  for (const g of groups.value) {
    const item = g.items.find(i => i.id === active.value)
    if (item) return item.label
  }
  return ''
})

async function loadUnreadCounts() {
  try {
    const res = await getUnreadChatCounts()
    if (res.success) unreadChatCounts.value = res.counts
  } catch { /* ignore */ }
}

function openChat(cls: { id: string; name: string }) {
  if (chatClassId.value === cls.id) {
    chatClassId.value = null
    chatClassName.value = ''
    loadUnreadCounts()
  } else {
    chatClassId.value = cls.id
    chatClassName.value = cls.name
    markChatRead(cls.id).then(() => {
      unreadChatCounts.value = { ...unreadChatCounts.value, [cls.id]: 0 }
    }).catch(() => {})
  }
}

function closeChat() {
  chatClassId.value = null
  chatClassName.value = ''
  loadUnreadCounts()
}

function openReport(id: number) {
  router.push(`/report/${id}`)
}

async function loadCards() {
  try { cards.value = await fetchHomeCards() } catch { /* ignore */ }
}

onMounted(async () => {
  if (!auth.isTeacher) { router.push('/'); return }
  if (!auth.isGuest) { await auth.fetchMe() }
  await loadCards()
  await Promise.all([loadUnreadCounts()])
})
</script>

<template>
  <div class="teacher-layout">
    <SystemBanner />
    <AppSidebar
      :groups="groups"
      :active-id="active"
      role="teacher"
      :user-name="auth.user?.name || ''"
      :collapsed="sidebarCollapsed"
      @select="active = $event as Section"
      @home="router.push({ path: '/home', query: { view: 'experiments' } })"
      @logout="auth.logout(); router.push('/')"
      @toggle-collapse="sidebarCollapsed = !sidebarCollapsed"
    />

    <div class="teacher-main">
      <!-- Top Bar -->
      <header class="topbar">
        <div class="topbar-left">
          <h1 class="topbar-title">{{ activeLabel }}</h1>
          <span class="topbar-date">{{ new Date().toLocaleDateString(dateLocaleStr, { weekday: 'long', day: 'numeric', month: 'long' }) }}</span>
        </div>
        <div class="topbar-right">
          <NameRequestBadge />
          <NotificationBell />
          <AccountSettingsModal />
        </div>
      </header>

      <LiveToastContainer />

      <!-- Content -->
      <div :class="['content-area', { 'chat-open': chatClassId }]">
        <div class="content-main">
          <!-- Tab: Home (sub-tabs for all home content) -->
          <template v-if="active === 'home'">
            <div class="sub-tabs">
              <button :class="['sub-tab', { active: homeSub === 'overview' }]" @click="setHomeSub('overview')">📊</button>
              <button :class="['sub-tab', { active: homeSub === 'daily' }]" @click="setHomeSub('daily')">📅</button>
              <button :class="['sub-tab', { active: homeSub === 'experiments' }]" @click="setHomeSub('experiments')">🔬</button>
              <button :class="['sub-tab', { active: homeSub === 'classes' }]" @click="setHomeSub('classes')">🏫</button>
              <button :class="['sub-tab', { active: homeSub === 'students' }]" @click="setHomeSub('students')">🎓</button>
              <button :class="['sub-tab', { active: homeSub === 'stats' }]" @click="setHomeSub('stats')">📈</button>
              <button :class="['sub-tab', { active: homeSub === 'quizzes' }]" @click="setHomeSub('quizzes')">📝</button>
              <button :class="['sub-tab', { active: homeSub === 'enhancements' }]" @click="setHomeSub('enhancements')">🏆</button>
              <button :class="['sub-tab', { active: homeSub === 'deadlines' }]" @click="setHomeSub('deadlines')">📋</button>
              <button :class="['sub-tab', { active: homeSub === 'announcements' }]" @click="setHomeSub('announcements')">📢</button>
            </div>

            <div v-if="loading && homeSub === 'overview'" class="loading-state"><div class="spinner"></div></div>
            <div v-else-if="homeSub === 'overview'" class="section-panel">
              <div v-if="kpi.totalClasses === 0" class="empty-welcome">
                <div class="empty-icon">🏫</div>
                <h3>{{ t('dashboard.noClassesTitle') }}</h3>
                <p>{{ t('dashboard.noClassesMsg') }}</p>
                <button class="empty-cta" @click="setHomeSub('classes')">{{ t('dashboard.createClass') }}</button>
              </div>
              <DashboardOverviewTab v-else :pending-count="kpi.pendingCount" :unopened="todayUnopened" :overdue="overdueUngraded" :class-rows="classRows" :unread-chat-counts="unreadChatCounts" :locale="locale" @open-report="openReport" @open-tab="navigateHome" @navigate="navigateHome" @open-chat="openChat" />
            </div>
            <div v-else-if="homeSub === 'experiments'" class="section-panel">
              <div class="cards-grid">
                <BranchCard v-for="card in translatedCards" :key="card.id" :id="card.id" :icon="card.icon" :title="card.title" :desc="card.desc" :stats="card.stats" :action="() => goToBranch(card.branchId)" />
              </div>
            </div>
            <div v-else-if="homeSub === 'daily'" class="section-panel">
              <DashboardDailyTab :unopened="todayUnopened" :overdue="overdueUngraded" :locale="locale" @open-report="openReport" />
            </div>
            <div v-else-if="homeSub === 'classes'" class="section-panel"><ClassManager /></div>
            <div v-else-if="homeSub === 'students'" class="section-panel"><DashboardStudentsTab :rows="studentRows" /></div>
            <div v-else-if="homeSub === 'stats'" class="section-panel"><TeacherStats /></div>
            <div v-else-if="homeSub === 'quizzes'" class="section-panel"><TeacherQuizBuilder /></div>
            <div v-else-if="homeSub === 'enhancements'" class="section-panel"><TeacherEnhancementsTab :class-rows="classRows" /></div>
            <div v-else-if="homeSub === 'deadlines'" class="section-panel"><TeacherDeadlinesPanel /></div>
            <TeacherAnnouncementsTab v-else-if="homeSub === 'announcements'" :class-rows="classRows" />
          </template>

          <!-- Tab: Grading -->
          <div v-else-if="active === 'grading'" class="section-panel">
            <TeacherGrading @graded="reload" />
          </div>

          <!-- Tab: Settings (sub-tabs: settings + approvals) -->
          <template v-else-if="active === 'settings'">
            <div class="sub-tabs">
              <button :class="['sub-tab', { active: settingsSub === 'settings' }]" @click="setSettingsSub('settings')">👤 {{ t('shared.navSettings') }}</button>
              <button :class="['sub-tab', { active: settingsSub === 'approvals' }]" @click="setSettingsSub('approvals')">✋ {{ t('shared.navApprovals') }}</button>
            </div>
            <TeacherSettingsTab v-if="settingsSub === 'settings'" :kpi="kpi" :user-name="auth.user?.name || ''" :user-email="auth.user?.email || ''" @navigate="navigateHome" />
            <div v-else-if="settingsSub === 'approvals'" class="section-panel"><ApprovalPanel mode="teacher" /></div>
          </template>
        </div>

        <!-- Chat Sidebar -->
        <div v-if="chatClassId" class="chat-col">
          <div class="chat-col-header">
            <span>💬 {{ chatClassName }}</span>
            <button class="chat-close-btn" @click="closeChat">✕</button>
          </div>
          <ClassChat :class-id="chatClassId" :class-name="chatClassName" />
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped src='./teacher-dashboard.css'></style>
