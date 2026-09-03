<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import { ref, watch } from 'vue'
import { createAdminPlan, updateAdminPlan, type AdminPlan } from '@/services/core/admin-subscriptions.api'


const props = defineProps<{
  plan?: AdminPlan
}>()

const emit = defineEmits<{
  (e: 'saved'): void
  (e: 'cancel'): void
}>()

const step = ref(1)
const saving = ref(false)
const formError = ref<string | null>(null)

const form = ref({
  type: 'student' as 'student' | 'teacher' | 'school',
  name: '',
  currency: 'EUR',
  features: '',
  is_active: 1,
})

const reset = () => {
  if (props.plan) {
    step.value = 2
    form.value = {
      type: props.plan.type,
      name: props.plan.name,
      currency: props.plan.currency,
      features: props.plan.features ?? '',
      is_active: props.plan.is_active,
    }
  } else {
    step.value = 1
    form.value = {
      type: 'student',
      name: '',
      currency: 'EUR',
      features: '',
      is_active: 1,
    }
  }
  formError.value = null
}

watch(() => props.plan, reset, { immediate: true })

const submit = async () => {
  saving.value = true
  formError.value = null
  try {
    const payload = {
      ...form.value,
      features: form.value.features.trim() || null,
    }
    if (props.plan) {
      await updateAdminPlan(props.plan.id, payload)
    } else {
      await createAdminPlan(payload)
    }
    emit('saved')
  } catch (e: any) {
    formError.value = e?.message || 'فشل حفظ الخطة'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="overlay" @click.self="emit('cancel')">
    <div class="panel">
      <h3 class="title">
        {{ props.plan ? 'تعديل خطة' : 'إضافة خطة جديدة' }}
      </h3>

      <div v-if="formError" class="error">{{ formError }}</div>

      <div v-if="step === 1" class="step">
        <p class="label">اختر نوع الخطة</p>
        <div class="type-options">
          <button
            v-for="t in ['student', 'teacher', 'school']"
            :key="t"
            type="button"
            :class="['type-card', { selected: form.type === t }]"
            @click="form.type = t as 'student' | 'teacher' | 'school'"
          >
            {{ t === 'student' ? 'طالب' : t === 'teacher' ? 'مدرس' : 'مدرسة' }}
          </button>
        </div>
        <div class="actions">
          <button type="button" class="btn-next" @click="step = 2">التالي</button>
          <button type="button" class="btn-secondary" @click="emit('cancel')">إلغاء</button>
        </div>
      </div>

      <form v-else class="step" @submit.prevent="submit">
        <div v-if="!props.plan" class="back-link" @click="step = 1">← تغيير النوع</div>

        <div class="field">
          <label>الاسم</label>
          <input v-model="form.name" type="text" required class="input" />
        </div>

        <div v-if="props.plan" class="field">
          <label>النوع</label>
          <input :value="form.type" class="input" disabled />
        </div>

        <div class="field">
          <label>العملة</label>
          <input v-model="form.currency" type="text" maxlength="3" required class="input" />
        </div>

        <div class="field">
          <label>المميزات / الوصف</label>
          <textarea v-model="form.features" class="input" rows="4" />
        </div>

        <div class="field inline">
          <label>
            <input v-model="form.is_active" type="checkbox" :true-value="1" :false-value="0" />
            نشط
          </label>
        </div>

        <div class="actions">
          <button type="submit" class="btn-next" :disabled="saving">
            {{ saving ? 'جاري الحفظ...' : 'حفظ' }}
          </button>
          <button type="button" class="btn-secondary" @click="emit('cancel')">إلغاء</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}
.panel {
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  width: 480px;
  max-width: 90vw;
  padding: 1.5rem;
  color: #e2e8f0;
}
.title {
  margin: 0 0 1rem;
  font-size: 1.2rem;
}
.error {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  padding: 0.75rem;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
}
.step {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.label {
  color: #94a3b8;
}
.type-options {
  display: flex;
  gap: 0.5rem;
}
.type-card {
  flex: 1;
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #cbd5e1;
  padding: 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
}
.type-card.selected {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.15);
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.field label {
  color: #94a3b8;
  font-size: 0.85rem;
}
.input {
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #e2e8f0;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
}
.field.inline {
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
}
.back-link {
  color: #6366f1;
  cursor: pointer;
  font-size: 0.85rem;
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}
.btn-next {
  background: #6366f1;
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
}
.btn-next:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-secondary {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
}
</style>
