<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { ref, computed } from 'vue';
import { useToast } from '@/composables/useToast';
import { sendAdminNotification } from '@/services/admin-notifications.service';
import type { AdminTargetType, AdminPriority } from '@/services/admin-notifications.service';

const toast = useToast();

const targetType = ref<AdminTargetType>('all');
const targetValue = ref('');
const title = ref('');
const message = ref('');
const priority = ref<AdminPriority>('normal');
const loading = ref(false);

const targetPlaceholder = computed(() => {
  switch (targetType.value) {
    case 'role': return t('admin.notifications.rolePlaceholder');
    case 'school': return t('admin.notifications.schoolPlaceholder');
    case 'class': return t('admin.notifications.classPlaceholder');
    case 'user': return t('admin.notifications.userPlaceholder');
    default: return '';
  }
});

const needsTargetValue = computed(() => targetType.value !== 'all');

const canSubmit = computed(() =>
  title.value.trim() &&
  message.value.trim() &&
  (!needsTargetValue.value || targetValue.value.trim())
);

async function submit() {
  if (!canSubmit.value) return;
  loading.value = true;
  try {
    const res = await sendAdminNotification({
      target_type: targetType.value,
      target_value: targetValue.value || undefined,
      title: title.value.trim(),
      message: message.value.trim(),
      priority: priority.value,
    });
    if (res.success) {
      toast.success(t('admin.notifications.sent', { count: res.recipient_count ?? 0 }));
      reset();
    } else {
      toast.error(res.message || t('admin.notifications.sendFailed'));
    }
  } catch (e: any) {
    toast.error(e?.message || t('admin.notifications.sendFailed'));
  } finally {
    loading.value = false;
  }
}

function reset() {
  targetType.value = 'all';
  targetValue.value = '';
  title.value = '';
  message.value = '';
  priority.value = 'normal';
}
</script>

<template>
  <div class="composer">
    <h3 class="composer__title">{{ t('admin.notifications.composerTitle') }}</h3>
    <div class="form">
      <div class="form-row">
        <label class="form-label">{{ t('admin.notifications.targetLabel') }}</label>
        <select v-model="targetType" class="form-select">
          <option value="all">{{ t('admin.notifications.targetAll') }}</option>
          <option value="role">{{ t('admin.notifications.targetRole') }}</option>
          <option value="school">{{ t('admin.notifications.targetSchool') }}</option>
          <option value="class">{{ t('admin.notifications.targetClass') }}</option>
          <option value="user">{{ t('admin.notifications.targetUser') }}</option>
        </select>
        <input v-if="needsTargetValue" v-model="targetValue" :placeholder="targetPlaceholder" class="form-input" />
      </div>

      <div class="form-row">
        <label class="form-label">{{ t('admin.notifications.priorityLabel') }}</label>
        <select v-model="priority" class="form-select">
          <option value="low">{{ t('admin.notifications.priorityLow') }}</option>
          <option value="normal">{{ t('admin.notifications.priorityNormal') }}</option>
          <option value="immediate">{{ t('admin.notifications.priorityImmediate') }}</option>
        </select>
      </div>

      <div class="form-row">
        <label class="form-label">{{ t('admin.notifications.titleLabel') }}</label>
        <input v-model="title" class="form-input" :placeholder="t('admin.notifications.titlePlaceholder')" maxlength="200" />
      </div>

      <div class="form-row">
        <label class="form-label">{{ t('admin.notifications.messageLabel') }}</label>
        <textarea v-model="message" rows="4" class="form-textarea" :placeholder="t('admin.notifications.messagePlaceholder')" maxlength="2000" />
      </div>

      <button class="submit-btn" :disabled="!canSubmit || loading" @click="submit">
        {{ loading ? t('admin.notifications.sending') : t('admin.notifications.send') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.composer { background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 1rem; padding: 1rem; }
.composer__title { margin: 0 0 1rem; color: #f1f5f9; font-size: 1.05rem; }
.form { display: flex; flex-direction: column; gap: 0.8rem; }
.form-row { display: flex; align-items: center; gap: 0.7rem; flex-wrap: wrap; }
.form-label { color: #94a3b8; font-size: 0.85rem; width: 80px; font-weight: 600; }
.form-input, .form-select, .form-textarea { flex: 1; min-width: 200px; padding: 0.55rem 0.7rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.25); color: #f1f5f9; font-family: inherit; font-size: 0.9rem; }
.form-textarea { resize: vertical; }
.submit-btn { padding: 0.6rem 1.2rem; border: none; border-radius: 8px; background: linear-gradient(135deg, #6366f1, #4f46e5); color: #fff; font-weight: 700; cursor: pointer; margin-inline-start: auto; }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
