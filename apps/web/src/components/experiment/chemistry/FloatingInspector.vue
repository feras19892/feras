<script setup lang="ts">
import { ref, computed } from 'vue';
import type { LabItem } from '../../../composables/chemistry/useChemistryTools';
import type { ToolState } from '../../../composables/chemistry/chemLabTypes';
import {
  items, isContainer,
  getPipette, getBurnerState, getBalanceTare, getContainerTare, getLiquid, getHotPlateState,
  isGradCylinder, tiltAngleMap,
  selectedChemical, hasSelectedChemicalMap, simSpeed,
  spatulaSelectedSolid, solidMap,
  isBunsenBurner, isHeatingMantle, isHotPlate, isBalance, isPhMeter, isThermometer,
} from '../../../composables/chemistry/useChemistryLab';
import { computeBalanceWeight, getBalanceReading, getPhReading, getTemperatureReading } from '../../../composables/chemistry/useLabSimulation';
import { useI18n } from '../../../composables/useI18n';
import { useChemicalLocale } from '../../../composables/chemistry/useChemicalLocale';

const { t } = useI18n();
const { getName, resolveLabel } = useChemicalLocale();
const props = defineProps<{
  item: LabItem | null;
  state: ToolState | null;
  canUndo?: boolean;
  canRedo?: boolean;
}>();

const emit = defineEmits<{
  action: [type: 'refill' | 'empty' | 'toggleValve' | 'fill5' | 'fill10' | 'fill50' | 'fill100' | 'remove5' | 'remove10' | 'remove50' | 'remove100' | 'addSolid', uid: string];
  remove: [uid: string];
  pipetteDraw: [];
  pipetteDispense: [];
  pipetteDrawAmount: [amount: number];
  pipetteDispenseAmount: [amount: number];
  pipetteDrawFrom: [targetUid: string, amount: number];
  pipetteDispenseTo: [targetUid: string, amount: number];
  pipetteFill: [amount: number];
  pipetteEmpty: [];
  buretteDrop: [];
  toggleBurner: [];
  tare: [];
  tareContainer: [];
  intensityChange: [val: number];
  labelChange: [label: string];
  undo: [];
  redo: [];
  spatulaSelectSolid: [];
  spatulaAddTo: [targetUid: string, grams: number];
}>();

function balanceReadout(): string {
  if (!props.item) return '--';
  const r = getBalanceReading(props.item.uid);
  return r !== null ? r.toFixed(2) + ' ' + t('chemistry.g') : '--';
}
function grossWeight(): string {
  if (!props.item) return '--';
  return computeBalanceWeight(props.item).toFixed(2) + ' ' + t('chemistry.g');
}
function phReadout(): string {
  if (!props.item) return '--.--';
  const r = getPhReading(props.item);
  return r !== null ? r.toFixed(2) : '--.--';
}
function tempReadout(): string {
  if (!props.item) return '--';
  const r = getTemperatureReading(props.item);
  return r !== null ? r.toFixed(1) : '--';
}
function tempColor(): string {
  if (!props.item) return '#94a3b8';
  const r = getTemperatureReading(props.item);
  if (r === null) return '#94a3b8';
  if (r < 15) return '#2563eb';
  if (r < 25) return '#3b82f6';
  if (r < 50) return '#10b981';
  if (r < 75) return '#eab308';
  if (r < 95) return '#f59e0b';
  return '#dc2626';
}
function tiltLeft() {
  if (!props.item) return;
  const current = tiltAngleMap[props.item.uid] || 0;
  tiltAngleMap[props.item.uid] = Math.max(-180, current - 15);
}
function tiltRight() {
  if (!props.item) return;
  const current = tiltAngleMap[props.item.uid] || 0;
  tiltAngleMap[props.item.uid] = Math.min(180, current + 15);
}
function resetTilt() {
  if (!props.item) return;
  delete tiltAngleMap[props.item.uid];
}

function pipetteStatus(): string {
  if (!props.item) return '';
  const v = getPipette(props.item.uid).volume;
  return v > 0 ? t('chemistry.contains') + ' ' + v.toFixed(1) + t('chemistry.mL') : t('chemistry.emptyF');
}

