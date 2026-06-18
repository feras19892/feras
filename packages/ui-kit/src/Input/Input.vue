<script setup lang="ts">
const model = defineModel<string>();

defineProps<{
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  label?: string;
  error?: string;
}>();
</script>

<template>
  <div class="input-wrapper">
    <label v-if="label" class="label">{{ label }}</label>
    <input
      v-model="model"
      :type="type || 'text'"
      :placeholder
      class="input"
      :class="{ error: !!error }"
    />
    <span v-if="error" class="error-text">{{ error }}</span>
  </div>
</template>

<style scoped>
.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #333;
}

.input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.input:focus {
  outline: none;
  border-color: #007bff;
}

.input.error {
  border-color: #dc3545;
}

.error-text {
  font-size: 0.75rem;
  color: #dc3545;
}
</style>
