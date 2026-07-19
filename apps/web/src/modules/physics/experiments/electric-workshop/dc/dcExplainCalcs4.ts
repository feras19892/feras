import type { ExplainCtx } from './dcExplainCalcs1'

export function explainRlTransient(ctx: ExplainCtx): string {
  const { t, V } = ctx
  const R = ctx.resistors[0]?.value ?? 100
  const ind = ctx.comps.find(c => c.type === 'inductor')
  const L = (ind?.value ?? 100) * 1e-3
  const tau = L / R
  const Imax = V / R
  const I_1tau = Imax * (1 - Math.exp(-1))
  const I_3tau = Imax * (1 - Math.exp(-3))
  const I_5tau = Imax * (1 - Math.exp(-5))
  return `
      <h3>${t('ew.exp.rl_transient')}</h3>
      <div class="ce-section">
        <h4>📋 ${t('ew.calc.given')}</h4>
        <ul>
          <li>${t('ew.calc.batteryVoltage', { V: String(V) })}</li>
          <li>${t('ew.calc.resistance', { R: String(R) })}</li>
          <li>L = ${(L * 1000).toFixed(0)} mH</li>
        </ul>
      </div>
      <div class="ce-section">
        <h4>📐 ${t('ew.calc.law')}</h4>
        <div class="ce-formula">τ = L / R (time constant)</div>
        <div class="ce-formula">I(t) = (V/R)(1 − e<sup>−t/τ</sup>)</div>
        <div class="ce-formula">V<sub>L</sub>(t) = V × e<sup>−t/τ</sup></div>
      </div>
      <div class="ce-section">
        <h4>🧮 ${t('ew.calc.calculations')}</h4>
        <div class="ce-calc">τ = L/R = ${(L * 1000).toFixed(0)}×10⁻³/${R} = ${tau.toFixed(6)} s = ${(tau * 1000).toFixed(2)} ms</div>
        <div class="ce-calc">I_max = V/R = ${V}/${R} = ${Imax.toFixed(4)} A</div>
        <div class="ce-calc">I(τ) = ${Imax.toFixed(4)}×(1−e⁻¹) = ${I_1tau.toFixed(4)} A (63.2%)</div>
        <div class="ce-calc">I(3τ) = ${I_3tau.toFixed(4)} A (95.0%)</div>
        <div class="ce-calc">I(5τ) = ${I_5tau.toFixed(4)} A (99.3%) — steady state</div>
      </div>
      <div class="ce-section ce-summary">
        <h4>✅ ${t('ew.calc.finalResult')}</h4>
        <ul>
          <li>τ = ${(tau * 1000).toFixed(2)} ms</li>
          <li>I_max = ${Imax.toFixed(4)} A</li>
          <li>V<sub>L</sub>(∞) = 0 V (inductor acts as wire at steady state)</li>
        </ul>
      </div>
    `
}

