<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getMyRatings, getRatingTargets, createRating, type Rating } from '@/services/enhancements.service'
import { useToast } from '@/composables/useToast'


const toast = useToast()

let isMounted = true
let loadController: AbortController | null = null
let submitController: AbortController | null = null

const loading = ref(false)
const submitting = ref(false)
const given = ref<Rating[]>([])
const received = ref<Rating[]>([])
const average = ref(0)
const count = ref(0)

const targets = ref<{ teachers?: { id: number; name: string }[]; students?: { id: number; name: string }[]; classes?: { id: string; name: string }[]; school: number | null } | null>(null)

const targetType = ref<'teacher' | 'school' | 'student' | 'class'>('teacher')
const selectedTargetId = ref<number | string | null>(null)
const ratingValue = ref(5)
const suggestion = ref('')

const showForm = ref(false)

const myRatingForSelected = computed(() => {
  if (!selectedTargetId.value) return undefined
  const id = String(selectedTargetId.value)
  return given.value.find(r => String(r.target_id) === id && r.target_type === targetType.value)
})

const hasRatedSelected = computed(() => myRatingForSelected.value != null)

const targetOptions = computed(() => {
  const list: { value: number | string; label: string; type: 'teacher' | 'school' | 'student' | 'class' }[] = []
  if (targets.value?.teachers) {
    for (const t of targets.value.teachers) list.push({ value: t.id, label: `مدرس: ${t.name}`, type: 'teacher' })
  }
  if (targets.value?.students) {
    for (const s of targets.value.students) list.push({ value: s.id, label: `طالب: ${s.name}`, type: 'student' })
  }
  if (targets.value?.classes) {
    for (const c of targets.value.classes) list.push({ value: c.id, label: `فصل: ${c.name}`, type: 'class' })
  }
  if (targets.value?.school) list.push({ value: targets.value.school, label: 'المدرسة', type: 'school' })
  return list
})

const percentage = computed(() => {
  if (!count.value) return 0
  return Math.round((average.value / 5) * 100)
})

function stars(n: number) {
  return '★'.repeat(n) + '☆'.repeat(5 - n)
}

function selectTargetType(type: 'teacher' | 'school' | 'student' | 'class') {
  targetType.value = type
  selectedTargetId.value = null
  if (type === 'teacher') {
    selectedTargetId.value = targets.value?.teachers?.[0]?.id ?? null
  } else if (type === 'student') {
    selectedTargetId.value = targets.value?.students?.[0]?.id ?? null
  } else if (type === 'class') {
    selectedTargetId.value = targets.value?.classes?.[0]?.id ?? null
  } else if (type === 'school') {
    selectedTargetId.value = targets.value?.school ?? null
  }
  applyMyRating()
}

function onTargetChange() {
  applyMyRating()
}

function applyMyRating() {
  const existing = myRatingForSelected.value
  if (existing) {
    ratingValue.value = existing.rating
    suggestion.value = existing.comment || ''
  } else {
    ratingValue.value = 5
    suggestion.value = ''
  }
}

function openEdit() {
  showForm.value = true
  applyMyRating()
}

async function submit() {
  if (!isMounted || !selectedTargetId.value) {
    if (isMounted) toast.error('اختر جهة للتقييم')
    return
  }
  if (submitController) { submitController.abort(); submitController = null }
  submitController = new AbortController()
  submitting.value = true
  try {
    const res = await createRating(selectedTargetId.value, targetType.value, ratingValue.value, suggestion.value || undefined, submitController.signal)
    if (!isMounted) return
    if (res.success) {
      toast.success(`تم حفظ التقييم: ${ratingValue.value}/5`)
      showForm.value = false
      await load()
    } else {
      toast.error(res.message || 'فشل حفظ التقييم')
    }
  } catch (e: any) {
    if (isMounted) toast.error(e?.message || 'فشل حفظ التقييم')
  } finally {
    if (isMounted) submitting.value = false
    submitController = null
  }
}

async function load() {
  if (!isMounted) return
  if (loadController) { loadController.abort(); loadController = null }
  loadController = new AbortController()
  loading.value = true
  try {
    const [rRes, tRes] = await Promise.all([getMyRatings(loadController.signal), getRatingTargets(loadController.signal)])
    if (!isMounted) return
    if (rRes.success) {
      given.value = rRes.given
      received.value = rRes.received
      average.value = rRes.average
      count.value = rRes.count
    }
    if (tRes.success) {
      targets.value = tRes.targets
      selectTargetType(targetType.value)
    }
  } catch (e: any) {
    if (isMounted) toast.error(e?.message || 'فشل التحميل')
  } finally {
    if (isMounted) loading.value = false
    loadController = null
  }
}

