<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import { ref, watch } from 'vue';
const props = defineProps<{
  showWarningModal: boolean;
  showReportModal: boolean;
  warningForm: { title: string; message: string; severity: string };
  reportForm: { reason: string; details: string };
  submitting: boolean;
  formMsg: string;
  formSuccess: boolean;
  userName?: string;
}>();

const emit = defineEmits<{
  (e: 'close-warning'): void
  (e: 'close-report'): void
  (e: 'submit-warning'): void
  (e: 'submit-report'): void
  (e: 'update:warningForm', value: { title: string; message: string; severity: string }): void
  (e: 'update:reportForm', value: { reason: string; details: string }): void
}>();
const localWarningForm = ref({ ...props.warningForm });
const localReportForm = ref({ ...props.reportForm });

watch(() => props.warningForm, (v) => { localWarningForm.value = { ...v }; });
watch(() => props.reportForm, (v) => { localReportForm.value = { ...v }; });

watch(localWarningForm, (v) => emit('update:warningForm', { ...v }), { deep: true });
watch(localReportForm, (v) => emit('update:reportForm', { ...v }), { deep: true });
</script>

<template>
  <div>
    <!-- Warning Modal -->
    <div v-if="showWarningModal" class="sud-modal-overlay" @click.self="emit('close-warning')">
      <div class="sud-modal">
        <h3>{{ t('shared.sudWarningTitle') }}</h3>
        <p class="modal-subtitle">{{ t('shared.sudWarningSubtitle', { name: userName || '' }) }}</p>
        <select v-model="localWarningForm.severity" class="sud-input">
          <option value="low">{{ t('shared.sudSevLow') }}</option>
          <option value="normal">{{ t('shared.sudSevNormal') }}</option>
          <option value="high">{{ t('shared.sudSevHigh') }}</option>
          <option value="critical">{{ t('shared.sudSevCritical') }}</option>
        </select>
        <input v-model="localWarningForm.title" type="text" class="sud-input" :placeholder="t('shared.sudWarningTitleInput')" />
        <textarea v-model="localWarningForm.message" class="sud-input sud-textarea" :placeholder="t('shared.sudWarningDetailsInput')" rows="3"></textarea>
        <p v-if="formMsg && !formSuccess" class="sud-form-error">{{ formMsg }}</p>
        <div class="sud-modal-actions">
          <button class="sud-btn-cancel" @click="emit('close-warning')">{{ t('shared.annCancel') }}</button>
          <button class="sud-btn-confirm" :disabled="submitting" @click="emit('submit-warning')">{{ submitting ? '...' : t('shared.annPublish') }}</button>
        </div>
      </div>
    </div>

    <!-- Report Modal -->
    <div v-if="showReportModal" class="sud-modal-overlay" @click.self="emit('close-report')">
      <div class="sud-modal">
        <h3>{{ t('shared.sudReportTitle') }}</h3>
        <p class="modal-subtitle">{{ t('shared.sudReportSubtitle', { name: userName || '' }) }}</p>
        <input v-model="localReportForm.reason" type="text" class="sud-input" :placeholder="t('shared.sudReportReasonInput')" />
        <textarea v-model="localReportForm.details" class="sud-input sud-textarea" :placeholder="t('shared.sudReportDetailsInput')" rows="4"></textarea>
        <p v-if="formMsg && !formSuccess" class="sud-form-error">{{ formMsg }}</p>
        <div class="sud-modal-actions">
          <button class="sud-btn-cancel" @click="emit('close-report')">{{ t('shared.annCancel') }}</button>
          <button class="sud-btn-confirm" :disabled="submitting" @click="emit('submit-report')">{{ submitting ? '...' : t('shared.sudSendReport') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>
