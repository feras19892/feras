<template>
  <div v-if="open" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content student-modal">
      <div v-if="loading" class="modal-loading">
        <SkeletonLoader type="list" :count="5" />
      </div>
      <template v-else-if="profile">
        <div class="student-header">
          <div class="student-avatar">{{ profile.student.name.charAt(0) }}</div>
          <div class="student-info">
            <h3>{{ profile.student.name }}</h3>
            <p class="text-sm text-gray-400">{{ maskEmail(profile.student.email) }}</p>
            <p class="text-sm">الفصل: {{ profile.className }}</p>
            <p class="text-sm text-gray-400" v-if="profile.membership">تاريخ الانضمام: {{ formatDate(profile.membership.joined_at) }}</p>
          </div>
          <button class="freeze-toggle" :class="{ frozen: isFrozen }" :title="isFrozen ? 'إلغاء التجميد' : 'تجميد الطالب'" :disabled="actionLoading" @click="toggleFreeze">
            {{ isFrozen ? '🔒' : '🔓' }}
          </button>
          <button class="modal-close" @click="$emit('close')">✕</button>
        </div>

        <div class="action-bar">
          <div class="action-group">
            <span class="action-group-label">عرض</span>
            <button class="action-btn action-neutral" :class="{ active: activeAction === 'reports' }" @click="activeAction = 'reports'">
              <span class="action-icon">📋</span><span>التقارير</span>
            </button>
          </div>
          <div class="action-divider"></div>
          <div class="action-group">
            <span class="action-group-label">إيجابي</span>
            <button class="action-btn action-good" :class="{ active: activeAction === 'grade' }" @click="activeAction = 'grade'">
              <span class="action-icon">✅</span><span>تقييم تقرير</span>
            </button>
            <button class="action-btn action-good" :class="{ active: activeAction === 'reward' }" @click="activeAction = 'reward'">
              <span class="action-icon">🏆</span><span>مكافأة</span>
            </button>
            <button class="action-btn action-good" :class="{ active: activeAction === 'rating' }" @click="activeAction = 'rating'">
              <span class="action-icon">⭐</span><span>تقييم عام</span>
            </button>
          </div>
          <div class="action-divider"></div>
          <div class="action-group">
            <span class="action-group-label">تنبيهي</span>
            <button class="action-btn action-warn" :class="{ active: activeAction === 'penalty' }" @click="activeAction = 'penalty'">
              <span class="action-icon">⚠️</span><span>عقوبة</span>
            </button>
            <button class="action-btn action-warn" :class="{ active: activeAction === 'warn' }" @click="activeAction = 'warn'">
              <span class="action-icon">📢</span><span>شكوى</span>
            </button>
          </div>
          <div class="action-divider"></div>
          <div class="action-group">
            <span class="action-group-label">إدارة</span>
            <button class="action-btn action-danger" :class="{ active: activeAction === 'remove' }" @click="activeAction = 'remove'">
              <span class="action-icon">🗑️</span><span>إزالة من الفصل</span>
            </button>
          </div>
        </div>

        <div v-if="activeAction === 'reports'" class="action-panel">
          <h4>📋 تقارير الطالب</h4>
          <div v-if="profile.reports.length" class="detail-table-wrap">
            <table class="detail-table">
              <thead><tr><th>التجربة</th><th>الحالة</th><th>العلامة</th><th>التاريخ</th></tr></thead>
              <tbody>
                <tr v-for="r in profile.reports" :key="r.id">
                  <td>{{ r.experiment_name }}</td>
                  <td><span class="badge-status" :class="r.status">{{ statusLabel(r.status) }}</span></td>
                  <td>{{ r.grade ?? '—' }}</td>
                  <td>{{ formatDate(r.submitted_at) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="empty-note">لا توجد تقارير</p>
        </div>

        <div v-if="activeAction === 'grade'" class="action-panel">
          <h4>✅ تقييم تقرير</h4>
          <div v-if="gradeableReports.length" class="form-group">
            <label>اختر التقرير</label>
            <select v-model="gradeForm.reportId" class="form-input">
              <option v-for="r in gradeableReports" :key="r.id" :value="r.id">{{ r.experiment_name }} ({{ statusLabel(r.status) }})</option>
            </select>
            <label>العلامة (0-100)</label>
            <input type="number" v-model.number="gradeForm.grade" min="0" max="100" class="form-input" />
            <label>ملاحظات</label>
            <textarea v-model="gradeForm.feedback" class="form-input" rows="2"></textarea>
            <button class="btn-sm btn-success" :disabled="actionLoading" @click="submitGrade">{{ actionLoading ? '...' : 'حفظ التقييم' }}</button>
          </div>
          <p v-else class="empty-note">لا توجد تقارير قابلة للتقييم</p>
        </div>

        <div v-if="activeAction === 'penalty'" class="action-panel">
          <h4>⚠️ تسجيل عقوبة</h4>
          <div class="form-group">
            <label>النوع</label>
            <select v-model="penaltyForm.type" class="form-input">
              <option value="late">تأخير</option><option value="misbehavior">سلوك سيئ</option>
              <option value="cheating">غش</option><option value="absence">غياب</option><option value="other">أخرى</option>
            </select>
            <label>السبب</label>
            <input v-model="penaltyForm.reason" class="form-input" placeholder="سبب العقوبة" />
            <label>النقاط (سالب)</label>
            <input type="number" v-model.number="penaltyForm.points" min="-100" max="0" class="form-input" />
            <button class="btn-sm btn-danger" :disabled="actionLoading" @click="submitPenalty">{{ actionLoading ? '...' : 'تسجيل العقوبة' }}</button>
          </div>
        </div>

        <div v-if="activeAction === 'warn'" class="action-panel">
          <h4>📢 إرسال شكوى/تنبيه</h4>
          <div class="form-group">
            <label>الرسالة</label>
            <textarea v-model="warnMessage" class="form-input" rows="3" placeholder="اكتب رسالة التنبيه للطالب"></textarea>
            <button class="btn-sm btn-warn" :disabled="actionLoading" @click="submitWarn">{{ actionLoading ? '...' : 'إرسال التنبيه' }}</button>
          </div>
        </div>

        <div v-if="activeAction === 'reward'" class="action-panel">
          <h4>🏆 منح وسام/مكافأة</h4>
          <div class="form-group">
            <label>اختر الوسام</label>
            <select v-model="rewardBadgeId" class="form-input">
              <option v-for="b in badges" :key="b.id" :value="b.id">{{ b.icon }} {{ b.name }}</option>
            </select>
            <label>ملاحظة (اختياري)</label>
            <input v-model="rewardNote" class="form-input" placeholder="ملاحظة للطالب" />
            <button class="btn-sm btn-success" :disabled="actionLoading" @click="submitReward">{{ actionLoading ? '...' : 'منح الوسام' }}</button>
          </div>
        </div>

        <div v-if="activeAction === 'rating'" class="action-panel">
          <h4>⭐ تقييم عام للطالب</h4>
          <div class="form-group">
            <label>التقييم (1-5)</label>
            <div class="stars-input">
              <span v-for="n in 5" :key="n" class="star" :class="{ active: n <= ratingValue }" @click="ratingValue = n">★</span>
            </div>
            <label>تعليق</label>
            <textarea v-model="ratingComment" class="form-input" rows="2" placeholder="تعليق عام على أداء الطالب"></textarea>
            <button class="btn-sm btn-success" :disabled="actionLoading" @click="submitRating">{{ actionLoading ? '...' : 'حفظ التقييم' }}</button>
          </div>
        </div>

        <div v-if="activeAction === 'remove'" class="action-panel">
          <h4>🗑️ إزالة الطالب من الفصل</h4>
          <p class="empty-note">سيتم إزالة الطالب نهائياً من هذا الفصل. هل أنت متأكد؟</p>
          <button class="btn-sm btn-danger" :disabled="actionLoading" @click="handleRemove">{{ actionLoading ? '...' : 'تأكيد الإزالة' }}</button>
        </div>

        <StudentDetailStats v-if="!activeAction" :profile="profile" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import * as teacherApi from '@/services/core/teacher.api'
import type { StudentProfile } from '@/services/core/teacher.api'
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'
import StudentDetailStats from './StudentDetailStats.vue'
import { useStudentActions } from './useStudentActions'

const props = defineProps<{ open: boolean; classId: string | null; studentId: number | null }>()
const emit = defineEmits<{ close: []; updated: [] }>()

const loading = ref(false)
const profile = ref<StudentProfile | null>(null)
const activeAction = ref('')
const badges = ref<{ id: number; name: string; icon: string; type: string; description: string }[]>([])

async function loadProfile() {
  if (!props.classId || !props.studentId) return
  loading.value = true
  activeAction.value = ''
  try {
    const res = await teacherApi.getStudentProfile(props.classId, props.studentId)
    if (res.success) profile.value = res.profile
  } catch { /* ignore */ } finally { loading.value = false }
}

const { actionLoading, gradeForm, penaltyForm, warnMessage, rewardBadgeId, rewardNote, ratingValue, ratingComment,
  submitGrade, submitPenalty, submitFreeze, submitWarn, submitReward, submitRating, submitRemove } = useStudentActions(props, loadProfile, (e) => emit(e))

const isFrozen = computed(() => !!profile.value?.student?.blocked_at)

async function toggleFreeze() {
  await submitFreeze()
}

const gradeableReports = computed(() => {
  if (!profile.value) return []
  return profile.value.reports.filter(r => r.status !== 'graded')
})

watch(() => [props.open, props.classId, props.studentId] as const, async ([open]) => {
  if (!open) { profile.value = null; activeAction.value = ''; return }
  await loadProfile()
}, { immediate: true })

watch(activeAction, async (val) => {
  if (val === 'reward' && badges.value.length === 0) {
    try { const res = await teacherApi.getAllBadges(); if (res.success) badges.value = res.badges } catch { /* ignore */ }
  }
})

function maskEmail(email: string) { const [name, domain] = email.split('@'); return (!domain || name.length <= 2) ? email : name.slice(0, 2) + '•••@' + domain }
function formatDate(d: string | null) { return d ? new Date(d).toLocaleDateString('ar', { year: 'numeric', month: 'short', day: 'numeric' }) : '—' }
function statusLabel(s: string) { return ({ submitted: 'مرسل', graded: 'مصحح', draft: 'مسودة', resubmitted: 'إعادة إرسال' } as Record<string,string>)[s] || s }

async function handleRemove() {
  await submitRemove()
  emit('close')
}
</script>

<style scoped>
@import '@/assets/styles/dashboard-shared.css';
@import '@/assets/styles/student-detail-modal.css';
</style>
