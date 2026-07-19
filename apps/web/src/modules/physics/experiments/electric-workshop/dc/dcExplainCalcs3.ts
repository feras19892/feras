import type { ExplainCtx } from './dcExplainCalcs1'

export function explainCdivider(ctx: ExplainCtx): string {
  const { t, V, I } = ctx
  const R1 = ctx.resistors[0]?.value ?? 0
  const R2 = ctx.resistors[1]?.value ?? 0
  const R3 = ctx.resistors[2]?.value ?? 0
  const Rparallel = (R2 * R3) / (R2 + R3)
  const Rtotal = R1 + Rparallel
  const Itotal = V / Rtotal
  const Vparallel = Itotal * Rparallel
  const I2 = Vparallel / R2
  const I3 = Vparallel / R3
  return `
      <h3>${t('ew.calc.cdividerTitle')}</h3>
      <div class="ce-section">
        <h4>📋 ${t('ew.calc.given')}</h4>
        <ul>
          <li>${t('ew.calc.batteryVoltage', { V: String(V) })}</li>
          <li>${t('ew.calc.cdividerConnection', { R1: String(R1), R2: String(R2), R3: String(R3) })}</li>
        </ul>
      </div>
      <div class="ce-section">
        <h4>📐 ${t('ew.calc.law')}</h4>
        <div class="ce-formula">I_R₂ = I_total × R₃ / (R₂ + R₃)</div>
        <div class="ce-formula">I_R₃ = I_total × R₂ / (R₂ + R₃)</div>
        <div class="ce-note">${t('ew.calc.cdividerLaw')}</div>
      </div>
      <div class="ce-section">
        <h4>🧮 ${t('ew.calc.calculations')}</h4>
        <div class="ce-calc">R_parallel = (R₂ × R₃)/(R₂ + R₃) = (${R2} × ${R3})/(${R2}+${R3}) = ${Rparallel.toFixed(4)} Ω</div>
        <div class="ce-calc">R_total = R₁ + R_parallel = ${R1} + ${Rparallel.toFixed(4)} = ${Rtotal.toFixed(4)} Ω</div>
        <div class="ce-calc">I_total = V / R_total = ${V} / ${Rtotal.toFixed(4)} = ${Itotal.toFixed(4)} A</div>
        <div class="ce-calc">V_parallel = I_total × R_parallel = ${Itotal.toFixed(4)} × ${Rparallel.toFixed(4)} = ${Vparallel.toFixed(4)} V</div>
        <div class="ce-calc">I_R₂ = V_parallel / R₂ = ${Vparallel.toFixed(4)} / ${R2} = ${I2.toFixed(4)} A</div>
        <div class="ce-calc">I_R₃ = V_parallel / R₃ = ${Vparallel.toFixed(4)} / ${R3} = ${I3.toFixed(4)} A</div>
        <div class="ce-calc">I_R₂ = I_total × R₃/(R₂+R₃) = ${Itotal.toFixed(4)} × ${R3}/${R2+R3} = ${(Itotal*R3/(R2+R3)).toFixed(4)} A</div>
        <div class="ce-note">${t('ew.calc.verifyCdivider', { I2: I2.toFixed(4), I3: I3.toFixed(4), Sum: (I2+I3).toFixed(4) })}</div>
      </div>
      <div class="ce-section">
        <h4>📟 ${t('ew.calc.meterReadings')}</h4>
        <ul>
          <li>${t('ew.calc.ammeterMainCdivider', { I: I.toFixed(4) })}</li>
          <li>${t('ew.calc.cdividerAmmeterR2', { I: I2.toFixed(4) })}</li>
          <li>${t('ew.calc.cdividerAmmeterR3', { I: I3.toFixed(4) })}</li>
          <li>${t('ew.calc.voltmeterAcrossParallelCdivider', { V: Vparallel.toFixed(4) })}</li>
        </ul>
      </div>
      <div class="ce-section ce-summary">
        <h4>✅ ${t('ew.calc.finalResult')}</h4>
        <ul>
          <li>${t('ew.calc.totalCurrent', { I: Itotal.toFixed(4) })}</li>
          <li>I_R₂ = ${I2.toFixed(4)} A | I_R₃ = ${I3.toFixed(4)} A</li>
          <li>${t('ew.calc.verifyCdividerShort', { Sum: (I2+I3).toFixed(4) })}</li>
        </ul>
      </div>
    `
}

