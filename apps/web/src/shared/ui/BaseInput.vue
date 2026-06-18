<script setup lang="ts">
const model = defineModel<string>();

defineProps<{
  type?: string;
  placeholder?: string;
  label?: string;
}>();
</script>

<template>
  <div class="input-wrapper">
    <label v-if="label">{{ label }}</label>
    <input v-model="model" :type="type || 'text'" :placeholder />
  </div>
</template>

<style scoped>
.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
}
</style>