onMounted(() => { isMounted = true; load() })
onUnmounted(() => {
  isMounted = false
  if (loadController) { loadController.abort(); loadController = null }
  if (submitController) { submitController.abort(); submitController = null }
})
</script>

<template>
  <div class="rating-center">
    <h3>⭐ التقييم العام</h3>

    <div v-if="loading" class="rc-loading">جاري التحميل...</div>
    <template v-else>
      <div class="rc-overview">
        <div class="rc-score">
          <span class="rc-percent">{{ percentage }}%</span>
          <span class="rc-stars">{{ stars(Math.round(average)) }}</span>
          <span class="rc-avg">{{ average.toFixed(1) }} / 5</span>
        </div>
        <div class="rc-count">{{ count }} تقييم · نسبة {{ percentage }}%</div>
      </div>

      <div class="rc-my-rating" v-if="hasRatedSelected">
        <div class="rc-my-summary">
          <span>تقييمك: <strong>{{ stars(ratingValue) }}</strong></span>
          <span v-if="myRatingForSelected?.comment" class="rc-my-comment">{{ myRatingForSelected.comment }}</span>
          <button class="rc-change-btn" @click="openEdit">تغيير</button>
        </div>
      </div>

      <div class="rc-suggestions" v-if="received.length">
        <h4>التعليقات والاقتراحات</h4>
        <div v-for="r in received" :key="r.id" class="rc-item">
          <span class="rc-item-stars">{{ stars(r.rating) }}</span>
          <span class="rc-item-name">{{ r.rater_name || 'مستخدم' }}</span>
          <p v-if="r.comment" class="rc-item-comment">{{ r.comment }}</p>
          <span class="rc-item-date">{{ new Date(r.created_at).toLocaleDateString('ar') }}</span>
        </div>
      </div>
      <div v-else class="rc-empty">لا توجد تعليقات بعد</div>

      <button v-if="!hasRatedSelected" class="rc-toggle" @click="showForm = !showForm">
        {{ showForm ? 'إلغاء' : '⭐ قيّم الآن' }}
      </button>

      <div v-if="showForm" class="rc-form">
        <h4>{{ hasRatedSelected ? 'تعديل التقييم' : 'تقييم جديد' }}</h4>
        <div class="rc-target-type">
          <button
            v-for="opt in targetOptions"
            :key="opt.type"
            :class="['rc-type-btn', { active: targetType === opt.type }]"
            @click="selectTargetType(opt.type)"
          >{{ opt.type === 'teacher' ? 'مدرس' : opt.type === 'student' ? 'طالب' : opt.type === 'class' ? 'فصل' : 'مدرسة' }}</button>
        </div>
        <select v-model="selectedTargetId" class="rc-select" @change="onTargetChange">
          <option v-for="opt in targetOptions.filter(o => o.type === targetType)" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
        <div class="rc-stars-input">
          <span v-for="n in 5" :key="n" :class="['rc-star', { active: n <= ratingValue }]" @click="ratingValue = n">★</span>
        </div>
        <textarea v-model="suggestion" rows="3" placeholder="اقتراح أو تعليق (اختياري)" maxlength="1000"></textarea>
        <button class="rc-submit" :disabled="submitting || !selectedTargetId" @click="submit">
          {{ submitting ? '...' : (hasRatedSelected ? '⭐ تحديث التقييم' : '⭐ إرسال التقييم') }}
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.rating-center { background: var(--as-surface, rgba(15,23,42,0.6)); border: 1px solid var(--as-border, rgba(255,255,255,0.06)); border-radius: 0.7rem; padding: 1.2rem; }
.rc-loading { text-align: center; padding: 2rem; color: var(--as-text-muted, #64748b); }
.rating-center h3 { margin: 0 0 1rem; font-size: 1rem; color: var(--as-text, #e2e8f0); }
.rc-overview { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.2rem; padding: 1rem; background: linear-gradient(135deg, rgba(99,102,241,0.12), rgba(124,58,237,0.08)); border-radius: 0.6rem; }
.rc-score { display: flex; align-items: center; gap: 0.8rem; }
.rc-percent { font-size: 2rem; font-weight: 800; color: var(--as-warning, #f59e0b); }
.rc-stars { font-size: 1.3rem; color: #f59e0b; letter-spacing: 2px; }
.rc-avg { font-size: 0.9rem; color: var(--as-text-muted, #94a3b8); }
.rc-count { font-size: 0.85rem; color: var(--as-text, #e2e8f0); }
.rc-my-rating { margin-bottom: 1rem; padding: 0.8rem; background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.15); border-radius: 0.5rem; }
.rc-my-summary { display: flex; align-items: center; flex-wrap: wrap; gap: 0.6rem; }
.rc-my-summary span { font-size: 0.9rem; color: var(--as-text, #e2e8f0); }
.rc-my-summary strong { color: #f59e0b; font-size: 1.1rem; }
.rc-my-comment { font-size: 0.85rem; color: var(--as-text-muted, #94a3b8); flex: 1 0 100%; }
.rc-change-btn { margin-inline-start: auto; padding: 0.3rem 0.8rem; border-radius: 0.4rem; border: 1px solid var(--as-border, rgba(255,255,255,0.08)); background: var(--as-accent, rgba(99,102,241,0.15)); color: var(--as-text, #c7d2fe); cursor: pointer; font-size: 0.8rem; font-family: inherit; }
.rc-change-btn:hover { background: var(--as-accent-solid, #6366f1); color: #fff; }
.rc-suggestions h4 { margin: 0 0 0.6rem; font-size: 0.9rem; color: var(--as-text-muted, #94a3b8); }
.rc-item { padding: 0.6rem; border-bottom: 1px solid var(--as-border, rgba(255,255,255,0.04)); }
.rc-item-stars { color: #f59e0b; font-size: 0.9rem; letter-spacing: 1px; }
.rc-item-name { font-size: 0.85rem; color: var(--as-text, #e2e8f0); font-weight: 600; margin: 0 0.5rem; }
.rc-item-comment { font-size: 0.85rem; color: var(--as-text-muted, #94a3b8); margin: 0.3rem 0; }
.rc-item-date { font-size: 0.7rem; color: var(--as-text-muted, #64748b); }
.rc-empty { text-align: center; padding: 1.5rem; color: var(--as-text-muted, #64748b); font-size: 0.85rem; }
.rc-toggle { width: 100%; padding: 0.7rem; border-radius: 0.5rem; border: none; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; font-weight: 700; cursor: pointer; margin-top: 1rem; font-family: inherit; }
.rc-form { margin-top: 1rem; padding: 1rem; border: 1px solid var(--as-border, rgba(255,255,255,0.06)); border-radius: 0.5rem; }
.rc-form h4 { margin: 0 0 0.6rem; font-size: 0.9rem; }
.rc-target-type { display: flex; gap: 0.4rem; margin-bottom: 0.6rem; }
.rc-type-btn { padding: 0.3rem 0.8rem; border-radius: 0.4rem; border: 1px solid var(--as-border, rgba(255,255,255,0.08)); background: transparent; color: var(--as-text-muted, #94a3b8); cursor: pointer; font-size: 0.8rem; font-family: inherit; }
.rc-type-btn.active { background: var(--as-accent, rgba(99,102,241,0.15)); color: var(--as-text, #c7d2fe); border-color: var(--as-accent-solid, #6366f1); }
.rc-select { width: 100%; padding: 0.5rem; border-radius: 0.4rem; border: 1px solid var(--as-border, rgba(255,255,255,0.08)); background: var(--as-input-bg, rgba(0,0,0,0.2)); color: var(--as-text, #e2e8f0); margin-bottom: 0.6rem; font-family: inherit; }
.rc-stars-input { display: flex; gap: 0.4rem; font-size: 2rem; margin-bottom: 0.6rem; }
.rc-star { cursor: pointer; color: var(--as-text-muted, #475569); transition: color 0.15s; }
.rc-star.active { color: #f59e0b; }
.rc-form textarea { width: 100%; padding: 0.5rem; border-radius: 0.4rem; border: 1px solid var(--as-border, rgba(255,255,255,0.08)); background: var(--as-input-bg, rgba(0,0,0,0.2)); color: var(--as-text, #e2e8f0); font-family: inherit; margin-bottom: 0.6rem; }
.rc-submit { width: 100%; padding: 0.6rem; border-radius: 0.4rem; border: none; background: var(--as-success, #10b981); color: #fff; font-weight: 700; cursor: pointer; font-family: inherit; }
.rc-submit:disabled { opacity: 0.5; cursor: not-allowed; }
@media (max-width: 600px) { .rc-overview { flex-direction: column; align-items: flex-start; } }
</style>
