<script setup lang="ts">
import { ref } from 'vue';
import { addComment, getComments } from '../../services/report.service';
import { useI18n } from '../../composables/useI18n';
import type { ReportComment } from '../../services/report.service';

const props = defineProps<{
  reportId: number;
  userRole: string;
  userName: string;
}>();

const { t } = useI18n();
const comments = ref<ReportComment[]>([]);
const newComment = ref('');
const loading = ref(false);
const sending = ref(false);

async function load() {
  loading.value = true;
  try {
    const res = await getComments(props.reportId);
    if (res.success) comments.value = res.comments;
  } catch (err) {
    console.error('load comments failed:', err);
  }
  loading.value = false;
}

async function send() {
  if (!newComment.value.trim()) return;
  sending.value = true;
  try {
    const res = await addComment(props.reportId, newComment.value.trim());
    if (res.success) {
      newComment.value = '';
      await load();
    }
  } catch (err) {
    console.error('send comment failed:', err);
  }
  sending.value = false;
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString('ar-SA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function authorLabel(role: string) {
  if (role === 'teacher') return t('common.authorTeacher');
  if (role === 'admin') return t('common.authorAdmin');
  return t('common.authorStudent');
}

load();
</script>

<template>
  <div class="comment-thread">
    <h4 class="title">{{ t('common.commentsTitle') }}</h4>

    <div v-if="loading" class="status">...</div>
    <div v-else-if="comments.length === 0" class="status">{{ t('common.noComments') }}</div>

    <div class="comments-list">
      <div
        v-for="c in comments"
        :key="c.id"
        :class="['comment', { me: c.author_role === userRole }]"
      >
        <div class="comment-header">
          <span class="author">{{ authorLabel(c.author_role) }} — {{ c.author_name }}</span>
          <span class="time">{{ formatTime(c.created_at) }}</span>
        </div>
        <p class="comment-body">{{ c.content }}</p>
      </div>
    </div>

    <div class="input-row">
      <input
        v-model="newComment"
        type="text"
        :placeholder="t('common.commentPlaceholder')"
        @keydown.enter.prevent="send"
      />
      <button :disabled="sending || !newComment.trim()" @click="send">
        {{ sending ? '...' : t('common.send') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.comment-thread {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.title { margin: 0; font-size: 0.9rem; color: #67e8f9; }
.status { text-align: center; color: #64748b; font-size: 0.8rem; padding: 0.5rem; }
.comments-list { display: flex; flex-direction: column; gap: 0.5rem; max-height: 300px; overflow-y: auto; padding-inline-end: 0.25rem; }
.comment { padding: 0.6rem 0.8rem; border-radius: 0.45rem; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); }
.comment.me { background: rgba(99, 102, 241, 0.08); border-color: rgba(99, 102, 241, 0.15); }
.comment-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.2rem; }
.author { font-size: 0.75rem; color: #94a3b8; font-weight: 600; }
.time { font-size: 0.7rem; color: #475569; }
.comment-body { margin: 0; font-size: 0.85rem; color: #e2e8f0; line-height: 1.45; }
.input-row { display: flex; gap: 0.4rem; margin-top: 0.25rem; }
.input-row input { flex: 1; padding: 0.5rem 0.7rem; border-radius: 0.4rem; border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(0, 0, 0, 0.3); color: #e2e8f0; font-size: 0.85rem; font-family: inherit; }
.input-row button { padding: 0.5rem 1rem; border-radius: 0.4rem; border: none; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; font-size: 0.8rem; font-weight: 700; cursor: pointer; }
.input-row button:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
