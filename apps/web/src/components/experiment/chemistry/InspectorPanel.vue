<script setup lang="ts">
import { computed } from 'vue';
import type { LabItem } from '../../../composables/chemistry/useChemistryTools';

export interface ToolState {
  uid: string;
  type: 'beaker' | 'burette' | 'pipette' | 'other';
  volume: number;
  maxVolume: number;
  valveOpen?: boolean;
  color: string;
  label?: string; // solution name for containers
  temp?: number;
  ph?: number;
}

interface Props {
  item: LabItem | null;
  state: ToolState | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  action: [type: 'refill' | 'empty' | 'toggleValve' | 'fill5' | 'fill10' | 'fill50' | 'fill100' | 'remove5' | 'remove10' | 'remove50' | 'remove100', uid: string];
  remove: [uid: string];
}>();

const pct = computed(() => {
  if (!props.state || props.state.maxVolume <= 0) return 0;
  return Math.round((props.state.volume / props.state.maxVolume) * 100);
});
</script>

<template>
  <div class="inspector">
    <h3>🔧 لوحة التحكم</h3>

    <div v-if="props.item && props.state" class="inspector-body">
      <!-- Header -->
      <div class="item-header">
        <span class="item-icon">{{ props.item.icon }}</span>
        <div class="item-meta">
          <span class="item-name">{{ props.item.name }}</span>
          <span class="item-type">{{ props.state.type === 'burette' ? 'سحاحة' : props.state.type === 'beaker' ? 'بيكر' : 'أداة' }}</span>
        </div>
      </div>

      <!-- ====== BEAKER ====== -->
      <template v-if="props.state.type === 'beaker'">
        <div class="prop-row">
          <span class="prop-label">الحجم</span>
          <span class="prop-value">{{ props.state.volume.toFixed(1) }} / {{ props.state.maxVolume }} mL</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: pct + '%', background: props.state.color }" />
        </div>
        <div class="prop-row">
          <span class="prop-label">اللون</span>
          <span class="color-dot" :style="{ background: props.state.color }" />
        </div>
        <div class="controls-row four">
          <button class="btn fill" @click="emit('action', 'fill5', props.item!.uid)">💧 +5</button>
          <button class="btn fill" @click="emit('action', 'fill10', props.item!.uid)">💧 +10</button>
          <button class="btn fill" @click="emit('action', 'fill50', props.item!.uid)">💧 +50</button>
          <button class="btn fill" @click="emit('action', 'fill100', props.item!.uid)">💧 +100</button>
        </div>
        <div class="controls-row four">
          <button class="btn remove" @click="emit('action', 'remove5', props.item!.uid)">💨 −5</button>
          <button class="btn remove" @click="emit('action', 'remove10', props.item!.uid)">💨 −10</button>
          <button class="btn remove" @click="emit('action', 'remove50', props.item!.uid)">💨 −50</button>
          <button class="btn remove" @click="emit('action', 'remove100', props.item!.uid)">💨 −100</button>
        </div>
        <div class="controls-row">
          <button class="btn empty" @click="emit('action', 'empty', props.item!.uid)">🗑️ تفريغ</button>
        </div>
      </template>

      <!-- ====== BURETTE ====== -->
      <template v-else-if="props.state.type === 'burette'">
        <div class="prop-row">
          <span class="prop-label">المحلول المتبقي</span>
          <span class="prop-value">{{ props.state.volume.toFixed(1) }} / {{ props.state.maxVolume }} mL</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: pct + '%', background: props.state.color }" />
        </div>
        <div class="prop-row">
          <span class="prop-label">حالة الصنبور</span>
          <span class="prop-value" :class="props.state.valveOpen ? 'open' : ''">
            {{ props.state.valveOpen ? '🔓 مفتوح' : '🔒 مغلق' }}
          </span>
        </div>
        <div class="controls-row">
          <button
            class="btn"
            :class="props.state.valveOpen ? 'danger' : 'success'"
            @click="emit('action', 'toggleValve', props.item!.uid)"
          >
            {{ props.state.valveOpen ? '🔒 إغلاق' : '🚰 فتح' }}
          </button>
          <button class="btn refill" @click="emit('action', 'refill', props.item!.uid)">♻️ تعبئة</button>
        </div>
      </template>

      <!-- ====== GENERIC ====== -->
      <template v-else>
        <div class="prop-row">
          <span class="prop-label">النوع</span>
          <span class="prop-value">{{ props.item.type }}</span>
        </div>
        <div class="prop-row">
          <span class="prop-label">المعرف</span>
          <span class="prop-value mono">{{ props.item.id }}</span>
        </div>
      </template>

      <!-- Common: Remove -->
      <div class="divider" />
      <button class="btn remove" @click="emit('remove', props.item!.uid)">❌ إزالة من مساحة العمل</button>
    </div>

    <div v-else class="placeholder">
      <div class="empty-icon">🧪</div>
      <p>اضغط على أداة في مساحة العمل لعرض تحكماتها</p>
    </div>
  </div>
</template>

<style scoped>
.inspector {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1rem;
  margin-bottom: 1rem;
}
.inspector h3 {
  margin: 0 0 0.85rem;
  font-size: 0.85rem;
  color: #334155;
  font-weight: 700;
}
.inspector-body {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}
.item-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid #f1f5f9;
}
.item-icon { font-size: 1.6rem; }
.item-meta {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}
.item-name { font-weight: 700; color: #1e293b; font-size: 0.85rem; }
.item-type { font-size: 0.7rem; color: #94a3b8; }

.prop-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
}
.prop-label { color: #64748b; }
.prop-value { font-weight: 700; color: #334155; }
.prop-value.mono { font-family: monospace; font-size: 0.7rem; }
.prop-value.open { color: #10b981; }

.progress-track {
  height: 6px;
  background: #f1f5f9;
  border-radius: 3px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
  border: 1px solid rgba(0,0,0,0.1);
}

.controls-row {
  display: flex;
  gap: 0.4rem;
  margin-top: 0.2rem;
}
.controls-row.four {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 0.25rem;
}
.controls-row.four .btn {
  font-size: 0.6rem;
  padding: 0.3rem;
}
.btn {
  flex: 1;
  padding: 0.45rem;
  border: none;
  border-radius: 0.45rem;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  text-align: center;
}
.btn:hover { transform: translateY(-1px); }
.btn.fill {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #fff;
}
.btn.empty {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff;
}
.btn.success {
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
}
.btn.danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: #fff;
}
.btn.refill {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: #fff;
}
.btn.remove {
  background: #f1f5f9;
  color: #64748b;
}
.btn.remove:hover {
  background: #fee2e2;
  color: #ef4444;
}
.divider {
  height: 1px;
  background: #f1f5f9;
  margin: 0.3rem 0;
}

.placeholder {
  text-align: center;
  padding: 1.5rem 0;
  color: #94a3b8;
  font-size: 0.8rem;
}
.empty-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  opacity: 0.4;
}
</style>
