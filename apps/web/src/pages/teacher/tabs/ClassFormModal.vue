<template>
  <div v-if="open" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <h3>{{ mode === 'create' ? 'إنشاء فصل' : 'إعادة تسمية الفصل' }}</h3>
      <div class="form-group"><label>اسم الفصل</label><input v-model="name" class="form-input" @keyup.enter="submit" /></div>
      <div class="modal-actions">
        <button @click="submit" class="btn-sm btn-success" :disabled="loading || !name.trim()">{{ loading ? '...' : (mode === 'create' ? 'إنشاء' : 'حفظ') }}</button>
        <button @click="$emit('close')" class="btn-sm btn-warn">إلغاء</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{ open: boolean; mode: 'create' | 'rename'; initialName?: string; loading: boolean }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'submit', name: string): void }>()

const name = ref('')

watch(() => props.open, (v) => {
  if (v) name.value = props.initialName || ''
})

function submit() {
  if (name.value.trim()) emit('submit', name.value.trim())
}
</script>