export function explainBseries(ctx: ExplainCtx): string {
  const { t, I } = ctx
  const batteries = ctx.comps.filter(c => c.type === 'battery')
  const V1 = batteries[0]?.value ?? 0
  const V2 = batteries[1]?.value ?? 0
  const Vtotal = V1 + V2
  const R = ctx.resistors[0]?.value ?? 0
  const Icalc = Vtotal / R
  const Vr = Icalc * R
  return `
      <h3>${t('ew.calc.bseriesTitle')}</h3>
      <div class="ce-section">
        <h4>📋 ${t('ew.calc.given')}</h4>
        <ul>
          <li>${t('ew.calc.battery1', { V: String(V1) })}</li>
          <li>${t('ew.calc.battery2', { V: String(V2) })}</li>
          <li>${t('ew.calc.loadResistance', { R: String(R) })}</li>
          <li>${t('ew.calc.bseriesConnection')}</li>
        </ul>
      </div>
      <div class="ce-section">
        <h4>📐 ${t('ew.calc.law')}</h4>
        <div class="ce-formula">V_total = V₁ + V₂ (same polarity)</div>
        <div class="ce-note">${t('ew.calc.bseriesReverseNote')}</div>
      </div>
      <div class="ce-section">
        <h4>🧮 ${t('ew.calc.calculations')}</h4>
        <div class="ce-calc">V_total = V₁ + V₂ = ${V1} + ${V2} = ${Vtotal} V</div>
        <div class="ce-calc">I = V_total / R = ${Vtotal} / ${R} = ${Icalc.toFixed(4)} A</div>
        <div class="ce-calc">V_R = I × R = ${Icalc.toFixed(4)} × ${R} = ${Vr.toFixed(4)} V</div>
        <div class="ce-note">${t('ew.calc.verifyBseries', { Vr: Vr.toFixed(4), Vtotal: String(Vtotal) })}</div>
      </div>
      <div class="ce-section">
        <h4>📟 ${t('ew.calc.meterReadings')}</h4>
        <ul>
          <li>${t('ew.calc.ammeterReading', { I: I.toFixed(4) })}</li>
          <li>${t('ew.calc.voltmeterAcrossBatteries', { V: Vtotal.toFixed(4) })}</li>
          <li>${t('ew.calc.voltmeterAcrossLoad', { V: Vr.toFixed(4) })}</li>
        </ul>
      </div>
      <div class="ce-section ce-summary">
        <h4>✅ ${t('ew.calc.finalResult')}</h4>
        <ul>
          <li>${t('ew.calc.totalVoltageBseries', { Vtotal: String(Vtotal), V1: String(V1), V2: String(V2) })}</li>
          <li>${t('ew.calc.current', { I: Icalc.toFixed(4) })}</li>
          <li>${t('ew.calc.powerBseries', { P: (Vtotal * Icalc).toFixed(4) })}</li>
        </ul>
      </div>
      <div class="ce-section" style="border-color: rgba(239,68,68,0.3); background: rgba(239,68,68,0.05)">
        <h4 style="color: #fca5a5">⚠️ ${t('ew.calc.warningsTitle')}</h4>
        <ul>
          <li>${t('ew.calc.warningBseries1')}</li>
          <li>${t('ew.calc.warningBseries2')}</li>
          <li>${t('ew.calc.warningBseries3')}</li>
        </ul>
      </div>
    `
}

