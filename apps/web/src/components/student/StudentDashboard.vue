<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '../../composables/useI18n'
import { useAuthStore } from '../../modules/auth/stores/auth'
import { useStudentDashboard } from '../../composables/student/useStudentDashboard'
import StudentOverviewTab from './StudentOverviewTab.vue'
import StudentReportsTab from './StudentReportsTab.vue'
import StudentClassesTab from './StudentClassesTab.vue'
import StudentProfileTab from './StudentProfileTab.vue'
import ClassChat from '../shared/ClassChat.vue'
import AccountSettingsModal from '../shared/AccountSettingsModal.vue'

const emit = defineEmits<{ (e: 'navigate', tab: string): void }>()
const router = useRouter()
const { t, locale } = useI18n()
const auth = useAuthStore()
const { kpi, reportRows, recentReports, overduePending, classes, classStudentsMap, joinClassByCode, leaveClassById, loading } = useStudentDashboard()

const dateLocaleStr = computed(() => locale.value === 'ar' ? 'ar-SA' : locale.value === 'es' ? 'es-ES' : 'en-US')

const activeTab = ref<'overview' | 'reports' | 'classes' | 'profile'>('overview')
const helpOpen = ref(false)
const chatClassId = ref<string | null>(null)
const chatClassName = ref('')

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
</script>

