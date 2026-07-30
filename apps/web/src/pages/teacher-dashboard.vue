<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '../composables/useI18n'
import { useAuthStore } from '../modules/auth/stores/auth'
import { useTeacherDashboard } from '../composables/teacher/useTeacherDashboard'
import AppSidebar from '../components/shared/AppSidebar.vue'
import type { SidebarGroup } from '../components/shared/AppSidebar.vue'
import NotificationBell from '../components/shared/NotificationBell.vue'
import AccountSettingsModal from '../components/shared/AccountSettingsModal.vue'
import NameRequestBadge from '../components/shared/NameRequestBadge.vue'
import ApprovalPanel from '../components/shared/ApprovalPanel.vue'
import AnnouncementsPanel from '../components/shared/AnnouncementsPanel.vue'
import ClassChat from '../components/shared/ClassChat.vue'
import BranchCard from '../components/ui/BranchCard.vue'
import DashboardOverviewTab from '../components/teacher/DashboardOverviewTab.vue'
import DashboardDailyTab from '../components/teacher/DashboardDailyTab.vue'
import DashboardClassesTab from '../components/teacher/DashboardClassesTab.vue'
import DashboardStudentsTab from '../components/teacher/DashboardStudentsTab.vue'
import TeacherGrading from '../components/teacher/TeacherGrading.vue'
import ClassManager from '../components/teacher/ClassManager.vue'
import TeacherStats from '../components/teacher/TeacherStats.vue'
import CreateAnnouncementForm from '../components/teacher/CreateAnnouncementForm.vue'
import TeacherQuizBuilder from '../components/teacher/TeacherQuizBuilder.vue'
import SystemBanner from '../components/shared/SystemBanner.vue'
import { fetchHomeCards } from '../services/home.service'
import { getUnreadChatCounts, markChatRead } from '../services/chat.service'
import type { HomeCard } from '../types/physics'

const router = useRouter()
const { t, locale } = useI18n()
const auth = useAuthStore()
const { kpi, classRows, studentRows, todayUnopened, overdueUngraded, loading } = useTeacherDashboard()

