<script setup lang="ts">
import { ref } from 'vue';
import { createApproval } from '../../services/approval.service';

const props = defineProps<{
  type: 'penalty' | 'grade_change' | 'student_removal' | 'grade_appeal';
  approverType: 'teacher' | 'school' | 'admin';
  targetUserId: number;
  targetUserName: string;
  classId?: string;
  reportId?: number;
  schoolId?: number;
}>();

const show = ref(false);
const title = ref('');
const description = ref('');
const proposedGrade = ref<number | null>(null);
const severity = ref('normal');
const submitting = ref(false);
const errorMsg = ref('');
const successMsg = ref('');

const typeLabels: Record<string, string> = {
  penalty: '⚠️ طلب عقوبة',
  grade_change: '📊 طلب تغيير درجة',
  student_removal: '🚪 طلب فصل طالب',
  grade_appeal: '📝 اعتراض على درجة',
};

async function submit() {
  if (!title.value.trim() || !description.value.trim()) return;
  submitting.value = true;
  errorMsg.value = '';
  successMsg.value = '';
  try {
    const res = await createApproval({
      type: props.type,
      approver_type: props.approverType,
      target_user_id: props.targetUserId,
      target_user_name: props.targetUserName,
      class_id: props.classId,
      report_id: props.reportId,
      school_id: props.schoolId,
      title: title.value,
      description: description.value,
      proposed_grade: proposedGrade.value ?? undefined,
      severity: props.type === 'penalty' ? severity.value : undefined,
    });
    if (res.success) {
      successMsg.value = 'تم إرسال الطلب بنجاح';
      show.value = false;
      title.value = '';
      description.value = '';
      proposedGrade.value = null;
      severity.value = 'normal';
    } else {
      errorMsg.value = (res as any).message || 'فشل الإرسال';
    }
  } catch {
    errorMsg.value = 'فشل الإرسال';
  } finally {
    submitting.value = false;
  }
}

function open() {
  show.value = true;
  errorMsg.value = '';
  successMsg.value = '';
}
</script>

<template>
  <div>
    <button class="ca-trigger" @click="open">
      <slot>{{ typeLabels[type] }}</slot>
    </button>

    <div v-if="show" class="ca-overlay" @click.self="show = false">
      <div class="ca-modal">
        <h3>{{ typeLabels[type] }}</h3>
        <p class="ca-subtitle">المستهدف: {{ targetUserName }}</p>

        <input v-model="title" type="text" class="ca-input" placeholder="عنوان الطلب" />

        <textarea v-model="description" class="ca-input ca-textarea" placeholder="اشرح السبب والتفاصيل..." rows="3"></textarea>

        <div v-if="type === 'grade_change' || type === 'grade_appeal'" class="ca-field">
          <label>الدرجة المقترحة (0-100)</label>
          <input v-model.number="proposedGrade" type="number" min="0" max="100" class="ca-input" placeholder="مثال: 85" />
        </div>

        <div v-if="type === 'penalty'" class="ca-field">
          <label>مستوى الخطورة</label>
          <select v-model="severity" class="ca-input">
            <option value="low">منخفضة</option>
            <option value="normal">عادية</option>
            <option value="high">عالية</option>
            <option value="critical">حرجة</option>
          </select>
        </div>

        <p v-if="errorMsg" class="ca-error">{{ errorMsg }}</p>
        <p v-if="successMsg" class="ca-success">{{ successMsg }}</p>

        <div class="ca-actions">
          <button class="ca-cancel" @click="show = false">إلغاء</button>
          <button class="ca-confirm" :disabled="submitting" @click="submit">{{ submitting ? '...' : 'إرسال الطلب' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ca-trigger { display: inline-block; }
.ca-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 300; }
.ca-modal { background: rgba(15,23,42,0.95); border: 1px solid rgba(255,255,255,0.1); border-radius: 0.8rem; padding: 1.5rem; width: 90%; max-width: 420px; display: flex; flex-direction: column; gap: 0.6rem; }
.ca-modal h3 { margin: 0; font-size: 1rem; color: #f1f5f9; text-align: center; }
.ca-subtitle { font-size: 0.78rem; color: #64748b; text-align: center; margin: 0; }
.ca-field { display: flex; flex-direction: column; gap: 0.2rem; }
.ca-field label { font-size: 0.75rem; color: #94a3b8; }
.ca-input { padding: 0.6rem 0.8rem; border-radius: 0.4rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: #e2e8f0; font-size: 0.82rem; font-family: inherit; }
.ca-textarea { resize: vertical; }
.ca-error { color: #f87171; font-size: 0.78rem; text-align: center; margin: 0; }
.ca-success { color: #86efac; font-size: 0.78rem; text-align: center; margin: 0; }
.ca-actions { display: flex; gap: 0.5rem; }
.ca-cancel { flex: 1; padding: 0.5rem; border-radius: 0.4rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: #94a3b8; font-size: 0.82rem; font-weight: 700; cursor: pointer; font-family: inherit; }
.ca-confirm { flex: 1; padding: 0.5rem; border-radius: 0.4rem; border: none; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; font-size: 0.82rem; font-weight: 700; cursor: pointer; font-family: inherit; }
.ca-confirm:disabled { opacity: 0.6; cursor: wait; }
</style>
