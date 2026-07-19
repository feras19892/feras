import type { ExplainCtx } from './dcExplainCalcs1'

export function explainMixed(ctx: ExplainCtx): string {
  const { t, V } = ctx
  const R1 = ctx.resistors[0]?.value ?? 0
  const R2 = ctx.resistors[1]?.value ?? 0
  const R3 = ctx.resistors[2]?.value ?? 0
  const R4 = ctx.resistors[3]?.value ?? 0
  const Rparallel = (R3 * R4) / (R3 + R4)
  const Rseries = R1 + R2
  const Rtotal = Rseries + Rparallel
  const Icalc = V / Rtotal
  const V1 = Icalc * R1
  const V2 = Icalc * R2
  const Vparallel = Icalc * Rparallel
  const I3 = Vparallel / R3
  const I4 = Vparallel / R4
  const P1 = V1 * Icalc
  const P2 = V2 * Icalc
  const P3 = Vparallel * I3
  const P4 = Vparallel * I4
  const Ptotal = P1 + P2 + P3 + P4
  return `
      <h3>${t('ew.calc.mixedTitle')}</h3>
      <div class="ce-section">
        <h4>1) ${t('ew.calc.given')}</h4>
        <ul>
          <li>${t('ew.calc.batteryVoltage', { V: String(V) })}</li>
          <li>${t('ew.calc.resistorSeries', { R: String(R1) })}</li>
          <li>${t('ew.calc.resistorSeries2', { R: String(R2) })}</li>
          <li>${t('ew.calc.resistorParallel', { R: String(R3) })}</li>
          <li>${t('ew.calc.resistorParallel2', { R: String(R4) })}</li>
        </ul>
        <div class="ce-note">${t('ew.calc.mixedArrangement')}</div>
      </div>
      <div class="ce-section">
        <h4>2) ${t('ew.calc.calcEqParallel')}</h4>
        <div class="ce-formula">R<sub>p</sub> = (R₃ × R₄) / (R₃ + R₄)</div>
        <div class="ce-calc">R<sub>p</sub> = (${R3} × ${R4}) / (${R3} + ${R4}) = ${Rparallel.toFixed(4)} Ω</div>
      </div>
      <div class="ce-section">
        <h4>3) ${t('ew.calc.calcEqTotal')}</h4>
        <div class="ce-formula">R<sub>total</sub> = R₁ + R₂ + R<sub>p</sub></div>
        <div class="ce-calc">R<sub>total</sub> = ${R1} + ${R2} + ${Rparallel.toFixed(4)} = ${Rtotal.toFixed(4)} Ω</div>
        <div class="ce-note">${t('ew.calc.seriesPlusParallelNote')}</div>
      </div>
      <div class="ce-section">
        <h4>4) ${t('ew.calc.calcTotalCurrentSeries')}</h4>
        <div class="ce-formula">I = V / R<sub>total</sub></div>
        <div class="ce-calc">I = ${V} / ${Rtotal.toFixed(4)} = ${Icalc.toFixed(4)} A</div>
        <div class="ce-note">${t('ew.calc.currentThroughSeriesNote')}</div>
      </div>
      <div class="ce-section">
        <h4>5) ${t('ew.calc.calcVoltageR1R2')}</h4>
        <div class="ce-formula">V<sub>n</sub> = I × R<sub>n</sub></div>
        <div class="ce-calc">V<sub>R1</sub> = ${Icalc.toFixed(4)} × ${R1} = ${V1.toFixed(4)} V</div>
        <div class="ce-calc">V<sub>R2</sub> = ${Icalc.toFixed(4)} × ${R2} = ${V2.toFixed(4)} V</div>
      </div>
      <div class="ce-section">
        <h4>6) ${t('ew.calc.calcVoltageParallel')}</h4>
        <div class="ce-formula">V<sub>p</sub> = I × R<sub>p</sub></div>
        <div class="ce-calc">V<sub>p</sub> = ${Icalc.toFixed(4)} × ${Rparallel.toFixed(4)} = ${Vparallel.toFixed(4)} V</div>
        <div class="ce-note">${t('ew.calc.verifyVoltageSum', { Sum: (V1+V2+Vparallel).toFixed(4), V: String(V) })}</div>
      </div>
      <div class="ce-section">
        <h4>7) ${t('ew.calc.calcCurrentBranches')}</h4>
        <div class="ce-formula">I<sub>n</sub> = V<sub>p</sub> / R<sub>n</sub></div>
        <div class="ce-calc">I<sub>3</sub> = ${Vparallel.toFixed(4)} / ${R3} = ${I3.toFixed(4)} A</div>
        <div class="ce-calc">I<sub>4</sub> = ${Vparallel.toFixed(4)} / ${R4} = ${I4.toFixed(4)} A</div>
        <div class="ce-note">${t('ew.calc.verifyCurrentSum', { Sum: (I3+I4).toFixed(4), I: Icalc.toFixed(4) })}</div>
      </div>
      <div class="ce-section">
        <h4>8) ${t('ew.calc.calcPowerMixed')}</h4>
        <div class="ce-formula">P<sub>n</sub> = V<sub>n</sub> × I<sub>n</sub></div>
        <div class="ce-calc">P<sub>R1</sub> = ${V1.toFixed(4)} × ${Icalc.toFixed(4)} = ${P1.toFixed(4)} W</div>
        <div class="ce-calc">P<sub>R2</sub> = ${V2.toFixed(4)} × ${Icalc.toFixed(4)} = ${P2.toFixed(4)} W</div>
        <div class="ce-calc">P<sub>R3</sub> = ${Vparallel.toFixed(4)} × ${I3.toFixed(4)} = ${P3.toFixed(4)} W</div>
        <div class="ce-calc">P<sub>R4</sub> = ${Vparallel.toFixed(4)} × ${I4.toFixed(4)} = ${P4.toFixed(4)} W</div>
        <div class="ce-calc">P<sub>total</sub> = ${P1.toFixed(4)} + ${P2.toFixed(4)} + ${P3.toFixed(4)} + ${P4.toFixed(4)} = ${Ptotal.toFixed(4)} W</div>
      </div>
      <div class="ce-section">
        <h4>9) ${t('ew.calc.meterReadings')}</h4>
        <ul>
          <li>${t('ew.calc.ammeterMainMixed', { I: Icalc.toFixed(4) })}</li>
          <li>${t('ew.calc.ammeterBetweenR1R2', { I: Icalc.toFixed(4) })}</li>
          <li>${t('ew.calc.ammeterBranchR3', { I: I3.toFixed(4) })}</li>
          <li>${t('ew.calc.ammeterBranchR4', { I: I4.toFixed(4) })}</li>
          <li>${t('ew.calc.voltmeterAcrossR1', { V: V1.toFixed(4) })}</li>
          <li>${t('ew.calc.voltmeterAcrossR2', { V: V2.toFixed(4) })}</li>
          <li>${t('ew.calc.voltmeterAcrossParallel', { V: Vparallel.toFixed(4) })}</li>
        </ul>
      </div>
      <div class="ce-section ce-summary">
        <h4>✅ ${t('ew.calc.finalResult')}</h4>
        <ul>
          <li>${t('ew.calc.eqResistance', { R: Rtotal.toFixed(4) })}</li>
          <li>${t('ew.calc.totalCurrent', { I: Icalc.toFixed(4) })}</li>
          <li>${t('ew.calc.voltageAll', { V1: V1.toFixed(4), V2: V2.toFixed(4), Vp: Vparallel.toFixed(4) })}</li>
          <li>${t('ew.calc.currentR3R4', { I3: I3.toFixed(4), I4: I4.toFixed(4) })}</li>
          <li>${t('ew.calc.totalPower', { P: Ptotal.toFixed(4) })}</li>
        </ul>
      </div>
    `
}

