<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { AnalysisEquation } from '../../../types/physics';

const props = defineProps<{
  equations: AnalysisEquation[];
  readings: Record<string, number>[];
}>();

const selectedIndex = ref(0);
const varValues = ref<Record<string, number>>({});
const targetVar = ref('');
const result = ref<string | null>(null);

function fillFromReadings() {
  if (!props.equations.length) return;
  const eq = props.equations[selectedIndex.value];
  if (!eq) return;
  // Try to fill from first non-empty row
  for (const row of props.readings) {
    let hasValue = false;
    for (const v of eq.variables) {
      if (row[v.symbol] !== undefined && row[v.symbol] !== 0) {
        varValues.value[v.symbol] = row[v.symbol];
        hasValue = true;
      }
    }
    if (hasValue) break;
  }
}

watch(() => props.equations, (eqs) => {
  if (eqs.length) {
    selectedIndex.value = 0;
    const vars: Record<string, number> = {};
    for (const v of eqs[0].variables) { vars[v.symbol] = v.value ?? 0; }
    varValues.value = vars;
    targetVar.value = eqs[0].solveFor[0] ?? '';
    fillFromReadings();
  }
}, { immediate: true });

watch(() => props.readings, () => { fillFromReadings(); }, { deep: true });

const activeEquation = computed(() => props.equations[selectedIndex.value]);

