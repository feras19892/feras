<template>
  <Transition name="quiz-force-fade">
    <div v-if="visible" class="quiz-force-overlay">
      <div class="quiz-force-card">
        <div class="quiz-force-icon">📝</div>
        <h2>امتحان إجباري</h2>
        <p class="quiz-force-title">{{ quizTitle }}</p>
        <p class="quiz-force-hint">لا يمكنك استخدام النظام حتى تكمل الامتحان</p>
        <button class="quiz-force-start" @click="startNow" :disabled="starting">
          {{ starting ? 'جاري التحميل...' : 'ابدأ الامتحان الآن' }}
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { eventBus } from '@/composables/shared/useEventBus'
import { getAvailableQuizzes } from '@/services/quiz.service'

const visible = ref(false)
const quizTitle = ref('')
const quizId = ref<number | null>(null)
const classId = ref('')
const starting = ref(false)

function onNewNotification(n: { type: string; title: string; message?: string; class_id?: string; quiz_id?: number; quizId?: number }) {
  if (n?.type === 'quiz_created') {
    quizTitle.value = n.title || 'امتحان جديد'
    classId.value = n.class_id || ''
    const qid = n.quiz_id ?? n.quizId
    if (qid) {
      quizId.value = qid
      visible.value = true
    } else {
      findQuizId()
    }
  }
}

async function findQuizId() {
  try {
    const res = await getAvailableQuizzes()
    if (res.success) {
      const published = res.quizzes.find(q => q.status === 'published' && !q.submitted)
      if (published) {
        quizId.value = published.id
        quizTitle.value = published.title
        visible.value = true
      }
    }
  } catch { /* ignore */ }
}

async function startNow() {
  if (quizId.value === null) {
    await findQuizId()
  }
  if (quizId.value === null) {
    visible.value = false
    return
  }
  starting.value = true
  eventBus.emit('student:switch-tab', { tabId: 'quizzes' })
  setTimeout(() => {
    visible.value = false
    starting.value = false
  }, 500)
}

function onForceDismiss() {
  visible.value = false
}

onMounted(() => {
  eventBus.on('notification:new', onNewNotification)
  eventBus.on('quiz:force-dismiss', onForceDismiss)
})
onUnmounted(() => {
  eventBus.off('notification:new', onNewNotification)
  eventBus.off('quiz:force-dismiss', onForceDismiss)
})
</script>

<style scoped>
.quiz-force-overlay {
  position: fixed; inset: 0; z-index: 10001;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.9); backdrop-filter: blur(6px);
}
.quiz-force-card {
  text-align: center; padding: 48px 56px; border-radius: 16px;
  background: linear-gradient(135deg, #1e3a5f, #0f172a);
  color: #fff; max-width: 440px; box-shadow: 0 24px 80px rgba(0,0,0,0.6);
  animation: pop 0.4s ease;
}
.quiz-force-icon { font-size: 64px; margin-bottom: 16px; animation: bounce 1s ease infinite; }
.quiz-force-card h2 { font-size: 22px; margin: 0 0 8px; font-weight: 800; }
.quiz-force-title { font-size: 18px; opacity: 0.95; margin: 0 0 8px; font-weight: 600; }
.quiz-force-hint { font-size: 13px; opacity: 0.6; margin: 0 0 24px; }
.quiz-force-start {
  padding: 12px 32px; border: none; border-radius: 10px;
  background: #3b82f6; color: #fff; font-size: 16px; font-weight: 700; cursor: pointer;
  transition: all 0.15s;
}
.quiz-force-start:hover:not(:disabled) { background: #2563eb; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(59,130,246,0.4); }
.quiz-force-start:disabled { opacity: 0.6; cursor: wait; }
@keyframes pop { from { transform: scale(0.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
.quiz-force-fade-enter-active, .quiz-force-fade-leave-active { transition: opacity 0.3s ease; }
.quiz-force-fade-enter-from, .quiz-force-fade-leave-to { opacity: 0; }
</style>