export function explainKvl(ctx: ExplainCtx): string {
  const { t, V, I } = ctx
  const R1 = ctx.resistors[0]?.value ?? 0
  const R2 = ctx.resistors[1]?.value ?? 0
  const R3 = ctx.resistors[2]?.value ?? 0
  const Rtotal = R1 + R2 + R3
  const Icalc = V / Rtotal
  const V1 = Icalc * R1
  const V2 = Icalc * R2
  const V3 = Icalc * R3
  const Vsum = V1 + V2 + V3
  return `
      <h3>${t('ew.calc.kvlTitle')}</h3>
      <div class="ce-section">
        <h4>📋 ${t('ew.calc.given')}</h4>
        <ul>
          <li>${t('ew.calc.batteryVoltage', { V: String(V) })}</li>
          <li>R₁ = ${R1} Ω | R₂ = ${R2} Ω | R₃ = ${R3} Ω</li>
          <li>${t('ew.calc.kvlConnection')}</li>
        </ul>
      </div>
      <div class="ce-section">
        <h4>📐 ${t('ew.calc.law')}</h4>
        <div class="ce-formula">KVL: ΣV = 0 → V_battery = V₁ + V₂ + V₃</div>
        <div class="ce-note">${t('ew.calc.kvlLaw')}</div>
      </div>
      <div class="ce-section">
        <h4>🧮 ${t('ew.calc.calculations')}</h4>
        <div class="ce-calc">R_total = R₁ + R₂ + R₃ = ${R1} + ${R2} + ${R3} = ${Rtotal} Ω</div>
        <div class="ce-calc">I = V / R_total = ${V} / ${Rtotal} = ${Icalc.toFixed(4)} A</div>
        <div class="ce-calc">V₁ = I × R₁ = ${Icalc.toFixed(4)} × ${R1} = ${V1.toFixed(4)} V</div>
        <div class="ce-calc">V₂ = I × R₂ = ${Icalc.toFixed(4)} × ${R2} = ${V2.toFixed(4)} V</div>
        <div class="ce-calc">V₃ = I × R₃ = ${Icalc.toFixed(4)} × ${R3} = ${V3.toFixed(4)} V</div>
        <div class="ce-calc">V₁ + V₂ + V₃ = ${V1.toFixed(4)} + ${V2.toFixed(4)} + ${V3.toFixed(4)} = ${Vsum.toFixed(4)} V</div>
        <div class="ce-note">${t('ew.calc.verifyKvl', { Sum: Vsum.toFixed(4), V: String(V) })}</div>
      </div>
      <div class="ce-section">
        <h4>📟 ${t('ew.calc.meterReadings')}</h4>
        <ul>
          <li>${t('ew.calc.ammeterReading', { I: I.toFixed(4) })}</li>
          <li>${t('ew.calc.voltmeterAcrossR1Short', { V: V1.toFixed(4) })}</li>
          <li>${t('ew.calc.voltmeterAcrossR2Short', { V: V2.toFixed(4) })}</li>
          <li>${t('ew.calc.voltmeterAcrossR3Short', { V: V3.toFixed(4) })}</li>
        </ul>
      </div>
      <div class="ce-section ce-summary">
        <h4>✅ ${t('ew.calc.finalResult')}</h4>
        <ul>
          <li>${t('ew.calc.totalResistance', { R: String(Rtotal) })}</li>
          <li>${t('ew.calc.current', { I: Icalc.toFixed(4) })}</li>
          <li>V₁ = ${V1.toFixed(4)} V | V₂ = ${V2.toFixed(4)} V | V₃ = ${V3.toFixed(4)} V</li>
          <li>${t('ew.calc.verifyKvlShort', { Sum: Vsum.toFixed(4), V: String(V) })}</li>
        </ul>
      </div>
    `
}

