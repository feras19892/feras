<template>
  <div class="tickets-panel">
    <div class="panel-header">
      <h2 class="panel-title">تذاكر الدعم الفني</h2>
      <div class="header-actions">
        <select v-model="filterStatus" @change="loadTickets" class="filter-select">
          <option value="">كل الحالات</option>
          <option value="open">مفتوح</option>
          <option value="in_progress">قيد المعالجة</option>
          <option value="resolved">تم الحل</option>
          <option value="closed">مغلق</option>
        </select>
        <select v-model="filterPriority" @change="loadTickets" class="filter-select">
          <option value="">كل الأولويات</option>
          <option value="low">منخفضة</option>
          <option value="medium">متوسطة</option>
          <option value="high">عالية</option>
          <option value="urgent">عاجلة</option>
        </select>
      </div>
    </div>

    <div v-if="error" class="alert alert-error">{{ error }}</div>

    <div v-if="loading" class="loading-state">
      <p>جاري التحميل...</p>
    </div>

    <div v-else-if="tickets.length === 0" class="empty-state">
      <p>لا توجد تذاكر حالياً</p>
    </div>

    <div v-else class="tickets-list">
      <div
        v-for="ticket in tickets"
        :key="ticket.id"
        class="ticket-item"
        :class="{ active: selectedTicket?.id === ticket.id }"
        @click="selectTicket(ticket)"
      >
        <div class="ticket-header">
          <span class="ticket-id">#{{ ticket.id }}</span>
          <span :class="['badge', getPriorityColor(ticket.priority)]">{{ getPriorityName(ticket.priority) }}</span>
          <span :class="['badge', getStatusColor(ticket.status)]">{{ getStatusName(ticket.status) }}</span>
        </div>
        <div class="ticket-subject">{{ ticket.subject }}</div>
        <div class="ticket-meta">
          <span>{{ getCategoryName(ticket.category) }}</span>
          <span>{{ formatDate(ticket.created_at) }}</span>
        </div>
      </div>
    </div>

    <div v-if="selectedTicket" class="ticket-detail">
      <div class="detail-header">
        <h3>تفاصيل التذكرة #{{ selectedTicket.id }}</h3>
        <button class="btn-icon" @click="selectedTicket = null">✕</button>
      </div>
      
      <div class="detail-content">
        <div class="detail-row">
          <span class="label">الموضوع:</span>
          <span>{{ selectedTicket.subject }}</span>
        </div>
        <div class="detail-row">
          <span class="label">الفئة:</span>
          <span>{{ getCategoryName(selectedTicket.category) }}</span>
        </div>
        <div class="detail-row">
          <span class="label">الأولوية:</span>
          <span :class="['badge', getPriorityColor(selectedTicket.priority)]">{{ getPriorityName(selectedTicket.priority) }}</span>
        </div>
        <div class="detail-row">
          <span class="label">الحالة:</span>
          <span :class="['badge', getStatusColor(selectedTicket.status)]">{{ getStatusName(selectedTicket.status) }}</span>
        </div>
        <div class="detail-row">
          <span class="label">الوصف:</span>
          <p class="description">{{ selectedTicket.description }}</p>
        </div>
        <div class="detail-row" v-if="selectedTicket.resolution">
          <span class="label">الحل:</span>
          <p class="description">{{ selectedTicket.resolution }}</p>
        </div>
      </div>

      <div class="detail-actions">
        <select v-model="updateData.status" class="action-select">
          <option value="open">مفتوح</option>
          <option value="in_progress">قيد المعالجة</option>
          <option value="resolved">تم الحل</option>
          <option value="closed">مغلق</option>
        </select>
        <input v-model="updateData.resolution" type="text" placeholder="وصف الحل" class="action-input" />
        <button class="btn btn-primary" @click="updateTicket" :disabled="updating">
          {{ updating ? 'جاري التحديث...' : 'تحديث' }}
        </button>
      </div>

      <div class="comments-section">
        <h4>التعليقات</h4>
        <div v-if="comments.length === 0" class="empty-comments">لا توجد تعليقات</div>
        <div v-else class="comments-list">
          <div v-for="comment in comments" :key="comment.id" class="comment-item">
            <div class="comment-header">
              <span class="comment-user">مستخدم #{{ comment.user_id }}</span>
              <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
            </div>
            <p class="comment-text">{{ comment.comment }}</p>
          </div>
        </div>
        <div class="add-comment">
          <textarea v-model="newComment" placeholder="أضف تعليقاً..." class="comment-textarea"></textarea>
          <button class="btn btn-secondary" @click="addComment" :disabled="!newComment || addingComment">
            {{ addingComment ? 'جاري الإضافة...' : 'إضافة' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getTickets, getTicketById, updateTicket as updateTicketApi, addTicketComment, getCategoryName, getPriorityName, getStatusName, getStatusColor, getPriorityColor } from '@/services/support-ticket.service';
import type { SupportTicket, TicketComment } from '@/services/support-ticket.service';

const tickets = ref<SupportTicket[]>([]);
const selectedTicket = ref<SupportTicket | null>(null);
const comments = ref<TicketComment[]>([]);
const loading = ref(false);
const updating = ref(false);
const addingComment = ref(false);
const error = ref('');
const filterStatus = ref('');
const filterPriority = ref('');
const newComment = ref('');

const updateData = ref({
  status: 'open',
  resolution: '',
});

const loadTickets = async () => {
  loading.value = true;
  error.value = '';
  const result = await getTickets({
    status: filterStatus.value || undefined,
    priority: filterPriority.value || undefined,
  });
  loading.value = false;
  
  if (result.success && result.tickets) {
    tickets.value = result.tickets;
  } else {
    error.value = result.message || 'فشل تحميل التذاكر';
  }
};

const selectTicket = async (ticket: SupportTicket) => {
  selectedTicket.value = ticket;
  updateData.value = {
    status: ticket.status,
    resolution: ticket.resolution || '',
  };
  
  const result = await getTicketById(ticket.id);
  if (result.success && result.comments) {
    comments.value = result.comments;
  }
};

const updateTicket = async () => {
  updating.value = true;
  error.value = '';

  const result = await updateTicketApi(selectedTicket.value!.id, {
    status: updateData.value.status,
    resolution: updateData.value.resolution || undefined,
  });
  updating.value = false;

  if (result.success) {
    await loadTickets();
    if (selectedTicket.value) {
      await selectTicket(selectedTicket.value);
    }
  } else {
    error.value = result.message || 'فشل تحديث التذكرة';
  }
};

const addComment = async () => {
  addingComment.value = true;
  error.value = '';

  const result = await addTicketComment(selectedTicket.value!.id, {
    comment: newComment.value,
    is_internal: false,
  });
  addingComment.value = false;

  if (result.success) {
    newComment.value = '';
    await selectTicket(selectedTicket.value!);
  } else {
    error.value = result.message || 'فشل إضافة التعليق';
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

onMounted(() => {
  loadTickets();
});
</script>

<style scoped>
.tickets-panel {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 0.8rem;
  padding: 1.5rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.panel-header {
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.panel-title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: #e2e8f0;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.filter-select,
.action-select,
.action-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  color: #e2e8f0;
  font-family: inherit;
  font-size: 0.85rem;
}

.action-input {
  flex: 1;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #6366f1;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #4f46e5;
}

.btn-secondary {
  background: rgba(99, 102, 241, 0.1);
  color: #cbd5e1;
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(99, 102, 241, 0.2);
}

.btn-icon {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.25rem;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.btn-icon:hover {
  opacity: 1;
}

.alert {
  grid-column: 1 / -1;
  padding: 1rem;
  border-radius: 0.5rem;
  font-size: 0.9rem;
}

.alert-error {
  background: rgba(239, 68, 68, 0.1);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.loading-state,
.empty-state {
  grid-column: 1 / -1;
  padding: 3rem;
  text-align: center;
  color: #64748b;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 0.6rem;
}

.tickets-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 600px;
  overflow-y: auto;
}

.ticket-item {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.ticket-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(99, 102, 241, 0.3);
}

.ticket-item.active {
  background: rgba(99, 102, 241, 0.1);
  border-color: #6366f1;
}

.ticket-header {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.5rem;
}

.ticket-id {
  font-weight: 600;
  color: #e2e8f0;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  color: white;
}

.bg-blue-500 { background: #3b82f6; }
.bg-yellow-500 { background: #eab308; }
.bg-green-500 { background: #22c55e; }
.bg-gray-500 { background: #6b7280; }
.bg-gray-400 { background: #9ca3af; }
.bg-orange-400 { background: #fb923c; }
.bg-red-500 { background: #ef4444; }

.ticket-subject {
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 0.25rem;
}

.ticket-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: #94a3b8;
}

.ticket-detail {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 0.5rem;
  padding: 1.5rem;
  max-height: 600px;
  overflow-y: auto;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-header h3 {
  margin: 0;
  color: #e2e8f0;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.label {
  font-size: 0.85rem;
  color: #94a3b8;
}

.description {
  margin: 0;
  color: #e2e8f0;
  line-height: 1.6;
}

.detail-actions {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.comments-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comments-section h4 {
  margin: 0;
  color: #e2e8f0;
}

.empty-comments {
  color: #64748b;
  font-size: 0.9rem;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 200px;
  overflow-y: auto;
}

.comment-item {
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 0.5rem;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.8rem;
}

.comment-user {
  color: #94a3b8;
}

.comment-date {
  color: #64748b;
}

.comment-text {
  margin: 0;
  color: #e2e8f0;
  line-height: 1.5;
}

.add-comment {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.comment-textarea {
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  color: #e2e8f0;
  font-family: inherit;
  font-size: 0.9rem;
  resize: vertical;
  min-height: 80px;
}

.comment-textarea:focus {
  outline: none;
  border-color: #6366f1;
}
</style>
