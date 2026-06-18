<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary';
}>();
</script>

<template>
  <button :class="['btn', variant]">
    <slot />
  </button>
</template>

<style scoped>
.btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}

.primary {
  background: #007bff;
  color: white;
}

.secondary {
  background: #6c757d;
  color: white;
}
</style>
