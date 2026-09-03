<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { ref, onMounted, computed } from 'vue';
import { fetchJson } from '@/services/http';
import { getSubscriptionSettings } from '@/services/core/school.api';
import type { SubscriptionSettings } from '@/services/core/school.api';

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const plans = ref<{ type: string; name: string; price_cents: number; billing_interval: string; features: string }[]>([]);
const settings = ref<SubscriptionSettings | null>(null);
const loading = ref(true);
const error = ref('');

function close() { emit('close'); }

function s(key: string, fallback: string | number): string | number {
  const raw = settings.value?.[key];
  if (raw == null) return fallback;
  if (typeof fallback === 'number') return Number(raw) || fallback;
  return raw;
}

const teacher = computed(() => ({
  monthCents: Number(s('teacher_price_student_month_cents', 150)),
  yearCents: Number(s('teacher_price_student_year_cents', 1300)),
  freeThreshold: Number(s('teacher_free_threshold', 10)),
}));

const school = computed(() => ({
  teacherMonth: Number(s('school_teacher_price_month_cents', 100)),
  teacherYear: Number(s('school_teacher_price_year_cents', 1000)),
  studentMonth: Number(s('school_student_price_month_cents', 100)),
  studentYear: Number(s('school_student_price_year_cents', 1000)),
  freeTeachers: Number(s('school_free_teachers', 15)),
  freeStudents: Number(s('school_free_students', 0)),
}));

function planDescription(type: string): string {
  if (type === 'student') return t('subscriptions.studentDesc')
  if (type === 'teacher') return t('subscriptions.teacherDesc', { price: (teacher.value.monthCents / 100).toFixed(2), freeThreshold: teacher.value.freeThreshold })
  if (type === 'school') return t('subscriptions.schoolDesc', { freeTeachers: school.value.freeTeachers, freeStudents: school.value.freeStudents, teacherPrice: (school.value.teacherMonth / 100).toFixed(2), studentPrice: (school.value.studentMonth / 100).toFixed(2) })
  return ''
}

onMounted(async () => {
  try {
    const [plansRes, settingsRes] = await Promise.all([
      fetchJson<{ success: boolean; plans: typeof plans.value }>('/api/subscriptions/plans'),
      getSubscriptionSettings(),
    ]);
    if (plansRes.success) plans.value = plansRes.plans;
    if (settingsRes.success) settings.value = settingsRes.data;
  } catch (e: any) {
    error.value = e.message || t('common.error');
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div v-if="open" class="modal-overlay" @click.self="close">
    <div class="modal-card">
      <button class="close-btn" @click="close">×</button>
      <h2>{{ t('subscriptions.title') }}</h2>
      <p v-if="loading" class="center">{{ t('subscriptions.loading') }}</p>
      <p v-else-if="error" class="error center">{{ error }}</p>
      <div v-else class="content">
        <p class="intro">{{ t('subscriptions.intro') }}</p>

        <div class="section-title">{{ t('subscriptions.plansTitle') }}</div>
        <div class="plans">
          <div v-for="plan in plans" :key="plan.type" class="plan-card">
            <div class="plan-header">
              <span class="plan-name">{{ plan.name }}</span>
              <span class="plan-price">{{ (plan.price_cents / 100).toFixed(2) }} €</span>
            </div>
            <p class="plan-desc">{{ planDescription(plan.type) }}</p>
          </div>
        </div>

        <div class="section-title">{{ t('subscriptions.howToTitle') }}</div>
        <ol class="steps">
          <li>{{ t('subscriptions.step1') }}</li>
          <li>{{ t('subscriptions.step2') }}</li>
          <li>{{ t('subscriptions.step3') }}</li>
          <li>{{ t('subscriptions.step4') }}</li>
          <li>{{ t('subscriptions.step5') }}</li>
        </ol>

        <div class="section-title">{{ t('subscriptions.perksTitle') }}</div>
        <ul class="perks">
          <li>{{ t('subscriptions.perkTeacher', { freeThreshold: teacher.freeThreshold }) }}</li>
          <li>{{ t('subscriptions.perkSchool', { freeTeachers: school.freeTeachers, freeStudents: school.freeStudents }) }}</li>
          <li>{{ t('subscriptions.perkYearly') }}</li>
        </ul>

        <div class="section-title">{{ t('subscriptions.notesTitle') }}</div>
        <ul class="notes">
          <li>{{ t('subscriptions.note1') }}</li>
          <li>{{ t('subscriptions.note2') }}</li>
          <li>{{ t('subscriptions.note3') }}</li>
        </ul>
      </div>
      <button class="btn-submit" @click="close">{{ t('subscriptions.close') }}</button>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; z-index: 1200;
  background: rgba(0,0,0,0.75);
  display: flex; align-items: center; justify-content: center;
  padding: 1rem;
  backdrop-filter: blur(2px);
}
.modal-card {
  background: #0f172a; border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px; padding: 1.5rem; max-width: 580px; width: 100%;
  max-height: 90vh; overflow-y: auto;
  position: relative;
}
.close-btn {
  position: absolute; top: 0.6rem; inset-inline-end: 0.8rem;
  background: none; border: none; color: #94a3b8; font-size: 1.4rem;
  cursor: pointer;
}
h2 { margin-top: 0; color: #f1f5f9; text-align: center; font-size: 1.35rem; }
.center { text-align: center; color: #94a3b8; }
.intro { color: #cbd5e1; font-size: 0.9rem; margin: 1rem 0; line-height: 1.7; }
.section-title { color: #a5b4fc; font-weight: 700; margin: 1.2rem 0 0.6rem; font-size: 1rem; }
.plans { display: flex; flex-direction: column; gap: 0.7rem; }
.plan-card {
  background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.18);
  border-radius: 12px; padding: 1rem;
}
.plan-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem; }
.plan-name { color: #f1f5f9; font-weight: 700; }
.plan-price { color: #67e8f9; font-weight: 800; font-size: 1.1rem; }
.plan-desc { color: #cbd5e1; font-size: 0.85rem; margin: 0; }
.steps, .perks, .notes { margin: 0; padding-right: 1.2rem; color: #cbd5e1; font-size: 0.9rem; line-height: 1.7; }
.steps li, .perks li, .notes li { margin-bottom: 0.4rem; }
.error { color: #fca5a5; }
.btn-submit {
  width: 100%; padding: 0.7rem; border: none; border-radius: 10px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff;
  font-weight: 700; cursor: pointer; margin-top: 1.2rem;
}
</style>
