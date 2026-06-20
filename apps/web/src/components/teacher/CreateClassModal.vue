<script setup lang="ts">
const props = defineProps<{
  show: boolean
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:show', val: boolean): void
  (e: 'update:modelValue', val: string): void
  (e: 'confirm'): void
}>()

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}

function onConfirm() {
  emit('confirm')
}

function onClose() {
  emit('update:show', false)
}
</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="onClose">
    <div class="join-modal">
      <h3>إنشاء فصل جديد</h3>
      <input
        :value="modelValue"
        type="text"
        placeholder="اسم الفصل"
        @input="onInput"
        @keyup.enter="onConfirm"
      />
      <div class="join-actions">
        <button class="join-cancel" @click="onClose">إلغاء</button>
        <button class="join-confirm" @click="onConfirm">إنشاء</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.join-modal {
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  width: 90%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.join-modal h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #f1f5f9;
  text-align: center;
}

.join-modal input {
  padding: 0.7rem 1rem;
  border-radius: 0.6rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.3);
  color: #e2e8f0;
  font-size: 0.9rem;
  font-family: inherit;
}

.join-actions {
  display: flex;
  gap: 0.5rem;
}

.join-cancel,
.join-confirm {
  flex: 1;
  padding: 0.55rem;
  border-radius: 0.55rem;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.join-cancel {
  background: rgba(255, 255, 255, 0.05);
  color: #94a3b8;
}

.join-confirm {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: #fff;
  border: none;
}
</style>