export function explainBparallel(ctx: ExplainCtx): string {
  const { t, I } = ctx
  const batteries = ctx.comps.filter(c => c.type === 'battery')
  const V1 = batteries[0]?.value ?? 0
  const V2 = batteries[1]?.value ?? 0
  const Vtotal = Math.max(V1, V2)
  const R = ctx.resistors[0]?.value ?? 0
  const Icalc = Vtotal / R
  const IperBat = Icalc / batteries.length
  return `
      <h3>${t('ew.calc.bparallelTitle')}</h3>
      <div class="ce-section">
        <h4>📋 ${t('ew.calc.given')}</h4>
        <ul>
          <li>${t('ew.calc.battery1', { V: String(V1) })}</li>
          <li>${t('ew.calc.battery2', { V: String(V2) })}</li>
          <li>${t('ew.calc.loadResistance', { R: String(R) })}</li>
          <li>${t('ew.calc.bparallelConnection')}</li>
        </ul>
      </div>
      <div class="ce-section">
        <h4>📐 ${t('ew.calc.law')}</h4>
        <div class="ce-formula">V_total = V₁ = V₂ (must be equal)</div>
        <div class="ce-note">${t('ew.calc.bparallelCurrentNote')}</div>
      </div>
      <div class="ce-section">
        <h4>🧮 ${t('ew.calc.calculations')}</h4>
        <div class="ce-calc">V_total = ${Vtotal} V (same voltage per battery)</div>
        <div class="ce-calc">I_total = V_total / R = ${Vtotal} / ${R} = ${Icalc.toFixed(4)} A</div>
        <div class="ce-calc">I_per_battery = I_total / 2 = ${Icalc.toFixed(4)} / 2 = ${IperBat.toFixed(4)} A</div>
        <div class="ce-note">${t('ew.calc.bparallelHalfCurrent')}</div>
      </div>
      <div class="ce-section">
        <h4>📟 ${t('ew.calc.meterReadings')}</h4>
        <ul>
          <li>${t('ew.calc.ammeterMain', { I: I.toFixed(4) })}</li>
          <li>${t('ew.calc.voltmeterReading', { V: Vtotal.toFixed(4) })}</li>
        </ul>
      </div>
      <div class="ce-section ce-summary">
        <h4>✅ ${t('ew.calc.finalResult')}</h4>
        <ul>
          <li>${t('ew.calc.voltageFixed', { V: String(Vtotal) })}</li>
          <li>${t('ew.calc.totalCurrent', { I: Icalc.toFixed(4) })}</li>
          <li>${t('ew.calc.currentPerBattery', { I: IperBat.toFixed(4) })}</li>
        </ul>
      </div>
      <div class="ce-section" style="border-color: rgba(239,68,68,0.3); background: rgba(239,68,68,0.05)">
        <h4 style="color: #fca5a5">⚠️ ${t('ew.calc.warningsTitle')}</h4>
        <ul>
          <li>${t('ew.calc.warningBparallel1')}</li>
          <li>${t('ew.calc.warningBparallel2')}</li>
          <li>${t('ew.calc.warningBparallel3')}</li>
          <li>${t('ew.calc.warningBparallel4')}</li>
        </ul>
      </div>
    `
}

export function explainRelay(ctx: ExplainCtx): string {
  const { t } = ctx
  const relays = ctx.comps.filter(c => c.type === 'relay')
  const relay = relays[0]
  const coilCurrent = relay ? Math.abs(relay.current * 1000).toFixed(2) : '0'
  const threshold = relay ? relay.value : 10
  const isEnergized = relay ? relay.relayState : false
  const lamps = ctx.comps.filter(c => c.type === 'lamp')
  const lamp = lamps[0]
  const lampPower = lamp ? Math.abs(lamp.voltage * lamp.current).toFixed(4) : '0'
  const lampBrightness = lamp ? Math.min(1, Math.abs(lamp.voltage * lamp.current) / 10).toFixed(2) : '0'
  return `
      <h3>${t('ew.calc.relayTitle')}</h3>
      <div class="ce-section">
        <h4>📋 ${t('ew.calc.given')}</h4>
        <ul>
          <li>${t('ew.calc.relayCoilVoltage', { V: '12' })}</li>
          <li>${t('ew.calc.relayCoilResistance', { R: '100' })}</li>
          <li>${t('ew.calc.relayThreshold', { I: String(threshold) })}</li>
          <li>${t('ew.calc.relayLampRating', { V: '6' })}</li>
        </ul>
      </div>
      <div class="ce-section">
        <h4>📐 ${t('ew.calc.law')}</h4>
        <div class="ce-formula">I_coil = V_coil / R_coil = 12 / 100 = 0.12 A = 120 mA</div>
        <div class="ce-formula">If I_coil > threshold (${threshold} mA) → Relay energizes → COM↔NO</div>
        <div class="ce-note">${t('ew.calc.relayNote')}</div>
      </div>
      <div class="ce-section">
        <h4>🧮 ${t('ew.calc.calculations')}</h4>
        <div class="ce-calc">I_coil = 12V / 100Ω = 0.12A = 120 mA</div>
        <div class="ce-calc">120 mA > ${threshold} mA → Relay ${isEnergized ? 'ENERGIZED' : 'DE-ENERGIZED'}</div>
        <div class="ce-calc">${isEnergized ? 'COM↔NO connected → Lamp circuit closed' : 'COM↔NC connected → Lamp circuit open'}</div>
        <div class="ce-calc">Lamp power = ${lampPower} W (brightness: ${lampBrightness})</div>
      </div>
      <div class="ce-section">
        <h4>📟 ${t('ew.calc.meterReadings')}</h4>
        <ul>
          <li>${t('ew.calc.relayCoilCurrent', { I: coilCurrent })}</li>
          <li>${t('ew.calc.relayState', { state: isEnergized ? 'ENERGIZED (COM↔NO)' : 'DE-ENERGIZED (COM↔NC)' })}</li>
          <li>${t('ew.calc.lampPower', { P: lampPower })}</li>
        </ul>
      </div>
      <div class="ce-section ce-summary">
        <h4>✅ ${t('ew.calc.finalResult')}</h4>
        <ul>
          <li>${t('ew.calc.relayCoilCurrent', { I: coilCurrent })}</li>
          <li>${isEnergized ? '✅ Lamp ON — relay energized, COM↔NO closed' : '❌ Lamp OFF — relay de-energized, COM↔NC'}</li>
        </ul>
      </div>
    `
}

