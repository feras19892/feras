<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getAllBadges, createBadge, deleteBadge, type Badge } from '../../services/gamification.service';
import { getAllPenalties, dismissPenalty, deletePenalty, getAllRatings, type Penalty, type Rating } from '../../services/enhancements.service';
import { adminGetAllQuizzes, deleteQuiz } from '../../services/quiz.service';
import type { Quiz } from '../../services/quiz.service';

const activeTab = ref<'quizzes' | 'badges' | 'penalties' | 'ratings'>('quizzes');
const loading = ref(false);

const quizzes = ref<(Quiz & { teacher_name: string; class_name: string | null })[]>([]);
const badges = ref<Badge[]>([]);
const penalties = ref<Penalty[]>([]);
const ratings = ref<Rating[]>([]);

const newBadge = ref({ name: '', description: '', icon: '🏆', type: 'manual', criteria: '' });
const showBadgeForm = ref(false);

async function loadAll() {
  loading.value = true;
  try {
    const [q, b, p, r] = await Promise.all([adminGetAllQuizzes(), getAllBadges(), getAllPenalties(), getAllRatings()]);
    if (q.success) quizzes.value = q.quizzes;
    if (b.success) badges.value = b.badges;
    if (p.success) penalties.value = p.penalties;
    if (r.success) ratings.value = r.ratings;
  } catch { /* ignore */ }
  loading.value = false;
}

async function handleCreateBadge() {
  if (!newBadge.value.name.trim()) return;
  await createBadge(newBadge.value.name, newBadge.value.description, newBadge.value.icon, newBadge.value.type, newBadge.value.criteria || undefined);
  showBadgeForm.value = false;
  newBadge.value = { name: '', description: '', icon: '🏆', type: 'manual', criteria: '' };
  await loadAll();
}

async function handleDeleteBadge(id: number) {
  if (!confirm('حذف هذه الشارة؟')) return;
  await deleteBadge(id);
  await loadAll();
}

async function handleDeleteQuiz(id: number) {
  if (!confirm('حذف هذا الامتحان؟')) return;
  await deleteQuiz(id);
  await loadAll();
}

async function handleDismissPenalty(id: number) {
  await dismissPenalty(id);
  await loadAll();
}

async function handleDeletePenalty(id: number) {
  if (!confirm('حذف هذه العقوبة؟')) return;
  await deletePenalty(id);
  await loadAll();
}

onMounted(loadAll);
</script>

