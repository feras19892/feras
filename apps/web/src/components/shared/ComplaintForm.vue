<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { getComplaintTargets, createComplaint, type ComplaintTargets } from '@/services/complaint.service'
import { useToast } from '@/composables/useToast'

const emit = defineEmits<{ created: [], cancel: [] }>()

const toast = useToast()

let isMounted = true
let loadController: AbortController | null = null
let submitController: AbortController | null = null

const targets = ref<ComplaintTargets | null>(null)
const loading = ref(false)
const submitting = ref(false)

const targetRole = ref<'teacher' | 'school' | 'admin'>('admin')
const targetId = ref<number | null>(null)
const category = ref<'technical' | 'academic' | 'behavioral' | 'other'>('technical')
const subject = ref('')
const body = ref('')
const priority = ref<'low' | 'normal' | 'high' | 'urgent'>('normal')

const availableTargets = computed(() => {
  if (!targets.value) return []
  const opts: { label: string; value: string; id?: number | null }[] = []
  if (targets.value.admin) opts.push({ label: 'الإدارة', value: 'admin', id: null })
  if (targets.value.school) opts.push({ label: 'المدرسة', value: 'school', id: targets.value.school.id })
  if (targets.value.teachers) {
    for (const t of targets.value.teachers) opts.push({ label: `المدرس: ${t.name}`, value: 'teacher', id: t.id })
  }
  return opts
})

const selectedTargetIdx = ref(0)

function selectTarget(idx: number) {
  selectedTargetIdx.value = idx
  const t = availableTargets.value[idx]
  if (t) {
    targetRole.value = t.value as any
    targetId.value = t.id ?? null
  }
}

function resetForm() {
  subject.value = ''
  body.value = ''
  priority.value = 'normal'
  selectedTargetIdx.value = 0
  if (availableTargets.value[0]) selectTarget(0)
}

function cancel() {
  if (submitController) { submitController.abort(); submitController = null }
  resetForm()
  emit('cancel')
}

async function loadTargets() {
  if (!isMounted) return
  if (loadController) { loadController.abort(); loadController = null }
  loadController = new AbortController()
  loading.value = true
  try {
    const res = await getComplaintTargets(loadController.signal)
    if (!isMounted) return
    if (res.success) {
      targets.value = res.targets
      const first = availableTargets.value[0]
      if (first) selectTarget(0)
    }
  } catch { /* ignore */ }
  finally { if (isMounted) loading.value = false; loadController = null }
}

async function submit() {
  if (!isMounted) return
  if (!subject.value.trim() || !body.value.trim()) {
    toast.error('يرجى تعبئة الموضوع والنص')
    return
  }
  if (submitController) { submitController.abort(); submitController = null }
  submitController = new AbortController()
  submitting.value = true
  try {
    const res = await createComplaint({
      targetRole: targetRole.value,
      targetId: targetId.value,
      category: category.value,
      subject: subject.value,
      body: body.value,
      priority: priority.value,
    }, submitController.signal)
    if (!isMounted) return
    if (res.success) {
      toast.success('تم إرسال الشكوى')
      resetForm()
      emit('created')
    } else {
      toast.error(res.message || 'فشل إرسال الشكوى')
    }
  } catch (e: any) {
    if (isMounted) toast.error(e?.message || 'فشل الإرسال')
  } finally {
    if (isMounted) submitting.value = false
    submitController = null
  }
}

onMounted(() => { isMounted = true; loadTargets() })
onUnmounted(() => {
  isMounted = false
  if (loadController) { loadController.abort(); loadController = null }
  if (submitController) { submitController.abort(); submitController = null }
})
</script>

