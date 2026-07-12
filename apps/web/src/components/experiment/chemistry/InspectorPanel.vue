<script setup lang="ts">
import { computed } from 'vue';
import type { LabItem } from '../../../composables/chemistry/useChemistryTools';
import type { ToolState } from '../../../composables/chemistry/chemLabTypes';
import { useI18n } from '../../../composables/useI18n';
const { t } = useI18n();

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
    <h3>{{ t('chemistry.inspectorTitle') }}</h3>

    <div v-if="props.item && props.state" class="inspector-body">
      <!-- Header -->
      <div class="item-header">
        <span class="item-icon">{{ props.item.icon }}</span>
        <div class="item-meta">
          <span class="item-name">{{ t(props.item.name) }}</span>
          <span class="item-type">
            {{ props.state.type === 'burette' ? (props.state.buretteNumber ? t('chemistry.burette') + ' ' + props.state.buretteNumber : t('chemistry.burette')) : props.state.type === 'beaker' ? t('chemistry.beaker') : t('chemistry.tool') }}
          </span>
        </div>
      </div>

      <!-- ====== BEAKER ====== -->
      <template v-if="props.state.type === 'beaker'">
        <div class="prop-row">
          <span class="prop-label">{{ t('chemistry.volume') }}</span>
          <span class="prop-value">{{ props.state.volume.toFixed(1) }} / {{ props.state.maxVolume }} {{ t('chemistry.mL') }}</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: pct + '%', background: props.state.color }" />
        </div>
        <div class="prop-row">
          <span class="prop-label">{{ t('chemistry.color') }}</span>
          <span class="color-dot" :style="{ background: props.state.color }" />
        </div>
        <div class="controls-row four">
          <button class="btn fill" @click="emit('action', 'fill5', props.item!.uid)">{{ t('chemistry.fill5') }}</button>
          <button class="btn fill" @click="emit('action', 'fill10', props.item!.uid)">{{ t('chemistry.fill10') }}</button>
          <button class="btn fill" @click="emit('action', 'fill50', props.item!.uid)">{{ t('chemistry.fill50') }}</button>
          <button class="btn fill" @click="emit('action', 'fill100', props.item!.uid)">{{ t('chemistry.fill100') }}</button>
        </div>
        <div class="controls-row four">
          <button class="btn remove" @click="emit('action', 'remove5', props.item!.uid)">{{ t('chemistry.remove5') }}</button>
          <button class="btn remove" @click="emit('action', 'remove10', props.item!.uid)">{{ t('chemistry.remove10') }}</button>
          <button class="btn remove" @click="emit('action', 'remove50', props.item!.uid)">{{ t('chemistry.remove50') }}</button>
          <button class="btn remove" @click="emit('action', 'remove100', props.item!.uid)">{{ t('chemistry.remove100') }}</button>
        </div>
        <div class="controls-row">
          <button class="btn empty" @click="emit('action', 'empty', props.item!.uid)">🗑️ {{ t('chemistry.drain') }}</button>
        </div>
      </template>

      <!-- ====== BURETTE ====== -->
      <template v-else-if="props.state.type === 'burette'">
        <div class="prop-row">
          <span class="prop-label">{{ t('chemistry.remainingSolution') }}</span>
          <span class="prop-value">{{ props.state.volume.toFixed(1) }} / {{ props.state.maxVolume }} {{ t('chemistry.mL') }}</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: pct + '%', background: props.state.color }" />
        </div>
        <div class="prop-row">
          <span class="prop-label">{{ t('chemistry.valveStatus') }}</span>
          <span class="prop-value" :class="props.state.valveOpen ? 'open' : ''">
            {{ props.state.valveOpen ? '🔓 ' + t('chemistry.open') : '🔒 ' + t('chemistry.closed') }}
          </span>
        </div>
        <div class="controls-row">
          <button
            class="btn"
            :class="props.state.valveOpen ? 'danger' : 'success'"
            @click="emit('action', 'toggleValve', props.item!.uid)"
          >
            {{ props.state.valveOpen ? '🔒 ' + t('chemistry.closeAction') : '🚰 ' + t('chemistry.openAction') }}
          </button>
          <button class="btn refill" @click="emit('action', 'refill', props.item!.uid)">♻️ {{ t('chemistry.refill') }}</button>
        </div>
      </template>

      <!-- ====== GENERIC ====== -->
      <template v-else>
        <div class="prop-row">
          <span class="prop-label">{{ t('chemistry.type') }}</span>
          <span class="prop-value">{{ props.item.type }}</span>
        </div>
        <div class="prop-row">
          <span class="prop-label">{{ t('chemistry.idLabel') }}</span>
          <span class="prop-value mono">{{ props.item.id }}</span>
        </div>
      </template>

      <!-- Common: Reaction state info for containers -->
      <template v-if="props.state.type === 'beaker' && props.state.volume > 0">
        <div v-if="props.state.equation" class="reaction-info">
          <div class="reaction-equation">{{ props.state.equation }}</div>
        </div>
        <div v-if="props.state.gasEvolution" class="prop-row reaction-badge gas">
          <span class="prop-label">{{ t('chemistry.gasEvolved') }}</span>
          <span class="prop-value">{{ props.state.gasType || 'CO₂' }}↑</span>
        </div>
        <div v-if="props.state.precipitate" class="prop-row reaction-badge precipitate">
          <span class="prop-label">{{ t('chemistry.precipitateFormed') }}</span>
          <span class="prop-value">
            <span class="precipitate-dot" :style="{ background: props.state.precipitateColor || '#c0c0c0' }"></span>
          </span>
        </div>
        <div v-if="props.state.temperature !== undefined && props.state.temperature > 25" class="prop-row reaction-badge temp">
          <span class="prop-label">{{ t('chemistry.temperature') }}</span>
          <span class="prop-value">{{ props.state.temperature.toFixed(1) }}°C</span>
        </div>
        <div v-if="props.state.ph !== undefined" class="prop-row">
          <span class="prop-label">pH</span>
          <span class="prop-value">{{ props.state.ph.toFixed(2) }}</span>
        </div>
      </template>

      <!-- Common: Remove -->
      <div class="divider" />
      <button class="btn remove" @click="emit('remove', props.item!.uid)">❌ {{ t('chemistry.removeFromWorkspace') }}</button>
    </div>

    <div v-else class="placeholder">
      <div class="empty-icon">🧪</div>
      <p>{{ t('chemistry.clickToolHint') }}</p>
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
.reaction-info {
  padding: 0.5rem;
  background: #f8fafc;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}
.reaction-equation {
  font-size: 0.7rem;
  color: #475569;
  font-family: monospace;
  text-align: center;
  line-height: 1.4;
}
.reaction-badge {
  padding: 0.3rem 0.5rem;
  border-radius: 0.4rem;
  font-size: 0.75rem;
}
.reaction-badge.gas {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
}
.reaction-badge.gas .prop-value {
  color: #2563eb;
}
.reaction-badge.precipitate {
  background: #fefce8;
  border: 1px solid #fde68a;
}
.reaction-badge.precipitate .prop-value {
  color: #d97706;
  font-size: 1rem;
}
.precipitate-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid rgba(0,0,0,0.2);
  vertical-align: middle;
}
.reaction-badge.temp {
  background: #fef2f2;
  border: 1px solid #fecaca;
}
.reaction-badge.temp .prop-value {
  color: #dc2626;
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