<template>
  <div class="admin-enh">
    <div class="sub-tabs">
      <button :class="{ active: activeTab === 'quizzes' }" @click="activeTab = 'quizzes'">📝 الامتحانات ({{ quizzes.length }})</button>
      <button :class="{ active: activeTab === 'badges' }" @click="activeTab = 'badges'">🏆 الشارات ({{ badges.length }})</button>
      <button :class="{ active: activeTab === 'penalties' }" @click="activeTab = 'penalties'">⚠️ العقوبات ({{ penalties.length }})</button>
      <button :class="{ active: activeTab === 'ratings' }" @click="activeTab = 'ratings'">⭐ التقييمات ({{ ratings.length }})</button>
    </div>

    <div v-if="loading" class="loading">جاري التحميل...</div>

    <!-- Quizzes -->
    <div v-if="activeTab === 'quizzes' && !loading">
      <div v-if="quizzes.length === 0" class="empty">لا توجد امتحانات</div>
      <table v-else class="data-table">
        <thead><tr><th>العنوان</th><th>المدرس</th><th>الفصل</th><th>الحالة</th><th>الوقت</th><th>إجراءات</th></tr></thead>
        <tbody>
          <tr v-for="q in quizzes" :key="q.id">
            <td>{{ q.title }}</td>
            <td>{{ q.teacher_name }}</td>
            <td>{{ q.class_name || '—' }}</td>
            <td><span :class="['status-tag', q.status]">{{ q.status }}</span></td>
            <td>{{ q.time_limit_minutes }} د</td>
            <td><button class="btn-mini delete" @click="handleDeleteQuiz(q.id)">حذف</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Badges -->
    <div v-if="activeTab === 'badges' && !loading">
      <div class="header-row">
        <h4>إدارة الشارات</h4>
        <button class="btn-create" @click="showBadgeForm = !showBadgeForm">{{ showBadgeForm ? 'إلغاء' : '+ شارة جديدة' }}</button>
      </div>
      <div v-if="showBadgeForm" class="badge-form">
        <div class="form-row">
          <input v-model="newBadge.name" placeholder="اسم الشارة" />
          <input v-model="newBadge.icon" placeholder="أيقونة" style="width: 60px" />
          <select v-model="newBadge.type">
            <option value="manual">يدوية</option>
            <option value="auto">تلقائية</option>
          </select>
        </div>
        <input v-model="newBadge.description" placeholder="الوصف" />
        <input v-if="newBadge.type === 'auto'" v-model="newBadge.criteria" placeholder="المعيار (criteria)" />
        <button class="btn-save" @click="handleCreateBadge">حفظ</button>
      </div>
      <div class="badges-grid">
        <div v-for="b in badges" :key="b.id" class="badge-item">
          <span class="badge-icon">{{ b.icon }}</span>
          <div class="badge-info">
            <strong>{{ b.name }}</strong>
            <p>{{ b.description }}</p>
            <span class="badge-type">{{ b.type === 'auto' ? 'تلقائية' : 'يدوية' }}</span>
          </div>
          <button class="btn-mini delete" @click="handleDeleteBadge(b.id)">حذف</button>
        </div>
      </div>
    </div>

    <!-- Penalties -->
    <div v-if="activeTab === 'penalties' && !loading">
      <div v-if="penalties.length === 0" class="empty">لا توجد عقوبات أو مكافآت</div>
      <table v-else class="data-table">
        <thead><tr><th>النوع</th><th>الطالب</th><th>المدرس</th><th>السبب</th><th>النقاط</th><th>الحالة</th><th>إجراءات</th></tr></thead>
        <tbody>
          <tr v-for="p in penalties" :key="p.id">
            <td><span :class="['type-tag', p.type]">{{ p.type === 'penalty' ? 'عقوبة' : 'مكافأة' }}</span></td>
            <td>{{ p.student_name }}</td>
            <td>{{ p.teacher_name }}</td>
            <td>{{ p.reason }}</td>
            <td>{{ p.points }}</td>
            <td>{{ p.status === 'active' ? 'نشط' : 'ملغي' }}</td>
            <td>
              <button v-if="p.status === 'active'" class="btn-mini" @click="handleDismissPenalty(p.id)">إلغاء</button>
              <button class="btn-mini delete" @click="handleDeletePenalty(p.id)">حذف</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Ratings -->
    <div v-if="activeTab === 'ratings' && !loading">
      <div v-if="ratings.length === 0" class="empty">لا توجد تقييمات</div>
      <table v-else class="data-table">
        <thead><tr><th>الهدف</th><th>النوع</th><th>المقيّم</th><th>التقييم</th><th>التعليق</th><th>التاريخ</th></tr></thead>
        <tbody>
          <tr v-for="r in ratings" :key="r.id">
            <td>{{ r.target_id }}</td>
            <td>{{ r.target_type }}</td>
            <td>{{ r.rater_name || r.rater_type }}</td>
            <td><span class="stars">{{ '⭐'.repeat(r.rating) }}</span></td>
            <td>{{ r.comment || '—' }}</td>
            <td>{{ new Date(r.created_at).toLocaleDateString('ar-SA') }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.admin-enh { color: #e2e8f0; }
.sub-tabs { display: flex; gap: 0.3rem; margin-bottom: 1rem; flex-wrap: wrap; }
.sub-tabs button { padding: 0.4rem 0.8rem; border-radius: 0.4rem; border: 1px solid rgba(255,255,255,0.08); background: rgba(15,23,42,0.5); color: #94a3b8; cursor: pointer; font-family: inherit; font-size: 0.8rem; }
.sub-tabs button.active { background: rgba(99,102,241,0.15); border-color: rgba(99,102,241,0.3); color: #c7d2fe; }

.loading, .empty { text-align: center; color: #64748b; padding: 2rem; }
.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem; }
.header-row h4 { margin: 0; font-size: 0.95rem; }
.btn-create { padding: 0.4rem 0.8rem; border-radius: 0.4rem; border: none; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; cursor: pointer; font-family: inherit; font-size: 0.8rem; }
.btn-save { margin-top: 0.5rem; padding: 0.4rem 1rem; border-radius: 0.4rem; border: none; background: linear-gradient(135deg, #16a34a, #22c55e); color: #fff; cursor: pointer; font-family: inherit; font-size: 0.8rem; }

.badge-form { background: rgba(15,23,42,0.5); border-radius: 0.5rem; padding: 0.8rem; margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.4rem; }
.badge-form input, .badge-form select { padding: 0.4rem 0.6rem; border-radius: 0.4rem; border: 1px solid #334155; background: #0f172a; color: #e2e8f0; font-size: 0.82rem; font-family: inherit; }
.form-row { display: flex; gap: 0.4rem; }
.form-row input, .form-row select { flex: 1; }

.badges-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 0.5rem; }
.badge-item { display: flex; align-items: center; gap: 0.5rem; background: rgba(15,23,42,0.5); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.5rem; padding: 0.6rem; }
.badge-icon { font-size: 1.5rem; }
.badge-info { flex: 1; }
.badge-info strong { font-size: 0.85rem; color: #f1f5f9; }
.badge-info p { margin: 0.1rem 0; font-size: 0.75rem; color: #94a3b8; }
.badge-type { font-size: 0.68rem; color: #64748b; }

.data-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
.data-table th { text-align: start; padding: 0.5rem; color: #94a3b8; border-bottom: 1px solid rgba(255,255,255,0.08); font-size: 0.75rem; }
.data-table td { padding: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.04); color: #cbd5e1; }

.status-tag { padding: 0.1rem 0.4rem; border-radius: 0.3rem; font-size: 0.68rem; font-weight: 700; }
.status-tag.draft { background: rgba(100,116,139,0.15); color: #94a3b8; }
.status-tag.published { background: rgba(34,197,94,0.15); color: #4ade80; }
.status-tag.closed { background: rgba(239,68,68,0.15); color: #f87171; }
.type-tag { padding: 0.1rem 0.4rem; border-radius: 0.3rem; font-size: 0.68rem; font-weight: 700; }
.type-tag.penalty { background: rgba(245,158,11,0.15); color: #fcd34d; }
.type-tag.reward { background: rgba(34,197,94,0.15); color: #4ade80; }
.stars { font-size: 0.75rem; }

.btn-mini { padding: 0.2rem 0.5rem; border-radius: 0.3rem; border: 1px solid rgba(255,255,255,0.08); background: rgba(15,23,42,0.6); cursor: pointer; font-size: 0.7rem; font-family: inherit; color: #94a3b8; }
.btn-mini.delete { color: #f87171; }
.btn-mini:hover { opacity: 0.8; }
</style>