function solve() {
  const eq = activeEquation.value;
  if (!eq || !targetVar.value) { result.value = null; return; }

  const vals = { ...varValues.value };
  const missing = targetVar.value;
  const f = (n: number) => n.toFixed(4);

  // Helper: build step-by-step result
  function steps(name: string, formula: string, value: number) {
    return `${name} = ${formula} = ${f(value)}`;
  }

  // === Spring ===
  if (eq.formula.includes('T = 2π√(m/k)')) {
    const m = vals['m'] ?? 0; const T = vals['T'] ?? 0; const k = vals['k'] ?? 0;
    if (missing === 'k' && m > 0 && T > 0) {
      const v = (4 * Math.PI * Math.PI * m) / (T * T);
      result.value = steps('k', `4π²·m/T² = 4π²·${f(m)}/${f(T*T)}`, v);
    } else if (missing === 'T' && m > 0 && k > 0) {
      const v = 2 * Math.PI * Math.sqrt(m / k);
      result.value = steps('T', `2π√(m/k) = 2π√(${f(m)}/${f(k)})`, v);
    } else if (missing === 'm' && T > 0 && k > 0) {
      const v = (k * T * T) / (4 * Math.PI * Math.PI);
      result.value = steps('m', `k·T²/(4π²) = ${f(k)}·${f(T*T)}/(4π²)`, v);
    } else result.value = 'أدخل قيم صحيحة للمتغيرات المعروفة';
  }
  // === Pendulum ===
  else if (eq.formula.includes('T = 2π√(L/g)')) {
    const L = vals['L'] ?? 0; const T = vals['T'] ?? 0; const g = vals['g'] ?? 0;
    if (missing === 'g' && L > 0 && T > 0) {
      const v = (4 * Math.PI * Math.PI * L) / (T * T);
      result.value = steps('g', `4π²·L/T² = 4π²·${f(L)}/${f(T*T)}`, v);
    } else if (missing === 'T' && L > 0 && g > 0) {
      const v = 2 * Math.PI * Math.sqrt(L / g);
      result.value = steps('T', `2π√(L/g) = 2π√(${f(L)}/${f(g)})`, v);
    } else if (missing === 'L' && T > 0 && g > 0) {
      const v = (g * T * T) / (4 * Math.PI * Math.PI);
      result.value = steps('L', `g·T²/(4π²) = ${f(g)}·${f(T*T)}/(4π²)`, v);
    } else result.value = 'أدخل قيم صحيحة للمتغيرات المعروفة';
  }
  // === Pendulum T² form ===
  else if (eq.formula.includes('T² = (4π²/g)·L')) {
    const L = vals['L'] ?? 0; const T = vals['T'] ?? 0;
    if (missing === 'g' && L > 0 && T > 0) {
      const v = (4 * Math.PI * Math.PI * L) / (T * T);
      result.value = steps('g', `4π²·L/T² = 4π²·${f(L)}/${f(T*T)}`, v);
    } else result.value = 'أدخل قيم صحيحة';
  }
  // === Free Fall ===
  else if (eq.formula.includes('h = ½gt²')) {
    const h = vals['h'] ?? 0; const t = vals['t'] ?? 0; const g = vals['g'] ?? 0;
    if (missing === 'g' && h > 0 && t > 0) {
      const v = (2 * h) / (t * t);
      result.value = steps('g', `2h/t² = 2·${f(h)}/${f(t*t)}`, v);
    } else if (missing === 't' && h > 0 && g > 0) {
      const v = Math.sqrt((2 * h) / g);
      result.value = steps('t', `√(2h/g) = √(2·${f(h)}/${f(g)})`, v);
    } else if (missing === 'h' && g > 0 && t > 0) {
      const v = 0.5 * g * t * t;
      result.value = steps('h', `½gt² = ½·${f(g)}·${f(t*t)}`, v);
    } else result.value = 'أدخل قيم صحيحة للمتغيرات المعروفة';
  }
  // === Inclined Plane ===
  else if (eq.formula.includes('a = g·sinθ − μ·g·cosθ')) {
    const a = vals['a'] ?? 0; const g = vals['g'] ?? 0; const theta = (vals['θ'] ?? 0) * Math.PI / 180; const mu = vals['μ'] ?? 0;
    if (missing === 'a' && g > 0) {
      const v = g * Math.sin(theta) - mu * g * Math.cos(theta);
      result.value = steps('a', `g·sinθ−μ·g·cosθ = ${f(g)}·${f(Math.sin(theta))}−${f(mu)}·${f(g)}·${f(Math.cos(theta))}`, v);
    } else if (missing === 'μ' && g > 0 && Math.cos(theta) > 1e-6) {
      const v = (g * Math.sin(theta) - a) / (g * Math.cos(theta));
      result.value = steps('μ', `(g·sinθ−a)/(g·cosθ)`, v);
    } else result.value = 'أدخل قيم صحيحة';
  }
  else if (eq.formula.includes('s = ½at²')) {
    const s = vals['s'] ?? 0; const a = vals['a'] ?? 0; const t = vals['t'] ?? 0;
    if (missing === 'a' && s > 0 && t > 0) {
      const v = (2 * s) / (t * t);
      result.value = steps('a', `2s/t² = 2·${f(s)}/${f(t*t)}`, v);
    } else if (missing === 't' && s > 0 && a > 0) {
      const v = Math.sqrt((2 * s) / a);
      result.value = steps('t', `√(2s/a) = √(2·${f(s)}/${f(a)})`, v);
    } else if (missing === 's' && a > 0 && t > 0) {
      const v = 0.5 * a * t * t;
      result.value = steps('s', `½at² = ½·${f(a)}·${f(t*t)}`, v);
    } else result.value = 'أدخل قيم صحيحة';
  }
  // === Collision ===
  else if (eq.formula.includes('m₁v₁i + m₂v₂i = m₁v₁f + m₂v₂f')) {
    const m1 = vals['m1'] ?? 0; const m2 = vals['m2'] ?? 0;
    const v1i = vals['v1i'] ?? 0; const v2i = vals['v2i'] ?? 0;
    const v1f = vals['v1f'] ?? 0; const v2f = vals['v2f'] ?? 0;
    if (missing === 'v1f') {
      const v = (m1 * v1i + m2 * v2i - m2 * v2f) / m1;
      result.value = steps('v₁f', `(m₁v₁i+m₂v₂i−m₂v₂f)/m₁`, v);
    } else if (missing === 'v2f') {
      const v = (m1 * v1i + m2 * v2i - m1 * v1f) / m2;
      result.value = steps('v₂f', `(m₁v₁i+m₂v₂i−m₁v₁f)/m₂`, v);
    } else result.value = 'أدخل قيم صحيحة';
  }
  else if (eq.formula.includes('e = (v₂f − v₁f)/(v₁i − v₂i)')) {
    const v1i = vals['v1i'] ?? 0; const v2i = vals['v2i'] ?? 0; const v1f = vals['v1f'] ?? 0; const v2f = vals['v2f'] ?? 0;
    if (missing === 'e' && Math.abs(v1i - v2i) > 1e-6) {
      const v = (v2f - v1f) / (v1i - v2i);
      result.value = steps('e', `(v₂f−v₁f)/(v₁i−v₂i)`, v);
    } else result.value = 'أدخل قيم صحيحة';
  }
  // === Projectile ===
  else if (eq.formula.includes('R = v₀²·sin(2θ)/g')) {
    const v0 = vals['v0'] ?? 0; const theta = (vals['θ'] ?? 0) * Math.PI / 180; const g = vals['g'] ?? 0; const R = vals['R'] ?? 0;
    if (missing === 'R' && v0 > 0 && g > 0) {
      const v = (v0 * v0 * Math.sin(2 * theta)) / g;
      result.value = steps('R', `v₀²·sin(2θ)/g`, v);
    } else if (missing === 'v0' && R > 0 && g > 0 && Math.sin(2*theta) > 1e-6) {
      const v = Math.sqrt((R * g) / Math.sin(2 * theta));
      result.value = steps('v₀', `√(R·g/sin(2θ))`, v);
    } else if (missing === 'θ' && R > 0 && v0 > 0 && g > 0) {
      const v = Math.asin((R * g) / (v0 * v0)) / 2 * 180 / Math.PI;
      result.value = steps('θ', `½·arcsin(R·g/v₀²)`, v);
    } else result.value = 'أدخل قيم صحيحة';
  }
  else if (eq.formula.includes('H = v₀²·sin²(θ)/(2g)')) {
    const v0 = vals['v0'] ?? 0; const theta = (vals['θ'] ?? 0) * Math.PI / 180; const g = vals['g'] ?? 0;
    if (missing === 'H' && v0 > 0 && g > 0) {
      const v = (v0 * v0 * Math.sin(theta) * Math.sin(theta)) / (2 * g);
      result.value = steps('H', `v₀²·sin²(θ)/(2g)`, v);
    } else result.value = 'أدخل قيم صحيحة';
  }
  else {
    result.value = `حساب ${missing} من المعادلة ${eq.formula}`;
  }
}

