<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import { ref, computed, onMounted } from 'vue'
import { getMyRatings, createRating, type Rating } from '@/services/enhancements.service'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/modules/auth/stores/auth'


const toast = useToast()
const auth = useAuthStore()
const loading = ref(false)
const submitting = ref(false)
const given = ref<Rating[]>([])
const received = ref<Rating[]>([])
const average = ref(0)
const count = ref(0)

const targetType = ref<'teacher' | 'school' | 'student' | 'class'>('teacher')
const targetId = ref<number | null>(null)
const ratingValue = ref(5)
const ratingComment = ref('')

const targetTypeLabel: Record<string, string> = {
  teacher: 'مدرس', school: 'مدرسة', student: 'طالب', class: 'فصل',
}

const canRate = computed(() => {
  if (auth.user?.role === 'student') return targetType.value === 'teacher' || targetType.value === 'class'
  if (auth.user?.role === 'teacher') return targetType.value === 'student' || targetType.value === 'school' || targetType.value === 'class'
  return true
})

function stars(n: number) {
  return '★'.repeat(n) + '☆'.repeat(5 - n)
}

async function submitRating() {
  if (!targetId.value) {
    toast.error('يرجى إدخال رقم الجهة المستهدفة')
    return
  }
  submitting.value = true
  try {
    const res = await createRating(targetId.value, targetType.value, ratingValue.value, ratingComment.value || undefined)
    if (res.success) {
      toast.success('تم حفظ التقييم')
      ratingValue.value = 5
      ratingComment.value = ''
      targetId.value = null
      await load()
    } else {
      toast.error(res.message || 'فشل التقييم')
    }
  } catch (e: any) {
    toast.error(e?.message || 'فشل التقييم')
  } finally {
    submitting.value = false
  }
}

async function load() {
  loading.value = true
  try {
    const res = await getMyRatings()
    if (res.success) {
      given.value = res.given
      received.value = res.received
      average.value = res.average
      count.value = res.count
    }
  } catch { /* ignore */ }
  loading.value = false
}

onMounted(load)
</script>

