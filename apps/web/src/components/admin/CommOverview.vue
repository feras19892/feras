<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { getAnnouncements, type Announcement } from '../../services/announcement.service';
import { getAdminFeedback, type AdminFeedbackItem, type AdminFeedbackStats } from '../../services/admin.service';
import { getAdminChatStats, getAdminFlaggedMessages, type ClassMessage } from '../../services/chat.service';
import { getConversations, getUnreadMessageCount, type ConversationItem } from '../../services/admin.service';

const emit = defineEmits<{
  (e: 'navigate', section: string): void
  (e: 'back'): void
}>();

const { t, locale } = useI18n();
const loading = ref(true);
const error = ref('');

const announcements = ref<Announcement[]>([]);
const feedbackList = ref<AdminFeedbackItem[]>([]);
const feedbackStats = ref<AdminFeedbackStats | null>(null);
const chatStats = ref<{ total: number; flagged: number; byClass: { id: string; name: string; msg_count: number; flagged_count: number }[] } | null>(null);
const flaggedMessages = ref<ClassMessage[]>([]);
const conversations = ref<ConversationItem[]>([]);
const unreadMessages = ref(0);

async function loadData() {
  loading.value = true;
  error.value = '';
  try {
    const [ann, fb, cs, fm, conv, unread] = await Promise.all([
      getAnnouncements(),
      getAdminFeedback(),
      getAdminChatStats(),
      getAdminFlaggedMessages(),
      getConversations(),
      getUnreadMessageCount(),
    ]);
    if (ann.success) announcements.value = ann.announcements;
    if (fb.success) { feedbackList.value = fb.feedback; feedbackStats.value = fb.stats; }
    if (cs.success) chatStats.value = cs.stats;
    if (fm.success) flaggedMessages.value = fm.messages;
    if (conv.success) conversations.value = conv.conversations;
    if (unread.success) unreadMessages.value = unread.count;
  } catch (err: unknown) {
    error.value = (err instanceof Error ? err.message : '') || 'فشل تحميل البيانات';
  } finally {
    loading.value = false;
  }
}

onMounted(loadData);

// Stats
const pinnedAnnouncements = computed(() => announcements.value.filter(a => a.is_pinned).length);
const openFeedback = computed(() => feedbackStats.value?.open ?? feedbackList.value.filter(f => f.status === 'open').length);
const flaggedChatCount = computed(() => chatStats.value?.flagged ?? 0);
const totalUnread = computed(() => unreadMessages.value);

// Alerts
const hasAlerts = computed(() => openFeedback.value > 0 || flaggedChatCount.value > 0 || totalUnread.value > 0);

// Recent items
const recentAnnouncements = computed(() =>
  [...announcements.value]
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
    .slice(0, 5)
);

const openFeedbackItems = computed(() =>
  feedbackList.value.filter(f => f.status === 'open').slice(0, 5)
);

const recentFlagged = computed(() => flaggedMessages.value.slice(0, 5));

const recentConversations = computed(() =>
  [...conversations.value]
    .sort((a, b) => (b.last_at || '').localeCompare(a.last_at || ''))
    .slice(0, 5)
);

const commSections = computed(() => [
  { id: 'announcements', icon: '📢', label: t('shared.navAnnouncements') },
  { id: 'feedback', icon: '💬', label: t('shared.navFeedback') },
  { id: 'chat', icon: '🖥️', label: t('shared.navChat') },
  { id: 'messages', icon: '✉️', label: t('shared.navMessages') },
]);

function formatTime(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  if (diffMin < 1) return t('shared.justNow');
  if (diffMin < 60) return t('shared.minutesAgo').replace('{n}', String(diffMin));
  if (diffHr < 24) return t('shared.hoursAgo').replace('{n}', String(diffHr));
  if (diffDay < 7) return t('shared.daysAgo').replace('{n}', String(diffDay));
  return d.toLocaleDateString(locale.value === 'ar' ? 'ar-SA' : locale.value);
}

