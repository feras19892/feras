<script setup lang="ts">
import { ref } from 'vue';
import { schoolCreateApproval } from '../../services/approval.service';
import { useI18n } from '../../composables/useI18n';

const { t } = useI18n();

const props = defineProps<{
  type: 'class_creation' | 'class_deletion' | 'class_edit' | 'user_creation' | 'user_edit' | 'report_deletion';
  targetUserId: number;
  targetUserName: string;
  classId?: string;
  reportId?: number;
  metadata?: string;
  label?: string;
}>();

const show = ref(false);
const title = ref('');
const description = ref('');
const submitting = ref(false);
const errorMsg = ref('');
const successMsg = ref('');

const defaultLabels: Record<string, string> = {
  class_creation: t('school.approvalClassCreation'),
  class_deletion: t('school.approvalClassDeletion'),
  class_edit: t('school.approvalClassEdit'),
  user_creation: t('school.approvalUserCreation'),
  user_edit: t('school.approvalUserEdit'),
  report_deletion: t('school.approvalReportDeletion'),
};

async function submit() {
  if (!title.value.trim() || !description.value.trim()) return;
  submitting.value = true;
  errorMsg.value = '';
  successMsg.value = '';
  try {
    const res = await schoolCreateApproval({
      type: props.type,
      target_user_id: props.targetUserId,
      target_user_name: props.targetUserName,
      class_id: props.classId,
      report_id: props.reportId,
      title: title.value,
      description: description.value,
      metadata: props.metadata,
    });
    if (res.success) {
      successMsg.value = t('school.approvalSentToAdmin');
      show.value = false;
      title.value = '';
      description.value = '';
    } else {
      errorMsg.value = (res as any).message || t('school.approvalSendFailed');
    }
  } catch {
    errorMsg.value = t('school.approvalSendFailed');
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
    <button class="sa-trigger" @click="open">
      <slot>{{ label || defaultLabels[type] }}</slot>
    </button>

    <div v-if="show" class="sa-overlay" @click.self="show = false">
      <div class="sa-modal">
        <h3>{{ defaultLabels[type] }}</h3>
        <p class="sa-subtitle">{{ t('school.approvalSubtitle') }}</p>

        <input v-model="title" type="text" class="sa-input" :placeholder="t('school.approvalTitlePlaceholder')" />

        <textarea v-model="description" class="sa-input sa-textarea" :placeholder="t('school.approvalDescPlaceholder')" rows="3"></textarea>

        <p v-if="errorMsg" class="sa-error">{{ errorMsg }}</p>
        <p v-if="successMsg" class="sa-success">{{ successMsg }}</p>

        <div class="sa-actions">
          <button class="sa-cancel" @click="show = false">{{ t('school.approvalCancelBtn') }}</button>
          <button class="sa-confirm" :disabled="submitting" @click="submit">{{ submitting ? '...' : t('school.approvalSubmitBtn') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sa-trigger { display: inline-block; }
.sa-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 300; }
.sa-modal { background: rgba(15,23,42,0.95); border: 1px solid rgba(255,255,255,0.1); border-radius: 0.8rem; padding: 1.5rem; width: 90%; max-width: 420px; display: flex; flex-direction: column; gap: 0.6rem; }
.sa-modal h3 { margin: 0; font-size: 1rem; color: #f1f5f9; text-align: center; }
.sa-subtitle { font-size: 0.78rem; color: #64748b; text-align: center; margin: 0; }
.sa-input { padding: 0.6rem 0.8rem; border-radius: 0.4rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: #e2e8f0; font-size: 0.82rem; font-family: inherit; }
.sa-textarea { resize: vertical; }
.sa-error { color: #f87171; font-size: 0.78rem; text-align: center; margin: 0; }
.sa-success { color: #86efac; font-size: 0.78rem; text-align: center; margin: 0; }
.sa-actions { display: flex; gap: 0.5rem; }
.sa-cancel { flex: 1; padding: 0.5rem; border-radius: 0.4rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: #94a3b8; font-size: 0.82rem; font-weight: 700; cursor: pointer; font-family: inherit; }
.sa-confirm { flex: 1; padding: 0.5rem; border-radius: 0.4rem; border: none; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; font-size: 0.82rem; font-weight: 700; cursor: pointer; font-family: inherit; }
.sa-confirm:disabled { opacity: 0.6; cursor: wait; }
</style>
