<template>
  <div>
    <p class="hint">⚙️ تعديل الأرقام والنصوص من هنا يؤثر على قيم مخزنة في النظام. سأربط الواجهات بها في الخطوة التالية.</p>
    <div v-if="loading" class="empty">جاري التحميل...</div>
    <div v-else-if="error" class="empty error">{{ error }}</div>
    <div v-else class="settings-list">
      <div v-for="item in settingsList" :key="item.key" class="setting-row">
        <label>{{ item.label }}</label>
        <input v-if="item.type === 'number'" v-model.number="values[item.key]" type="number" class="input-sm" />
        <input v-else v-model="values[item.key]" class="input-sm" />
      </div>
      <button class="btn" :disabled="saving" @click="save">حفظ الإعدادات</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import { ref, reactive, onMounted } from 'vue'
import { useToast } from '@/composables/useToast'
import { getAdminSettings, updateAdminSetting } from '@/services/admin-reports.service'


const toast = useToast()
const settings = ref<Record<string, string>>({})
const values = reactive<Record<string, string | number>>({})
const loading = ref(true)
const error = ref<string | null>(null)
const saving = ref(false)

const settingsList = [
  { key: 'student_price_month_cents', label: 'سعر طالب/شهر (سنت)', type: 'number' },
  { key: 'student_price_year_cents', label: 'سعر طالب/سنة (سنت)', type: 'number' },
  { key: 'student_premium_price_month_cents', label: 'سعر طالب مميز/شهر (سنت)', type: 'number' },
  { key: 'teacher_price_student_month_cents', label: 'سعر طالب/شهر للمدرس (سنت)', type: 'number' },
  { key: 'teacher_price_student_year_cents', label: 'سعر طالب/سنة للمدرس (سنت)', type: 'number' },
  { key: 'teacher_free_threshold', label: 'حد المجانية للمدرس (عدد طلاب)', type: 'number' },
  { key: 'school_teacher_price_month_cents', label: 'سعر معلم/شهر للمدرسة (سنت)', type: 'number' },
  { key: 'school_teacher_price_year_cents', label: 'سعر معلم/سنة للمدرسة (سنت)', type: 'number' },
  { key: 'school_student_price_month_cents', label: 'سعر طالب/شهر للمدرسة (سنت)', type: 'number' },
  { key: 'school_student_price_year_cents', label: 'سعر طالب/سنة للمدرسة (سنت)', type: 'number' },
  { key: 'school_free_teachers', label: 'حد المعلمين المجانيين للمدرسة', type: 'number' },
  { key: 'school_free_students', label: 'حد الطلاب المجانيين للمدرسة', type: 'number' },
  { key: 'free_account_label', label: 'نص الحساب المجاني', type: 'text' },
  { key: 'no_subscription_title', label: 'نص "لا يوجد اشتراك"', type: 'text' },
  { key: 'student_plan_title', label: 'عنوان قسم خطط الطالب', type: 'text' },
  { key: 'student_plan_basic_name', label: 'اسم الخطة الأساسية', type: 'text' },
  { key: 'student_plan_basic_desc', label: 'وصف الخطة الأساسية', type: 'text' },
  { key: 'student_plan_premium_name', label: 'اسم الخطة المميزة', type: 'text' },
  { key: 'student_plan_premium_desc', label: 'وصف الخطة المميزة', type: 'text' },
]

async function load() {
  loading.value = true
  try {
    const res = await getAdminSettings()
    if (res.success) {
      settings.value = res.settings
      for (const item of settingsList) {
        const raw = res.settings[item.key]
        values[item.key] = item.type === 'number' ? (raw ? Number(raw) : 0) : (raw ?? '')
      }
    }
  } catch (e: any) { error.value = e.message || 'فشل التحميل' } finally { loading.value = false }
}

async function save() {
  saving.value = true
  try {
    for (const item of settingsList) {
      const v = values[item.key]
      const str = String(v ?? '')
      await updateAdminSetting(item.key, str)
    }
    toast.success('تم الحفظ')
  } catch (e: any) { toast.error(e.message || 'فشل الحفظ') } finally { saving.value = false }
}

onMounted(load)
</script>

<style scoped>
.hint { color: #94a3b8; font-size: 0.85rem; margin-bottom: 1rem; }
.settings-list { display: flex; flex-direction: column; gap: 0.7rem; }
.setting-row { display: grid; grid-template-columns: 1fr 180px; align-items: center; gap: 1rem; }
.setting-row label { color: #cbd5e1; font-size: 0.85rem; }
.input-sm { padding: 0.4rem 0.6rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: #0f172a; color: #f1f5f9; font-size: 0.85rem; }
.btn { padding: 0.5rem 1rem; border: none; border-radius: 6px; background: #22c55e; color: #fff; cursor: pointer; margin-top: 0.5rem; }
.empty { color: #64748b; text-align: center; padding: 1rem; }
.error { color: #f87171; }
</style>
