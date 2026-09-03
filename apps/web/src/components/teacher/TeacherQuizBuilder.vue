<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { locale } = useI18n();
import { ref, onMounted } from 'vue';

import { useConfirmDialog } from '../../composables/useConfirmDialog';
import { createQuiz, addQuestion, publishQuiz, closeQuiz, deleteQuiz, getMyQuizzes, getQuizSubmissions, type Quiz, type QuizSubmission } from '../../services/quiz.service';
import { getMyClasses } from '../../services/class.service';
import type { ClassItem } from '../../services/class.service';




const quizzes = ref<Quiz[]>([]);
const classes = ref<ClassItem[]>([]);
const loading = ref(false);
const error = ref('');

const showBuilder = ref(false);
const builderTitle = ref('');
const builderDesc = ref('');
const builderClassId = ref('');
const builderTime = ref(30);
const builderQuestions = ref<{ question_text: string; option_a: string; option_b: string; option_c: string; option_d: string; correct_answer: string; points: number }[]>([]);
const newQ = ref({ question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'a', points: 10 });
const saving = ref(false);
const editingIndex = ref(-1);

const viewSubmissions = ref<Quiz | null>(null);
const submissions = ref<QuizSubmission[]>([]);

async function load() {
  loading.value = true;
  try {
    const [qRes, cRes] = await Promise.allSettled([getMyQuizzes(), getMyClasses()]);
    if (qRes.status === 'fulfilled' && qRes.value.success) quizzes.value = qRes.value.quizzes;
    if (cRes.status === 'fulfilled' && cRes.value.success) classes.value = cRes.value.classes;
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Failed to load';
  }
  loading.value = false;
}

function openBuilder() {
  showBuilder.value = true;
  builderQuestions.value = [];
  newQ.value = { question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'a', points: 10 };
}

function addQuestionLocal() {
  if (!newQ.value.question_text.trim() || !newQ.value.option_a.trim() || !newQ.value.option_b.trim()) return;
  if (editingIndex.value >= 0) {
    builderQuestions.value[editingIndex.value] = { ...newQ.value };
    editingIndex.value = -1;
  } else {
    builderQuestions.value.push({ ...newQ.value });
  }
  newQ.value = { question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'a', points: 10 };
}

function editQuestionLocal(i: number) {
  editingIndex.value = i;
  newQ.value = { ...builderQuestions.value[i] };
}

function removeQuestionLocal(i: number) {
  builderQuestions.value.splice(i, 1);
  if (editingIndex.value === i) editingIndex.value = -1;
}

async function saveQuiz() {
  if (!builderTitle.value.trim() || !builderClassId.value || builderQuestions.value.length === 0) return;
  saving.value = true;
  const res = await createQuiz(builderClassId.value, builderTitle.value, builderDesc.value, builderTime.value);
  if (res.success && res.quiz) {
    for (const q of builderQuestions.value) {
      await addQuestion(res.quiz.id, {
        question_text: q.question_text,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c || undefined,
        option_d: q.option_d || undefined,
        correct_answer: q.correct_answer,
        points: q.points,
      });
    }
    showBuilder.value = false;
    builderTitle.value = '';
    builderDesc.value = '';
    builderQuestions.value = [];
    await load();
  }
  saving.value = false;
}

async function publish(id: number) {
  await publishQuiz(id);
  await load();
}

async function close(id: number) {
  await closeQuiz(id);
  await load();
}

const { confirmDialog } = useConfirmDialog();

async function remove(id: number) {
  const ok = await confirmDialog({ message: 'هل أنت متأكد من حذف هذا الامتحان؟', variant: 'danger' });
  if (!ok) return;
  await deleteQuiz(id);
  await load();
}

async function viewSubs(quiz: Quiz) {
  viewSubmissions.value = quiz;
  const res = await getQuizSubmissions(quiz.id);
  if (res.success) submissions.value = res.submissions;
}

onMounted(load);
</script>