type Section = 'overview' | 'experiments' | 'grading' | 'classes' | 'students' | 'quizzes' | 'stats' | 'announcements' | 'approvals' | 'settings'
const active = ref<Section>('overview')
const sidebarCollapsed = ref(false)
const cards = ref<HomeCard[]>([])
const chatClassId = ref<string | null>(null)
const chatClassName = ref('')
const unreadChatCounts = ref<Record<string, number>>({})
const selectedClassForAnnouncement = ref<string>('')

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
    title: 'الرئيسية',
    icon: '🏠',
    items: [
      { id: 'overview', icon: '📊', label: 'نظرة عامة' },
      { id: 'experiments', icon: '🔬', label: 'التجارب' },
    ],
  },
  {
    id: 'work',
    title: 'العمل',
    icon: '📚',
    items: [
      { id: 'grading', icon: '✅', label: 'التصحيح', badge: kpi.value.pendingCount > 0 ? kpi.value.pendingCount : undefined },
      { id: 'classes', icon: '🏫', label: 'الفصول' },
      { id: 'students', icon: '🎓', label: 'الطلاب' },
      { id: 'stats', icon: '📈', label: 'الإحصائيات' },
      { id: 'quizzes', icon: '📝', label: 'الامتحانات' },
    ],
  },
  {
    id: 'comm',
    title: 'التواصل',
    icon: '💬',
    items: [
      { id: 'announcements', icon: '📢', label: 'الإعلانات' },
      { id: 'approvals', icon: '✋', label: 'الموافقات' },
    ],
  },
  {
    id: 'account',
    title: 'الحساب',
    icon: '⚙️',
    items: [
      { id: 'settings', icon: '👤', label: 'الإعدادات' },
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
  await loadUnreadCounts()
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
      @home="router.push('/home')"
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

      <!-- KPI Strip -->
      <div class="kpi-strip" v-if="active === 'overview' || active === 'grading'">
        <div class="kpi-item" :class="{ click: kpi.pendingCount > 0 }" @click="kpi.pendingCount > 0 && (active = 'grading')">
          <span class="kpi-icon">⏳</span>
          <span class="kpi-val">{{ kpi.pendingCount }}</span>
          <span class="kpi-lab">بانتظار التصحيح</span>
        </div>
        <div class="kpi-item" :class="{ click: kpi.unopenedCount > 0 }" @click="kpi.unopenedCount > 0 && (active = 'overview')">
          <span class="kpi-icon">📬</span>
          <span class="kpi-val">{{ kpi.unopenedCount }}</span>
          <span class="kpi-lab">لم تُفتح</span>
        </div>
        <div class="kpi-item" :class="{ click: kpi.overdueCount > 0 }" @click="kpi.overdueCount > 0 && (active = 'overview')">
          <span class="kpi-icon">🚨</span>
          <span class="kpi-val">{{ kpi.overdueCount }}</span>
          <span class="kpi-lab">متأخرة</span>
        </div>
        <div class="kpi-item">
          <span class="kpi-icon">📥</span>
          <span class="kpi-val">{{ kpi.submittedToday }}</span>
          <span class="kpi-lab">وصل اليوم</span>
        </div>
        <div class="kpi-item">
          <span class="kpi-icon">✅</span>
          <span class="kpi-val">{{ kpi.gradedToday }}</span>
          <span class="kpi-lab">صُحّح اليوم</span>
        </div>
        <div class="kpi-item">
          <span class="kpi-icon">🎓</span>
          <span class="kpi-val">{{ kpi.totalStudents }}</span>
          <span class="kpi-lab">طلاب</span>
        </div>
        <div class="kpi-item">
          <span class="kpi-icon">🏫</span>
          <span class="kpi-val">{{ kpi.totalClasses }}</span>
          <span class="kpi-lab">فصول</span>
        </div>
        <div class="kpi-item">
          <span class="kpi-icon">📊</span>
          <span class="kpi-val">{{ kpi.avgGrade }}%</span>
          <span class="kpi-lab">المتوسط</span>
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
            <div v-if="kpi.totalClasses === 0" class="empty-welcome">
              <div class="empty-icon">🏫</div>
              <h3>{{ t('dashboard.noClassesTitle') }}</h3>
              <p>{{ t('dashboard.noClassesMsg') }}</p>
              <button class="empty-cta" @click="active = 'classes'">{{ t('dashboard.createClass') }}</button>
            </div>
            <DashboardOverviewTab
              v-else
              :pending-count="kpi.pendingCount"
              :unopened="todayUnopened"
              :overdue="overdueUngraded"
              :class-rows="classRows"
              :unread-chat-counts="unreadChatCounts"
              @open-report="openReport"
              @open-tab="active = $event as Section"
              @navigate="active = $event as Section"
              @open-chat="openChat"
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

          <!-- Grading -->
          <div v-else-if="active === 'grading'" class="section-panel">
            <TeacherGrading />
          </div>

          <!-- Classes -->
          <div v-else-if="active === 'classes'" class="section-panel">
            <ClassManager />
          </div>

          <!-- Students -->
          <div v-else-if="active === 'students'" class="section-panel">
            <DashboardStudentsTab :rows="studentRows" />
          </div>

          <!-- Stats -->
          <div v-else-if="active === 'stats'" class="section-panel">
            <TeacherStats />
          </div>

          <!-- Quizzes -->
          <div v-else-if="active === 'quizzes'" class="section-panel">
            <TeacherQuizBuilder />
          </div>

          <!-- Announcements -->
          <div v-else-if="active === 'announcements'" class="section-panel">
            <div class="ann-grid">
              <div class="panel-card">
                <div class="pc-header">
                  <h3>📢 الإعلانات</h3>
                </div>
                <AnnouncementsPanel />
              </div>
              <div class="panel-card">
                <div class="pc-header">
                  <h3>✏️ إنشاء إعلان</h3>
                </div>
                <div class="ann-create-wrap">
                  <div class="class-select-row">
                    <label>اختر الفصل:</label>
                    <select v-model="selectedClassForAnnouncement" class="class-select">
                      <option value="">— اختر فصل —</option>
                      <option v-for="c in classRows" :key="c.id" :value="c.id">{{ c.name }} ({{ c.code }})</option>
                    </select>
                  </div>
                  <CreateAnnouncementForm v-if="selectedClassForAnnouncement" :class-id="selectedClassForAnnouncement" />
                  <p v-else class="ann-hint">اختر فصلاً لإنشاء إعلان</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Approvals -->
          <div v-else-if="active === 'approvals'" class="section-panel">
            <ApprovalPanel mode="teacher" />
          </div>

          <!-- Settings -->
          <div v-else-if="active === 'settings'" class="section-panel">
            <div class="panel-card settings-card">
              <h3>👤 الملف الشخصي</h3>
              <p class="settings-name">{{ auth.user?.name }}</p>
              <p class="settings-email">{{ auth.user?.email }}</p>
              <p class="settings-role">المدرس</p>
            </div>
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
.teacher-layout {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0f1c 0%, #111827 40%, #0f172a 100%);
  color: #e2e8f0;
}

.teacher-main {
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
.topbar-date { font-size: 0.75rem; color: #64748b; }
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
  border-color: rgba(165,180,252,0.3);
  background: rgba(165,180,252,0.04);
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
  background: rgba(165,180,252,0.08);
  border: 1px solid rgba(165,180,252,0.12);
  border-radius: 0.6rem 0.6rem 0 0;
  font-size: 0.85rem;
  font-weight: 700;
  color: #c7d2fe;
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
.pc-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem; }
.pc-header h3 { margin: 0; font-size: 0.9rem; font-weight: 700; color: #e5e7eb; }

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  justify-items: center;
  max-width: 1000px;
  width: 100%;
  margin: 0 auto;
}

/* Announcements Grid */
.ann-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
}
@media (max-width: 768px) { .ann-grid { grid-template-columns: 1fr; } }
.ann-create-wrap { padding: 0.5rem 0; }
.class-select-row { display: flex; flex-direction: column; gap: 0.3rem; margin-bottom: 0.6rem; }
.class-select-row label { font-size: 0.78rem; color: #94a3b8; }
.class-select {
  padding: 0.5rem 0.7rem;
  border-radius: 0.4rem;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(15,23,42,0.6);
  color: #e2e8f0;
  font-size: 0.82rem;
  font-family: inherit;
}
.class-select:focus { outline: none; border-color: rgba(165,180,252,0.5); }
.ann-hint { color: #64748b; font-size: 0.8rem; text-align: center; padding: 1rem; }

/* Settings */
.settings-card { text-align: center; padding: 2rem; }
.settings-card h3 { margin: 0 0 0.8rem; }
.settings-name { font-size: 1.1rem; font-weight: 700; color: #f1f5f9; margin: 0.3rem 0; }
.settings-email { font-size: 0.85rem; color: #94a3b8; margin: 0.2rem 0; }
.settings-role { font-size: 0.78rem; color: #a5b4fc; margin: 0.3rem 0; }

/* Loading */
.loading-state { display: flex; justify-content: center; padding: 3rem; }
.spinner {
  width: 36px; height: 36px;
  border: 3px solid rgba(165,180,252,0.2);
  border-top-color: #a5b4fc;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Empty Welcome */
.empty-welcome { text-align: center; padding: 3rem 1.5rem; }
.empty-icon { font-size: 3rem; margin-bottom: 0.8rem; }
.empty-welcome h3 { margin: 0 0 0.4rem; color: #e5e7eb; }
.empty-welcome p { margin: 0 0 1.2rem; color: #64748b; font-size: 0.85rem; }
.empty-cta {
  padding: 0.6rem 1.5rem;
  border: none;
  border-radius: 0.6rem;
  background: linear-gradient(135deg, #6366f1, #7c3aed);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.empty-cta:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(99,102,241,0.3); }

@media (max-width: 768px) {
  .kpi-strip { grid-template-columns: repeat(4, 1fr); }
  .content-area { padding: 0.8rem; }
  .content-area.chat-open .content-main { flex: 1; }
  .chat-col { display: none; }
}
</style>
