<script setup lang="ts">
import type { LabItem } from '../../../composables/chemistry/useChemistryTools';
import type { ToolState } from './InspectorPanel.vue';
import {
  getPipette, getBurnerState, getBalanceTare, getContainerTare,
  isGradCylinder, tiltAngleMap,
  selectedChemical, hasSelectedChemicalMap, simSpeed
} from '../../../composables/chemistry/useChemistryLab';
import { computeBalanceWeight, getBalanceReading, getPhReading } from '../../../composables/chemistry/useLabSimulation';

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
  toggleBurner: [];
  tare: [];
  tareContainer: [];
  intensityChange: [val: number];
  labelChange: [label: string];
  undo: [];
  redo: [];
}>();

function balanceReadout(): string {
  if (!props.item) return '--';
  const r = getBalanceReading(props.item.uid);
  return r !== null ? r.toFixed(2) + ' g' : '--';
}
function grossWeight(): string {
  if (!props.item) return '--';
  return computeBalanceWeight(props.item).toFixed(2) + ' g';
}
function phReadout(): string {
  if (!props.item) return '--.--';
  const r = getPhReading(props.item);
  return r !== null ? r.toFixed(2) : '--.--';
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
  return v > 0 ? 'تحتوي على ' + v.toFixed(1) + 'mL' : 'فارغة';
}
</script>

