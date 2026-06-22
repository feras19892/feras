<script setup lang="ts">
import { ref } from 'vue';
import { submitFeedback } from '../../services/admin.service';
import { useI18n } from '../../composables/useI18n';

const props = defineProps<{
  show: boolean;
  experimentId?: string;
  experimentName?: string;
}>();

const emit = defineEmits<{
  (e: 'update:show', val: boolean): void;
}>();

const { t } = useI18n();
const type = ref<'complaint' | 'rating' | 'suggestion'>('complaint');
const message = ref('');
const rating = ref(5);
const loading = ref(false);
const error = ref('');
const success = ref('');

async function send() {
  if (!message.value.trim()) { error.value = t('common.writeMessage'); return; }
  loading.value = true; error.value = ''; success.value = '';
  try {
    const res = await submitFeedback(
      type.value,
      message.value,
      props.experimentId,
      props.experimentName,
      type.value === 'rating' ? rating.value : undefined
    );
    if (res.success) {
      success.value = t('common.thanks');
      setTimeout(() => { emit('update:show', false); message.value = ''; }, 1200);
    }
  } catch (err: unknown) {
    error.value = (err instanceof Error ? err.message : '') || t('common.submitFailed');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('update:show', false)">
    <div class="modal-content">
      <h3>{{ t('common.feedbackTitle') }}</h3>

      <div class="form-row">
        <label>{{ t('common.typeLabel') }}</label>
        <div class="type-buttons">
          <button :class="{ active: type === 'complaint' }" @click="type = 'complaint'">{{ t('common.complaint') }}</button>
          <button :class="{ active: type === 'rating' }" @click="type = 'rating'">{{ t('common.rating') }}</button>
          <button :class="{ active: type === 'suggestion' }" @click="type = 'suggestion'">{{ t('common.suggestion') }}</button>
        </div>
      </div>

      <div v-if="type === 'rating'" class="form-row">
        <label>{{ t('common.ratingLabel') }}</label>
        <div class="stars">
          <button v-for="n in 5" :key="n" @click="rating = n" :class="{ filled: n <= rating }">⭐</button>
        </div>
      </div>

      <div class="form-row">
        <label>{{ t('common.messageLabel') }}</label>
        <textarea v-model="message" rows="4" :placeholder="t('common.messagePlaceholder')"></textarea>
      </div>

      <p v-if="error" class="msg error">{{ error }}</p>
      <p v-if="success" class="msg success">{{ success }}</p>

      <div class="modal-actions">
        <button class="btn-cancel" @click="$emit('update:show', false)">{{ t('common.cancel') }}</button>
        <button class="btn-submit" :disabled="loading" @click="send">{{ loading ? '...' : t('common.submit') }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 200; }
.modal-content { background: #111827; border: 1px solid rgba(255,255,255,0.08); border-radius: 0.75rem; padding: 1.5rem; width: 100%; max-width: 420px; box-shadow: 0 25px 50px rgba(0,0,0,0.5); }
.modal-content h3 { margin: 0 0 1rem; color: #e2e8f0; font-size: 1.1rem; }
.form-row { margin-bottom: 0.8rem; }
.form-row label { display: block; font-size: 0.8rem; color: #94a3b8; margin-bottom: 0.3rem; }
.type-buttons { display: flex; gap: 0.4rem; }
.type-buttons button { flex: 1; padding: 0.4rem; border-radius: 0.4rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: #94a3b8; cursor: pointer; font-family: inherit; font-size: 0.8rem; }
.type-buttons button.active { background: rgba(99,102,241,0.2); color: #a5b4fc; border-color: rgba(99,102,241,0.3); }
.stars { display: flex; gap: 0.3rem; }
.stars button { background: none; border: none; font-size: 1.3rem; cursor: pointer; filter: grayscale(1); opacity: 0.4; transition: all 0.2s; }
.stars button.filled { filter: grayscale(0); opacity: 1; }
textarea { width: 100%; padding: 0.5rem; border-radius: 0.4rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: #e2e8f0; font-family: inherit; font-size: 0.85rem; resize: vertical; box-sizing: border-box; }
.modal-actions { display: flex; gap: 0.5rem; margin-top: 1rem; }
.modal-actions button { flex: 1; padding: 0.55rem; border-radius: 0.5rem; font-family: inherit; font-weight: 700; cursor: pointer; }
.btn-cancel { background: rgba(255,255,255,0.05); color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); }
.btn-submit { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; border: none; }
.msg.error { color: #f87171; font-size: 0.85rem; margin: 0.5rem 0; }
.msg.success { color: #4ade80; font-size: 0.85rem; margin: 0.5rem 0; }
</style>
