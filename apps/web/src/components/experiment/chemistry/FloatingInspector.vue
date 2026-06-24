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
  action: [type: 'refill' | 'empty' | 'toggleValve' | 'fill50' | 'fill100' | 'remove50' | 'remove100' | 'addSolid', uid: string];
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
          <button @click="emit('action', 'fill50', item.uid)">💧 +50mL</button>
          <button @click="emit('action', 'fill100', item.uid)">💧 +100mL</button>
        </div>
        <div class="fi-actions">
          <button class="remove" @click="emit('action', 'remove50', item.uid)">💨 −50mL</button>
          <button class="remove" @click="emit('action', 'remove100', item.uid)">💨 −100mL</button>
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
          <button :class="state.valveOpen ? 'danger' : 'success'" @click="emit('action', 'toggleValve', item.uid)">{{ state.valveOpen ? '🔒 إغلاق' : '🚰 فتح' }}</button>
          <button class="refill" @click="emit('action', 'refill', item.uid)">♻️ تعبئة</button>
        </div>
        <div class="fi-actions">
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
<style scoped>
.floating-inspector {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 220px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  box-shadow: 0 8px 30px rgba(0,0,0,0.1);
  padding: 0.75rem;
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.fi-header {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid #f1f5f9;
}
.fi-icon { font-size: 1.2rem; }
.fi-name { font-weight: 700; color: #1e293b; font-size: 0.8rem; flex: 1; }
.fi-undo-group { display: flex; gap: 0.2rem; }
.fi-undo-group button {
  width: 26px; height: 26px;
  border: none; border-radius: 0.3rem;
  background: #f1f5f9;
  cursor: pointer; font-size: 0.75rem;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.fi-undo-group button:hover:not(:disabled) { background: #e2e8f0; transform: translateY(-1px); }
.fi-undo-group button:disabled { opacity: 0.3; cursor: not-allowed; }
.fi-body { display: flex; flex-direction: column; gap: 0.35rem; }
.fi-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.72rem;
}
.fi-row span { color: #64748b; }
.fi-row b { color: #334155; font-weight: 700; }
.fi-row b.open { color: #10b981; }
.fi-row b.hot { color: #ef4444; }
.fi-row b.acid { color: #f59e0b; }
.fi-row b.base { color: #3b82f6; }
.fi-row b.neutral { color: #22c55e; }
.fi-bar {
  height: 5px;
  background: #f1f5f9;
  border-radius: 3px;
  overflow: hidden;
}
.fi-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s;
}
.fi-dot {
  width: 10px; height: 10px; border-radius: 50%;
  display: inline-block; border: 1px solid rgba(0,0,0,0.1);
}
.fi-input {
  width: 100px;
  padding: 0.2rem 0.4rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.3rem;
  font-size: 0.7rem;
  font-family: inherit;
  text-align: right;
  background: #f8fafc;
  color: #334155;
  outline: none;
}
.fi-input:focus {
  border-color: #3b82f6;
  background: #fff;
}
.fi-row.hint, .fi-row.pour-hint {
  color: #64748b;
  font-size: 0.65rem;
  gap: 0.3rem;
  background: rgba(241,245,249,0.7);
  padding: 0.15rem 0.4rem;
  border-radius: 0.3rem;
}
.fi-row.hint small, .fi-row.pour-hint small { font-weight: 600; }
.fi-row.pour-hint {
  background: rgba(16,185,129,0.15);
  color: #059669;
  border: 1px solid rgba(16,185,129,0.3);
}
.fi-actions {
  display: flex;
  gap: 0.3rem;
}
.fi-actions button {
  flex: 1;
  padding: 0.35rem;
  border: none;
  border-radius: 0.4rem;
  font-size: 0.68rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  text-align: center;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #fff;
  transition: all 0.15s;
}
.fi-actions button:hover { transform: translateY(-1px); }
.fi-actions button.empty {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}
.fi-actions button.delete {
  background: #f1f5f9;
  color: #64748b;
}
.fi-actions button.delete:hover {
  background: #fee2e2; color: #ef4444;
}
.fi-actions button.success {
  background: linear-gradient(135deg, #10b981, #059669);
}
.fi-actions button.danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}
.fi-actions button.refill {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}
.fi-actions button.remove {
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: #fff;
}
.fi-chem-row {
  background: rgba(241,245,249,0.6);
  border-radius: 0.5rem;
  padding: 0.3rem 0.5rem;
  margin-bottom: 0.25rem;
}
.fi-chem-name {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-weight: 700;
  color: #334155;
}
.fi-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  box-shadow: 0 0 0 2px rgba(255,255,255,0.8);
}
.fi-slider {
  width: 100px;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: #e2e8f0;
  border-radius: 2px;
  outline: none;
}
.fi-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
}
.tilt-actions button {
  background: #f1f5f9;
  color: #475569;
  font-size: 0.6rem;
  padding: 0.25rem;
}
.tilt-actions button:hover { background: #e2e8f0; }
.tilt-actions button.tilt-left { color: #3b82f6; }
.tilt-actions button.tilt-right { color: #3b82f6; }
.tilt-actions button.tilt-reset { color: #10b981; font-weight: 800; }
.tilt-value { color: #3b82f6; }
</style>
