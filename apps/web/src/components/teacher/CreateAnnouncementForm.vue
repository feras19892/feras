<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import { ref } from 'vue';
import { createAnnouncement } from '../../services/announcement.service';

const props = defineProps<{ classId: string }>();
const emit = defineEmits<{ created: [] }>();

const title = ref('');
const content = ref('');
const isPinned = ref(false);
const saving = ref(false);
const error = ref('');

async function submit() {
  if (!title.value.trim() || !content.value.trim()) return;
  saving.value = true;
  error.value = '';
  try {
    const res = await createAnnouncement({
      scope: 'class',
      class_id: props.classId,
      title: title.value,
      content: content.value,
      is_pinned: isPinned.value,
    });
    if (res.success) {
      title.value = '';
      content.value = '';
      isPinned.value = false;
      emit('created');
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'فشل الإرسال';
  }
  saving.value = false;
}
</script>

<template>
  <div class="create-announcement">
    <h4>📢 إنشاء إعلان للفصل</h4>
    <input v-model="title" placeholder="عنوان الإعلان" class="input" />
    <textarea v-model="content" placeholder="محتوى الإعلان" class="textarea" rows="3"></textarea>
    <label class="pin-label">
      <input type="checkbox" v-model="isPinned" /> تثبيت الإعلان
    </label>
    <div v-if="error" class="error">{{ error }}</div>
    <button @click="submit" :disabled="saving || !title.trim() || !content.trim()" class="btn">
      {{ saving ? 'جاري الإرسال...' : 'نشر الإعلان' }}
    </button>
  </div>
</template>

<style scoped>
.create-announcement { display: flex; flex-direction: column; gap: 0.5rem; padding: 0.75rem; background: rgba(255,255,255,0.02); border-radius: 0.5rem; }
.create-announcement h4 { color: #e2e8f0; font-size: 0.85rem; margin: 0; }
.input, .textarea {
  background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 0.35rem; padding: 0.5rem; color: #e2e8f0; font-size: 0.8rem; width: 100%;
}
.input:focus, .textarea:focus { outline: none; border-color: rgba(99,102,241,0.5); }
.pin-label { display: flex; align-items: center; gap: 0.3rem; color: #94a3b8; font-size: 0.75rem; cursor: pointer; }
.error { color: #ef4444; font-size: 0.75rem; }
.btn {
  background: #6366f1; color: #fff; border: none; border-radius: 0.35rem;
  padding: 0.5rem 1rem; cursor: pointer; font-size: 0.8rem; transition: background 0.15s;
}
.btn:hover:not(:disabled) { background: #4f46e5; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
