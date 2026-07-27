<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '../../composables/useI18n'
import { useAuthStore } from '../../modules/auth/stores/auth'
import { useTeacherDashboard } from '../../composables/teacher/useTeacherDashboard'
import { getUnreadChatCounts, markChatRead } from '../../services/chat.service'
import DashboardOverviewTab from './DashboardOverviewTab.vue'
import DashboardDailyTab from './DashboardDailyTab.vue'
import DashboardClassesTab from './DashboardClassesTab.vue'
import DashboardStudentsTab from './DashboardStudentsTab.vue'
import ClassChat from '../shared/ClassChat.vue'
import AccountSettingsModal from '../shared/AccountSettingsModal.vue'
import NameRequestBadge from '../shared/NameRequestBadge.vue'

const router = useRouter()
const emit = defineEmits<{ (e: 'navigate', tab: string): void }>()
const { t, locale } = useI18n()
const auth = useAuthStore()
const { kpi, classRows, studentRows, todayUnopened, overdueUngraded, loading } = useTeacherDashboard()

const activeTab = ref<'overview' | 'daily' | 'classes' | 'students'>('overview')
const helpOpen = ref(false)
const chatClassId = ref<string | null>(null)
const chatClassName = ref('')
const unreadChatCounts = ref<Record<string, number>>({})

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

function dateLocale(): string {
  const map: Record<string, string> = { ar: 'ar-SA', en: 'en-US', es: 'es-ES' }
  return map[locale.value] || 'ar-SA'
}

onMounted(() => {
  loadUnreadCounts()
})
</script>