// Auto-solve when enough inputs are filled
watch([varValues, targetVar], () => {
  const eq = activeEquation.value;
  if (!eq || !targetVar.value) return;
  const known = eq.variables.filter(v => varValues.value[v.symbol] !== undefined && varValues.value[v.symbol] !== 0).length;
  const total = eq.variables.length;
  // Auto-solve if all but one variable is known
  if (known >= total - 1) solve();
}, { deep: true });
</script>

<template>
  <div class="equations-panel">
    <div class="panel-header">⚗️ المعادلات</div>

    <div v-if="equations.length" class="body">
      <div class="eq-list">
        <button
          v-for="(eq, i) in equations"
          :key="i"
          class="eq-tab"
          :class="{ active: i === selectedIndex }"
          @click="selectedIndex = i"
        >
          {{ eq.name }}
        </button>
      </div>

      <div v-if="activeEquation" class="eq-detail">
        <div class="formula">{{ activeEquation.formula }}</div>

        <div class="vars">
          <div v-for="v in activeEquation.variables" :key="v.symbol" class="var-row">
            <label>{{ v.label }} ({{ v.symbol }})</label>
            <input
              type="number"
              step="any"
              v-model.number="varValues[v.symbol]"
            />
          </div>
        </div>

        <div class="solve-row">
          <label>احسب:</label>
          <select v-model="targetVar">
            <option v-for="s in activeEquation.solveFor" :key="s" :value="s">{{ s }}</option>
          </select>
          <button class="btn-solve" @click="solve">= احسب</button>
        </div>

        <div v-if="result" class="result">
          <div class="result-label">✅ الناتج</div>
          <div class="result-value">{{ result }}</div>
        </div>
      </div>
    </div>
    <p v-else class="empty">لا توجد معادلات</p>
  </div>
</template>

<style scoped>
.equations-panel {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 0.5rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.panel-header {
  padding: 0.6rem 0.9rem;
  background: rgba(255,255,255,0.04);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  font-size: 0.95rem;
  color: #67e8f9;
  font-weight: 700;
}
.body { padding: 0.6rem; display: flex; flex-direction: column; gap: 0.5rem; }
.eq-list { display: flex; gap: 0.4rem; flex-wrap: wrap; }
.eq-tab {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  color: #94a3b8;
  border-radius: 0.35rem;
  padding: 0.3rem 0.6rem;
  font-size: 0.85rem;
  cursor: pointer;
}
.eq-tab.active { background: rgba(6,182,212,0.15); color: #67e8f9; border-color: rgba(6,182,212,0.3); }
.formula {
  font-family: 'Courier New', monospace;
  background: rgba(0,0,0,0.2);
  padding: 0.5rem 0.7rem;
  border-radius: 0.3rem;
  color: #e2e8f0;
  font-size: 0.95rem;
  text-align: center;
  font-weight: 600;
}
.vars { display: flex; flex-direction: column; gap: 0.4rem; }
.var-row { display: flex; align-items: center; gap: 0.5rem; }
.var-row label { font-size: 0.85rem; color: #94a3b8; min-width: 90px; font-weight: 600; }
.var-row input {
  flex: 1;
  background: #0f172a;
  border: 1px solid #334155;
  color: #e2e8f0;
  border-radius: 0.25rem;
  padding: 0.35rem 0.5rem;
  font-size: 0.9rem;
}
.solve-row { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.3rem; }
.solve-row label { font-size: 0.85rem; color: #94a3b8; font-weight: 600; }
select {
  background: #0f172a;
  border: 1px solid #334155;
  color: #e2e8f0;
  border-radius: 0.25rem;
  padding: 0.3rem 0.5rem;
  font-size: 0.85rem;
}
.btn-solve {
  background: linear-gradient(135deg, #06b6d4, #0891b2);
  border: none;
  color: #fff;
  border-radius: 0.3rem;
  padding: 0.35rem 0.7rem;
  font-size: 0.85rem;
  cursor: pointer;
  font-weight: 700;
}
.result {
  background: rgba(34,197,94,0.08);
  border: 1px solid rgba(34,197,94,0.2);
  border-radius: 0.3rem;
  padding: 0.5rem 0.7rem;
  margin-top: 0.3rem;
  text-align: center;
}
.result-label { font-size: 0.8rem; color: #4ade80; margin-bottom: 0.25rem; font-weight: 700; }
.result-value { color: #e2e8f0; font-size: 0.9rem; font-family: 'Courier New', monospace; font-weight: 700; }
.empty { color: #64748b; text-align: center; padding: 1rem; font-size: 0.9rem; }
</style>
