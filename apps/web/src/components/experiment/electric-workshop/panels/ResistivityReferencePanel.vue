<script setup lang="ts">
const MATERIALS = [
  { name: 'فضة (Silver)',   rho: 1.59e-8,  color: '#c0c0c0' },
  { name: 'نحاس (Copper)',   rho: 1.68e-8,  color: '#b87333' },
  { name: 'ذهب (Gold)',     rho: 2.44e-8,  color: '#ffd700' },
  { name: 'ألمنيوم (Aluminum)', rho: 2.82e-8,  color: '#a0a0a0' },
  { name: 'تنجستن (Tungsten)', rho: 5.6e-8,  color: '#4a4a4a' },
  { name: 'نيكل (Nickel)',   rho: 6.99e-8,   color: '#c0c0c0' },
  { name: 'حديد (Iron)',     rho: 9.71e-8,   color: '#8b4513' },
  { name: 'جرافيت (Graphite)', rho: 3.5e-5,  color: '#333333' },
  { name: 'سيليكون (Silicon)', rho: 640,     color: '#4169e1' },
  { name: 'زجاج (Glass)',    rho: 1e12,      color: '#87ceeb' },
  { name: 'مطاط (Rubber)',   rho: 1e13,      color: '#2d2d2d' },
]

const NOTES = [
  '💡 ρ ثابتة لكل مادة — لا تتغير بتغيير شكل السلك',
  '⚡ الموصلات الجيدة (معادن) لها ρ صغيرة جداً (~10⁻⁸)',
  '🔥 العوازل (زجاج، مطاط) لها ρ ضخمة جداً (>10¹⁰)',
  '📊 الرسم: R مقابل L → خط مستقيم، الميل = ρ/A',
  '📏 مضاعف الطول = مضاعف المقاومة (R ∝ L)',
  '📏 مضاعف المساحة = نصف المقاومة (R ∝ 1/A)',
]
</script>

<template>
  <div class="panel-body">
    <div class="ref-title">🔬 المقاومية ρ</div>

    <div class="ref-section">
      <div class="section-title">القانون الأساسي</div>
      <div class="formula-box" style="color:#c084fc">R = ρ × L / A</div>
      <div class="formula-box" style="color:#c084fc">ρ = R × A / L</div>
    </div>

    <div class="ref-section">
      <div class="section-title">جدول المقاومية للمواد</div>
      <div class="mat-table">
        <div class="mat-header">
          <span>المادة</span>
          <span>ρ (Ω·m)</span>
        </div>
        <div v-for="m in MATERIALS" :key="m.name" class="mat-row">
          <span :style="{ color: m.color }">{{ m.name }}</span>
          <span class="rho-val">{{ m.rho.toExponential(2) }}</span>
        </div>
      </div>
    </div>

    <div v-for="(note, i) in NOTES" :key="i" class="ref-note">{{ note }}</div>
  </div>
</template>

<style scoped>
.panel-body { padding: 1rem; display: flex; flex-direction: column; gap: .5rem; overflow-y: auto; }
.ref-title { font-size: .9rem; font-weight: 700; color: #c084fc; text-align: center; padding-bottom: .3rem; border-bottom: 1px solid #1e2530; }
.ref-section { margin-top: .4rem; padding: .5rem; background: rgba(255,255,255,.02); border-radius: 4px; }
.section-title { font-size: .78rem; font-weight: 700; color: #67e8f9; margin-bottom: .3rem; }
.formula-box { font-family: 'Courier New', monospace; font-size: .82rem; text-align: center; padding: .3rem; background: rgba(192,132,252,.06); border-radius: 3px; margin-bottom: .2rem; font-weight: 700; }
.mat-table { display: flex; flex-direction: column; gap: .1rem; }
.mat-header { display: flex; justify-content: space-between; padding: .3rem .5rem; background: #1E2530; border-radius: 4px; font-weight: 700; font-size: .72rem; color: #94a3b8; }
.mat-row { display: flex; justify-content: space-between; padding: .2rem .5rem; border-bottom: 1px solid rgba(255,255,255,.04); font-size: .72rem; }
.mat-row:last-child { border-bottom: none; }
.rho-val { font-family: 'Courier New', monospace; color: #94a3b8; }
.ref-note { font-size: .72rem; color: #64748b; margin-top: .3rem; line-height: 1.5; }
</style>
