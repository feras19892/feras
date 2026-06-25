<script setup lang="ts">
interface Props {
  isHovered: boolean;
}
defineProps<Props>();
</script>

<template>
  <div class="lab-wooden-base" :class="{ hovered: isHovered }">
    <svg width="160" height="20" viewBox="0 0 160 20">
      <!-- Wood grain top surface -->
      <rect x="0" y="0" width="160" height="18" rx="3" fill="#8B5A2B" />
      <rect x="0" y="14" width="160" height="4" rx="1" fill="#6B4226" />
      <!-- Wood grain lines -->
      <line x1="20" y1="2" x2="20" y2="14" stroke="#7A4E1F" stroke-width="1" opacity="0.5" />
      <line x1="50" y1="2" x2="50" y2="14" stroke="#7A4E1F" stroke-width="1" opacity="0.5" />
      <line x1="80" y1="2" x2="80" y2="14" stroke="#7A4E1F" stroke-width="1" opacity="0.5" />
      <line x1="110" y1="2" x2="110" y2="14" stroke="#7A4E1F" stroke-width="1" opacity="0.5" />
      <line x1="140" y1="2" x2="140" y2="14" stroke="#7A4E1F" stroke-width="1" opacity="0.5" />
      <!-- Highlight -->
      <rect x="2" y="1" width="156" height="2" rx="1" fill="#A67B5B" opacity="0.6" />
    </svg>
    <span class="tool-label">قاعدة خشبية</span>
  </div>
</template>

<style scoped>
.lab-wooden-base {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 2px;
}
.lab-wooden-base.hovered {
  filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.3));
}
.tool-label {
  font-size: 0.65rem;
  color: #64748b;
  white-space: nowrap;
}
</style>