export function explainWheatstone(ctx: ExplainCtx): string {
  const { t, V } = ctx
  const R1 = ctx.resistors[0]?.value ?? 0
  const R2 = ctx.resistors[1]?.value ?? 0
  const R3 = ctx.resistors[2]?.value ?? 0
  const R4 = ctx.resistors[3]?.value ?? 0
  const balanced = R1 * R4 === R2 * R3
  const ratio = R2 > 0 ? R1 / R2 : 0
  const Rx = R3 > 0 ? ratio * R3 : 0
  const Vbridge = R1 + R2 > 0 ? V * (R2 / (R1 + R2) - R4 / (R3 + R4)) : 0
  return `
      <h3>${t('ew.exp.wheatstone')}</h3>
      <div class="ce-section">
        <h4>📋 ${t('ew.calc.given')}</h4>
        <ul>
          <li>${t('ew.calc.batteryVoltage', { V: String(V) })}</li>
          <li>R₁ = ${R1} Ω, R₂ = ${R2} Ω, R₃ = ${R3} Ω, R₄ = ${R4} Ω</li>
        </ul>
      </div>
      <div class="ce-section">
        <h4>📐 ${t('ew.calc.law')}</h4>
        <div class="ce-formula">Bridge balanced when: R₁ × R₄ = R₂ × R₃</div>
        <div class="ce-formula">V_bridge = V × (R₂/(R₁+R₂) − R₄/(R₃+R₄))</div>
      </div>
      <div class="ce-section">
        <h4>🧮 ${t('ew.calc.calculations')}</h4>
        <div class="ce-calc">R₁ × R₄ = ${R1} × ${R4} = ${R1 * R4}</div>
        <div class="ce-calc">R₂ × R₃ = ${R2} × ${R3} = ${R2 * R3}</div>
        <div class="ce-calc">V_bridge = ${V} × (${R2}/(${R1}+${R2}) − ${R4}/(${R3}+${R4})) = ${Vbridge.toFixed(6)} V</div>
        <div class="ce-note">${balanced ? '✅ Bridge is BALANCED — V_bridge = 0' : '⚠️ Bridge is UNBALANCED — V_bridge ≠ 0'}</div>
      </div>
      <div class="ce-section ce-summary">
        <h4>✅ ${t('ew.calc.finalResult')}</h4>
        <ul>
          <li>${balanced ? 'Bridge balanced: R₁R₄ = R₂R₃' : 'Bridge unbalanced: V_bridge = ' + Vbridge.toFixed(6) + ' V'}</li>
          <li>Ratio R₁/R₂ = ${ratio.toFixed(4)}</li>
          <li>Rx (if R₃ unknown) = R₂×R₃/R₁ = ${Rx.toFixed(2)} Ω</li>
        </ul>
      </div>
    `
}

export function explainThevenin(ctx: ExplainCtx): string {
  const { t, V } = ctx
  const R1 = ctx.resistors[0]?.value ?? 0
  const R2 = ctx.resistors[1]?.value ?? 0
  const Vth = V * R2 / (R1 + R2)
  const Rth = (R1 * R2) / (R1 + R2)
  return `
      <h3>${t('ew.exp.thevenin')}</h3>
      <div class="ce-section">
        <h4>📋 ${t('ew.calc.given')}</h4>
        <ul>
          <li>${t('ew.calc.batteryVoltage', { V: String(V) })}</li>
          <li>R₁ = ${R1} Ω (series), R₂ = ${R2} Ω (parallel to load)</li>
        </ul>
      </div>
      <div class="ce-section">
        <h4>📐 ${t('ew.calc.law')}</h4>
        <div class="ce-formula">V<sub>th</sub> = V × R₂ / (R₁ + R₂) (open-circuit voltage)</div>
        <div class="ce-formula">R<sub>th</sub> = R₁ ∥ R₂ = (R₁ × R₂)/(R₁ + R₂) (with source shorted)</div>
      </div>
      <div class="ce-section">
        <h4>🧮 ${t('ew.calc.calculations')}</h4>
        <div class="ce-calc">V<sub>th</sub> = ${V} × ${R2} / (${R1} + ${R2}) = ${Vth.toFixed(4)} V</div>
        <div class="ce-calc">R<sub>th</sub> = (${R1} × ${R2})/(${R1} + ${R2}) = ${Rth.toFixed(4)} Ω</div>
      </div>
      <div class="ce-section ce-summary">
        <h4>✅ ${t('ew.calc.finalResult')}</h4>
        <ul>
          <li>V<sub>th</sub> = ${Vth.toFixed(4)} V</li>
          <li>R<sub>th</sub> = ${Rth.toFixed(4)} Ω</li>
          <li>Equivalent: V<sub>th</sub> in series with R<sub>th</sub></li>
        </ul>
      </div>
    `
}