export function explainRcCharge(ctx: ExplainCtx): string {
  const { t, V } = ctx
  const R = ctx.resistors[0]?.value ?? 100
  const cap = ctx.comps.find(c => c.type === 'capacitor')
  const C = (cap?.value ?? 100) * 1e-6
  const tau = R * C
  const Imax = V / R
  const Vc_1tau = V * (1 - Math.exp(-1))
  const Vc_2tau = V * (1 - Math.exp(-2))
  const Vc_3tau = V * (1 - Math.exp(-3))
  const Vc_5tau = V * (1 - Math.exp(-5))
  return `
      <h3>${t('ew.exp.rc_charge')}</h3>
      <div class="ce-section">
        <h4>📋 ${t('ew.calc.given')}</h4>
        <ul>
          <li>${t('ew.calc.batteryVoltage', { V: String(V) })}</li>
          <li>${t('ew.calc.resistance', { R: String(R) })}</li>
          <li>C = ${(C * 1e6).toFixed(0)} µF</li>
        </ul>
      </div>
      <div class="ce-section">
        <h4>📐 ${t('ew.calc.law')}</h4>
        <div class="ce-formula">τ = R × C (time constant)</div>
        <div class="ce-formula">V<sub>C</sub>(t) = V₀(1 − e<sup>−t/τ</sup>)</div>
        <div class="ce-formula">I(t) = (V₀/R) × e<sup>−t/τ</sup></div>
      </div>
      <div class="ce-section">
        <h4>🧮 ${t('ew.calc.calculations')}</h4>
        <div class="ce-calc">τ = R × C = ${R} × ${(C * 1e6).toFixed(0)}×10⁻⁶ = ${tau.toFixed(6)} s = ${(tau * 1000).toFixed(2)} ms</div>
        <div class="ce-calc">I_max = V/R = ${V}/${R} = ${Imax.toFixed(4)} A</div>
        <div class="ce-calc">V<sub>C</sub>(τ) = ${V}×(1−e⁻¹) = ${Vc_1tau.toFixed(4)} V (63.2%)</div>
        <div class="ce-calc">V<sub>C</sub>(2τ) = ${Vc_2tau.toFixed(4)} V (86.5%)</div>
        <div class="ce-calc">V<sub>C</sub>(3τ) = ${Vc_3tau.toFixed(4)} V (95.0%)</div>
        <div class="ce-calc">V<sub>C</sub>(5τ) = ${Vc_5tau.toFixed(4)} V (99.3%) — fully charged</div>
      </div>
      <div class="ce-section ce-summary">
        <h4>✅ ${t('ew.calc.finalResult')}</h4>
        <ul>
          <li>τ = ${(tau * 1000).toFixed(2)} ms</li>
          <li>I_max = ${Imax.toFixed(4)} A</li>
          <li>V<sub>C</sub>(∞) = ${V} V</li>
        </ul>
      </div>
    `
}

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