function scopeLabel(scope: string) {
  const labels: Record<string, string> = { global: t('shared.scopeGlobal'), school: t('shared.roleSchool'), class: t('shared.navClasses') };
  return labels[scope] || scope;
}

function feedbackTypeLabel(type: string) {
  const labels: Record<string, string> = { rating: t('shared.feedbackRating'), complaint: t('shared.feedbackComplaint'), suggestion: t('shared.feedbackSuggestion') };
  return labels[type] || type;
}
</script>

<template>
  <div class="tab-content">

    <!-- Back -->
    <button class="go-back" @click="emit('back')">
      <span>⟵</span>
      <span>العودة للنظرة العامة</span>
    </button>

    <div v-if="loading" class="loading-inline">جاري تحميل بيانات التواصل...</div>
    <div v-else-if="error" class="error-inline">❌ {{ error }}</div>

    <template v-else>
      <!-- ═══ Section 0: الأقسام ═══ -->
      <div class="section-header">
        <h2 class="section-title">⚡ الأقسام</h2>
      </div>
      <div class="quick-links-grid">
        <button
          v-for="item in commSections"
          :key="item.id"
          class="quick-link-card"
          @click="emit('navigate', item.id)"
        >
          <span v-if="item.id === 'feedback' && openFeedback > 0" class="go-badge">{{ openFeedback }}</span>
          <span v-if="item.id === 'chat' && flaggedChatCount > 0" class="go-badge">{{ flaggedChatCount }}</span>
          <span v-if="item.id === 'messages' && totalUnread > 0" class="go-badge">{{ totalUnread }}</span>
          <span class="link-icon-lg">{{ item.icon }}</span>
          <span class="link-label-lg">{{ item.label }}</span>
          <template v-if="item.id === 'announcements'">
            <span class="go-count">{{ announcements.length }}</span>
            <span class="go-sub">إعلان</span>
          </template>
          <template v-else-if="item.id === 'feedback'">
            <span class="go-count">{{ feedbackStats?.total ?? feedbackList.length }}</span>
            <span class="go-sub">ملاحظة</span>
          </template>
          <template v-else-if="item.id === 'chat'">
            <span class="go-count">{{ chatStats?.total ?? 0 }}</span>
            <span class="go-sub">رسالة</span>
          </template>
          <template v-else-if="item.id === 'messages'">
            <span class="go-count">{{ conversations.length }}</span>
            <span class="go-sub">محادثة</span>
          </template>
        </button>
      </div>

      <!-- ═══ Section 1: ملخص التواصل ═══ -->
      <div class="section-header">
        <h2 class="section-title">📊 ملخص التواصل</h2>
      </div>
      <div class="hero-stats">
        <div class="hero-card primary">
          <div class="hero-icon">📢</div>
          <div class="hero-body">
            <div class="hero-label">الإعلانات</div>
            <div class="hero-value">{{ announcements.length }}</div>
            <div class="hero-sub">{{ pinnedAnnouncements }} مثبت • {{ announcements.filter(a => a.scope === 'global').length }} عام</div>
          </div>
        </div>
        <div class="hero-card">
          <div class="hero-icon">💬</div>
          <div class="hero-body">
            <div class="hero-label">الملاحظات</div>
            <div class="hero-value">{{ feedbackStats?.total ?? feedbackList.length }}</div>
            <div class="hero-sub">{{ openFeedback }} مفتوحة • {{ feedbackStats?.resolved ?? 0 }} محلولة</div>
          </div>
        </div>
        <div class="hero-card">
          <div class="hero-icon">🖥️</div>
          <div class="hero-body">
            <div class="hero-label">رسائل الشات</div>
            <div class="hero-value">{{ chatStats?.total ?? 0 }}</div>
            <div class="hero-sub">{{ flaggedChatCount }} مميزة ⚠️</div>
          </div>
        </div>
        <div class="hero-card accent">
          <div class="hero-icon">✉️</div>
          <div class="hero-body">
            <div class="hero-label">رسائل مباشرة</div>
            <div class="hero-value">{{ conversations.length }}</div>
            <div class="hero-sub">{{ totalUnread }} غير مقروءة</div>
          </div>
        </div>
      </div>

      <!-- ═══ Section 2: إجراءات بانتظارك ═══ -->
      <div v-if="hasAlerts" class="section-header">
        <h2 class="section-title">⏳ إجراءات بانتظارك</h2>
      </div>
      <div v-if="hasAlerts" class="pending-grid">
        <button v-if="openFeedback > 0" class="pending-card warning" @click="emit('navigate', 'feedback')">
          <span class="pending-icon">💬</span>
          <div class="pending-body">
            <span class="pending-label">ملاحظات مفتوحة</span>
            <span class="pending-count">{{ openFeedback }}</span>
          </div>
          <span class="pending-arrow">←</span>
        </button>
        <button v-if="flaggedChatCount > 0" class="pending-card danger" @click="emit('navigate', 'chat')">
          <span class="pending-icon">🚩</span>
          <div class="pending-body">
            <span class="pending-label">رسائل شات مميزة</span>
            <span class="pending-count">{{ flaggedChatCount }}</span>
          </div>
          <span class="pending-arrow">←</span>
        </button>
        <button v-if="totalUnread > 0" class="pending-card info" @click="emit('navigate', 'messages')">
          <span class="pending-icon">✉️</span>
          <div class="pending-body">
            <span class="pending-label">رسائل مباشرة غير مقروءة</span>
            <span class="pending-count">{{ totalUnread }}</span>
          </div>
          <span class="pending-arrow">←</span>
        </button>
      </div>

      <!-- ═══ Section 3: أحدث الإعلانات ═══ -->
      <div class="section-header">
        <h2 class="section-title">📢 أحدث الإعلانات</h2>
      </div>
      <div class="modern-card">
        <div v-if="recentAnnouncements.length === 0" class="empty-inline">لا توجد إعلانات</div>
        <div v-else class="recent-list">
          <div v-for="a in recentAnnouncements" :key="a.id" class="recent-item" @click="emit('navigate', 'announcements')">
            <span class="recent-icon">{{ a.is_pinned ? '📌' : '📢' }}</span>
            <div class="recent-info">
              <span class="recent-name">{{ a.title }}</span>
              <span class="recent-meta">{{ a.author_name }} • {{ scopeLabel(a.scope) }}</span>
            </div>
            <span class="recent-badge" :class="a.scope">{{ scopeLabel(a.scope) }}</span>
            <span class="recent-date">{{ formatTime(a.created_at) }}</span>
          </div>
        </div>
      </div>

      <!-- ═══ Section 4: ملاحظات مفتوحة ═══ -->
      <div class="section-header">
        <h2 class="section-title">💬 ملاحظات مفتوحة</h2>
      </div>
      <div class="modern-card">
        <div v-if="openFeedbackItems.length === 0" class="empty-inline">لا توجد ملاحظات مفتوحة ✅</div>
        <div v-else class="recent-list">
          <div v-for="f in openFeedbackItems" :key="f.id" class="recent-item" @click="emit('navigate', 'feedback')">
            <span class="recent-icon">{{ f.type === 'complaint' ? '⚠️' : f.type === 'rating' ? '⭐' : '💡' }}</span>
            <div class="recent-info">
              <span class="recent-name">{{ f.user_name }}</span>
              <span class="recent-meta">{{ feedbackTypeLabel(f.type) }}{{ f.experiment_name ? ' • ' + f.experiment_name : '' }}</span>
            </div>
            <span class="recent-badge warn">مفتوحة</span>
            <span class="recent-date">{{ formatTime(f.created_at || '') }}</span>
          </div>
        </div>
      </div>

      <!-- ═══ Section 5: رسائل شات مميزة ═══ -->
      <div v-if="recentFlagged.length > 0" class="section-header">
        <h2 class="section-title">🚩 رسائل شات مميزة</h2>
      </div>
      <div v-if="recentFlagged.length > 0" class="modern-card">
        <div class="recent-list">
          <div v-for="m in recentFlagged" :key="m.id" class="recent-item" @click="emit('navigate', 'chat')">
            <span class="recent-icon">🚩</span>
            <div class="recent-info">
              <span class="recent-name">{{ m.user_name }}</span>
              <span class="recent-meta">{{ m.content?.slice(0, 60) }}{{ (m.content?.length ?? 0) > 60 ? '...' : '' }}</span>
            </div>
            <span class="recent-badge danger">مميزة</span>
            <span class="recent-date">{{ formatTime(m.created_at) }}</span>
          </div>
        </div>
      </div>

      <!-- ═══ Section 6: أحدث المحادثات ═══ -->
      <div class="section-header">
        <h2 class="section-title">✉️ أحدث المحادثات</h2>
      </div>
      <div class="modern-card">
        <div v-if="recentConversations.length === 0" class="empty-inline">لا توجد محادثات</div>
        <div v-else class="recent-list">
          <div v-for="c in recentConversations" :key="c.other_id" class="recent-item" @click="emit('navigate', 'messages')">
            <span class="recent-icon">{{ c.other_role === 'teacher' ? '👨‍🏫' : c.other_role === 'student' ? '🎓' : '🛡️' }}</span>
            <div class="recent-info">
              <span class="recent-name">{{ c.other_name }}</span>
              <span class="recent-meta">{{ c.last_message?.slice(0, 50) }}{{ (c.last_message?.length ?? 0) > 50 ? '...' : '' }}</span>
            </div>
            <span v-if="c.unread_count > 0" class="recent-badge danger">{{ c.unread_count }} غير مقروء</span>
            <span class="recent-date">{{ formatTime(c.last_at) }}</span>
          </div>
        </div>
      </div>

    </template>
  </div>