<template>
  <div :class="['sd-container', { 'chat-open': chatClassId }]">
    <div class="sd-main">
    <!-- Header -->
    <div class="sd-header">
      <div class="sd-greeting">
        <h1>{{ t('dashboard.welcome') }}, {{ auth.user?.name }} 👋</h1>
        <span class="sd-date">{{ new Date().toLocaleDateString(dateLocaleStr, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) }}</span>
      </div>
      <div class="sd-quick-nav">
        <AccountSettingsModal />
        <button class="qn-btn" @click="emit('navigate', 'branches')" title="الفروع">⚛️</button>
        <button class="qn-btn help-btn" @click="helpOpen = true" title="شرح الصفحة">❓</button>
      </div>
    </div>

    <!-- Summary Strip -->
    <div class="sd-strip">
      <div :class="['strip-item', { click: kpi.pendingCount > 0 }]" @click="kpi.pendingCount > 0 && (activeTab = 'reports')">
        <span class="si-icon">⏳</span><span class="si-val">{{ kpi.pendingCount }}</span><span class="si-lab">{{ t('dashboard.pending') }}</span>
      </div>
      <div :class="['strip-item', { click: kpi.newFeedback > 0 }]" @click="kpi.newFeedback > 0 && (activeTab = 'reports')">
        <span class="si-icon">💬</span><span class="si-val">{{ kpi.newFeedback }}</span><span class="si-lab">{{ t('dashboard.dash.feedback') }}</span>
      </div>
      <div class="strip-item"><span class="si-icon">✅</span><span class="si-val">{{ kpi.gradedCount }}</span><span class="si-lab">{{ t('dashboard.graded') }}</span></div>
      <div class="strip-item"><span class="si-icon">📝</span><span class="si-val">{{ kpi.draftCount }}</span><span class="si-lab">{{ t('dashboard.dash.drafts') }}</span></div>
      <div class="strip-item"><span class="si-icon">📄</span><span class="si-val">{{ kpi.totalReports }}</span><span class="si-lab">{{ t('dashboard.totalReports') }}</span></div>
      <div class="strip-item"><span class="si-icon">🏫</span><span class="si-val">{{ kpi.totalClasses }}</span><span class="si-lab">{{ t('dashboard.classes') }}</span></div>
      <div class="strip-item"><span class="si-icon">📊</span><span class="si-val">{{ kpi.avgGrade }}%</span><span class="si-lab">{{ t('dashboard.average') }}</span></div>
      <div class="strip-item"><span class="si-icon">⭐</span><span class="si-val">{{ kpi.bestGrade }}%</span><span class="si-lab">{{ t('dashboard.bestGrade') }}</span></div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="sd-loading"><div class="spinner"></div></div>

    <!-- Empty State -->
    <div v-else-if="kpi.totalReports === 0 && kpi.totalClasses === 0" class="sd-empty">
      <div class="empty-icon">🎓</div>
      <h3>{{ t('dashboard.dash.studentWelcomeTitle') }}</h3>
      <p>{{ t('dashboard.dash.studentWelcomeMsg') }}</p>
      <button class="empty-cta" @click="emit('navigate', 'branches')">{{ t('dashboard.dash.startExperiment') }}</button>
    </div>

    <!-- Tabbed Content -->
    <div v-else>
      <div class="sd-tabs">
        <button :class="['tab', { active: activeTab === 'overview' }]" @click="activeTab = 'overview'">
          <span>🏠</span> {{ t('dashboard.dash.tabOverview') }}
          <span v-if="kpi.pendingCount + kpi.newFeedback > 0" class="tab-badge">{{ kpi.pendingCount + kpi.newFeedback }}</span>
        </button>
        <button :class="['tab', { active: activeTab === 'reports' }]" @click="activeTab = 'reports'">
          <span>📋</span> {{ t('dashboard.dash.tabReports') }}
          <span v-if="kpi.pendingCount > 0" class="tab-badge urgent">{{ kpi.pendingCount }}</span>
        </button>
        <button :class="['tab', { active: activeTab === 'classes' }]" @click="activeTab = 'classes'">
          <span>🏫</span> {{ t('dashboard.dash.tabClasses') }}
        </button>
        <button :class="['tab', { active: activeTab === 'profile' }]" @click="activeTab = 'profile'">
          <span>👤</span> {{ t('dashboard.dash.tabProfile') }}
        </button>
      </div>

      <StudentOverviewTab
        v-if="activeTab === 'overview'"
        :kpi="kpi"
        :recent="recentReports"
        :overdue="overduePending"
        :classes="classes"
        @open-report="openReport"
        @open-tab="activeTab = $event"
        @navigate="emit('navigate', $event)"
      />
      <StudentReportsTab
        v-if="activeTab === 'reports'"
        :rows="reportRows"
        @open-report="openReport"
      />
      <StudentClassesTab
        v-if="activeTab === 'classes'"
        :classes="classes"
        :class-students-map="classStudentsMap"
        :current-user-id="auth.user?.id || 0"
        :join-fn="joinClassByCode"
        :leave-fn="leaveClassById"
        :active-chat-id="chatClassId"
        @open-chat="openChat"
      />
      <StudentProfileTab
        v-if="activeTab === 'profile'"
        :kpi="kpi"
        :recent="recentReports"
      />
    </div>
    </div>

    <!-- Chat Sidebar -->
    <div v-if="chatClassId" class="sd-chat-col">
      <div class="chat-col-header">
        <span>💬 {{ chatClassName }}</span>
        <button class="chat-close-btn" @click="closeChat">✕</button>
      </div>
      <ClassChat :class-id="chatClassId" :class-name="chatClassName" />
    </div>
  </div>

  <!-- Help Modal -->
  <div v-if="helpOpen" class="help-overlay" @click.self="helpOpen = false">
    <div class="help-modal">
      <div class="help-header">
        <h2>📖 دليل استخدام لوحة الطالب</h2>
        <button class="help-close" @click="helpOpen = false">✕</button>
      </div>
      <div class="help-body">
        <div class="help-section">
          <h3>🏠 الترويسة العلوية</h3>
          <ul>
            <li><b>الترحيب:</b> اسمك وتاريخ اليوم.</li>
            <li><b>أزرار التصفح السريع:</b>
              <ul>
                <li>⚛️ — يفتح صفحة الفروع (فيزياء، كيمياء، رياضيات، أحياء) لبدء تجربة جديدة.</li>
                <li>❓ — يفتح هذا الشرح.</li>
              </ul>
            </li>
          </ul>
        </div>

        <div class="help-section">
          <h3>📊 شريط الملخص</h3>
          <ul>
            <li><b>⏳ معلق:</b> تقارير أرسلتها ولم تُصحّح بعد. اضغط لرؤيتها.</li>
            <li><b>💬 ملاحظات:</b> تقارير مصحّحة فيها ملاحظات من المدرس. اضغط لرؤيتها.</li>
            <li><b>✅ مصحح:</b> إجمالي التقارير المصحّحة.</li>
            <li><b>📝 مسودة:</b> تقارير لم تُرسل بعد.</li>
            <li><b>📄 الإجمالي:</b> كل تقاريرك.</li>
            <li><b>🏫 الفصول:</b> عدد الفصول المنضم لها.</li>
            <li><b>📊 المتوسط:</b> متوسط درجاتك.</li>
            <li><b>⭐ الأفضل:</b> أعلى درجة حصلت عليها.</li>
          </ul>
        </div>

        <div class="help-section">
          <h3>🗂️ التبويبات الأربعة</h3>
          <ul>
            <li><b>🏠 نظرة عامة:</b> أحدث تقاريرك + المعلّقة + فصولك.</li>
            <li><b>📋 تقاريري:</b> كل تقاريرك مع فلاتر (الكل / مصحح / معلق / مسودة). اضغط على أي تقرير لفتحه.</li>
            <li><b>🏫 فصولي:</b> الفصول التي انضممت لها — اضغط على أي فصل لرؤية زملائك فيه، الانضمام لفصل جديد، أو مغادرة فصل.</li>
            <li><b>👤 ملفي:</b> إحصائياتك الكاملة + أحدث تقاريرك.</li>
          </ul>
        </div>

        <div class="help-section">
          <h3>📄 فتح تقرير</h3>
          <p>اضغط على أي تقرير لفتح صفحته الكاملة:</p>
          <ul>
            <li>الدرجة والملاحظات (إذا صُحّح).</li>
            <li>الرسم البياني والقراءات.</li>
            <li>الخاتمة والتحليل.</li>
            <li>إعادة الإرسال (إذا صُحّح وتريد تعديله).</li>
          </ul>
        </div>

        <div class="help-section">
          <h3>💡 نصائح</h3>
          <ul>
            <li>الصفحة تتحدّث تلقائياً كل 60 ثانية.</li>
            <li>ابدأ تجربة جديدة من ⚛️ الفروع.</li>
            <li>انضم لفصل جديد من 🏫 الفصول بكود الفصل.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sd-container { width: 100%; max-width: 1400px; margin: 0 auto; padding: 1rem 1.5rem; }