const pipetteTargetUid = ref<string>('');

const spatulaTargetUid = ref<string>('');

const spatulaContainerList = computed(() => {
  if (!props.item) return [];
  return items.value.filter((i: LabItem) => i.uid !== props.item!.uid && isContainer(i.id));
});

function spatulaContainerLabel(c: LabItem): string {
  const liq = getLiquid(c.uid);
  const vol = liq.volume > 0 ? ` (${liq.volume.toFixed(1)} ${t('chemistry.mL')})` : ` (${t('chemistry.emptyF')})`;
  const solid = solidMap[c.uid];
  const solidInfo = solid && solid.amount > 0 ? ` + ${solid.amount.toFixed(1)}${t('chemistry.g')}` : '';
  return t(c.name) + vol + solidInfo;
}

const containerList = computed(() => {
  if (!props.item) return [];
  return items.value.filter((i: LabItem) => i.uid !== props.item!.uid && isContainer(i.id));
});

function containerLabel(c: LabItem): string {
  const liq = getLiquid(c.uid);
  const vol = liq.volume > 0 ? ` (${liq.volume.toFixed(1)} ${t('chemistry.mL')})` : ` (${t('chemistry.emptyF')})`;
  return t(c.name) + vol;
}
</script>

<template>
  <div v-if="item && state" class="floating-inspector">
    <div class="fi-header">
      <span class="fi-icon">{{ item.icon }}</span>
      <span class="fi-name">{{ t(item.name) }}</span>
      <div class="fi-undo-group">
        <button
          class="undo-btn"
          :disabled="!canUndo"
          :title="t('chemistry.undo') + ' (Ctrl+Z)'"
          @click.stop="emit('undo')"
        >↩️</button>
        <button
          class="redo-btn"
          :disabled="!canRedo"
          :title="t('chemistry.redo') + ' (Ctrl+Y)'"
          @click.stop="emit('redo')"
        >↪️</button>
      </div>
    </div>
    <div class="fi-body">
      <!-- Container -->
      <template v-if="state.type === 'beaker'">
        <div class="fi-row"><span>{{ t('chemistry.volume') }}</span><b>{{ state.volume.toFixed(1) }} / {{ state.maxVolume }} {{ t('chemistry.mL') }}</b></div>
        <div class="fi-bar"><div class="fi-fill" :style="{ width: (state.volume/state.maxVolume*100).toFixed(0) + '%', background: state.color }" /></div>
        <div class="fi-row"><span>{{ t('chemistry.color') }}</span><span class="fi-dot" :style="{ background: state.color }" /></div>
        <div class="fi-row">
          <span>{{ t('chemistry.solution') }}</span>
          <input
            v-if="item"
            class="fi-input"
            :value="resolveLabel(state.label || '')"
            :placeholder="t('chemistry.solutionPlaceholder')"
            @input="(e: Event) => emit('labelChange', (e.target as HTMLInputElement).value)"
            @click.stop
          />
        </div>
        <div v-if="item && isGradCylinder(item.id)" class="fi-row hint">
          <span>⚠️</span><small>{{ t('chemistry.gradCylinderHint') }}</small>
        </div>
        <!-- Current chemical indicator -->
        <div v-if="item && hasSelectedChemicalMap[item.uid]" class="fi-row fi-chem-row">
          <span>{{ t('chemistry.selectedSolution') }}</span>
          <span class="fi-chem-name">
            <span class="fi-dot" :style="{ background: selectedChemical.color }" />
            {{ getName(selectedChemical.id) }}
          </span>
        </div>
        <div class="fi-actions">
          <button @click="emit('action', 'fill5', item.uid)">💧 +5</button>
          <button @click="emit('action', 'fill10', item.uid)">💧 +10</button>
          <button @click="emit('action', 'fill50', item.uid)">💧 +50</button>
          <button @click="emit('action', 'fill100', item.uid)">💧 +100</button>
        </div>
        <div class="fi-actions">
          <button class="remove" @click="emit('action', 'remove5', item.uid)">💨 −5</button>
          <button class="remove" @click="emit('action', 'remove10', item.uid)">💨 −10</button>
          <button class="remove" @click="emit('action', 'remove50', item.uid)">💨 −50</button>
          <button class="remove" @click="emit('action', 'remove100', item.uid)">💨 −100</button>
        </div>
        <div class="fi-actions">
          <button class="empty" @click="emit('action', 'empty', item.uid)">🗑️ {{ t('chemistry.drain') }}</button>
          <button class="delete" @click="emit('remove', item.uid)">❌ {{ t('chemistry.remove') }}</button>
        </div>
        <!-- Tilt controls -->
        <div class="fi-row">
          <span>🔄 {{ t('chemistry.tilt') }}</span>
          <b v-if="item && tiltAngleMap[item.uid]" class="tilt-value">{{ tiltAngleMap[item.uid] > 0 ? '↻ ' : '↺ ' }}{{ Math.abs(tiltAngleMap[item.uid]).toFixed(0) }}°</b>
          <b v-else>⬆ {{ t('chemistry.straightUp') }}</b>
        </div>
        <div class="fi-actions tilt-actions">
          <button class="tilt-left" @click="tiltLeft">↺ {{ t('chemistry.left') }}</button>
          <button class="tilt-reset" @click="resetTilt">⬆ {{ t('chemistry.tiltReset') }}</button>
          <button class="tilt-right" @click="tiltRight">↻ {{ t('chemistry.right') }}</button>
        </div>
      </template>
      <!-- Burette -->
      <template v-else-if="state.type === 'burette'">
        <div class="fi-row"><span>{{ t('chemistry.solution') }}</span><b>{{ state.volume.toFixed(1) }} / {{ state.maxVolume }} {{ t('chemistry.mL') }}</b></div>
        <div class="fi-bar"><div class="fi-fill" :style="{ width: (state.volume/state.maxVolume*100).toFixed(0) + '%', background: state.color }" /></div>
        <div class="fi-row"><span>{{ t('chemistry.valve') }}</span><b :class="state.valveOpen ? 'open' : ''">{{ state.valveOpen ? '🔓 ' + t('chemistry.open') : '🔒 ' + t('chemistry.closed') }}</b></div>
        <div class="fi-actions">
          <button @click="emit('action', 'fill5', item.uid)">💧 +5</button>
          <button @click="emit('action', 'fill10', item.uid)">💧 +10</button>
          <button @click="emit('action', 'fill50', item.uid)">💧 +50</button>
          <button @click="emit('action', 'fill100', item.uid)">💧 +100</button>
        </div>
        <div class="fi-actions">
          <button :class="state.valveOpen ? 'danger' : 'success'" @click="emit('action', 'toggleValve', item.uid)">{{ state.valveOpen ? '🔒 ' + t('chemistry.closeAction') : '🚰 ' + t('chemistry.openAction') }}</button>
          <button class="refill" @click="emit('action', 'refill', item.uid)">♻️ {{ t('chemistry.refill') }}</button>
        </div>
        <div class="fi-actions">
          <button class="drop-one" @click="emit('buretteDrop')">💧 {{ t('chemistry.dropByDrop') }}</button>
        </div>
        <div class="fi-actions">
          <button class="remove" @click="emit('action', 'remove5', item.uid)">💨 −5</button>
          <button class="remove" @click="emit('action', 'remove10', item.uid)">💨 −10</button>
          <button class="remove" @click="emit('action', 'remove50', item.uid)">💨 −50</button>
          <button class="remove" @click="emit('action', 'remove100', item.uid)">💨 −100</button>
        </div>
        <div class="fi-actions">
          <button class="empty" @click="emit('action', 'empty', item.uid)">🗑️ {{ t('chemistry.drain') }}</button>
          <button class="delete" @click="emit('remove', item.uid)">❌ {{ t('chemistry.remove') }}</button>
        </div>
      </template>
      <!-- Pipette -->
      <template v-else-if="state.type === 'pipette'">
        <div class="fi-row"><span>{{ t('chemistry.solution') }}</span><b>{{ state.volume.toFixed(1) }} / {{ state.maxVolume }} {{ t('chemistry.mL') }}</b></div>
        <div class="fi-bar"><div class="fi-fill" :style="{ width: (state.volume/state.maxVolume*100).toFixed(0) + '%', background: state.color }" /></div>
        <div class="fi-row"><span>{{ t('chemistry.color') }}</span><span class="fi-dot" :style="{ background: state.color }" /></div>
        <!-- Current chemical indicator -->
        <div v-if="item && hasSelectedChemicalMap[item.uid]" class="fi-row fi-chem-row">
          <span>{{ t('chemistry.selectedSolution') }}</span>
          <span class="fi-chem-name">
            <span class="fi-dot" :style="{ background: selectedChemical.color }" />
            {{ getName(selectedChemical.id) }}
          </span>
        </div>
        <!-- Fill from chemical shelf -->
        <div class="fi-row"><span>🧪 {{ t('chemistry.fillFromShelf') }}</span></div>
        <div class="fi-actions">
          <button @click="emit('pipetteFill', 5)">💧 +5</button>
          <button @click="emit('pipetteFill', 10)">💧 +10</button>
          <button @click="emit('pipetteFill', 50)">💧 +50</button>
          <button @click="emit('pipetteFill', 100)">💧 +100</button>
        </div>
        <!-- Select target container -->
        <div class="fi-row"><span>🎯 {{ t('chemistry.selectContainer') }}</span></div>
        <div class="fi-actions">
          <select v-model="pipetteTargetUid" class="fi-select" @click.stop>
            <option value="">{{ t('chemistry.chooseContainer') }}</option>
            <option v-for="c in containerList" :key="c.uid" :value="c.uid">{{ containerLabel(c) }}</option>
          </select>
        </div>
        <!-- Draw from selected container -->
        <div class="fi-row"><span>💉 {{ t('chemistry.drawFrom') }}</span></div>
        <div class="fi-actions">
          <button class="success" :disabled="!pipetteTargetUid" @click="emit('pipetteDrawFrom', pipetteTargetUid, 1)">💉 1</button>
          <button class="success" :disabled="!pipetteTargetUid" @click="emit('pipetteDrawFrom', pipetteTargetUid, 3)">💉 3</button>
          <button class="success" :disabled="!pipetteTargetUid" @click="emit('pipetteDrawFrom', pipetteTargetUid, 5)">💉 5</button>
          <button class="success" :disabled="!pipetteTargetUid" @click="emit('pipetteDrawFrom', pipetteTargetUid, 10)">💉 10</button>
        </div>
        <!-- Dispense to selected container -->
        <div class="fi-row"><span>💧 {{ t('chemistry.dispenseTo') }}</span></div>
        <div class="fi-actions">
          <button class="success" :disabled="!pipetteTargetUid" @click="emit('pipetteDispenseTo', pipetteTargetUid, 1)">💧 1</button>
          <button class="success" :disabled="!pipetteTargetUid" @click="emit('pipetteDispenseTo', pipetteTargetUid, 3)">💧 3</button>
          <button class="success" :disabled="!pipetteTargetUid" @click="emit('pipetteDispenseTo', pipetteTargetUid, 5)">💧 5</button>
          <button class="success" :disabled="!pipetteTargetUid" @click="emit('pipetteDispenseTo', pipetteTargetUid, 10)">💧 10</button>
        </div>
        <!-- Quick actions -->
        <div class="fi-actions">
          <button class="empty" @click="emit('pipetteEmpty')">🗑️ {{ t('chemistry.drain') }}</button>
          <button class="delete" @click="emit('remove', item.uid)">❌ {{ t('chemistry.remove') }}</button>
        </div>
        <div class="fi-row hint">
          <span>📖</span><small>{{ t('chemistry.pipetteHintNew') }}</small>
        </div>
      </template>
      <!-- Bunsen Burner -->
      <template v-else-if="isBunsenBurner(item.id)">
        <div class="fi-row"><span>{{ t('chemistry.status') }}</span><b :class="getBurnerState(item.uid).on ? 'open' : ''">{{ getBurnerState(item.uid).on ? '🔥 ' + t('chemistry.on') : '⚫ ' + t('chemistry.off') }}</b></div>
        <div class="fi-row"><span>{{ t('chemistry.intensity') }}</span><b>{{ Math.round(getBurnerState(item.uid).intensity * 100) }}%</b></div>
        <div class="fi-row"><span>{{ t('chemistry.heatingSpeed') }}</span><b>{{ simSpeed }}x</b></div>
        <div class="fi-actions">
          <button :class="getBurnerState(item.uid).on ? 'danger' : 'success'" @click="emit('toggleBurner')">{{ getBurnerState(item.uid).on ? '⏹️ ' + t('chemistry.heatOff') : '🔥 ' + t('chemistry.heatOn') }}</button>
        </div>
        <div class="fi-actions">
          <input type="range" min="0" max="100" :value="getBurnerState(item.uid).intensity * 100" @input="emit('intensityChange', +($event.target as HTMLInputElement).value / 100)" class="fi-slider" style="width:100%" />
        </div>
        <div class="fi-actions">
          <button class="refill" @click="simSpeed = simSpeed === 1 ? 5 : 1">{{ simSpeed === 1 ? '⏩ ' + t('chemistry.fastX5') : '⏪ ' + t('chemistry.slowX1') }}</button>
        </div>
        <div class="fi-actions">
          <button class="delete" @click="emit('remove', item.uid)">❌ {{ t('chemistry.remove') }}</button>
        </div>
      </template>
      <!-- Digital Balance -->
      <template v-else-if="isBalance(item.id)">
        <div class="fi-row"><span>{{ t('chemistry.reading') }}</span><b style="color:#22c55e;font-family:monospace">{{ balanceReadout() }}</b></div>
        <div class="fi-row"><span>{{ t('chemistry.grossWeight') }}</span><b style="font-family:monospace">{{ grossWeight() }}</b></div>
        <div class="fi-row"><span>{{ t('chemistry.tare') }}</span><b style="font-family:monospace">{{ getBalanceTare(item.uid).toFixed(2) }} {{ t('chemistry.g') }}</b></div>
        <div class="fi-row"><span>{{ t('chemistry.tareTool') }}</span><b style="font-family:monospace">{{ getContainerTare(item.uid).toFixed(2) }} {{ t('chemistry.g') }}</b></div>
        <div class="fi-actions">
          <button class="success" @click="emit('tare')">⚖️ {{ t('chemistry.tareAll') }}</button>
          <button class="refill" @click="emit('tareContainer')">🧪 {{ t('chemistry.removeToolWeight') }}</button>
        </div>
        <div class="fi-actions">
          <button class="delete" @click="emit('remove', item.uid)">❌ {{ t('chemistry.remove') }}</button>
        </div>
      </template>
      <!-- Heating Mantle -->
      <template v-else-if="isHeatingMantle(item.id)">
        <div class="fi-row"><span>{{ t('chemistry.status') }}</span><b :class="getBurnerState(item.uid).on ? 'open' : ''">{{ getBurnerState(item.uid).on ? '🔥 ' + t('chemistry.on') : '⚫ ' + t('chemistry.off') }}</b></div>
        <div class="fi-row"><span>{{ t('chemistry.intensity') }}</span><b>{{ Math.round(getBurnerState(item.uid).intensity * 100) }}%</b></div>
        <div class="fi-row"><span>{{ t('chemistry.heatingSpeed') }}</span><b>{{ simSpeed }}x</b></div>
        <div class="fi-actions">
          <button :class="getBurnerState(item.uid).on ? 'danger' : 'success'" @click="emit('toggleBurner')">{{ getBurnerState(item.uid).on ? '⏹️ ' + t('chemistry.heatingOff') : '🔥 ' + t('chemistry.heatingOn') }}</button>
        </div>
        <div class="fi-actions">
          <input type="range" min="0" max="100" :value="getBurnerState(item.uid).intensity * 100" @input="emit('intensityChange', +($event.target as HTMLInputElement).value / 100)" class="fi-slider" style="width:100%" />
        </div>
        <div class="fi-actions">
          <button class="refill" @click="simSpeed = simSpeed === 1 ? 5 : 1">{{ simSpeed === 1 ? '⏩ ' + t('chemistry.fastX5') : '⏪ ' + t('chemistry.slowX1') }}</button>
        </div>
        <div class="fi-actions">
          <button class="delete" @click="emit('remove', item.uid)">❌ {{ t('chemistry.remove') }}</button>
        </div>
      </template>
      <!-- pH Meter -->
      <template v-else-if="isPhMeter(item.id)">
        <div class="fi-row"><span>{{ t('chemistry.reading') }}</span><b style="color:#22c55e;font-family:monospace;font-size:1.1rem">{{ phReadout() }}</b></div>
        <div class="fi-row"><span>{{ t('chemistry.status') }}</span><b>{{ getPhReading(item) !== null ? '🟢 ' + t('chemistry.electrodeIn') : '⚪ ' + t('chemistry.electrodeOut') }}</b></div>
        <div class="fi-actions">
          <button class="delete" @click="emit('remove', item.uid)">❌ {{ t('chemistry.remove') }}</button>
        </div>
      </template>
      <!-- Thermometer -->
      <template v-else-if="isThermometer(item.id)">
        <div class="fi-row"><span>{{ t('chemistry.tool') }}</span><b>{{ item.id === 'thermometer-digital' ? t('chemistry.thermometerDigital') : t('chemistry.thermometerMercury') }}</b></div>
        <div class="fi-row"><span>{{ t('chemistry.reading') }}</span><b :style="{ color: tempColor(), fontFamily: 'monospace', fontSize: '1.1rem' }">{{ tempReadout() }}°C</b></div>
        <div class="fi-row"><span>{{ t('chemistry.status') }}</span><b>{{ getTemperatureReading(item) !== null ? '🟢 ' + t('chemistry.probeInLiquid') : '⚪ ' + t('chemistry.probeOutOfLiquid') }}</b></div>
        <div class="fi-row hint"><span>📖</span><small>{{ t('chemistry.thermometerHint') }}</small></div>
        <div class="fi-actions">
          <button class="delete" @click="emit('remove', item.uid)">❌ {{ t('chemistry.remove') }}</button>
        </div>
      </template>
      <!-- Pipette info -->
      <template v-else-if="item.id === 'pipette'">
        <div class="fi-row"><span>{{ t('chemistry.tool') }}</span><b>{{ t('chemistry.pipette') }}</b></div>
        <div class="fi-row"><span>{{ t('chemistry.capacity') }}</span><b>10 {{ t('chemistry.mL') }}</b></div>
        <div class="fi-row"><span>{{ t('chemistry.status') }}</span><b>{{ pipetteStatus() }}</b></div>
        <div class="fi-row hint"><span>📖</span><small>{{ t('chemistry.pipetteHint') }}</small></div>
        <div class="fi-actions">
          <button v-if="state && state.volume <= 0" class="success" @click="emit('pipetteDraw')">💉 {{ t('chemistry.draw') }}</button>
          <button v-else class="success" @click="emit('pipetteDispense')">💉 {{ t('chemistry.dispense') }}</button>
        </div>
        <div class="fi-actions">
          <button class="delete" @click="emit('remove', item.uid)">❌ {{ t('chemistry.remove') }}</button>
        </div>
      </template>
      <!-- Spatula -->
      <template v-else-if="item.id === 'spatula'">
        <div class="fi-row"><span>{{ t('chemistry.tool') }}</span><b>{{ t('chemistry.spatula') }}</b></div>
        <div class="fi-row"><span>{{ t('chemistry.usage') }}</span><b>{{ t('chemistry.transferSolids') }}</b></div>

        <!-- Selected solid indicator -->
        <div v-if="spatulaSelectedSolid" class="fi-row fi-chem-row">
          <span>{{ t('chemistry.selectedSolid') }}</span>
          <span class="fi-chem-name">
            <span class="fi-dot" :style="{ background: spatulaSelectedSolid.color }" />
            {{ spatulaSelectedSolid.name }}
          </span>
        </div>

        <!-- Select solid button -->
        <div class="fi-actions">
          <button class="success" @click="emit('spatulaSelectSolid')">
            🧪 {{ spatulaSelectedSolid ? t('chemistry.changeSolid') : t('chemistry.selectSolid') }}
          </button>
        </div>

        <!-- Target container selector -->
        <div class="fi-row"><span>🎯 {{ t('chemistry.selectContainer') }}</span></div>
        <div class="fi-actions">
          <select v-model="spatulaTargetUid" class="fi-select" @click.stop>
            <option value="">{{ t('chemistry.chooseContainer') }}</option>
            <option v-for="c in spatulaContainerList" :key="c.uid" :value="c.uid">{{ spatulaContainerLabel(c) }}</option>
          </select>
        </div>

        <!-- Grams buttons -->
        <div class="fi-row"><span>⚖️ {{ t('chemistry.addGrams') }}</span></div>
        <div class="fi-actions">
          <button class="success" :disabled="!spatulaSelectedSolid || !spatulaTargetUid" @click="emit('spatulaAddTo', spatulaTargetUid, 0.5)">🥄 +0.5g</button>
          <button class="success" :disabled="!spatulaSelectedSolid || !spatulaTargetUid" @click="emit('spatulaAddTo', spatulaTargetUid, 1)">🥄 +1g</button>
          <button class="success" :disabled="!spatulaSelectedSolid || !spatulaTargetUid" @click="emit('spatulaAddTo', spatulaTargetUid, 2)">🥄 +2g</button>
          <button class="success" :disabled="!spatulaSelectedSolid || !spatulaTargetUid" @click="emit('spatulaAddTo', spatulaTargetUid, 5)">🥄 +5g</button>
        </div>

        <!-- Show total solid in target -->
        <div v-if="spatulaTargetUid && solidMap[spatulaTargetUid] && solidMap[spatulaTargetUid].amount > 0" class="fi-row">
          <span>{{ t('chemistry.totalSolid') }}</span>
          <b>{{ solidMap[spatulaTargetUid].amount.toFixed(2) }} {{ t('chemistry.g') }}</b>
        </div>

        <div class="fi-row hint"><span>📖</span><small>{{ t('chemistry.spatulaHintNew') }}</small></div>
        <div class="fi-actions">
          <button class="delete" @click="emit('remove', item.uid)">❌ {{ t('chemistry.remove') }}</button>
        </div>
      </template>
      <!-- Hot Plate -->
      <template v-else-if="isHotPlate(item.id)">
        <div class="fi-row"><span>{{ t('chemistry.status') }}</span><b :class="getHotPlateState(item.uid).on ? 'open' : ''">{{ getHotPlateState(item.uid).on ? '🔥 ' + t('chemistry.on') : '⚫ ' + t('chemistry.off') }}</b></div>
        <div class="fi-row"><span>{{ t('chemistry.heatingSpeed') }}</span><b>{{ simSpeed }}x</b></div>
        <div class="fi-actions">
          <button :class="getHotPlateState(item.uid).on ? 'danger' : 'success'" @click="emit('toggleBurner')">{{ getHotPlateState(item.uid).on ? '⏹️ ' + t('chemistry.heatingOff') : '🔥 ' + t('chemistry.heatingOn') }}</button>
        </div>
        <div class="fi-actions">
          <button class="refill" @click="simSpeed = simSpeed === 1 ? 5 : 1">{{ simSpeed === 1 ? '⏩ ' + t('chemistry.fastX5') : '⏪ ' + t('chemistry.slowX1') }}</button>
        </div>
        <div class="fi-actions">
          <button class="delete" @click="emit('remove', item.uid)">❌ {{ t('chemistry.remove') }}</button>
        </div>
      </template>
      <!-- Generic -->
      <template v-else>
        <div class="fi-row"><span>{{ t('chemistry.type') }}</span><b>{{ item.type }}</b></div>
        <div class="fi-actions">
          <button class="delete" @click="emit('remove', item.uid)">❌ {{ t('chemistry.remove') }}</button>
        </div>
      </template>
    </div>
  </div>
</template>
<style src="./floating-inspector.css" scoped></style>