export function explainKcl(ctx: ExplainCtx): string {
  const { t, V, I } = ctx
  const R1 = ctx.resistors[0]?.value ?? 0
  const R2 = ctx.resistors[1]?.value ?? 0
  const R3 = ctx.resistors[2]?.value ?? 0
  const I1 = V / R1
  const I2 = V / R2
  const I3 = V / R3
  const Itotal = I1 + I2 + I3
  return `
      <h3>${t('ew.calc.kclTitle')}</h3>
      <div class="ce-section">
        <h4>📋 ${t('ew.calc.given')}</h4>
        <ul>
          <li>${t('ew.calc.batteryVoltage', { V: String(V) })}</li>
          <li>${t('ew.calc.resistorsParallel3', { R1: String(R1), R2: String(R2), R3: String(R3) })}</li>
        </ul>
      </div>
      <div class="ce-section">
        <h4>📐 ${t('ew.calc.law')}</h4>
        <div class="ce-formula">KCL: ΣI = 0 → I_in = I_out</div>
        <div class="ce-note">${t('ew.calc.kclLaw')}</div>
      </div>
      <div class="ce-section">
        <h4>🧮 ${t('ew.calc.calculations')}</h4>
        <div class="ce-calc">I₁ = V / R₁ = ${V} / ${R1} = ${I1.toFixed(4)} A</div>
        <div class="ce-calc">I₂ = V / R₂ = ${V} / ${R2} = ${I2.toFixed(4)} A</div>
        <div class="ce-calc">I₃ = V / R₃ = ${V} / ${R3} = ${I3.toFixed(4)} A</div>
        <div class="ce-calc">I_total = I₁ + I₂ + I₃ = ${I1.toFixed(4)} + ${I2.toFixed(4)} + ${I3.toFixed(4)} = ${Itotal.toFixed(4)} A</div>
        <div class="ce-note">${t('ew.calc.verifyKcl')}</div>
      </div>
      <div class="ce-section">
        <h4>📟 ${t('ew.calc.meterReadings')}</h4>
        <ul>
          <li>${t('ew.calc.ammeterMain', { I: I.toFixed(4) })}</li>
          <li>${t('ew.calc.ammeter1R1', { I: I1.toFixed(4) })}</li>
          <li>${t('ew.calc.ammeter2R2', { I: I2.toFixed(4) })}</li>
          <li>${t('ew.calc.ammeter3R3', { I: I3.toFixed(4) })}</li>
          <li>${t('ew.calc.voltmeterSharedKcl', { V: String(V) })}</li>
        </ul>
      </div>
      <div class="ce-section ce-summary">
        <h4>✅ ${t('ew.calc.finalResult')}</h4>
        <ul>
          <li>I₁ = ${I1.toFixed(4)} A | I₂ = ${I2.toFixed(4)} A | I₃ = ${I3.toFixed(4)} A</li>
          <li>${t('ew.calc.totalCurrent', { I: Itotal.toFixed(4) })}</li>
          <li>${t('ew.calc.verifyKclShort', { Sum: Itotal.toFixed(4) })}</li>
        </ul>
      </div>
    `
}