<template>
  <div class="complaint-form">
    <h4>📝 تقديم شكوى</h4>

    <div v-if="loading" class="cf-loading">جاري التحميل...</div>
    <template v-else>
      <div class="cf-field">
        <label>الجهة المستهدفة</label>
        <div class="cf-targets">
          <button
            v-for="(t, i) in availableTargets"
            :key="i"
            class="cf-target-btn"
            :class="{ active: selectedTargetIdx === i }"
            @click="selectTarget(i)"
          >{{ t.label }}</button>
        </div>
      </div>

      <div class="cf-row">
        <div class="cf-field">
          <label>التصنيف</label>
          <select v-model="category">
            <option value="technical">تقني</option>
            <option value="academic">أكاديمي</option>
            <option value="behavioral">سلوكي</option>
            <option value="other">أخرى</option>
          </select>
        </div>
        <div class="cf-field">
          <label>الأولوية</label>
          <select v-model="priority">
            <option value="low">منخفضة</option>
            <option value="normal">عادية</option>
            <option value="high">عالية</option>
            <option value="urgent">عاجلة</option>
          </select>
        </div>
      </div>

      <div v-if="!availableTargets.length && !loading" class="cf-empty">لا توجد جهات متاحة لتقديم شكاوى</div>

      <div class="cf-field">
        <label>الموضوع</label>
        <input v-model="subject" placeholder="عنوان مختصر للشكوى" maxlength="200" />
      </div>

      <div class="cf-field">
        <label>تفاصيل الشكوى</label>
        <textarea v-model="body" rows="4" placeholder="اكتب تفاصيل الشكوى هنا..." maxlength="5000"></textarea>
      </div>

      <div class="cf-actions">
        <button
          class="cf-submit"
          :disabled="submitting || !subject.trim() || !body.trim() || !availableTargets.length"
          @click="submit"
        >
          <span class="cf-submit-icon">📤</span>
          <span class="cf-submit-text">{{ submitting ? 'جاري الإرسال...' : 'إرسال الشكوى الآن' }}</span>
        </button>
        <button class="cf-cancel" type="button" :disabled="submitting" @click="cancel">
          إلغاء
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.complaint-form { background: var(--as-surface, rgba(15,23,42,0.6)); border: 1px solid var(--as-border, rgba(255,255,255,0.06)); border-radius: 0.6rem; padding: 1rem; }
.cf-loading { text-align: center; padding: 1.5rem; color: var(--as-text-muted, #64748b); }
.cf-field { margin-bottom: 0.8rem; }
.cf-field label { display: block; font-size: 0.8rem; color: var(--as-text-muted, #94a3b8); margin-bottom: 0.3rem; }
.cf-field input, .cf-field select, .cf-field textarea { width: 100%; padding: 0.5rem 0.7rem; border-radius: 0.4rem; border: 1px solid var(--as-border, rgba(255,255,255,0.08)); background: var(--as-input-bg, rgba(0,0,0,0.2)); color: var(--as-text, #e2e8f0); font-size: 0.85rem; font-family: inherit; }
.cf-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; }
.cf-targets { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.cf-target-btn { padding: 0.4rem 0.8rem; border-radius: 0.4rem; border: 1px solid var(--as-border, rgba(255,255,255,0.08)); background: transparent; color: var(--as-text-muted, #94a3b8); cursor: pointer; font-size: 0.8rem; font-family: inherit; }
.cf-target-btn.active { background: var(--as-accent, rgba(99,102,241,0.15)); border-color: var(--as-accent-solid, #6366f1); color: var(--as-text, #c7d2fe); }
.cf-actions { display: grid; grid-template-columns: 1fr auto; gap: 0.6rem; align-items: center; }
.cf-submit { display: flex; align-items: center; justify-content: center; gap: 0.5rem; width: 100%; padding: 0.85rem; border-radius: 0.5rem; border: none; background: linear-gradient(135deg, #22c55e, #16a34a); color: #fff; cursor: pointer; font-weight: 800; font-family: inherit; font-size: 1rem; box-shadow: 0 4px 14px rgba(22,163,74,0.3); transition: transform 0.12s, opacity 0.12s; }
.cf-submit:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
.cf-submit:not(:disabled):hover { transform: translateY(-1px); }
.cf-submit-icon { font-size: 1.1rem; }
.cf-cancel { padding: 0.85rem 1rem; border-radius: 0.5rem; border: 1px solid var(--as-border, rgba(255,255,255,0.08)); background: transparent; color: var(--as-text-muted, #94a3b8); cursor: pointer; font-family: inherit; font-size: 0.9rem; }
.cf-cancel:disabled { opacity: 0.45; cursor: not-allowed; }
.cf-cancel:hover { color: var(--as-text, #e2e8f0); }
.cf-empty { text-align: center; padding: 1rem; color: var(--as-text-muted, #64748b); font-size: 0.85rem; background: rgba(239,68,68,0.05); border: 1px dashed rgba(239,68,68,0.2); border-radius: 0.4rem; }
@media (max-width: 600px) { .cf-row { grid-template-columns: 1fr; } }
</style>
