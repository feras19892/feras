<script setup lang="ts">
import type { WorkshopComponent, WorkshopWire } from '../shared/types'
import type { useWorkshop } from '../shared/useWorkshop'
import { componentDefs } from '../shared/componentDefs'
import { WIRE_COLOR_NAMES } from '../shared/types'

defineProps<{
  t: (key: string, vars?: Record<string, string | number>) => string
  workshop: ReturnType<typeof useWorkshop>
  showValueEditor: boolean
  editingComp: WorkshopComponent | null
  editValue: number
  editRotation: number
  showWireEditor: boolean
  editingWire: WorkshopWire | null
  editWireColor: string
  editWireThickness: number
  renderMode: '3d' | '2d'
  redraw: () => void
}>()

const emit = defineEmits<{
  (e: 'update:editValue', v: number): void
  (e: 'update:editRotation', v: number): void
  (e: 'update:editWireColor', v: string): void
  (e: 'update:editWireThickness', v: number): void
  (e: 'update:renderMode', v: '3d' | '2d'): void
  (e: 'applyEditValue'): void
  (e: 'applyRotate'): void
  (e: 'zoomComp', delta: number): void
  (e: 'zoomCompVal', val: number): void
  (e: 'showResistorTutorial'): void
  (e: 'deleteSelectedComp'): void
  (e: 'deleteSelectedWire'): void
  (e: 'openCanvasFullscreen'): void
}>()
</script>