.sd-container.chat-open { display: flex; gap: 0.8rem; max-width: 1600px; }
.sd-container.chat-open .sd-main { flex: 0 0 66%; min-width: 0; }
.sd-main { width: 100%; }
.sd-chat-col { flex: 0 0 34%; display: flex; flex-direction: column; position: sticky; top: 80px; height: calc(100vh - 100px); }
.chat-col-header { display: flex; align-items: center; justify-content: space-between; padding: 0.6rem 0.8rem; background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.12); border-radius: 0.6rem 0.6rem 0 0; font-size: 0.85rem; font-weight: 700; color: #c7d2fe; }
.chat-close-btn { width: 26px; height: 26px; border-radius: 0.35rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: #94a3b8; cursor: pointer; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; }
.chat-close-btn:hover { background: rgba(239,68,68,0.15); color: #f87171; }
.sd-chat-col :deep(.chat-panel) { border-radius: 0 0 0.6rem 0.6rem; flex: 1; }
.sd-chat-col :deep(.chat-header) { display: none; }
.sd-chat-col :deep(.chat-body) { max-height: none; flex: 1; }
.sd-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
.sd-greeting h1 { margin: 0; font-size: 1.3rem; font-weight: 800; background: linear-gradient(135deg, #67e8f9, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.sd-date { font-size: 0.78rem; color: #64748b; }
.sd-quick-nav { display: flex; gap: 0.4rem; }
.qn-btn { width: 38px; height: 38px; border-radius: 0.6rem; border: 1px solid rgba(255,255,255,0.08); background: rgba(15,23,42,0.6); font-size: 1.1rem; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; justify-content: center; }
.qn-btn:hover { border-color: rgba(99,102,241,0.3); background: rgba(99,102,241,0.08); transform: translateY(-1px); }
.help-btn { border-color: rgba(99,102,241,0.2); }
.help-btn:hover { border-color: rgba(99,102,241,0.5); background: rgba(99,102,241,0.12); }

.sd-strip { display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 0.5rem; margin-bottom: 1.2rem; }
.strip-item { display: flex; flex-direction: column; align-items: center; gap: 0.1rem; padding: 0.6rem 0.4rem; border-radius: 0.6rem; background: rgba(15,23,42,0.5); border: 1px solid rgba(255,255,255,0.05); transition: all 0.15s; }
.strip-item.click { cursor: pointer; }
.strip-item.click:hover { border-color: rgba(251,191,36,0.3); background: rgba(251,191,36,0.04); transform: translateY(-1px); }
.si-icon { font-size: 1.1rem; }
.si-val { font-size: 1.1rem; font-weight: 800; color: #e5e7eb; line-height: 1; }
.si-lab { font-size: 0.62rem; color: #64748b; text-align: center; white-space: nowrap; }

.sd-loading { display: flex; justify-content: center; padding: 3rem; }
.spinner { width: 36px; height: 36px; border: 3px solid rgba(99,102,241,0.2); border-top-color: #818cf8; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.sd-empty { text-align: center; padding: 3rem 1.5rem; }
.empty-icon { font-size: 3rem; margin-bottom: 0.8rem; }
.sd-empty h3 { margin: 0 0 0.4rem; color: #e5e7eb; }
.sd-empty p { margin: 0 0 1.2rem; color: #64748b; font-size: 0.85rem; }
.empty-cta { padding: 0.6rem 1.5rem; border: none; border-radius: 0.6rem; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; font-weight: 700; cursor: pointer; font-family: inherit; }
.empty-cta:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(79,70,229,0.3); }

.sd-tabs { display: flex; gap: 0.3rem; margin-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 0.5rem; overflow-x: auto; }
.tab { display: flex; align-items: center; gap: 0.3rem; padding: 0.5rem 0.9rem; border: none; border-radius: 0.5rem; background: transparent; color: #64748b; font-size: 0.82rem; font-weight: 700; cursor: pointer; font-family: inherit; white-space: nowrap; transition: all 0.15s; }
.tab:hover { background: rgba(255,255,255,0.04); color: #94a3b8; }
.tab.active { background: rgba(99,102,241,0.12); color: #c7d2fe; }
.tab-badge { padding: 0.1rem 0.4rem; border-radius: 999px; font-size: 0.65rem; font-weight: 800; background: rgba(99,102,241,0.2); color: #c7d2fe; }
.tab-badge.urgent { background: rgba(251,191,36,0.2); color: #fbbf24; }

.help-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(6px); display: flex; align-items: flex-start; justify-content: center; z-index: 500; padding: 2rem 1rem; overflow-y: auto; }
.help-modal { background: rgba(15,23,42,0.97); border: 1px solid rgba(255,255,255,0.1); border-radius: 1rem; width: 100%; max-width: 700px; max-height: 85vh; overflow-y: auto; }
.help-header { display: flex; align-items: center; justify-content: space-between; padding: 1.2rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.08); position: sticky; top: 0; background: rgba(15,23,42,0.97); z-index: 1; }
.help-header h2 { margin: 0; font-size: 1.1rem; font-weight: 800; color: #e5e7eb; }
.help-close { width: 32px; height: 32px; border-radius: 0.4rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: #94a3b8; cursor: pointer; font-size: 0.9rem; }
.help-close:hover { background: rgba(239,68,68,0.15); color: #f87171; }
.help-body { padding: 1.2rem 1.5rem; display: flex; flex-direction: column; gap: 1.2rem; }
.help-section h3 { margin: 0 0 0.5rem; font-size: 0.95rem; font-weight: 800; color: #67e8f9; }
.help-section p { margin: 0 0 0.5rem; font-size: 0.82rem; color: #94a3b8; line-height: 1.5; }
.help-section ul { margin: 0; padding-inline-start: 1.2rem; }
.help-section li { font-size: 0.82rem; color: #cbd5e1; line-height: 1.7; margin-bottom: 0.2rem; }
.help-section li b { color: #e5e7eb; }
.help-section ul ul { margin-top: 0.2rem; }
.help-section ul ul li { font-size: 0.78rem; color: #94a3b8; }
</style>