<template>
  <div class="rating-section">
    <h4>⭐ التقييمات</h4>

    <div v-if="loading" class="rs-loading">جاري التحميل...</div>
    <template v-else>
      <div class="rs-summary" v-if="count > 0">
        <div class="rs-avg">
          <span class="rs-avg-val">{{ average.toFixed(1) }}</span>
          <span class="rs-avg-stars">{{ stars(Math.round(average)) }}</span>
          <span class="rs-avg-count">({{ count }} تقييم)</span>
        </div>
      </div>

      <div class="rs-form" v-if="canRate">
        <h5>تقديم تقييم جديد</h5>
        <div class="rs-row">
          <div class="rs-field">
            <label>الجهة</label>
            <select v-model="targetType">
              <option value="teacher">مدرس</option>
              <option value="school">مدرسة</option>
              <option value="student">طالب</option>
              <option value="class">فصل</option>
            </select>
          </div>
          <div class="rs-field">
            <label>الرقم</label>
            <input v-model.number="targetId" type="number" placeholder="رقم الجهة" />
          </div>
        </div>
        <div class="rs-field">
          <label>التقييم</label>
          <div class="rs-stars">
            <span v-for="n in 5" :key="n" class="rs-star" :class="{ active: n <= ratingValue }" @click="ratingValue = n">★</span>
          </div>
        </div>
        <div class="rs-field">
          <label>تعليق</label>
          <textarea v-model="ratingComment" rows="2" placeholder="تعليق اختياري" maxlength="1000"></textarea>
        </div>
        <button class="rs-submit" :disabled="submitting || !targetId" @click="submitRating">
          {{ submitting ? '...' : '⭐ حفظ التقييم' }}
        </button>
      </div>

      <div class="rs-lists">
        <div class="rs-list" v-if="received.length">
          <h5>التقييمات التي حصلت عليها</h5>
          <div v-for="r in received" :key="r.id" class="rs-item">
            <span class="rs-item-stars">{{ stars(r.rating) }}</span>
            <span class="rs-item-name">{{ r.rater_name || 'مستخدم' }}</span>
            <span class="rs-item-comment" v-if="r.comment">{{ r.comment }}</span>
            <span class="rs-item-date">{{ new Date(r.created_at).toLocaleDateString('ar') }}</span>
          </div>
        </div>

        <div class="rs-list" v-if="given.length">
          <h5>التقييمات التي قدمتها</h5>
          <div v-for="r in given" :key="r.id" class="rs-item">
            <span class="rs-item-stars">{{ stars(r.rating) }}</span>
            <span class="rs-item-name">{{ r.target_name || targetTypeLabel[r.target_type] || r.target_type }} #{{ r.target_id }}</span>
            <span class="rs-item-comment" v-if="r.comment">{{ r.comment }}</span>
            <span class="rs-item-date">{{ new Date(r.created_at).toLocaleDateString('ar') }}</span>
          </div>
        </div>

        <div v-if="!received.length && !given.length" class="rs-empty">
          لا توجد تقييمات بعد
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.rating-section { background: var(--as-surface, rgba(15,23,42,0.6)); border: 1px solid var(--as-border, rgba(255,255,255,0.06)); border-radius: 0.6rem; padding: 1rem; margin-bottom: 1rem; }
.rs-loading { text-align: center; padding: 1.5rem; color: var(--as-text-muted, #64748b); }
.rs-summary { margin-bottom: 1rem; padding: 0.8rem; background: rgba(99,102,241,0.08); border-radius: 0.5rem; }
.rs-avg { display: flex; align-items: center; gap: 0.6rem; }
.rs-avg-val { font-size: 1.8rem; font-weight: 800; color: var(--as-warning, #f59e0b); }
.rs-avg-stars { font-size: 1.2rem; color: #f59e0b; letter-spacing: 2px; }
.rs-avg-count { font-size: 0.8rem; color: var(--as-text-muted, #64748b); }
.rs-form { margin-bottom: 1.2rem; padding: 0.8rem; border: 1px solid var(--as-border, rgba(255,255,255,0.06)); border-radius: 0.5rem; }
.rs-form h5 { margin: 0 0 0.6rem; font-size: 0.9rem; color: var(--as-text, #e2e8f0); }
.rs-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; }
.rs-field { margin-bottom: 0.6rem; }
.rs-field label { display: block; font-size: 0.8rem; color: var(--as-text-muted, #94a3b8); margin-bottom: 0.3rem; }
.rs-field input, .rs-field select, .rs-field textarea { width: 100%; padding: 0.5rem 0.7rem; border-radius: 0.4rem; border: 1px solid var(--as-border, rgba(255,255,255,0.08)); background: var(--as-input-bg, rgba(0,0,0,0.2)); color: var(--as-text, #e2e8f0); font-size: 0.85rem; font-family: inherit; }
.rs-stars { display: flex; gap: 0.3rem; font-size: 1.5rem; }
.rs-star { cursor: pointer; color: var(--as-text-muted, #475569); transition: color 0.15s; }
.rs-star.active { color: #f59e0b; }
.rs-submit { width: 100%; padding: 0.6rem; border-radius: 0.4rem; border: none; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; cursor: pointer; font-weight: 700; font-family: inherit; font-size: 0.85rem; }
.rs-submit:disabled { opacity: 0.5; cursor: not-allowed; }
.rs-lists { display: flex; flex-direction: column; gap: 1rem; }
.rs-list h5 { margin: 0 0 0.5rem; font-size: 0.85rem; color: var(--as-text-muted, #94a3b8); }
.rs-item { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; padding: 0.5rem 0; border-bottom: 1px solid var(--as-border, rgba(255,255,255,0.04)); }
.rs-item-stars { color: #f59e0b; letter-spacing: 1px; font-size: 0.9rem; }
.rs-item-name { font-size: 0.85rem; color: var(--as-text, #e2e8f0); font-weight: 600; }
.rs-item-comment { font-size: 0.8rem; color: var(--as-text-muted, #94a3b8); flex: 1; min-width: 120px; }
.rs-item-date { font-size: 0.7rem; color: var(--as-text-muted, #64748b); }
.rs-empty { text-align: center; padding: 1rem; color: var(--as-text-muted, #64748b); font-size: 0.85rem; }
@media (max-width: 600px) { .rs-row { grid-template-columns: 1fr; } }
</style>
