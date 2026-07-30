<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { createQuiz, addQuestion, publishQuiz, closeQuiz, deleteQuiz, getMyQuizzes, getQuizSubmissions, type Quiz } from '../../services/quiz.service';

const quizzes = ref<Quiz[]>([]);
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

const viewSubmissions = ref<Quiz | null>(null);
const submissions = ref<any[]>([]);

async function load() {
  loading.value = true;
  try {
    const res = await getMyQuizzes();
    if (res.success) quizzes.value = res.quizzes;
  } catch (e: any) {
    error.value = e?.message || 'Failed to load';
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
  builderQuestions.value.push({ ...newQ.value });
  newQ.value = { question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'a', points: 10 };
}

function removeQuestionLocal(i: number) {
  builderQuestions.value.splice(i, 1);
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

async function remove(id: number) {
  if (!confirm('هل أنت متأكد من حذف هذا الامتحان؟')) return;
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
          <label>معرف الفصل (Class ID)</label>
          <input v-model="builderClassId" placeholder="أدخل معرف الفصل" />
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
        <button class="btn-add-q" @click="addQuestionLocal">+ إضافة السؤال</button>
      </div>

      <button class="btn-save" @click="saveQuiz" :disabled="saving || !builderTitle.trim() || !builderClassId.trim() || builderQuestions.length === 0">
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
            <td>{{ s.submitted_at ? new Date(s.submitted_at).toLocaleString('ar-SA') : '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.quizzes-tab { color: #e2e8f0; }
.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.header-row h3 { margin: 0; font-size: 1.1rem; }
.loading, .empty { text-align: center; color: #64748b; padding: 2rem; }
.error-box { background: rgba(239,68,68,0.1); color: #f87171; padding: 1rem; border-radius: 0.5rem; text-align: center; }

.btn-create { padding: 0.5rem 1rem; border-radius: 0.5rem; border: none; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; cursor: pointer; font-weight: 700; font-family: inherit; font-size: 0.85rem; }
.btn-cancel { padding: 0.4rem 0.9rem; border-radius: 0.4rem; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: #94a3b8; cursor: pointer; font-family: inherit; font-size: 0.8rem; }
.btn-save { margin-top: 1rem; padding: 0.6rem 1.5rem; border-radius: 0.5rem; border: none; background: linear-gradient(135deg, #16a34a, #22c55e); color: #fff; cursor: pointer; font-weight: 700; font-family: inherit; font-size: 0.9rem; width: 100%; }
.btn-save:disabled { opacity: 0.5; }
.btn-add-q { padding: 0.4rem 0.9rem; border-radius: 0.4rem; border: 1px dashed rgba(99,102,241,0.4); background: rgba(99,102,241,0.05); color: #a5b4fc; cursor: pointer; font-family: inherit; font-size: 0.8rem; }

.quiz-list { display: flex; flex-direction: column; gap: 0.6rem; }
.quiz-card { background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.6rem; padding: 1rem; }
.quiz-header { display: flex; justify-content: space-between; align-items: center; }
.quiz-header h4 { margin: 0; font-size: 0.95rem; color: #f1f5f9; }
.quiz-status { padding: 0.15rem 0.5rem; border-radius: 0.3rem; font-size: 0.7rem; font-weight: 700; }
.quiz-status.draft { background: rgba(100,116,139,0.15); color: #94a3b8; }
.quiz-status.published { background: rgba(34,197,94,0.15); color: #4ade80; }
.quiz-status.closed { background: rgba(239,68,68,0.15); color: #f87171; }
.quiz-desc { font-size: 0.8rem; color: #94a3b8; margin: 0.3rem 0; }
.quiz-meta { display: flex; gap: 1rem; font-size: 0.75rem; color: #64748b; margin-bottom: 0.5rem; }
.quiz-actions { display: flex; gap: 0.3rem; }
.btn-mini { padding: 0.25rem 0.6rem; border-radius: 0.3rem; border: 1px solid rgba(255,255,255,0.08); background: rgba(15,23,42,0.6); cursor: pointer; font-size: 0.72rem; font-family: inherit; }
.btn-mini.publish { color: #4ade80; }
.btn-mini.close { color: #fca5a5; }
.btn-mini.view { color: #67e8f9; }
.btn-mini.delete { color: #f87171; }
.btn-mini:hover { opacity: 0.8; }

.builder { background: rgba(15,23,42,0.4); border-radius: 0.8rem; padding: 1.2rem; }
.form-group { margin-bottom: 0.8rem; }
.form-group label { display: block; font-size: 0.78rem; color: #94a3b8; margin-bottom: 0.3rem; }
.form-group input, .form-group textarea, .form-group select { width: 100%; padding: 0.5rem 0.7rem; border-radius: 0.4rem; border: 1px solid #334155; background: #0f172a; color: #e2e8f0; font-size: 0.85rem; box-sizing: border-box; font-family: inherit; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; }
.builder h4 { font-size: 0.9rem; color: #cbd5e1; margin: 1rem 0 0.5rem; }

.saved-q { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.7rem; background: rgba(255,255,255,0.03); border-radius: 0.4rem; margin-bottom: 0.3rem; font-size: 0.8rem; }
.q-num { color: #a5b4fc; font-weight: 700; }
.q-text { flex: 1; color: #e2e8f0; }
.q-answer { color: #4ade80; font-size: 0.75rem; }
.q-points { color: #64748b; font-size: 0.72rem; }

.new-q-form { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.06); }

.subs-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.subs-table th { text-align: start; padding: 0.5rem; color: #94a3b8; border-bottom: 1px solid rgba(255,255,255,0.08); font-size: 0.78rem; }
.subs-table td { padding: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.04); color: #cbd5e1; }
</style>
