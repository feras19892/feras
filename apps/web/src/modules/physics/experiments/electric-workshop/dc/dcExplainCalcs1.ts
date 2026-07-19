import type { WorkshopComponent } from '../shared/types'

export interface ExplainCtx {
  t: (key: string, params?: Record<string, string>) => string
  V: number
  I: number
  P: number
  comps: WorkshopComponent[]
  resistors: WorkshopComponent[]
  batteries: WorkshopComponent[]
  ammeters: WorkshopComponent[]
  voltmeters: WorkshopComponent[]
}

export function explainOhm(ctx: ExplainCtx): string {
  const { t, V, I } = ctx
  const R = ctx.resistors[0]?.value ?? 0
  const Icalc = R > 0 ? V / R : 0
  const Vr = Icalc * R
  const Pcalc = Vr * Icalc
  return `
      <h3>${t('ew.calc.ohmTitle')}</h3>
      <div class="ce-section">
        <h4>1) ${t('ew.calc.given')}</h4>
        <ul>
          <li>${t('ew.calc.batteryVoltage', { V: String(V) })}</li>
          <li>${t('ew.calc.resistance', { R: String(R) })}</li>
        </ul>
      </div>
      <div class="ce-section">
        <h4>2) ${t('ew.calc.calcTotalCurrent')}</h4>
        <div class="ce-formula">I = V / R</div>
        <div class="ce-calc">I = ${V} / ${R} = ${Icalc.toFixed(4)} A</div>
      </div>
      <div class="ce-section">
        <h4>3) ${t('ew.calc.calcVoltageAcrossR')}</h4>
        <div class="ce-formula">V<sub>R1</sub> = I × R₁</div>
        <div class="ce-calc">V<sub>R1</sub> = ${Icalc.toFixed(4)} × ${R} = ${Vr.toFixed(4)} V</div>
        <div class="ce-note">${t('ew.calc.voltageEqualsBattery')}</div>
      </div>
      <div class="ce-section">
        <h4>4) ${t('ew.calc.calcPower')}</h4>
        <div class="ce-formula">P = V × I = I² × R</div>
        <div class="ce-calc">P = ${Vr.toFixed(4)} × ${Icalc.toFixed(4)} = ${Pcalc.toFixed(4)} W</div>
        <div class="ce-calc">P = ${Icalc.toFixed(4)}² × ${R} = ${Pcalc.toFixed(4)} W</div>
      </div>
      <div class="ce-section">
        <h4>5) ${t('ew.calc.meterReadings')}</h4>
        <ul>
          <li>${t('ew.calc.ammeterReads', { I: Icalc.toFixed(4) })}</li>
          <li>${t('ew.calc.voltmeterReads', { V: Vr.toFixed(4) })}</li>
        </ul>
      </div>
      <div class="ce-section ce-summary">
        <h4>✅ ${t('ew.calc.finalResult')}</h4>
        <ul>
          <li>${t('ew.calc.totalCurrent', { I: Icalc.toFixed(4) })}</li>
          <li>${t('ew.calc.voltageR1', { V: Vr.toFixed(4) })}</li>
          <li>${t('ew.calc.power', { P: Pcalc.toFixed(4) })}</li>
        </ul>
      </div>
      <div class="ce-section">
        <h4>📟 ${t('ew.calc.meterReadings')}</h4>
        <ul>
          <li>${t('ew.calc.ammeterReads', { I: I.toFixed(4) })} (solver)</li>
        </ul>
      </div>
    `
}