<template>
  <div class="ac-top-bar">
        <!-- Component selected -->
        <template v-if="showValueEditor && editingComp">
          <div class="tb-section tb-name">
            <span class="tb-icon">{{ componentDefs.find(d => d.type === editingComp?.type)?.icon }}</span>
            <span class="tb-label">{{ t('ew.comp.' + editingComp?.type) }}</span>
          </div>

          <div class="tb-section" v-if="editingComp?.unit">
            <label class="tb-field">{{ t('ew.value') }}</label>
            <div class="tb-input-grp">
              <input type="number" :value="editValue" @input="emit('update:editValue', Number(($event.target as HTMLInputElement).value)); emit('applyEditValue')" step="0.1" class="tb-input" />
              <span class="tb-unit">{{ editingComp?.unit }}</span>
            </div>
          </div>

          <div class="tb-section" v-if="editingComp?.type === 'resistor'">
            <button class="tb-action-btn" @click="emit('showResistorTutorial')">🎨 {{ t('ew.learnResistorColors') }}</button>
          </div>

          <div class="tb-section">
            <label class="tb-field">{{ t('ew.rotation') }}</label>
            <div class="tb-btn-grp">
              <button class="tb-mini-btn" @click="emit('update:editRotation', (editRotation + 270) % 360); emit('applyRotate')">↺</button>
              <span class="tb-rot-val">{{ editRotation }}°</span>
              <button class="tb-mini-btn" @click="emit('update:editRotation', (editRotation + 90) % 360); emit('applyRotate')">↻</button>
            </div>
          </div>

          <div class="tb-section">
            <label class="tb-field">{{ t('ew.scale') }} {{ Math.round((editingComp?.scale ?? 1) * 100) }}%</label>
            <div class="tb-btn-grp">
              <button class="tb-mini-btn" @click="emit('zoomComp', -0.2)">−</button>
              <input type="range" min="0.3" max="4" step="0.1" :value="editingComp?.scale ?? 1" @input="emit('zoomCompVal', Number(($event.target as HTMLInputElement).value))" class="tb-slider" />
              <button class="tb-mini-btn" @click="emit('zoomComp', 0.2)">+</button>
            </div>
          </div>

          <div class="tb-section" v-if="editingComp?.type === 'switch'">
            <button class="tb-action-btn" @click="workshop.toggleSwitch(editingComp!.id); if (workshop.running.value) workshop.solve()">
              {{ editingComp?.closed ? ('🟢 ' + t('ew.on')) : ('🔴 ' + t('ew.off')) }}
            </button>
          </div>

          <div class="tb-section" v-if="editingComp?.type === 'breaker' && editingComp?.breakerTripped">
            <button class="tb-action-btn warn" @click="workshop.resetBreaker(editingComp!.id); if (workshop.running.value) workshop.solve()">{{ t('ew.resetBreaker') }}</button>
          </div>

          <div class="tb-section" v-if="editingComp?.type === 'fuse' && editingComp?.fuseBlown">
            <button class="tb-action-btn warn" @click="workshop.resetFuse(editingComp!.id); if (workshop.running.value) workshop.solve()">{{ t('ew.replaceFuse') }}</button>
          </div>

          <div class="tb-section" v-if="editingComp?.type === 'multimeter'">
            <div class="tb-mm-grp">
              <button class="tb-mm-btn" :class="{ active: editingComp?.multimeterMode === 'voltage' }" @click="workshop.setMultimeterMode(editingComp!.id, 'voltage')">V</button>
              <button class="tb-mm-btn" :class="{ active: editingComp?.multimeterMode === 'current' }" @click="workshop.setMultimeterMode(editingComp!.id, 'current')">A</button>
              <button class="tb-mm-btn" :class="{ active: editingComp?.multimeterMode === 'resistance' }" @click="workshop.setMultimeterMode(editingComp!.id, 'resistance')">Ω</button>
            </div>
          </div>

          <div class="tb-section tb-readings" v-if="workshop.running.value">
            <span class="tb-rd">V: {{ editingComp?.voltage.toFixed(3) }}</span>
            <span class="tb-rd">A: {{ editingComp?.current.toFixed(4) }}</span>
            <span class="tb-rd">W: {{ workshop.getPower(editingComp!).toFixed(3) }}</span>
          </div>

          <div class="tb-section tb-actions">
            <button class="tb-delete-btn" @click="emit('deleteSelectedComp')">🗑 {{ t('ew.delete') }}</button>
          </div>
        </template>

        <!-- Wire selected -->
        <template v-else-if="showWireEditor && editingWire">
          <div class="tb-section tb-name">
            <span class="tb-icon">🧵</span>
            <span class="tb-label">{{ t('ew.wireProps') }}</span>
          </div>

          <div class="tb-section">
            <label class="tb-field">{{ t('ew.color') }}</label>
            <div class="tb-color-grp">
              <button
                v-for="wc in WIRE_COLOR_NAMES"
                :key="wc.key"
                class="tb-color-dot"
                :class="{ active: editWireColor === wc.color }"
                :style="{ '--wc': wc.color }"
                @click="emit('update:editWireColor', wc.color); workshop.updateWireColor(editingWire!.id, wc.color); redraw()"
              ></button>
            </div>
          </div>

          <div class="tb-section">
            <label class="tb-field">{{ t('ew.thickness') }}: {{ editWireThickness }}px</label>
            <input type="range" min="1" max="8" :value="editWireThickness" @input="emit('update:editWireThickness', Number(($event.target as HTMLInputElement).value)); workshop.updateWireThickness(editingWire!.id, Number(($event.target as HTMLInputElement).value)); redraw()" class="tb-slider" />
          </div>

          <div class="tb-section">
            <span class="tb-info">{{ editingWire?.points.length }} {{ t('ew.cornerPoints') }}</span>
          </div>

          <div class="tb-section">
            <button class="tb-action-btn" @click="workshop.rerouteAllWires(); redraw()">{{ t('ew.reroute') }}</button>
          </div>

          <div class="tb-section tb-actions">
            <button class="tb-delete-btn" @click="emit('deleteSelectedWire')">🗑 {{ t('ew.delete') }}</button>
          </div>
        </template>

        <!-- Nothing selected -->
        <template v-else>
          <div class="tb-section tb-name">
            <span class="tb-icon">⚙️</span>
            <span class="tb-label">{{ t('ew.controlPanel') }}</span>
          </div>
          <div class="tb-section">
            <span class="tb-info">{{ t('ew.selectPrompt') }}</span>
          </div>
          <div class="tb-section tb-actions">
            <button class="tb-render-toggle" @click="emit('update:renderMode', renderMode === '3d' ? '2d' : '3d'); redraw()">{{ renderMode === '3d' ? '2D' : '3D' }}</button>
            <button class="tb-fs-btn" @click="emit('openCanvasFullscreen')" :title="t('ew.fullscreen')">{{ t('ew.fullscreen') }}</button>
          </div>
        </template>

      </div>
</template>
