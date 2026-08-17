<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '../composables/useI18n'
import { useGoToBranch } from '../composables/useGoToBranch'
import { useAuthStore } from '../modules/auth/stores/auth'
import { useStudentDashboard } from '../composables/student/useStudentDashboard'
import AppSidebar from '../components/shared/AppSidebar.vue'
import type { SidebarGroup } from '../components/shared/AppSidebar.vue'
import NotificationBell from '../components/shared/NotificationBell.vue'
import LiveToastContainer from '../components/shared/LiveToastContainer.vue'
import AccountSettingsModal from '../components/shared/AccountSettingsModal.vue'
import StudentOverviewTab from '../components/student/StudentOverviewTab.vue'
import LearningProgressCard from '../components/student/LearningProgressCard.vue'
import SystemBanner from '../components/shared/SystemBanner.vue'
import BranchCard from '../components/ui/BranchCard.vue'
import { fetchHomeCards } from '../services/home.service'
import { getUnreadChatCounts, markChatRead } from '../services/chat.service'
import type { HomeCard } from '../types/physics'

const StudentReportsTab = defineAsyncComponent(() => import('../components/student/StudentReportsTab.vue'))
const StudentClassesTab = defineAsyncComponent(() => import('../components/student/StudentClassesTab.vue'))
const StudentProfileTab = defineAsyncComponent(() => import('../components/student/StudentProfileTab.vue'))
const StudentQuizzesTab = defineAsyncComponent(() => import('../components/student/StudentQuizzesTab.vue'))
const StudentEnhancementsTab = defineAsyncComponent(() => import('../components/student/StudentEnhancementsTab.vue'))
const AnnouncementsPanel = defineAsyncComponent(() => import('../components/shared/AnnouncementsPanel.vue'))
const AITutorWidget = defineAsyncComponent(() => import('../components/student/AITutorWidget.vue'))
const DeadlinesPanel = defineAsyncComponent(() => import('../components/student/DeadlinesPanel.vue'))
const ApprovalPanel = defineAsyncComponent(() => import('../components/shared/ApprovalPanel.vue'))
const ClassChat = defineAsyncComponent(() => import('../components/shared/ClassChat.vue'))

const router = useRouter()
const { t, locale } = useI18n()
const { goToBranch } = useGoToBranch()
const auth = useAuthStore()
const { kpi, reportRows, recentReports, overduePending, classes, classStudentsMap, joinClassByCode, leaveClassById, loading } = useStudentDashboard()

type Section = 'overview' | 'experiments' | 'reports' | 'classes' | 'quizzes' | 'badges' | 'announcements' | 'approvals' | 'settings'
const savedTab = localStorage.getItem('student-active-tab') as Section | null
const active = ref<Section>(savedTab && ['overview','experiments','reports','classes','quizzes','badges','announcements','approvals','settings'].includes(savedTab) ? savedTab : 'overview')
watch(active, (v) => { localStorage.setItem('student-active-tab', v) })
const sidebarCollapsed = ref(false)
const cards = ref<HomeCard[]>([])
const chatClassId = ref<string | null>(null)
const chatClassName = ref('')
const unreadChatCounts = ref<Record<string, number>>({})