export function explainVdivider(ctx: ExplainCtx): string {
  const { t, V, I } = ctx
  const R1 = ctx.resistors[0]?.value ?? 0
  const R2 = ctx.resistors[1]?.value ?? 0
  const Rtotal = R1 + R2
  const Icalc = V / Rtotal
  const V1 = Icalc * R1
  const Vout = Icalc * R2
  return `
      <h3>${t('ew.calc.vdividerTitle')}</h3>
      <div class="ce-section">
        <h4>📋 ${t('ew.calc.given')}</h4>
        <ul>
          <li>${t('ew.calc.vdividerInputVoltage', { V: String(V) })}</li>
          <li>${t('ew.calc.vdividerSeriesNote', { R1: String(R1), R2: String(R2) })}</li>
        </ul>
      </div>
      <div class="ce-section">
        <h4>📐 ${t('ew.calc.law')}</h4>
        <div class="ce-formula">V_out = V_in × R₂ / (R₁ + R₂)</div>
        <div class="ce-note">${t('ew.calc.vdividerLaw')}</div>
      </div>
      <div class="ce-section">
        <h4>🧮 ${t('ew.calc.calculations')}</h4>
        <div class="ce-calc">R_total = R₁ + R₂ = ${R1} + ${R2} = ${Rtotal} Ω</div>
        <div class="ce-calc">I = V_in / R_total = ${V} / ${Rtotal} = ${Icalc.toFixed(4)} A</div>
        <div class="ce-calc">V₁ = I × R₁ = ${Icalc.toFixed(4)} × ${R1} = ${V1.toFixed(4)} V</div>
        <div class="ce-calc">V_out = I × R₂ = ${Icalc.toFixed(4)} × ${R2} = ${Vout.toFixed(4)} V</div>
        <div class="ce-calc">V_out = V_in × R₂/(R₁+R₂) = ${V} × ${R2}/${Rtotal} = ${Vout.toFixed(4)} V</div>
        <div class="ce-note">${t('ew.calc.verifyVdivider', { V1: V1.toFixed(4), Vout: Vout.toFixed(4), Sum: (V1+Vout).toFixed(4), V: String(V) })}</div>
      </div>
      <div class="ce-section">
        <h4>📟 ${t('ew.calc.meterReadings')}</h4>
        <ul>
          <li>${t('ew.calc.ammeterReading', { I: I.toFixed(4) })}</li>
          <li>${t('ew.calc.voltmeterAcrossR1Short', { V: V1.toFixed(4) })}</li>
          <li>${t('ew.calc.voltmeterVout', { V: Vout.toFixed(4) })}</li>
        </ul>
      </div>
      <div class="ce-section ce-summary">
        <h4>✅ ${t('ew.calc.finalResult')}</h4>
        <ul>
          <li>${t('ew.calc.outputVoltage', { V: Vout.toFixed(4) })}</li>
          <li>${t('ew.calc.divisionRatio', { R2: String(R2), Rtotal: String(Rtotal), Pct: (R2/Rtotal*100).toFixed(1) })}</li>
          <li>${t('ew.calc.current', { I: Icalc.toFixed(4) })}</li>
        </ul>
      </div>
    `
}