<template>
  <div :class="['td-container', { 'chat-open': chatClassId }]">
    <div class="td-main">
    <!-- Header -->
    <div class="td-header">
      <div class="td-greeting">
        <h1>{{ t('dashboard.welcome') }}, {{ auth.user?.name }} 👋</h1>
        <span class="td-date">{{ new Date().toLocaleDateString(dateLocale(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) }}</span>
      </div>
      <div class="td-quick-nav">
        <NameRequestBadge />
        <AccountSettingsModal />
        <button class="qn-btn" @click="emit('navigate', 'classes')" title="الفصول">🏫</button>
        <button class="qn-btn" @click="emit('navigate', 'grading')" title="التصحيح">✅</button>
        <button class="qn-btn" @click="emit('navigate', 'stats')" title="الإحصائيات">📊</button>
        <button class="qn-btn" @click="emit('navigate', 'experiments')" title="التجارب">📋</button>
        <button class="qn-btn help-btn" @click="helpOpen = true" title="شرح الصفحة">❓</button>
      </div>
    </div>

    <!-- Summary Strip -->
    <div class="td-strip">
      <div :class="['strip-item', { click: kpi.pendingCount > 0 }]" @click="kpi.pendingCount > 0 && emit('navigate', 'grading')">
        <span class="si-icon">⏳</span><span class="si-val">{{ kpi.pendingCount }}</span><span class="si-lab">{{ t('dashboard.dash.pendingGrading') }}</span>
      </div>
      <div :class="['strip-item', { click: kpi.unopenedCount > 0 }]" @click="kpi.unopenedCount > 0 && (activeTab = 'daily')">
        <span class="si-icon">📬</span><span class="si-val">{{ kpi.unopenedCount }}</span><span class="si-lab">{{ t('dashboard.dash.unopened') }}</span>
      </div>
      <div :class="['strip-item', { click: kpi.overdueCount > 0 }]" @click="kpi.overdueCount > 0 && (activeTab = 'daily')">
        <span class="si-icon">🚨</span><span class="si-val">{{ kpi.overdueCount }}</span><span class="si-lab">{{ t('dashboard.dash.overdue') }}</span>
      </div>
      <div class="strip-item"><span class="si-icon">📥</span><span class="si-val">{{ kpi.submittedToday }}</span><span class="si-lab">{{ t('dashboard.dash.submittedToday') }}</span></div>
      <div class="strip-item"><span class="si-icon">✅</span><span class="si-val">{{ kpi.gradedToday }}</span><span class="si-lab">{{ t('dashboard.dash.gradedToday') }}</span></div>
      <div class="strip-item"><span class="si-icon">🎓</span><span class="si-val">{{ kpi.totalStudents }}</span><span class="si-lab">{{ t('dashboard.dash.students') }}</span></div>
      <div class="strip-item"><span class="si-icon">🏫</span><span class="si-val">{{ kpi.totalClasses }}</span><span class="si-lab">{{ t('dashboard.dash.classesReport') }}</span></div>
      <div class="strip-item"><span class="si-icon">📊</span><span class="si-val">{{ kpi.avgGrade }}%</span><span class="si-lab">{{ t('dashboard.dash.avgGrade') }}</span></div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="td-loading"><div class="spinner"></div></div>

    <!-- Empty State -->
    <div v-else-if="kpi.totalClasses === 0" class="td-empty">
      <div class="empty-icon">🏫</div>
      <h3>{{ t('dashboard.noClassesTitle') }}</h3>
      <p>{{ t('dashboard.noClassesMsg') }}</p>
      <button class="empty-cta" @click="emit('navigate', 'classes')">{{ t('dashboard.createClass') }}</button>
    </div>

    <!-- Tabbed Content -->
    <div v-else>
      <div class="td-tabs">
        <button :class="['tab', { active: activeTab === 'overview' }]" @click="activeTab = 'overview'">
          <span>🏠</span> {{ t('dashboard.dash.tabOverview') }}
          <span v-if="kpi.pendingCount > 0" class="tab-badge">{{ kpi.pendingCount }}</span>
        </button>
        <button :class="['tab', { active: activeTab === 'daily' }]" @click="activeTab = 'daily'">
          <span>📬</span> {{ t('dashboard.dash.tabDaily') }}
          <span v-if="kpi.unopenedCount + kpi.overdueCount > 0" class="tab-badge urgent">{{ kpi.unopenedCount + kpi.overdueCount }}</span>
        </button>
        <button :class="['tab', { active: activeTab === 'classes' }]" @click="activeTab = 'classes'">
          <span>🏫</span> {{ t('dashboard.dash.tabClasses') }}
        </button>
        <button :class="['tab', { active: activeTab === 'students' }]" @click="activeTab = 'students'">
          <span>🎓</span> {{ t('dashboard.dash.tabStudents') }}
        </button>
      </div>

      <DashboardOverviewTab
        v-if="activeTab === 'overview'"
        :pending-count="kpi.pendingCount"
        :unopened="todayUnopened"
        :overdue="overdueUngraded"
        :class-rows="classRows"
        :unread-chat-counts="unreadChatCounts"
        @open-report="openReport"
        @open-tab="activeTab = $event"
        @navigate="emit('navigate', $event)"
        @open-chat="openChat"
      />
      <DashboardDailyTab
        v-if="activeTab === 'daily'"
        :unopened="todayUnopened"
        :overdue="overdueUngraded"
        @open-report="openReport"
      />
      <DashboardClassesTab
        v-if="activeTab === 'classes'"
        :rows="classRows"
        @navigate="emit('navigate', $event)"
        @open-chat="openChat"
        :active-chat-id="chatClassId"
        :unread-chat-counts="unreadChatCounts"
      />
      <DashboardStudentsTab
        v-if="activeTab === 'students'"
        :rows="studentRows"
      />
    </div>
    </div>

    <!-- Chat Sidebar -->
    <div v-if="chatClassId" class="td-chat-col">
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
        <h2>📖 دليل استخدام لوحة التحكم</h2>
        <button class="help-close" @click="helpOpen = false">✕</button>
      </div>
      <div class="help-body">
        <div class="help-section">
          <h3>🏠 الترويسة العلوية</h3>
          <ul>
            <li><b>الترحيب:</b> اسمك وتاريخ اليوم بالكامل.</li>
            <li><b>أزرار التصفح السريع:</b> أربعة أزرار على اليمين:
              <ul>
                <li>🏫 — يفتح صفحة إدارة الفصول (إنشاء فصل، رؤية الطلاب، حذف فصل).</li>
                <li>✅ — يفتح صفحة التصحيح (تصحيح تقارير الطلاب، رؤية المعلّقة).</li>
                <li>📊 — يفتح صفحة الإحصائيات (رسوم بيانية، ترتيب الطلاب، أداء التجارب).</li>
                <li>📋 — يفتح صفحة التجارب المتاحة لطلابك.</li>
              </ul>
            </li>
          </ul>
        </div>

        <div class="help-section">
          <h3>📊 شريط الملخص (البطاقات الصغيرة)</h3>
          <p>ثمان بطاقات تعطيك نظرة سريعة على كل شيء:</p>
          <ul>
            <li><b>⏳ بانتظار التصحيح:</b> عدد التقارير التي سلّمها الطلاب ولم تصحّحها بعد. اضغط عليها للذهاب لصفحة التصحيح.</li>
            <li><b>📬 لم تُفتح:</b> تقارير وصلتك ولم تفتحها. اضغط للذهاب لتبويب «يومي».</li>
            <li><b>🚨 متأخرة:</b> تقارير معلّقة منذ يومين أو أكثر. اضغط للذهاب لتبويب «يومي».</li>
            <li><b>📥 وصل اليوم:</b> عدد التقارير التي سُلّمت اليوم فقط.</li>
            <li><b>✅ صُحّح اليوم:</b> عدد التقارير التي صحّحتها اليوم.</li>
            <li><b>🎓 طلاب:</b> إجمالي عدد الطلاب في كل فصولك.</li>
            <li><b>🏫 فصول:</b> إجمالي عدد الفصول التي أنشأتها.</li>
            <li><b>📊 المتوسط:</b> متوسط درجات كل فصولك.</li>
          </ul>
        </div>

        <div class="help-section">
          <h3>🗂️ التبويبات الأربعة</h3>
          <p>أسفل شريط الملخص توجد أربعة تبويبات لتنظيم المعلومات:</p>
          <ul>
            <li><b>🏠 نظرة عامة:</b> أهم ما تحتاج رؤيته في مكان واحد:
              <ul>
                <li>بانر أصفر يذكّرك بعدد التقارير المعلّقة — اضغط للتصحيح.</li>
                <li>عمود «لم تُفتح»: أحدث 5 تقارير لم تفتحها — اضغط على أي تقرير لفتحه.</li>
                <li>عمود «متأخرة»: أقدم 5 تقارير معلّقة منذ يومين+ — اضغط للفتح.</li>
                <li>جدول مصغّر لأهم 5 فصول مع أعداد الطلاب والتقارير والمتوسط.</li>
              </ul>
            </li>
            <li><b>📬 يومي:</b> قوائم كاملة لكل التقارير:
              <ul>
                <li>كل التقارير التي لم تُفتح بعد (قائمة كاملة وليس 5 فقط).</li>
                <li>كل التقارير المتأخرة دون تصحيح مع عدد الأيام المنقضية.</li>
                <li>اضغط على أي تقرير لفتح صفحته الكاملة.</li>
              </ul>
            </li>
            <li><b>🏫 الفصول:</b> جدول كامل لكل فصل:
              <ul>
                <li>اسم الفصل والكود، عدد الطلاب، إجمالي التقارير، المصحّحة، المعلّقة، المتوسط.</li>
                <li>الخلايا الصفراء تعني وجود تقارير معلّقة.</li>
                <li>اضغط على أي صف للذهاب لصفحة إدارة الفصل.</li>
              </ul>
            </li>
            <li><b>🎓 الطلاب:</b> جدول كامل لكل طالب مع فلاتر:
              <ul>
                <li>«الكل»: يعرض كل الطلاب.</li>
                <li>«لديهم معلق»: يعرض الطلاب الذين لديهم تقارير معلّقة فقط.</li>
                <li>«لم يسلموا»: يعرض الطلاب الذين لم يسلّموا أي تقرير (خلفية حمراء).</li>
                <li>لكل طالب: اسمه، فصله، عدد تقاريره، المصحّحة، المعلّقة، متوسطه، آخر تسليم.</li>
              </ul>
            </li>
          </ul>
        </div>

        <div class="help-section">
          <h3>📄 فتح تقرير طالب</h3>
          <p>من أي مكان في الصفحة، اضغط على اسم الطالب أو التقرير — سيفتح صفحة كاملة فيها:</p>
          <ul>
            <li>بيانات الطالب كاملة (الاسم، البريد، الصف، النوع، الإصدار).</li>
            <li>الرسم البياني الذي رسمه الطالب.</li>
            <li>خاتمة الطالب ومصادر الخطأ والتحسينات.</li>
            <li>بانر جودة التقرير (نسبة مئوية + فحوصات).</li>
            <li>جدول القراءات الكامل + إحصائيات لكل عمود (متوسط، انحراف، وسيط، قيم شاذة).</li>
            <li>المعادلات وحلولها.</li>
            <li>تحليل الانحدار والخطأ.</li>
            <li>تحليل الذكاء الاصطناعي.</li>
            <li>نافذة تصحيح (درجة + ملاحظات).</li>
            <li>سجل التصحيح والتعليقات.</li>
          </ul>
        </div>

        <div class="help-section">
          <h3>💡 نصائح سريعة</h3>
          <ul>
            <li>الصفحة تتحدّث تلقائياً كل 60 ثانية — لا تحتاج لإعادة التحميل.</li>
            <li>الأرقام الصفراء = تحتاج إجراء منك. الخضراء = كل شيء تمام.</li>
            <li>الحمراء = متأخرة أو لم يسلّم الطالب.</li>
            <li>ابدأ من تبويب «نظرة عامة» كل يوم لترى ما يحتاج إجراءً.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.td-container { width: 100%; max-width: 1400px; margin: 0 auto; padding: 1rem 1.5rem; }
.td-container.chat-open { display: flex; gap: 0.8rem; max-width: 1600px; }
.td-container.chat-open .td-main { flex: 0 0 66%; min-width: 0; }
.td-main { width: 100%; }
.td-chat-col { flex: 0 0 34%; display: flex; flex-direction: column; position: sticky; top: 80px; height: calc(100vh - 100px); }
.chat-col-header { display: flex; align-items: center; justify-content: space-between; padding: 0.6rem 0.8rem; background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.12); border-radius: 0.6rem 0.6rem 0 0; font-size: 0.85rem; font-weight: 700; color: #c7d2fe; }
.chat-close-btn { width: 26px; height: 26px; border-radius: 0.35rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: #94a3b8; cursor: pointer; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; }
.chat-close-btn:hover { background: rgba(239,68,68,0.15); color: #f87171; }
.td-chat-col :deep(.chat-panel) { border-radius: 0 0 0.6rem 0.6rem; flex: 1; }
.td-chat-col :deep(.chat-header) { display: none; }
.td-chat-col :deep(.chat-body) { max-height: none; flex: 1; }
.td-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
.td-greeting h1 { margin: 0; font-size: 1.3rem; font-weight: 800; background: linear-gradient(135deg, #67e8f9, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.td-date { font-size: 0.78rem; color: #64748b; }
.td-quick-nav { display: flex; gap: 0.4rem; }
.qn-btn { width: 38px; height: 38px; border-radius: 0.6rem; border: 1px solid rgba(255,255,255,0.08); background: rgba(15,23,42,0.6); font-size: 1.1rem; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; justify-content: center; }
.qn-btn:hover { border-color: rgba(99,102,241,0.3); background: rgba(99,102,241,0.08); transform: translateY(-1px); }

.td-strip { display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 0.5rem; margin-bottom: 1.2rem; }
.strip-item { display: flex; flex-direction: column; align-items: center; gap: 0.1rem; padding: 0.6rem 0.4rem; border-radius: 0.6rem; background: rgba(15,23,42,0.5); border: 1px solid rgba(255,255,255,0.05); transition: all 0.15s; }
.strip-item.click { cursor: pointer; }
.strip-item.click:hover { border-color: rgba(251,191,36,0.3); background: rgba(251,191,36,0.04); transform: translateY(-1px); }
.si-icon { font-size: 1.1rem; }
.si-val { font-size: 1.1rem; font-weight: 800; color: #e5e7eb; line-height: 1; }
.si-lab { font-size: 0.62rem; color: #64748b; text-align: center; white-space: nowrap; }

.td-loading { display: flex; justify-content: center; padding: 3rem; }
.spinner { width: 36px; height: 36px; border: 3px solid rgba(99,102,241,0.2); border-top-color: #818cf8; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.td-empty { text-align: center; padding: 3rem 1.5rem; }
.empty-icon { font-size: 3rem; margin-bottom: 0.8rem; }
.td-empty h3 { margin: 0 0 0.4rem; color: #e5e7eb; }
.td-empty p { margin: 0 0 1.2rem; color: #64748b; font-size: 0.85rem; }
.empty-cta { padding: 0.6rem 1.5rem; border: none; border-radius: 0.6rem; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; font-weight: 700; cursor: pointer; font-family: inherit; }
.empty-cta:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(79,70,229,0.3); }

.td-tabs { display: flex; gap: 0.3rem; margin-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 0.5rem; overflow-x: auto; }
.tab { display: flex; align-items: center; gap: 0.3rem; padding: 0.5rem 0.9rem; border: none; border-radius: 0.5rem; background: transparent; color: #64748b; font-size: 0.82rem; font-weight: 700; cursor: pointer; font-family: inherit; white-space: nowrap; transition: all 0.15s; }
.tab:hover { background: rgba(255,255,255,0.04); color: #94a3b8; }
.tab.active { background: rgba(99,102,241,0.12); color: #c7d2fe; }
.tab-badge { padding: 0.1rem 0.4rem; border-radius: 999px; font-size: 0.65rem; font-weight: 800; background: rgba(99,102,241,0.2); color: #c7d2fe; }
.tab-badge.urgent { background: rgba(251,191,36,0.2); color: #fbbf24; }

.help-btn { border-color: rgba(99,102,241,0.2); }
.help-btn:hover { border-color: rgba(99,102,241,0.5); background: rgba(99,102,241,0.12); }

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