</template>

<style scoped>
.go-back {
  display: inline-flex; align-items: center; gap: 0.4rem;
  background: none; border: none; color: #818cf8; cursor: pointer;
  font-family: inherit; font-size: 0.85rem; font-weight: 600;
  padding: 0; margin-bottom: 1rem; transition: color 0.15s;
}
.go-back:hover { color: #a5b4fc; }

.loading-inline { text-align: center; color: #64748b; padding: 2rem; }
.error-inline { text-align: center; color: #f87171; padding: 1rem; }
.empty-inline { text-align: center; color: #64748b; padding: 1rem; font-size: 0.85rem; }

.section-header { margin-bottom: 1rem; margin-top: 1.5rem; }
.section-header:first-of-type { margin-top: 0; }
.section-title { font-size: 1.1rem; font-weight: 800; color: #e2e8f0; padding-bottom: 0.5rem; border-bottom: 2px solid rgba(99,102,241,0.2); }

.hero-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.2rem; margin-bottom: 1.5rem; }
.hero-card { display: flex; align-items: center; gap: 1rem; background: rgba(255,255,255,0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); border-radius: 1rem; padding: 1.5rem; transition: all 0.3s; }
.hero-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
.hero-card.primary { background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1)); border-color: rgba(99,102,241,0.3); }
.hero-card.accent { background: linear-gradient(135deg, rgba(34,211,238,0.1), rgba(59,130,246,0.1)); border-color: rgba(34,211,238,0.3); }
.hero-icon { font-size: 2rem; flex-shrink: 0; }
.hero-body { flex: 1; min-width: 0; }
.hero-label { font-size: 0.8rem; color: #94a3b8; font-weight: 500; margin-bottom: 0.5rem; }
.hero-value { font-size: 2.2rem; font-weight: 800; color: #e2e8f0; line-height: 1; margin-bottom: 0.5rem; }
.hero-sub { font-size: 0.75rem; color: #64748b; }

.pending-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.8rem; margin-bottom: 1.5rem; }
.pending-card { display: flex; align-items: center; gap: 0.8rem; padding: 1rem 1.2rem; border-radius: 0.8rem; border: 1px solid; cursor: pointer; transition: all 0.2s; font-family: inherit; text-align: start; }
.pending-card:hover { transform: translateY(-2px); }
.pending-card.warning { background: rgba(245,158,11,0.08); border-color: rgba(245,158,11,0.2); }
.pending-card.warning:hover { background: rgba(245,158,11,0.15); }
.pending-card.info { background: rgba(59,130,246,0.08); border-color: rgba(59,130,246,0.2); }
.pending-card.info:hover { background: rgba(59,130,246,0.15); }
.pending-card.danger { background: rgba(239,68,68,0.08); border-color: rgba(239,68,68,0.2); }
.pending-card.danger:hover { background: rgba(239,68,68,0.15); }
.pending-icon { font-size: 1.5rem; flex-shrink: 0; }
.pending-body { flex: 1; display: flex; flex-direction: column; }
.pending-label { font-size: 0.82rem; font-weight: 600; color: #cbd5e1; }
.pending-count { font-size: 1.3rem; font-weight: 800; color: #e2e8f0; }
.pending-arrow { font-size: 1rem; color: #64748b; }

.quick-links-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 0.8rem; margin-bottom: 1.5rem; }
.quick-link-card { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1.2rem 0.8rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 0.8rem; color: #cbd5e1; cursor: pointer; transition: all 0.3s; position: relative; font-family: inherit; }
.quick-link-card:hover { background: rgba(99,102,241,0.1); border-color: rgba(99,102,241,0.4); transform: translateY(-3px); box-shadow: 0 6px 16px rgba(0,0,0,0.2); }
.link-icon-lg { font-size: 2rem; line-height: 1; }
.link-label-lg { font-size: 0.82rem; font-weight: 600; text-align: center; }
.go-count { font-size: 1.4rem; font-weight: 800; color: #818cf8; line-height: 1; }
.go-sub { font-size: 0.68rem; color: #64748b; text-align: center; }
.go-badge { position: absolute; top: 0.4rem; inset-inline-end: 0.4rem; min-width: 18px; height: 18px; border-radius: 999px; background: #ef4444; color: #fff; font-size: 0.62rem; font-weight: 700; display: flex; align-items: center; justify-content: center; padding: 0 4px; }

.modern-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 1rem; padding: 1.5rem; }
.recent-list { display: flex; flex-direction: column; gap: 0.4rem; }
.recent-item { display: flex; align-items: center; gap: 0.8rem; padding: 0.6rem 0.75rem; background: rgba(255,255,255,0.02); border-radius: 0.5rem; cursor: pointer; transition: background 0.15s; }
.recent-item:hover { background: rgba(255,255,255,0.05); }
.recent-icon { font-size: 1.2rem; flex-shrink: 0; }
.recent-info { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.recent-name { font-size: 0.85rem; font-weight: 600; color: #e2e8f0; }
.recent-meta { font-size: 0.72rem; color: #64748b; }
.recent-badge { font-size: 0.68rem; padding: 0.15rem 0.5rem; border-radius: 0.3rem; font-weight: 600; background: rgba(99,102,241,0.15); color: #a5b4fc; }
.recent-badge.global { background: rgba(239,68,68,0.15); color: #fca5a5; }
.recent-badge.school { background: rgba(6,182,212,0.15); color: #67e8f9; }
.recent-badge.class { background: rgba(129,140,248,0.15); color: #a5b4fc; }
.recent-badge.warn { background: rgba(245,158,11,0.15); color: #fcd34d; }
.recent-badge.danger { background: rgba(239,68,68,0.15); color: #fca5a5; }
.recent-date { font-size: 0.72rem; color: #475569; flex-shrink: 0; }
</style>
