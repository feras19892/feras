<script setup lang="ts">
import { computed } from 'vue';
import type { LabItem } from '../../../composables/chemistry/useChemistryTools';
import LabPipette from './LabPipette.vue';

const props = defineProps<{
  cursorPipette: { state: { volume: number; maxVolume: number; color: string; opacity: number } } | null;
  cursorX: number;
  cursorY: number;
  pourFlowMap?: Record<string, string>;
  items?: LabItem[];
}>();

const streamLines = computed(() => {
  const lines: { x1: number; y1: number; x2: number; y2: number; color: string }[] = [];
  if (!props.items || !props.pourFlowMap) return lines;
  for (const [srcUid, dstUid] of Object.entries(props.pourFlowMap)) {
    const src = props.items.find(i => i.uid === srcUid);
    const dst = props.items.find(i => i.uid === dstUid);
    if (!src || !dst) continue;
    lines.push({
      x1: src.x + 42, y1: src.y + 60,
      x2: dst.x + 42, y2: dst.y + 10,
      color: '#3b82f6',
    });
  }
  return lines;
});
</script>

<template>
  <!-- Cursor Pipette Mode -->
  <div v-if="cursorPipette" class="cursor-pipette" :style="{ left: cursorX + 'px', top: cursorY + 'px' }">
    <LabPipette
      :volume="cursorPipette.state.volume"
      :max-volume="cursorPipette.state.maxVolume"
      :liquid-color="cursorPipette.state.color"
      :liquid-opacity="cursorPipette.state.opacity"
      :is-active="true"
    />
  </div>

  <!-- Pipette mode hint bar -->
  <div v-if="cursorPipette" class="pipette-mode-bar">
    <span class="pipette-mode-text">
      💉 <b>وضع الماصة:</b>
      <span v-if="cursorPipette.state.volume <= 0">انقر على حاوية لسحب السائل</span>
      <span v-else>انقر على حاوية لإفراغ الماصة ({{ cursorPipette.state.volume.toFixed(1) }}mL)</span>
      | اضغط <b>ESC</b> للخروج
    </span>
  </div>

  <!-- Pour stream lines -->
  <svg v-if="streamLines.length" class="pour-streams" style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:20;">
    <defs>
      <linearGradient id="streamGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="rgba(59,130,246,0)" />
        <stop offset="50%" stop-color="rgba(59,130,246,0.6)" />
        <stop offset="100%" stop-color="rgba(59,130,246,0)" />
      </linearGradient>
    </defs>
    <line
      v-for="(s, i) in streamLines"
      :key="i"
      :x1="s.x1" :y1="s.y1" :x2="s.x2" :y2="s.y2"
      stroke="url(#streamGrad)"
      stroke-width="3"
      stroke-linecap="round"
    />
    <circle
      v-for="(s, i) in streamLines"
      :key="'d' + i"
      :cx="s.x2" :cy="s.y2" r="4"
      fill="#3b82f6"
      opacity="0.5"
    >
      <animate attributeName="opacity" values="0.5;0.1;0.5" dur="0.8s" repeatCount="indefinite" />
    </circle>
  </svg>

  <!-- Zoom hint -->
  <div class="zoom-hint">
    <span>🖱️ عجلة الماوس على الأداة للتكبير</span>
  </div>
</template>

<style scoped>
.cursor-pipette {
  position: absolute;
  pointer-events: none;
  z-index: 200;
  transform: translate(-50%, -10%);
  filter: drop-shadow(0 8px 20px rgba(0,0,0,0.15));
}
.pipette-mode-bar {
  position: absolute;
  top: 0.5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 60;
  pointer-events: none;
}
.pipette-mode-text {
  background: rgba(59,130,246,0.9);
  color: #fff;
  padding: 0.4rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(59,130,246,0.3);
}
.pour-hint-bar {
  position: absolute;
  top: 0.75rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 60;
  pointer-events: none;
}
.pour-hint-text {
  background: rgba(16,185,129,0.9);
  color: #fff;
  padding: 0.4rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(16,185,129,0.3);
}
.zoom-hint {
  position: fixed;
  bottom: 0.75rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(4px);
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 0.3rem 0.6rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  z-index: 50;
  font-size: 0.65rem;
  color: #94a3b8;
  pointer-events: none;
}
</style>