<template>
  <div class="quizzes-tab">
    <div v-if="!showBuilder && !viewSubmissions">
      <div class="header-row">
        <h3>📝 الامتحانات</h3>
        <button class="btn-create" @click="openBuilder">+ إنشاء امتحان</button>
      </div>

      <div v-if="loading" class="loading">جاري التحميل...</div>
      <div v-else-if="error" class="error-box">❌ {{ error }}</div>
      <div v-else-if="quizzes.length === 0" class="empty">لا توجد امتحانات بعد</div>
      <div v-else class="quiz-list">
        <div v-for="q in quizzes" :key="q.id" class="quiz-card">
          <div class="quiz-header">
            <h4>{{ q.title }}</h4>
            <span :class="['quiz-status', q.status]">{{ q.status === 'draft' ? 'مسودة' : q.status === 'published' ? 'منشور' : 'منتهي' }}</span>
          </div>
          <p v-if="q.description" class="quiz-desc">{{ q.description }}</p>
          <div class="quiz-meta">
            <span>⏱️ {{ q.time_limit_minutes }} دقيقة</span>
            <span>📊 {{ q.max_score }} نقطة</span>
          </div>
          <div class="quiz-actions">
            <button v-if="q.status === 'draft'" class="btn-mini publish" @click="publish(q.id)">نشر</button>
            <button v-if="q.status === 'published'" class="btn-mini close" @click="close(q.id)">إغلاق</button>
            <button class="btn-mini view" @click="viewSubs(q)">النتائج</button>
            <button class="btn-mini delete" @click="remove(q.id)">حذف</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Builder -->
    <div v-if="showBuilder" class="builder">
      <div class="header-row">
        <h3>إنشاء امتحان جديد</h3>
        <button class="btn-cancel" @click="showBuilder = false">إلغاء</button>
      </div>

      <div class="form-group">
        <label>عنوان الامتحان</label>
        <input v-model="builderTitle" placeholder="مثال: امتحان الفصل الأول" />
      </div>
      <div class="form-group">
        <label>الوصف (اختياري)</label>
        <input v-model="builderDesc" placeholder="وصف مختصر" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>الفصل</label>
          <select v-model="builderClassId">
            <option value="" disabled>— اختر فصل —</option>
            <option v-for="cls in classes" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>الوقت (دقائق)</label>
          <input v-model.number="builderTime" type="number" min="1" max="180" />
        </div>
      </div>

      <h4>الأسئلة ({{ builderQuestions.length }})</h4>
      <div v-for="(q, i) in builderQuestions" :key="i" class="saved-q">
        <span class="q-num">{{ i + 1 }}.</span>
        <span class="q-text">{{ q.question_text }}</span>
        <span class="q-answer">الإجابة: {{ q.correct_answer.toUpperCase() }}</span>
        <span class="q-points">{{ q.points }} نقطة</span>
        <button class="btn-mini edit" @click="editQuestionLocal(i)">✏️</button>
        <button class="btn-mini delete" @click="removeQuestionLocal(i)">✕</button>
      </div>

      <div class="new-q-form">
        <h4>إضافة سؤال جديد</h4>
        <div class="form-group">
          <label>نص السؤال</label>
          <textarea v-model="newQ.question_text" rows="2" placeholder="اكتب السؤال هنا..."></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>الخيار A</label>
            <input v-model="newQ.option_a" />
          </div>
          <div class="form-group">
            <label>الخيار B</label>
            <input v-model="newQ.option_b" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>الخيار C (اختياري)</label>
            <input v-model="newQ.option_c" />
          </div>
          <div class="form-group">
            <label>الخيار D (اختياري)</label>
            <input v-model="newQ.option_d" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>الإجابة الصحيحة</label>
            <select v-model="newQ.correct_answer">
              <option value="a">A</option>
              <option value="b">B</option>
              <option value="c">C</option>
              <option value="d">D</option>
            </select>
          </div>
          <div class="form-group">
            <label>النقاط</label>
            <input v-model.number="newQ.points" type="number" min="1" max="100" />
          </div>
        </div>
        <button class="btn-add-q" @click="addQuestionLocal">{{ editingIndex >= 0 ? '✏️ تحديث السؤال' : '+ إضافة السؤال' }}</button>
      </div>

      <button class="btn-save" @click="saveQuiz" :disabled="saving || !builderTitle.trim() || !builderClassId || builderQuestions.length === 0">
        {{ saving ? 'جاري الحفظ...' : 'حفظ ونشر الامتحان' }}
      </button>
    </div>

    <!-- Submissions -->
    <div v-if="viewSubmissions" class="submissions-view">
      <div class="header-row">
        <h3>نتائج: {{ viewSubmissions.title }}</h3>
        <button class="btn-cancel" @click="viewSubmissions = null">رجوع</button>
      </div>
      <div v-if="submissions.length === 0" class="empty">لا توجد إجابات بعد</div>
      <table v-else class="subs-table">
        <thead>
          <tr><th>الطالب</th><th>الدرجة</th><th>تاريخ الإرسال</th></tr>
        </thead>
        <tbody>
          <tr v-for="s in submissions" :key="s.id">
            <td>{{ s.student_name }}</td>
            <td>{{ s.score }} / {{ viewSubmissions.max_score }}</td>
            <td>{{ s.submitted_at ? new Date(s.submitted_at).toLocaleDateString(locale === 'ar' ? 'ar-SA' : locale) : '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped src="./teacher-quiz-builder.css"></style>