export function explainSuperposition(ctx: ExplainCtx): string {
  const { t } = ctx
  const batteries = ctx.batteries
  const V1 = batteries[0]?.value ?? 0
  const V2 = batteries[1]?.value ?? 0
  const R = ctx.resistors[0]?.value ?? 100
  const I1 = V1 / R
  const I2 = V2 / R
  const Itotal = I1 + I2
  return `
      <h3>${t('ew.exp.superposition')}</h3>
      <div class="ce-section">
        <h4>📋 ${t('ew.calc.given')}</h4>
        <ul>
          <li>V₁ = ${V1} V, V₂ = ${V2} V</li>
          <li>${t('ew.calc.resistance', { R: String(R) })}</li>
        </ul>
      </div>
      <div class="ce-section">
        <h4>📐 ${t('ew.calc.law')}</h4>
        <div class="ce-formula">I_total = I₁ (from V₁ only) + I₂ (from V₂ only)</div>
      </div>
      <div class="ce-section">
        <h4>🧮 ${t('ew.calc.calculations')}</h4>
        <div class="ce-calc">I₁ = V₁/R = ${V1}/${R} = ${I1.toFixed(4)} A (V₂ shorted)</div>
        <div class="ce-calc">I₂ = V₂/R = ${V2}/${R} = ${I2.toFixed(4)} A (V₁ shorted)</div>
        <div class="ce-calc">I_total = I₁ + I₂ = ${I1.toFixed(4)} + ${I2.toFixed(4)} = ${Itotal.toFixed(4)} A</div>
      </div>
      <div class="ce-section ce-summary">
        <h4>✅ ${t('ew.calc.finalResult')}</h4>
        <ul>
          <li>I₁ = ${I1.toFixed(4)} A</li>
          <li>I₂ = ${I2.toFixed(4)} A</li>
          <li>I_total = ${Itotal.toFixed(4)} A</li>
        </ul>
      </div>
    `
}

export function explainMaxPower(ctx: ExplainCtx): string {
  const { t, V } = ctx
  const R1 = ctx.resistors[0]?.value ?? 0
  const R2 = ctx.resistors[1]?.value ?? 0
  const Vth = R1 + R2 > 0 ? V * R2 / (R1 + R2) : 0
  const Rth = R1 + R2 > 0 ? (R1 * R2) / (R1 + R2) : 0
  const RL = Rth
  const Imax = Vth / (Rth + RL)
  const Pmax = Imax * Imax * RL
  return `
      <h3>${t('ew.exp.maxpower')}</h3>
      <div class="ce-section">
        <h4>📋 ${t('ew.calc.given')}</h4>
        <ul>
          <li>${t('ew.calc.batteryVoltage', { V: String(V) })}</li>
          <li>R₁ = ${R1} Ω, R₂ = ${R2} Ω</li>
        </ul>
      </div>
      <div class="ce-section">
        <h4>📐 ${t('ew.calc.law')}</h4>
        <div class="ce-formula">Maximum power transfer when R<sub>L</sub> = R<sub>th</sub></div>
        <div class="ce-formula">P_max = V<sub>th</sub>² / (4 × R<sub>th</sub>)</div>
      </div>
      <div class="ce-section">
        <h4>🧮 ${t('ew.calc.calculations')}</h4>
        <div class="ce-calc">V<sub>th</sub> = ${V} × ${R2}/(${R1}+${R2}) = ${Vth.toFixed(4)} V</div>
        <div class="ce-calc">R<sub>th</sub> = (${R1}×${R2})/(${R1}+${R2}) = ${Rth.toFixed(4)} Ω</div>
        <div class="ce-calc">R<sub>L</sub> = R<sub>th</sub> = ${RL.toFixed(4)} Ω (for max power)</div>
        <div class="ce-calc">I = V<sub>th</sub>/(R<sub>th</sub>+R<sub>L</sub>) = ${Vth.toFixed(4)}/${(Rth + RL).toFixed(4)} = ${Imax.toFixed(4)} A</div>
        <div class="ce-calc">P_max = I² × R<sub>L</sub> = ${Imax.toFixed(4)}² × ${RL.toFixed(4)} = ${Pmax.toFixed(4)} W</div>
      </div>
      <div class="ce-section ce-summary">
        <h4>✅ ${t('ew.calc.finalResult')}</h4>
        <ul>
          <li>R<sub>L</sub> = ${RL.toFixed(4)} Ω (for maximum power)</li>
          <li>P_max = ${Pmax.toFixed(4)} W</li>
          <li>Efficiency at max power = 50%</li>
        </ul>
      </div>
    `
}
