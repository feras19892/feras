<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '../composables/useI18n'
import { useAuthStore } from '../modules/auth/stores/auth'
import { useStudentDashboard } from '../composables/student/useStudentDashboard'
import AppSidebar from '../components/shared/AppSidebar.vue'
import type { SidebarGroup } from '../components/shared/AppSidebar.vue'
import NotificationBell from '../components/shared/NotificationBell.vue'
import AccountSettingsModal from '../components/shared/AccountSettingsModal.vue'
import StudentOverviewTab from '../components/student/StudentOverviewTab.vue'
import SystemBanner from '../components/shared/SystemBanner.vue'
import BranchCard from '../components/ui/BranchCard.vue'
import { fetchHomeCards } from '../services/home.service'
import type { HomeCard } from '../types/physics'

const StudentReportsTab = defineAsyncComponent(() => import('../components/student/StudentReportsTab.vue'))
const StudentClassesTab = defineAsyncComponent(() => import('../components/student/StudentClassesTab.vue'))
const StudentProfileTab = defineAsyncComponent(() => import('../components/student/StudentProfileTab.vue'))
const StudentQuizzesTab = defineAsyncComponent(() => import('../components/student/StudentQuizzesTab.vue'))
const StudentEnhancementsTab = defineAsyncComponent(() => import('../components/student/StudentEnhancementsTab.vue'))
const AnnouncementsPanel = defineAsyncComponent(() => import('../components/shared/AnnouncementsPanel.vue'))
const DeadlinesPanel = defineAsyncComponent(() => import('../components/student/DeadlinesPanel.vue'))
const ApprovalPanel = defineAsyncComponent(() => import('../components/shared/ApprovalPanel.vue'))
const ClassChat = defineAsyncComponent(() => import('../components/shared/ClassChat.vue'))

const router = useRouter()
const { t, locale } = useI18n()
const auth = useAuthStore()
const { kpi, reportRows, recentReports, overduePending, classes, classStudentsMap, joinClassByCode, leaveClassById, loading } = useStudentDashboard()

