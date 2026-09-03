<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/modules/auth/stores/auth'
import { useToast } from '@/composables/useToast'
import { getRatings, createRating, type Rating } from '@/services/enhancements.service'
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'

const toast = useToast()
const auth = useAuthStore()

const ratings = ref<Rating[]>([])
const average = ref(0)
const count = ref(0)
const loading = ref(false)
const submitting = ref(false)
const showForm = ref(false)
const newRating = ref(5)
const comment = ref('')

const currentId = computed(() => auth.user?.id ?? auth.schoolSession?.id ?? null)
const myRating = computed(() => ratings.value.find(r => r.rater_id === currentId.value))
const hasRated = computed(() => myRating.value != null)

function stars(n: number) {
  return '★'.repeat(n) + '☆'.repeat(5 - n)
}

function formatDate(d?: string | null) { return d ? new Date(d).toLocaleDateString('ar') : '—' }

function applyMyRating() {
  if (myRating.value) {
    newRating.value = myRating.value.rating
    comment.value = myRating.value.comment || ''
  } else {
    newRating.value = 5
    comment.value = ''
  }
}

function openEdit() {
  applyMyRating()
  showForm.value = true
}

async function submit() {
  if (!currentId.value) {
    toast.error('يجب تسجيل الدخول لتقييم المشروع')
    return
  }
  submitting.value = true
  try {
    const res = await createRating('global', 'project', newRating.value, comment.value || undefined)
    if (res.success) {
      toast.success(hasRated.value ? 'تم تحديث تقييم المشروع' : 'تم إرسال تقييم المشروع')
      showForm.value = false
      await load()
    } else {
      toast.error(res.message || 'فشل إرسال التقييم')
    }
  } catch (e: any) { toast.error(e?.message || 'فشل إرسال التقييم') }
  finally { submitting.value = false }
}

async function load() {
  loading.value = true
  try {
    const res = await getRatings('project', 'global')
    if (res.success) {
      ratings.value = res.ratings || []
      average.value = res.average || 0
      count.value = res.count || 0
    }
  } catch { /* ignore */ }
  finally { loading.value = false }
}

onMounted(load)
</script>

<template>
  <div class="project-rating">
    <h3>⭐ تقييم المشروع</h3>
    <SkeletonLoader v-if="loading" type="cards" :count="2" />
    <template v-else>
      <div class="pr-overview">
        <div class="pr-score">
          <span class="pr-stars">{{ stars(Math.round(average)) }}</span>
          <span class="pr-avg">{{ average.toFixed(1) }} / 5</span>
        </div>
        <div class="pr-count">{{ count }} تقييم</div>
      </div>

      <div v-if="hasRated" class="pr-my">
        <span>تقييمك: <strong>{{ stars(myRating?.rating || 0) }}</strong></span>
        <button class="pr-edit" @click="openEdit">تغيير</button>
      </div>

      <button v-if="!hasRated" class="pr-toggle" @click="showForm = !showForm">
        {{ showForm ? 'إلغاء' : '⭐ قيّم المشروع' }}
      </button>

      <div v-if="showForm" class="pr-form">
        <h4>{{ hasRated ? 'تعديل تقييم المشروع' : 'تقييم جديد للمشروع' }}</h4>
        <div class="pr-stars-input">
          <span v-for="n in 5" :key="n" :class="['pr-star', { active: n <= newRating }]" @click="newRating = n">★</span>
        </div>
        <textarea v-model="comment" rows="3" placeholder="تعليق أو اقتراح (اختياري)" maxlength="1000"></textarea>
        <button class="pr-submit" :disabled="submitting" @click="submit">
          {{ submitting ? '...' : (hasRated ? '⭐ تحديث' : '⭐ إرسال') }}
        </button>
      </div>

      <div v-if="ratings.length" class="pr-list">
        <h4>آخر التقييمات</h4>
        <div v-for="r in ratings" :key="r.id" class="pr-item">
          <span class="pr-item-stars">{{ stars(r.rating) }}</span>
          <span class="pr-item-name">{{ r.rater_name || 'مستخدم' }}</span>
          <p v-if="r.comment" class="pr-item-comment">{{ r.comment }}</p>
          <span class="pr-item-date">{{ formatDate(r.created_at) }}</span>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.project-rating { background: var(--as-surface, rgba(15,23,42,0.6)); border: 1px solid var(--as-border, rgba(255,255,255,0.06)); border-radius: 0.7rem; padding: 1.2rem; margin-top: 1rem; }