const dateLocaleStr = computed(() => locale.value === 'ar' ? 'ar-SA' : locale.value === 'es' ? 'es-ES' : 'en-US')
const currentDate = ref(new Date())
let dateInterval: ReturnType<typeof setInterval> | null = null

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
      { id: 'overview', icon: '📊', label: t('shared.navOverview') },
      { id: 'experiments', icon: '🔬', label: t('shared.navExperiments') },
    ],
  },
  {
    id: 'work',
    title: t('shared.navWork'),
    icon: '📚',
    items: [
      { id: 'reports', icon: '📋', label: t('shared.navMyReports'), badge: kpi.value.pendingCount > 0 ? kpi.value.pendingCount : undefined },
      { id: 'classes', icon: '🏫', label: t('shared.navMyClasses') },
      { id: 'quizzes', icon: '📝', label: t('shared.navQuizzes') },
      { id: 'badges', icon: '🏅', label: t('shared.navBadges') },
    ],
  },
  {
    id: 'comm',
    title: t('shared.navComm'),
    icon: '💬',
    items: [
      { id: 'announcements', icon: '📢', label: t('shared.navAnnouncements') },
      { id: 'approvals', icon: '✋', label: t('shared.navObjections') },
      { id: 'settings', icon: '👤', label: t('shared.navSettings') },
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

async function loadUnreadCounts() {
  try {
    const res = await getUnreadChatCounts()
    if (res.success) unreadChatCounts.value = res.counts
  } catch { /* ignore */ }
}

function openReport(id: number) {
  router.push(`/report/${id}`)
}

async function loadCards() {
  try { cards.value = await fetchHomeCards() } catch { /* ignore */ }
}

onMounted(async () => {
  if (!auth.isStudent && !auth.isGuest) { router.push('/'); return }
  if (!auth.isGuest) { await auth.fetchMe() }
  await loadCards()
  await Promise.all([loadUnreadCounts()])
  dateInterval = setInterval(() => { currentDate.value = new Date() }, 60000)
})

onUnmounted(() => {
  if (dateInterval) clearInterval(dateInterval)
})
</script>

<template>
  <div class="student-layout">
    <SystemBanner />
    <AppSidebar
      :groups="groups"
      :active-id="active"
      role="student"
      :user-name="auth.user?.name || ''"
      :collapsed="sidebarCollapsed"
      @select="active = $event as Section"
      @home="router.push({ path: '/home', query: { view: 'experiments' } })"
      @logout="auth.logout(); router.push('/')"
      @toggle-collapse="sidebarCollapsed = !sidebarCollapsed"
    />

    <div class="student-main">
      <!-- Top Bar -->
      <header class="topbar">
        <div class="topbar-left">
          <h1 class="topbar-title">{{ activeLabel }}</h1>
          <span class="topbar-date">{{ currentDate.toLocaleDateString(dateLocaleStr, { weekday: 'long', day: 'numeric', month: 'long' }) }}</span>
        </div>
        <div class="topbar-right">
          <NotificationBell />
          <AccountSettingsModal />
        </div>
      </header>

      <LiveToastContainer />

      <!-- Content -->
      <div :class="['content-area', { 'chat-open': chatClassId }]">
        <div class="content-main">
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
          </div>

          <!-- Overview -->
          <div v-else-if="active === 'overview'" class="section-panel">
            <div v-if="kpi.totalReports === 0 && kpi.totalClasses === 0" class="empty-welcome">
              <div class="empty-icon">🎓</div>
              <h3>{{ t('dashboard.dash.studentWelcomeTitle') }}</h3>
              <p>{{ t('dashboard.dash.studentWelcomeMsg') }}</p>
              <div class="empty-actions">
                <button class="empty-cta" @click="active = 'experiments'">{{ t('dashboard.dash.startExperiment') }}</button>
                <button class="empty-cta secondary" @click="active = 'classes'">{{ t('dashboard.joinClass') }}</button>
              </div>
            </div>
            <template v-else>
              <LearningProgressCard v-if="kpi.totalReports > 0" style="margin-bottom: 1rem" />
              <StudentOverviewTab
                :kpi="kpi"
                :recent="recentReports"
                :overdue="overduePending"
                :classes="classes"
                :locale="locale"
                @open-report="openReport"
                @open-tab="active = $event as Section"
                @navigate="active = $event as Section"
              />
            </template>
          </div>

          <!-- Experiments -->
          <div v-else-if="active === 'experiments'" class="section-panel">
            <div class="cards-grid">
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

          <!-- Reports -->
          <div v-else-if="active === 'reports'" class="section-panel">
            <StudentReportsTab :rows="reportRows" :locale="locale" @open-report="openReport" />
          </div>

          <!-- Classes -->
          <div v-else-if="active === 'classes'" class="section-panel">
            <StudentClassesTab
              :classes="classes"
              :class-students-map="classStudentsMap"
              :current-user-id="auth.user?.id || 0"
              :join-fn="joinClassByCode"
              :leave-fn="leaveClassById"
              :active-chat-id="chatClassId"
              :unread-chat-counts="unreadChatCounts"
              @open-chat="openChat"
            />
          </div>

          <!-- Quizzes -->
          <div v-else-if="active === 'quizzes'" class="section-panel">
            <Suspense>
              <StudentQuizzesTab />
              <template #fallback>
                <div class="loading-state"><div class="spinner"></div></div>
              </template>
            </Suspense>
          </div>

          <!-- Badges & Enhancements -->
          <div v-else-if="active === 'badges'" class="section-panel">
            <Suspense>
              <StudentEnhancementsTab />
              <template #fallback>
                <div class="loading-state"><div class="spinner"></div></div>
              </template>
            </Suspense>
          </div>

          <!-- Announcements -->
          <div v-else-if="active === 'announcements'" class="section-panel">
            <div class="panel-card">
              <Suspense>
                <AnnouncementsPanel />
                <template #fallback>
                  <div class="loading-state"><div class="spinner"></div></div>
                </template>
              </Suspense>
            </div>
            <div class="panel-card">
              <DeadlinesPanel />
            </div>
          </div>

          <!-- Approvals -->
          <div v-else-if="active === 'approvals'" class="section-panel">
            <Suspense>
              <ApprovalPanel mode="student" />
              <template #fallback>
                <div class="loading-state"><div class="spinner"></div></div>
              </template>
            </Suspense>
          </div>

          <!-- Settings -->
          <div v-else-if="active === 'settings'" class="section-panel">
            <StudentProfileTab :kpi="kpi" :recent="recentReports" />
          </div>
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

    <AITutorWidget />
  </div>
</template>


<style scoped src='./student-dashboard.css'></style>
