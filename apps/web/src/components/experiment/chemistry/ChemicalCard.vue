<script setup lang="ts">
import type { Chemical } from '../../../composables/chemistry/useChemistryLab';

const props = defineProps<{ chem: Chemical; selected: boolean; clickable: boolean }>();
const emit = defineEmits<{ click: [] }>();

function hazardDot() {
  const map = { safe: '#22c55e', caution: '#eab308', warning: '#f97316', danger: '#ef4444' };
  return map[props.chem.hazardLevel];
}
function svgIcon() {
  switch (props.chem.physicalState) {
    case 'solid': return 'vial-solid';
    case 'gas': return 'cylinder-gas';
    default: return 'flask-liquid';
  }
}
</script>

<template>
  <div
    class="chem-card"
    :class="{ selected, clickable }"
    @click="emit('click')"
  >
    <div class="chem-visual">
      <svg viewBox="0 0 48 64" class="chem-svg" xmlns="http://www.w3.org/2000/svg">
        <!-- Glass outline -->
        <path
          v-if="svgIcon() === 'flask-liquid'"
          d="M14 0 L14 20 L4 44 L4 60 Q4 64 8 64 L40 64 Q44 64 44 60 L44 44 L34 20 L34 0"
          fill="none" stroke="#cbd5e1" stroke-width="2"
        />
        <rect
          v-else-if="svgIcon() === 'vial-solid'"
          x="8" y="8" width="32" height="48" rx="4"
          fill="none" stroke="#cbd5e1" stroke-width="2"
        />
        <rect
          v-else
          x="6" y="8" width="36" height="48" rx="3"
          fill="none" stroke="#cbd5e1" stroke-width="2"
        />
        <!-- Liquid / solid fill -->
        <path
          v-if="svgIcon() === 'flask-liquid'"
          d="M7 44 L41 44 L41 60 Q41 63 38 63 L10 63 Q7 63 7 60 Z"
          :fill="chem.color" :fill-opacity="chem.opacity" stroke="none"
        />
        <rect
          v-else-if="svgIcon() === 'vial-solid'"
          x="10" y="24" width="28" height="30" rx="2"
          :fill="chem.color" :fill-opacity="chem.opacity" stroke="none"
        />
        <rect
          v-else
          x="8" y="18" width="32" height="36" rx="2"
          :fill="chem.color" :fill-opacity="chem.opacity" stroke="none"
        />
        <!-- Hazard dot -->
        <circle cx="42" cy="6" r="3" :fill="hazardDot()" stroke="#fff" stroke-width="1" />
      </svg>
    </div>
    <span class="chem-name">{{ chem.nameAr }}</span>
    <span class="chem-formula">{{ chem.formula }}</span>
    <span class="chem-state">{{ chem.physicalState === 'liquid' ? 'L' : chem.physicalState === 'solid' ? 'S' : 'G' }}</span>
  </div>
</template>

<style scoped>
.chem-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 0.6rem 0.4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
  position: relative;
}
.chem-card:hover {
  border-color: #10b981;
  box-shadow: 0 4px 12px rgba(16,185,129,0.12);
  transform: translateY(-2px);
}
.chem-card.selected {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16,185,129,0.25);
  background: #ecfdf5;
}
.chem-card.clickable {
  animation: pulse 1.5s infinite;
}
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 2px rgba(16,185,129,0.2); }
  50% { box-shadow: 0 0 0 6px rgba(16,185,129,0.1); }
}
.chem-visual { width: 48px; height: 64px; }
.chem-svg { width: 100%; height: 100%; }
.chem-name { font-size: 0.72rem; font-weight: 700; color: #1e293b; text-align: center; }
.chem-formula { font-size: 0.6rem; color: #64748b; font-family: monospace; }
.chem-state { font-size: 0.6rem; }
</style>