.project-rating h3 { margin: 0 0 1rem; font-size: 1rem; color: var(--as-text, #e2e8f0); }
.pr-overview { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.8rem; margin-bottom: 1rem; padding: 1rem; background: linear-gradient(135deg, rgba(99,102,241,0.12), rgba(124,58,237,0.08)); border-radius: 0.6rem; }
.pr-score { display: flex; align-items: center; gap: 0.6rem; }
.pr-stars { font-size: 1.4rem; color: #f59e0b; letter-spacing: 2px; }
.pr-avg { font-size: 0.9rem; color: var(--as-text-muted, #94a3b8); }
.pr-count { font-size: 0.85rem; color: var(--as-text, #e2e8f0); }
.pr-my { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.8rem; padding: 0.6rem; background: rgba(16,185,129,0.08); border-radius: 0.5rem; }
.pr-my span { font-size: 0.9rem; color: var(--as-text, #e2e8f0); }
.pr-my strong { color: #f59e0b; font-size: 1.1rem; }
.pr-edit { margin-inline-start: auto; padding: 0.3rem 0.8rem; border-radius: 0.4rem; border: 1px solid var(--as-border, rgba(255,255,255,0.08)); background: var(--as-accent, rgba(99,102,241,0.15)); color: var(--as-text, #c7d2fe); cursor: pointer; font-size: 0.8rem; font-family: inherit; }
.pr-toggle { width: 100%; padding: 0.7rem; border-radius: 0.5rem; border: none; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; font-weight: 700; cursor: pointer; font-family: inherit; }
.pr-form { margin-top: 1rem; padding: 1rem; border: 1px solid var(--as-border, rgba(255,255,255,0.06)); border-radius: 0.5rem; }
.pr-form h4 { margin: 0 0 0.6rem; font-size: 0.9rem; color: var(--as-text, #e2e8f0); }
.pr-stars-input { display: flex; gap: 0.4rem; font-size: 2rem; margin-bottom: 0.6rem; }
.pr-star { cursor: pointer; color: var(--as-text-muted, #475569); transition: color 0.15s; }
.pr-star.active { color: #f59e0b; }
.pr-form textarea { width: 100%; padding: 0.5rem; border-radius: 0.4rem; border: 1px solid var(--as-border, rgba(255,255,255,0.08)); background: var(--as-input-bg, rgba(0,0,0,0.2)); color: var(--as-text, #e2e8f0); font-family: inherit; margin-bottom: 0.6rem; box-sizing: border-box; }
.pr-submit { width: 100%; padding: 0.6rem; border-radius: 0.4rem; border: none; background: var(--as-success, #10b981); color: #fff; font-weight: 700; cursor: pointer; font-family: inherit; }
.pr-submit:disabled { opacity: 0.5; cursor: not-allowed; }
.pr-list { margin-top: 1rem; }
.pr-list h4 { margin: 0 0 0.6rem; font-size: 0.9rem; color: var(--as-text-muted, #94a3b8); }
.pr-item { padding: 0.6rem; border-bottom: 1px solid var(--as-border, rgba(255,255,255,0.04)); }
.pr-item-stars { color: #f59e0b; font-size: 0.9rem; letter-spacing: 1px; }
.pr-item-name { font-size: 0.85rem; color: var(--as-text, #e2e8f0); font-weight: 600; margin: 0 0.5rem; }
.pr-item-comment { font-size: 0.85rem; color: var(--as-text-muted, #94a3b8); margin: 0.3rem 0; }
.pr-item-date { font-size: 0.7rem; color: var(--as-text-muted, #64748b); }
</style>