export function explainSeries(ctx: ExplainCtx): string {
  const { t, V } = ctx
  const R1 = ctx.resistors[0]?.value ?? 0
  const R2 = ctx.resistors[1]?.value ?? 0
  const Rtotal = R1 + R2
  const Icalc = V / Rtotal
  const V1 = Icalc * R1
  const V2 = Icalc * R2
  const P1 = V1 * Icalc
  const P2 = V2 * Icalc
  const Ptotal = P1 + P2
  return `
      <h3>${t('ew.calc.seriesTitle')}</h3>
      <div class="ce-section">
        <h4>1) ${t('ew.calc.given')}</h4>
        <ul>
          <li>${t('ew.calc.batteryVoltage', { V: String(V) })}</li>
          <li>${t('ew.calc.resistor1', { R: String(R1) })}</li>
          <li>${t('ew.calc.resistor2', { R: String(R2) })}</li>
        </ul>
      </div>
      <div class="ce-section">
        <h4>2) ${t('ew.calc.calcEqResistance')}</h4>
        <div class="ce-formula">R<sub>eq</sub> = R₁ + R₂</div>
        <div class="ce-calc">R<sub>eq</sub> = ${R1} + ${R2} = ${Rtotal} Ω</div>
        <div class="ce-note">${t('ew.calc.seriesAddNote')}</div>
      </div>
      <div class="ce-section">
        <h4>3) ${t('ew.calc.calcTotalCurrentSeries')}</h4>
        <div class="ce-formula">I = V / R<sub>eq</sub></div>
        <div class="ce-calc">I = ${V} / ${Rtotal} = ${Icalc.toFixed(4)} A</div>
        <div class="ce-note">${t('ew.calc.seriesSameCurrentNote')}</div>
      </div>
      <div class="ce-section">
        <h4>4) ${t('ew.calc.calcVoltageEach')}</h4>
        <div class="ce-formula">V<sub>n</sub> = I × R<sub>n</sub></div>
        <div class="ce-calc">V<sub>R1</sub> = ${Icalc.toFixed(4)} × ${R1} = ${V1.toFixed(4)} V</div>
        <div class="ce-calc">V<sub>R2</sub> = ${Icalc.toFixed(4)} × ${R2} = ${V2.toFixed(4)} V</div>
        <div class="ce-note">${t('ew.calc.verifySum', { Sum: (V1+V2).toFixed(4), V: String(V) })}</div>
      </div>
      <div class="ce-section">
        <h4>5) ${t('ew.calc.calcPowerEach')}</h4>
        <div class="ce-formula">P<sub>n</sub> = V<sub>n</sub> × I = I² × R<sub>n</sub></div>
        <div class="ce-calc">P<sub>R1</sub> = ${V1.toFixed(4)} × ${Icalc.toFixed(4)} = ${P1.toFixed(4)} W</div>
        <div class="ce-calc">P<sub>R2</sub> = ${V2.toFixed(4)} × ${Icalc.toFixed(4)} = ${P2.toFixed(4)} W</div>
        <div class="ce-calc">P<sub>total</sub> = ${P1.toFixed(4)} + ${P2.toFixed(4)} = ${Ptotal.toFixed(4)} W</div>
      </div>
      <div class="ce-section">
        <h4>6) ${t('ew.calc.meterReadings')}</h4>
        <ul>
          <li>${t('ew.calc.ammeter1', { I: Icalc.toFixed(4) })}</li>
          <li>${t('ew.calc.ammeterSameCurrent', { I: Icalc.toFixed(4) })}</li>
          <li>${t('ew.calc.voltmeter1R1', { V: V1.toFixed(4) })}</li>
          <li>${t('ew.calc.voltmeter2R2', { V: V2.toFixed(4) })}</li>
        </ul>
      </div>
      <div class="ce-section ce-summary">
        <h4>✅ ${t('ew.calc.finalResult')}</h4>
        <ul>
          <li>${t('ew.calc.eqResistance', { R: String(Rtotal) })}</li>
          <li>${t('ew.calc.totalCurrent', { I: Icalc.toFixed(4) })}</li>
          <li>${t('ew.calc.voltageR1Short', { V: V1.toFixed(4) })}</li>
          <li>${t('ew.calc.voltageR2Short', { V: V2.toFixed(4) })}</li>
          <li>${t('ew.calc.totalPower', { P: Ptotal.toFixed(4) })}</li>
        </ul>
      </div>
    `
}

