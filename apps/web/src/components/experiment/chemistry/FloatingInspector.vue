<script setup lang="ts">
import type { LabItem } from '../../../composables/chemistry/useChemistryTools';
import type { ToolState } from '../../../composables/chemistry/chemLabTypes';
import {
  getPipette, getBurnerState, getBalanceTare, getContainerTare, getHotPlateState,
  simSpeed,
  isBunsenBurner, isHeatingMantle, isHotPlate, isBalance, isPhMeter, isThermometer,
} from '../../../composables/chemistry/useChemistryLab';
import { computeBalanceWeight, getBalanceReading, getPhReading, getTemperatureReading } from '../../../composables/chemistry/useLabSimulation';
import { useI18n } from '../../../composables/useI18n';
import InspectorContainer from './InspectorContainer.vue';
import InspectorBurette from './InspectorBurette.vue';
import InspectorPipette from './InspectorPipette.vue';
import InspectorSpatula from './InspectorSpatula.vue';

const { t } = useI18n();
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
function pipetteStatus(): string {
  if (!props.item) return '';
  const v = getPipette(props.item.uid).volume;
  return v > 0 ? t('chemistry.contains') + ' ' + v.toFixed(1) + t('chemistry.mL') : t('chemistry.emptyF');
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
        <InspectorContainer
          :item="item"
          :state="state"
          @action="(type, uid) => emit('action', type, uid)"
          @remove="(uid) => emit('remove', uid)"
          @label-change="(label) => emit('labelChange', label)"
        />
      </template>
      <!-- Sep Funnel -->
      <template v-else-if="state.type === 'sep-funnel'">
        <InspectorContainer
          :item="item"
          :state="state"
          @action="(type, uid) => emit('action', type, uid)"
          @remove="(uid) => emit('remove', uid)"
          @label-change="(label) => emit('labelChange', label)"
        />
        <div class="fi-row"><span>{{ t('chemistry.valve') }}</span><b :class="state.valveOpen ? 'open' : ''">{{ state.valveOpen ? '🔓 ' + t('chemistry.open') : '🔒 ' + t('chemistry.closed') }}</b></div>
        <div class="fi-actions">
          <button :class="state.valveOpen ? 'danger' : 'success'" @click="emit('action', 'toggleValve', item.uid)">{{ state.valveOpen ? '🔒 ' + t('chemistry.closeAction') : '🚰 ' + t('chemistry.openAction') }}</button>
        </div>
      </template>
      <!-- Burette -->
      <template v-else-if="state.type === 'burette'">
        <InspectorBurette
          :item="item"
          :state="state"
          @action="(type, uid) => emit('action', type, uid)"
          @remove="(uid) => emit('remove', uid)"
          @burette-drop="emit('buretteDrop')"
          @label-change="(label) => emit('labelChange', label)"
        />
      </template>
      <!-- Pipette -->
      <template v-else-if="state.type === 'pipette'">
        <InspectorPipette
          :item="item"
          :state="state"
          @pipette-fill="(amount: number) => emit('pipetteFill', amount)"
          @pipette-draw-from="(targetUid: string, amount: number) => emit('pipetteDrawFrom', targetUid, amount)"
          @pipette-dispense-to="(targetUid: string, amount: number) => emit('pipetteDispenseTo', targetUid, amount)"
          @pipette-empty="emit('pipetteEmpty')"
          @remove="(uid) => emit('remove', uid)"
        />
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
        <InspectorSpatula
          :item="item"
          @spatula-select-solid="emit('spatulaSelectSolid')"
          @spatula-add-to="(targetUid: string, grams: number) => emit('spatulaAddTo', targetUid, grams)"
          @remove="(uid) => emit('remove', uid)"
        />
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
<style src="./floating-inspector.css"></style>
