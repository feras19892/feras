<script setup lang="ts">
import type { ComponentType } from '../types'

const emit = defineEmits<{ (e: 'add', type: ComponentType): void }>()

const tools: { type: ComponentType; icon: string; label: string; desc: string }[] = [
  { type: 'battery',      icon: '🔋', label: 'بطارية',      desc: 'مصدر جهد DC' },
  { type: 'resistor',     icon: '🔲', label: 'مقاومة',      desc: 'مقاومة ثابتة' },
  { type: 'capacitor',    icon: '🔌', label: 'مكثف',        desc: 'يخزن الشحنة الكهربائية' },
  { type: 'switch',       icon: '🔘', label: 'مفتاح',       desc: 'فتح/إغلاق الدائرة' },
  { type: 'lamp',         icon: '💡', label: 'مصباح',       desc: 'تحويل كهرباء لضوء' },
  { type: 'ammeter',      icon: '📊', label: 'أميتر',       desc: 'قياس التيار' },
  { type: 'voltmeter',    icon: '📈', label: 'فولتميتر',    desc: 'قياس الجهد' },
  { type: 'galvanometer', icon: '📐', label: 'جلفانوميتر',  desc: 'قياس تيارات صغيرة (µA)' },
]
</script>

<template>
  <div class="tool-palette">
    <h3 class="panel-title">🧰 الأدوات</h3>
    <div class="tool-list">
      <button
        v-for="tool in tools"
        :key="tool.type"
        class="tool-btn"
        @click="emit('add', tool.type)"
      >
        <span class="tool-icon">{{ tool.icon }}</span>
        <span class="tool-info">
          <span class="tool-label">{{ tool.label }}</span>
          <span class="tool-desc">{{ tool.desc }}</span>
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.tool-palette {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 0.75rem;
  overflow: hidden;
}
.panel-title {
  margin: 0;
  padding: 0.75rem 1rem;
  font-size: 0.85rem;
  color: #f59e0b;
  background: rgba(245,158,11,0.08);
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.tool-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.tool-btn {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 0.75rem;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.15s;
  text-align: right;
}
.tool-btn:hover {
  background: rgba(245,158,11,0.12);
  border-color: rgba(245,158,11,0.3);
  transform: translateX(-2px);
}
.tool-icon {
  font-size: 1.3rem;
  flex-shrink: 0;
}
.tool-info {
  display: flex;
  flex-direction: column;
}
.tool-label {
  font-size: 0.82rem;
  color: #e2e8f0;
  font-weight: 600;
}
.tool-desc {
  font-size: 0.68rem;
  color: #64748b;
}
</style>
