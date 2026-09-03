<script setup lang="ts">
import { useAdminCommOverview } from '@/composables/admin/useAdminCommOverview';

const emit = defineEmits<{
  (e: 'navigate', section: string): void
  (e: 'back'): void
}>()

const {
  loading, error, announcements, feedbackList, feedbackStats, chatStats,
  conversations, pinnedAnnouncements, openFeedback,
  flaggedChatCount, totalUnread, hasAlerts, recentAnnouncements, openFeedbackItems,
  recentFlagged, recentConversations, commSections, formatTime, scopeLabel, feedbackTypeLabel,
} = useAdminCommOverview()
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

<style scoped src='./CommOverview.css'></style>