export function explainParallel(ctx: ExplainCtx): string {
  const { t, V } = ctx
  const R1 = ctx.resistors[0]?.value ?? 0
  const R2 = ctx.resistors[1]?.value ?? 0
  const Vr = V
  const I1 = Vr / R1
  const I2 = Vr / R2
  const Itotal = I1 + I2
  const Req = (R1 * R2) / (R1 + R2)
  const P1 = Vr * I1
  const P2 = Vr * I2
  const Ptotal = P1 + P2
  return `
      <h3>${t('ew.calc.parallelTitle')}</h3>
      <div class="ce-section">
        <h4>1) ${t('ew.calc.given')}</h4>
        <ul>
          <li>${t('ew.calc.batteryVoltage', { V: String(V) })}</li>
          <li>${t('ew.calc.resistor1', { R: String(R1) })}</li>
          <li>${t('ew.calc.resistor2', { R: String(R2) })}</li>
        </ul>
      </div>
      <div class="ce-section">
        <h4>2) ${t('ew.calc.calcVoltageEach')}</h4>
        <div class="ce-note">${t('ew.calc.parallelVoltageNote')}</div>
        <div class="ce-calc">V<sub>R1</sub> = V<sub>R2</sub> = V = ${Vr} V</div>
      </div>
      <div class="ce-section">
        <h4>3) ${t('ew.calc.calcCurrentEachBranch')}</h4>
        <div class="ce-formula">I<sub>n</sub> = V / R<sub>n</sub></div>
        <div class="ce-calc">I<sub>1</sub> = ${Vr} / ${R1} = ${I1.toFixed(4)} A</div>
        <div class="ce-calc">I<sub>2</sub> = ${Vr} / ${R2} = ${I2.toFixed(4)} A</div>
      </div>
      <div class="ce-section">
        <h4>4) ${t('ew.calc.calcTotalCurrentParallel')}</h4>
        <div class="ce-formula">I<sub>total</sub> = I₁ + I₂</div>
        <div class="ce-calc">I<sub>total</sub> = ${I1.toFixed(4)} + ${I2.toFixed(4)} = ${Itotal.toFixed(4)} A</div>
      </div>
      <div class="ce-section">
        <h4>5) ${t('ew.calc.calcEqResistanceParallel')}</h4>
        <div class="ce-formula">1/R<sub>eq</sub> = 1/R₁ + 1/R₂ &nbsp; ⇒ &nbsp; R<sub>eq</sub> = (R₁ × R₂) / (R₁ + R₂)</div>
        <div class="ce-calc">R<sub>eq</sub> = (${R1} × ${R2}) / (${R1} + ${R2}) = ${Req.toFixed(4)} Ω</div>
        <div class="ce-note">${t('ew.calc.verifyTotalCurrent', { V: String(Vr), Req: Req.toFixed(4), I: (Vr/Req).toFixed(4) })}</div>
      </div>
      <div class="ce-section">
        <h4>6) ${t('ew.calc.calcPowerParallel')}</h4>
        <div class="ce-formula">P<sub>n</sub> = V × I<sub>n</sub> = V² / R<sub>n</sub></div>
        <div class="ce-calc">P<sub>1</sub> = ${Vr}² / ${R1} = ${P1.toFixed(4)} W</div>
        <div class="ce-calc">P<sub>2</sub> = ${Vr}² / ${R2} = ${P2.toFixed(4)} W</div>
        <div class="ce-calc">P<sub>total</sub> = ${P1.toFixed(4)} + ${P2.toFixed(4)} = ${Ptotal.toFixed(4)} W</div>
      </div>
      <div class="ce-section">
        <h4>7) ${t('ew.calc.meterReadings')}</h4>
        <ul>
          <li>${t('ew.calc.ammeterMain', { I: Itotal.toFixed(4) })}</li>
          <li>${t('ew.calc.ammeterBranch1', { I: I1.toFixed(4) })}</li>
          <li>${t('ew.calc.ammeterBranch2', { I: I2.toFixed(4) })}</li>
          <li>${t('ew.calc.voltmeterShared', { V: Vr.toFixed(4) })}</li>
        </ul>
      </div>
      <div class="ce-section ce-summary">
        <h4>✅ ${t('ew.calc.finalResult')}</h4>
        <ul>
          <li>${t('ew.calc.eqResistance', { R: Req.toFixed(4) })}</li>
          <li>${t('ew.calc.totalCurrent', { I: Itotal.toFixed(4) })}</li>
          <li>${t('ew.calc.currentR1R2', { I1: I1.toFixed(4), I2: I2.toFixed(4) })}</li>
          <li>${t('ew.calc.voltageShared', { V: String(Vr) })}</li>
          <li>${t('ew.calc.totalPower', { P: Ptotal.toFixed(4) })}</li>
        </ul>
      </div>
    `
}