type Section = 'overview' | 'experiments' | 'reports' | 'classes' | 'quizzes' | 'badges' | 'announcements' | 'approvals' | 'settings'
const active = ref<Section>('overview')
const sidebarCollapsed = ref(false)
const cards = ref<HomeCard[]>([])
const chatClassId = ref<string | null>(null)
const chatClassName = ref('')

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
    ],
  },
  {
    id: 'achieve',
    title: t('shared.navAchieve'),
    icon: '🏆',
    items: [
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
    ],
  },
  {
    id: 'account',
    title: t('shared.navAccount'),
    icon: '⚙️',
    items: [
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

function goToBranch(branchId: string) {
  if (branchId === 'physics') router.push('/physics')
  if (branchId === 'chemistry') router.push('/chemistry')
  if (branchId === 'mathematics') router.push('/math')
  if (branchId === 'general') router.push('/biology')
}

function openChat(cls: { id: string; name: string }) {
  if (chatClassId.value === cls.id) {
    chatClassId.value = null
    chatClassName.value = ''
  } else {
    chatClassId.value = cls.id
    chatClassName.value = cls.name
  }
}

function closeChat() {
  chatClassId.value = null
  chatClassName.value = ''
}

function openReport(id: number) {
  router.push(`/report/${id}`)
}

async function loadCards() {
  try { cards.value = await fetchHomeCards() } catch { /* ignore */ }
}

onMounted(async () => {
  if (!auth.isGuest) { await auth.fetchMe() }
  await loadCards()
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
      @home="router.push('/home')"
      @logout="auth.logout(); router.push('/')"
      @toggle-collapse="sidebarCollapsed = !sidebarCollapsed"
    />

    <div class="student-main">
      <!-- Top Bar -->
      <header class="topbar">
        <div class="topbar-left">
          <h1 class="topbar-title">{{ activeLabel }}</h1>
          <span class="topbar-date">{{ new Date().toLocaleDateString(dateLocaleStr, { weekday: 'long', day: 'numeric', month: 'long' }) }}</span>
        </div>
        <div class="topbar-right">
          <NotificationBell />
          <AccountSettingsModal />
        </div>
      </header>

      <!-- KPI Strip -->
      <div class="kpi-strip" v-if="active === 'overview' || active === 'reports'">
        <div class="kpi-item" :class="{ click: kpi.pendingCount > 0 }" @click="kpi.pendingCount > 0 && (active = 'reports')">
          <span class="kpi-icon">⏳</span>
          <span class="kpi-val">{{ kpi.pendingCount }}</span>
          <span class="kpi-lab">{{ t('shared.kpiPendingShort') }}</span>
        </div>
        <div class="kpi-item" :class="{ click: kpi.newFeedback > 0 }" @click="kpi.newFeedback > 0 && (active = 'reports')">
          <span class="kpi-icon">💬</span>
          <span class="kpi-val">{{ kpi.newFeedback }}</span>
          <span class="kpi-lab">{{ t('shared.kpiFeedback') }}</span>
        </div>
        <div class="kpi-item">
          <span class="kpi-icon">✅</span>
          <span class="kpi-val">{{ kpi.gradedCount }}</span>
          <span class="kpi-lab">{{ t('shared.kpiGradedShort') }}</span>
        </div>
        <div class="kpi-item">
          <span class="kpi-icon">📝</span>
          <span class="kpi-val">{{ kpi.draftCount }}</span>
          <span class="kpi-lab">{{ t('shared.kpiDraft') }}</span>
        </div>
        <div class="kpi-item">
          <span class="kpi-icon">📄</span>
          <span class="kpi-val">{{ kpi.totalReports }}</span>
          <span class="kpi-lab">{{ t('shared.kpiTotal') }}</span>
        </div>
        <div class="kpi-item">
          <span class="kpi-icon">🏫</span>
          <span class="kpi-val">{{ kpi.totalClasses }}</span>
          <span class="kpi-lab">{{ t('shared.kpiClasses') }}</span>
        </div>
        <div class="kpi-item">
          <span class="kpi-icon">📊</span>
          <span class="kpi-val">{{ kpi.avgGrade }}%</span>
          <span class="kpi-lab">{{ t('shared.kpiAvg') }}</span>
        </div>
        <div class="kpi-item">
          <span class="kpi-icon">⭐</span>
          <span class="kpi-val">{{ kpi.bestGrade }}%</span>
          <span class="kpi-lab">{{ t('shared.kpiBest') }}</span>
        </div>
      </div>

      <!-- Content -->
      <div :class="['content-area', { 'chat-open': chatClassId }]">
        <div class="content-main">
          <div v-if="loading && active === 'overview'" class="loading-state">
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
            <StudentOverviewTab
              v-else
              :kpi="kpi"
              :recent="recentReports"
              :overdue="overduePending"
              :classes="classes"
              :locale="locale"
              @open-report="openReport"
              @open-tab="active = $event as Section"
              @navigate="active = $event as Section"
            />
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
              @open-chat="openChat"
            />
          </div>

          <!-- Quizzes -->
          <div v-else-if="active === 'quizzes'" class="section-panel">
            <StudentQuizzesTab />
          </div>

          <!-- Badges & Enhancements -->
          <div v-else-if="active === 'badges'" class="section-panel">
            <StudentEnhancementsTab />
          </div>

          <!-- Announcements -->
          <div v-else-if="active === 'announcements'" class="section-panel">
            <div class="panel-card">
              <AnnouncementsPanel />
            </div>
            <div class="panel-card">
              <DeadlinesPanel />
            </div>
          </div>

          <!-- Approvals -->
          <div v-else-if="active === 'approvals'" class="section-panel">
            <ApprovalPanel mode="student" />
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
  </div>
</template>

<style scoped>
.student-layout {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0f1c 0%, #111827 40%, #0f172a 100%);
  color: #e2e8f0;
}

.student-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* Top Bar */
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  background: rgba(10,15,28,0.5);
  backdrop-filter: blur(12px);
  position: sticky;
  top: 0;
  z-index: 50;
}
.topbar-left { display: flex; align-items: center; gap: 0.8rem; }
.topbar-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 800;
  color: #f1f5f9;
}
.topbar-date {
  font-size: 0.75rem;
  color: #64748b;
}
.topbar-right { display: flex; align-items: center; gap: 0.4rem; }

/* KPI Strip */
.kpi-strip {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.03);
}
.kpi-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  padding: 0.5rem 0.4rem;
  border-radius: 0.6rem;
  background: rgba(15,23,42,0.5);
  border: 1px solid rgba(255,255,255,0.05);
  transition: all 0.15s;
}
.kpi-item.click { cursor: pointer; }
.kpi-item.click:hover {
  border-color: rgba(251,191,36,0.3);
  background: rgba(251,191,36,0.04);
  transform: translateY(-1px);
}
.kpi-icon { font-size: 1rem; }
.kpi-val { font-size: 1.05rem; font-weight: 800; color: #e5e7eb; line-height: 1; }
.kpi-lab { font-size: 0.6rem; color: #64748b; text-align: center; white-space: nowrap; }

/* Content */
.content-area {
  flex: 1;
  display: flex;
  padding: 1.5rem;
  gap: 0.8rem;
  overflow-y: auto;
}
.content-area.chat-open { max-width: 1600px; }
.content-main { flex: 1; min-width: 0; }
.content-area.chat-open .content-main { flex: 0 0 66%; }

.chat-col {
  flex: 0 0 34%;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 80px;
  height: calc(100vh - 100px);
}
.chat-col-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.8rem;
  background: rgba(74,222,128,0.08);
  border: 1px solid rgba(74,222,128,0.12);
  border-radius: 0.6rem 0.6rem 0 0;
  font-size: 0.85rem;
  font-weight: 700;
  color: #86efac;
}
.chat-close-btn {
  width: 26px; height: 26px;
  border-radius: 0.35rem;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.05);
  color: #94a3b8;
  cursor: pointer;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.chat-close-btn:hover { background: rgba(239,68,68,0.15); color: #f87171; }
.chat-col :deep(.chat-panel) { border-radius: 0 0 0.6rem 0.6rem; flex: 1; }
.chat-col :deep(.chat-header) { display: none; }
.chat-col :deep(.chat-body) { max-height: none; flex: 1; }

/* Section Panel */
.section-panel { animation: fadeIn 0.2s; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.panel-card {
  background: rgba(15,23,42,0.5);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 0.8rem;
  padding: 1rem;
  margin-bottom: 0.8rem;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  justify-items: center;
  max-width: 1000px;
  width: 100%;
  margin: 0 auto;
}

/* Loading */
.loading-state { display: flex; justify-content: center; padding: 3rem; }
.spinner {
  width: 36px; height: 36px;
  border: 3px solid rgba(74,222,128,0.2);
  border-top-color: #4ade80;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Empty Welcome */
.empty-welcome {
  text-align: center;
  padding: 3rem 1.5rem;
}
.empty-icon { font-size: 3rem; margin-bottom: 0.8rem; }
.empty-welcome h3 { margin: 0 0 0.4rem; color: #e5e7eb; }
.empty-welcome p { margin: 0 0 1.2rem; color: #64748b; font-size: 0.85rem; }
.empty-actions { display: flex; gap: 0.8rem; justify-content: center; flex-wrap: wrap; }
.empty-cta {
  padding: 0.6rem 1.5rem;
  border: none;
  border-radius: 0.6rem;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.empty-cta:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(34,197,94,0.3); }
.empty-cta.secondary {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
}

@media (max-width: 768px) {
  .kpi-strip { grid-template-columns: repeat(4, 1fr); }
  .content-area { padding: 0.8rem; }
  .content-area.chat-open .content-main { flex: 1; }
  .chat-col { display: none; }
}
</style>
