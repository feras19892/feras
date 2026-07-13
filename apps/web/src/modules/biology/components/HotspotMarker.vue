<script setup lang="ts">
const props = defineProps<{
  label: string;
  x: number;
  y: number;
  visible: boolean;
  active: boolean;
}>();

const emit = defineEmits<{
  (e: 'click'): void;
}>();
</script>

<template>
  <button
    type="button"
    class="hotspot-marker"
    :class="{ active: props.active, hidden: !props.visible }"
    :style="{ left: `${props.x}px`, top: `${props.y}px` }"
    :title="props.label"
    @click.stop="emit('click')"
  >
    <span class="marker-pulse" />
    <span class="marker-tooltip">{{ props.label }}</span>
  </button>
</template>

<style scoped>
.hotspot-marker {
  position: absolute;
  width: 18px;
  height: 18px;
  margin-left: -9px;
  margin-top: -9px;
  border-radius: 50%;
  background: radial-gradient(circle, #4ade80 0%, #22c55e 40%, rgba(34, 197, 94, 0) 70%);
  border: 2px solid #86efac;
  box-shadow: 0 0 12px rgba(74, 222, 128, 0.6);
  cursor: pointer;
  pointer-events: auto;
  transform: scale(1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  z-index: 10;
  font-family: 'Segoe UI', 'Helvetica Neue', Tahoma, Geneva, Verdana, sans-serif;
}

.hotspot-marker:hover {
  transform: scale(1.3);
  box-shadow: 0 0 18px rgba(74, 222, 128, 0.9);
}

.hotspot-marker.active {
  background: radial-gradient(circle, #facc15 0%, #eab308 40%, rgba(234, 179, 8, 0) 70%);
  border-color: #fde047;
  box-shadow: 0 0 16px rgba(250, 204, 21, 0.8);
}

.hotspot-marker.hidden {
  opacity: 0;
  pointer-events: none;
}

.marker-pulse {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 1px solid rgba(74, 222, 128, 0.5);
  animation: pulse 1.6s ease-out infinite;
}

.active .marker-pulse {
  border-color: rgba(250, 204, 21, 0.6);
}

.marker-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  padding: 0.35rem 0.6rem;
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid #475569;
  border-radius: 0.4rem;
  color: #e2e8f0;
  font-size: 0.8rem;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.hotspot-marker:hover .marker-tooltip {
  opacity: 1;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}
</style>
