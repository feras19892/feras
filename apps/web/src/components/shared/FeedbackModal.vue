<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { createFeedback } from '../../services/feedback.service';
import { useToast } from '../../composables/useToast';
const props = defineProps<{
  show: boolean;
  experimentId?: string;
  experimentName?: string;
}>();

const emit = defineEmits<{
  (e: 'update:show', val: boolean): void;
}>();
const toast = useToast();
const route = useRoute();

const categories = [
  { key: 'not-working', label: 'شيء لا يعمل', type: 'complaint' as const },
  { key: 'wrong-values', label: 'قيم غير صحيحة', type: 'complaint' as const },
  { key: 'design-error', label: 'خطأ في التصميم/الرسم', type: 'complaint' as const },
  { key: 'page-unresponsive', label: 'الصفحة لا تستجيب', type: 'complaint' as const },
  { key: 'suggestion', label: 'اقتراح تحسين', type: 'suggestion' as const },
  { key: 'other', label: 'أخرى', type: 'complaint' as const },
];

const selectedCategory = ref('');
const message = ref('');
const loading = ref(false);
const pageTitle = computed(() => props.experimentName || (typeof document !== 'undefined' ? document.title : ''));
const pagePath = computed(() => route.fullPath);

function buildDeviceInfo() {
  if (typeof navigator === 'undefined') return '';
  const screen = `${window.innerWidth || 0}x${window.innerHeight || 0}`;
  const platform = navigator.platform || 'unknown';
  const ua = navigator.userAgent || 'unknown';
  return `${screen} | ${platform} | ${ua.slice(0, 120)}`;
}

function selectedType() {
  const found = categories.find((c) => c.key === selectedCategory.value);
  return found ? found.type : 'complaint';
}

function selectedLabel() {
  return categories.find((c) => c.key === selectedCategory.value)?.label || '';
}

function reset() {
  selectedCategory.value = '';
  message.value = '';
}

function close() {
  reset();
  emit('update:show', false);
}

async function send() {
  if (!selectedCategory.value) { toast.error('اختر نوع البلاغ'); return; }
  if (!message.value.trim()) { toast.error('أدخل وصفاً'); return; }
  loading.value = true;
  try {
    await createFeedback({
      type: selectedType(),
      message: message.value.trim(),
      category: selectedLabel(),
      experimentId: props.experimentId || (typeof route.name === 'string' ? route.name : route.fullPath),
      experimentName: pageTitle.value,
      pagePath: pagePath.value,
      deviceInfo: buildDeviceInfo(),
    });
    toast.success('تم إرسال البلاغ، شكراً لك');
    close();
  } catch (err: any) {
    console.error('[feedback] send error:', err);
    toast.error(err?.message || t('common.submitFailed'));
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="close">
    <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="feedback-title">
      <h3 id="feedback-title">إبلاغ عن مشكلة</h3>

      <div class="context-box">
        <div class="context-label">أنت الآن في:</div>
        <div class="context-value" :title="pagePath">{{ pageTitle || pagePath }}</div>
      </div>

      <div class="form-row">
        <label>نوع البلاغ</label>
        <div class="category-chips">
          <button
            v-for="c in categories"
            :key="c.key"
            type="button"
            class="category-chip"
            :class="{ active: selectedCategory === c.key }"
            @click="selectedCategory = c.key"
          >
            {{ c.label }}
          </button>
        </div>
      </div>

      <div class="form-row">
        <label for="feedback-message">الوصف</label>
        <textarea
          id="feedback-message"
          v-model="message"
          rows="4"
          maxlength="5000"
          placeholder="اشرح ما حدث باختصار..."
        ></textarea>
        <div class="hint">{{ message.length }}/5000</div>
      </div>

      <div class="modal-actions">
        <button class="btn-cancel" @click="close">{{ t('common.cancel') }}</button>
        <button class="btn-submit" :disabled="loading" @click="send">
          <span v-if="loading" class="spinner">...</span>
          <span v-else>{{ t('common.submit') }}</span>
        </button>
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
.context-box { margin-bottom: 1rem; padding: 0.6rem 0.75rem; background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.12); border-radius: 0.5rem; }
.context-label { font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.2rem; }
.context-value { font-size: 0.9rem; font-weight: 700; color: #c7d2fe; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.category-chips { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.category-chip { padding: 0.4rem 0.75rem; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.2); color: #94a3b8; cursor: pointer; font-size: 0.8rem; transition: all 0.15s; }
.category-chip:hover { background: rgba(99,102,241,0.12); }
.category-chip.active { background: rgba(99,102,241,0.2); border-color: #6366f1; color: #e0e7ff; }
.hint { font-size: 0.75rem; color: #64748b; margin-top: 0.3rem; text-align: left; }
.spinner { display: inline-block; }
</style>