<template>
  <div v-if="item && state" class="floating-inspector">
    <div class="fi-header">
      <span class="fi-icon">{{ item.icon }}</span>
      <span class="fi-name">{{ item.name }}</span>
      <div class="fi-undo-group">
        <button
          class="undo-btn"
          :disabled="!canUndo"
          title="تراجع (Ctrl+Z)"
          @click.stop="emit('undo')"
        >↩️</button>
        <button
          class="redo-btn"
          :disabled="!canRedo"
          title="إعادة (Ctrl+Y)"
          @click.stop="emit('redo')"
        >↪️</button>
      </div>
    </div>
    <div class="fi-body">
      <!-- Container -->
      <template v-if="state.type === 'beaker'">
        <div class="fi-row"><span>الحجم</span><b>{{ state.volume.toFixed(1) }} / {{ state.maxVolume }} mL</b></div>
        <div class="fi-bar"><div class="fi-fill" :style="{ width: (state.volume/state.maxVolume*100).toFixed(0) + '%', background: state.color }" /></div>
        <div class="fi-row"><span>اللون</span><span class="fi-dot" :style="{ background: state.color }" /></div>
        <div class="fi-row">
          <span>المحلول</span>
          <input
            v-if="item"
            class="fi-input"
            :value="state.label || ''"
            placeholder="اسم المحلول..."
            @input="(e: any) => emit('labelChange', e.target.value)"
            @click.stop
          />
        </div>
        <div v-if="item && isGradCylinder(item.id)" class="fi-row hint">
          <span>⚠️</span><small>المخبار المدرج: أداة قياس دقيقة للحجوم</small>
        </div>
        <!-- Current chemical indicator -->
        <div v-if="item && hasSelectedChemicalMap[item.uid]" class="fi-row fi-chem-row">
          <span>🧪 المحلول:</span>
          <span class="fi-chem-name">
            <span class="fi-dot" :style="{ background: selectedChemical.color }" />
            {{ selectedChemical.nameAr }}
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
          <button class="empty" @click="emit('action', 'empty', item.uid)">🗑️ تفريغ</button>
          <button class="delete" @click="emit('remove', item.uid)">❌ إزالة</button>
        </div>
        <!-- Tilt controls -->
        <div class="fi-row">
          <span>🔄 الإمالة</span>
          <b v-if="item && tiltAngleMap[item.uid]" class="tilt-value">{{ tiltAngleMap[item.uid] > 0 ? '↻ ' : '↺ ' }}{{ Math.abs(tiltAngleMap[item.uid]).toFixed(0) }}°</b>
          <b v-else>⬆ مستقيم</b>
        </div>
        <div class="fi-actions tilt-actions">
          <button class="tilt-left" @click="tiltLeft">↺ يسار</button>
          <button class="tilt-reset" @click="resetTilt">⬆ توازن</button>
          <button class="tilt-right" @click="tiltRight">↻ يمين</button>
        </div>
      </template>
      <!-- Burette -->
      <template v-else-if="state.type === 'burette'">
        <div class="fi-row"><span>المحلول</span><b>{{ state.volume.toFixed(1) }} / {{ state.maxVolume }} mL</b></div>
        <div class="fi-bar"><div class="fi-fill" :style="{ width: (state.volume/state.maxVolume*100).toFixed(0) + '%', background: state.color }" /></div>
        <div class="fi-row"><span>الصنبور</span><b :class="state.valveOpen ? 'open' : ''">{{ state.valveOpen ? '🔓 مفتوح' : '🔒 مغلق' }}</b></div>
        <div class="fi-actions">
          <button @click="emit('action', 'fill5', item.uid)">💧 +5</button>
          <button @click="emit('action', 'fill10', item.uid)">💧 +10</button>
          <button @click="emit('action', 'fill50', item.uid)">💧 +50</button>
          <button @click="emit('action', 'fill100', item.uid)">💧 +100</button>
        </div>
        <div class="fi-actions">
          <button :class="state.valveOpen ? 'danger' : 'success'" @click="emit('action', 'toggleValve', item.uid)">{{ state.valveOpen ? '🔒 إغلاق' : '🚰 فتح' }}</button>
          <button class="refill" @click="emit('action', 'refill', item.uid)">♻️ تعبئة</button>
        </div>
        <div class="fi-actions">
          <button class="remove" @click="emit('action', 'remove5', item.uid)">💨 −5</button>
          <button class="remove" @click="emit('action', 'remove10', item.uid)">💨 −10</button>
          <button class="remove" @click="emit('action', 'remove50', item.uid)">💨 −50</button>
          <button class="remove" @click="emit('action', 'remove100', item.uid)">💨 −100</button>
        </div>
        <div class="fi-actions">
          <button class="empty" @click="emit('action', 'empty', item.uid)">🗑️ تفريغ</button>
          <button class="delete" @click="emit('remove', item.uid)">❌ إزالة</button>
        </div>
      </template>
      <!-- Pipette -->
      <template v-else-if="state.type === 'pipette'">
        <div class="fi-row"><span>المسحوب</span><b>{{ state.volume.toFixed(1) }} / {{ state.maxVolume }} mL</b></div>
        <div class="fi-bar"><div class="fi-fill" :style="{ width: (state.volume/state.maxVolume*100).toFixed(0) + '%', background: state.color }" /></div>
        <div class="fi-row"><span>اللون</span><span class="fi-dot" :style="{ background: state.color }" /></div>
        <div class="fi-actions">
          <button v-if="state.volume <= 0" class="success" @click="emit('pipetteDraw')">💉 سحب</button>
          <button v-else class="success" @click="emit('pipetteDispense')">💉 إفراغ</button>
        </div>
        <div class="fi-actions">
          <button class="delete" @click="emit('remove', item.uid)">❌ إزالة</button>
        </div>
      </template>
      <!-- Bunsen Burner -->
      <template v-else-if="item.id === 'bunsen-burner'">
        <div class="fi-row"><span>الحالة</span><b :class="getBurnerState(item.uid).on ? 'open' : ''">{{ getBurnerState(item.uid).on ? '🔥 مشتعل' : '⚫ مطفأ' }}</b></div>
        <div class="fi-row"><span>الشدة</span><b>{{ Math.round(getBurnerState(item.uid).intensity * 100) }}%</b></div>
        <div class="fi-row"><span>سرعة التسخين</span><b>{{ simSpeed }}x</b></div>
        <div class="fi-actions">
          <button :class="getBurnerState(item.uid).on ? 'danger' : 'success'" @click="emit('toggleBurner')">{{ getBurnerState(item.uid).on ? '⏹️ إطفاء' : '🔥 إشعال' }}</button>
        </div>
        <div class="fi-actions">
          <button class="refill" @click="simSpeed = simSpeed === 1 ? 5 : 1">{{ simSpeed === 1 ? '⏩ تسريع ×5' : '⏪ إبطاء ×1' }}</button>
        </div>
        <div class="fi-actions">
          <button class="delete" @click="emit('remove', item.uid)">❌ إزالة</button>
        </div>
      </template>
      <!-- Digital Balance -->
      <template v-else-if="item.id === 'digital-balance'">
        <div class="fi-row"><span>القراءة</span><b style="color:#22c55e;font-family:monospace">{{ balanceReadout() }}</b></div>
        <div class="fi-row"><span>الوزن الخام</span><b style="font-family:monospace">{{ grossWeight() }}</b></div>
        <div class="fi-row"><span>التصفير</span><b style="font-family:monospace">{{ getBalanceTare(item.uid).toFixed(2) }} g</b></div>
        <div class="fi-row"><span>تصفير الأداة</span><b style="font-family:monospace">{{ getContainerTare(item.uid).toFixed(2) }} g</b></div>
        <div class="fi-actions">
          <button class="success" @click="emit('tare')">⚖️ تصفير الكل</button>
          <button class="refill" @click="emit('tareContainer')">🧪 حذف وزن الأداة</button>
        </div>
        <div class="fi-actions">
          <button class="delete" @click="emit('remove', item.uid)">❌ إزالة</button>
        </div>
      </template>
      <!-- Heating Mantle -->
      <template v-else-if="item.id === 'heating-mantle'">
        <div class="fi-row"><span>الحالة</span><b :class="getBurnerState(item.uid).on ? 'open' : ''">{{ getBurnerState(item.uid).on ? '🔥 يعمل' : '⚫ إيقاف' }}</b></div>
        <div class="fi-row"><span>الشدة</span><b>{{ Math.round(getBurnerState(item.uid).intensity * 100) }}%</b></div>
        <div class="fi-row"><span>سرعة التسخين</span><b>{{ simSpeed }}x</b></div>
        <div class="fi-actions">
          <button :class="getBurnerState(item.uid).on ? 'danger' : 'success'" @click="emit('toggleBurner')">{{ getBurnerState(item.uid).on ? '⏹️ إيقاف' : '🔥 تشغيل' }}</button>
        </div>
        <div class="fi-actions">
          <input type="range" min="0" max="100" :value="getBurnerState(item.uid).intensity * 100" @input="emit('intensityChange', +($event.target as HTMLInputElement).value / 100)" class="fi-slider" style="width:100%" />
        </div>
        <div class="fi-actions">
          <button class="refill" @click="simSpeed = simSpeed === 1 ? 5 : 1">{{ simSpeed === 1 ? '⏩ تسريع ×5' : '⏪ إبطاء ×1' }}</button>
        </div>
        <div class="fi-actions">
          <button class="delete" @click="emit('remove', item.uid)">❌ إزالة</button>
        </div>
      </template>
      <!-- pH Meter -->
      <template v-else-if="item.id === 'ph-meter'">
        <div class="fi-row"><span>القراءة</span><b style="color:#22c55e;font-family:monospace;font-size:1.1rem">{{ phReadout() }}</b></div>
        <div class="fi-row"><span>الحالة</span><b>{{ getPhReading(item) !== null ? '🟢 قطب مغطس' : '⚪ قطب في الهواء' }}</b></div>
        <div class="fi-actions">
          <button class="delete" @click="emit('remove', item.uid)">❌ إزالة</button>
        </div>
      </template>
      <!-- Pipette info -->
      <template v-else-if="item.id === 'pipette'">
        <div class="fi-row"><span>الأداة</span><b>ماصة (Pipette)</b></div>
        <div class="fi-row"><span>السعة</span><b>10 mL</b></div>
        <div class="fi-row"><span>الحالة</span><b>{{ pipetteStatus() }}</b></div>
        <div class="fi-row hint"><span>📖</span><small>انقر نقرًا مزدوجًا على الماصة للسحب أو الإفراغ تلقائيًا</small></div>
        <div class="fi-actions">
          <button v-if="state && state.volume <= 0" class="success" @click="emit('pipetteDraw')">💉 سحب</button>
          <button v-else class="success" @click="emit('pipetteDispense')">💉 إفراغ</button>
        </div>
        <div class="fi-actions">
          <button class="delete" @click="emit('remove', item.uid)">❌ إزالة</button>
        </div>
      </template>
      <!-- Spatula -->
      <template v-else-if="item.id === 'spatula'">
        <div class="fi-row"><span>الأداة</span><b>ملعقة مخبرية</b></div>
        <div class="fi-row"><span>الاستخدام</span><b>نقل المواد الصلبة</b></div>
        <div class="fi-row hint"><span>📖</span><small>ضع زجاجة ساعة على الميزان أولاً، ثم أضف المادة</small></div>
        <div class="fi-actions">
          <button class="success" @click="emit('action', 'addSolid', item.uid)">🥄 إضافة مادة صلبة</button>
        </div>
        <div class="fi-actions">
          <button class="delete" @click="emit('remove', item.uid)">❌ إزالة</button>
        </div>
      </template>
      <!-- Generic -->
      <template v-else>
        <div class="fi-row"><span>النوع</span><b>{{ item.type }}</b></div>
        <div class="fi-actions">
          <button class="delete" @click="emit('remove', item.uid)">❌ إزالة</button>
        </div>
      </template>
    </div>
  </div>
</template>
<style src="./floating-inspector.css" scoped></style>
