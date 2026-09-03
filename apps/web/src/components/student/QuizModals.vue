<script setup lang="ts">
import type { SubmissionReview } from '../../services/quiz.service';

defineProps<{
  showReview: boolean;
  reviewData: SubmissionReview | null;
  reviewLoading: boolean;
}>();

const emit = defineEmits<{
  closeReview: [];
}>();
</script>

<template>
  <!-- Review Answers Modal -->
  <Transition name="confirm-fade">
    <div v-if="showReview" class="confirm-overlay" @click.self="emit('closeReview')">
      <div class="leaderboard-card">
        <div class="leaderboard-header">
          <h3>📝 مراجعة الإجابات</h3>
          <button class="btn-close-lb" @click="emit('closeReview')">✕</button>
        </div>
        <div v-if="reviewLoading" class="loading">جاري التحميل...</div>
        <template v-else-if="reviewData">
          <div class="lb-my-rank">
            <span>درجتك: <strong>{{ reviewData.score }}</strong></span>
            <span v-if="reviewData.submitted_at">📅 {{ new Date(reviewData.submitted_at).toLocaleDateString('ar', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }}</span>
          </div>
          <div class="lb-list">
            <div v-for="(d, i) in reviewData.details" :key="d.questionId" class="review-row" :class="{ correct: d.is_correct, wrong: !d.is_correct }">
              <div class="review-q-header">
                <span class="review-q-num">{{ i + 1 }}</span>
                <span class="review-q-text">{{ d.question_text }}</span>
                <span class="review-q-points">{{ d.points }} نقطة</span>
              </div>
              <div class="review-options">
                <div class="review-opt" :class="{ correct: 'a' === d.correct_answer, chosen: d.student_answer === 'a' }">A: {{ d.option_a }}</div>
                <div class="review-opt" :class="{ correct: 'b' === d.correct_answer, chosen: d.student_answer === 'b' }">B: {{ d.option_b }}</div>
                <div v-if="d.option_c" class="review-opt" :class="{ correct: 'c' === d.correct_answer, chosen: d.student_answer === 'c' }">C: {{ d.option_c }}</div>
                <div v-if="d.option_d" class="review-opt" :class="{ correct: 'd' === d.correct_answer, chosen: d.student_answer === 'd' }">D: {{ d.option_d }}</div>
              </div>
              <div class="review-result">
                <span v-if="d.is_correct" style="color: #16a34a;">✅ إجابة صحيحة</span>
                <span v-else style="color: #dc2626;">❌ إجابة خاطئة — الصحيح: {{ d.correct_answer.toUpperCase() }}</span>
              </div>
            </div>
          </div>
        </template>
        <div v-else class="empty">لا توجد بيانات</div>
      </div>
    </div>
  </Transition>
</template>

<style scoped src="./student-quizzes-tab.css"></style>
