import type { WorkshopComponent } from '../shared/types'

export interface ACExplainCtx {
  V: number
  f: number
  omega: number
  resistors: WorkshopComponent[]
  inductors: WorkshopComponent[]
  capacitors: WorkshopComponent[]
  transformers: WorkshopComponent[]
}

export function explainACRL(ctx: ACExplainCtx): string {
  const { V, f, omega, resistors, inductors } = ctx
  const R = resistors[0]?.value ?? 100
  const L = (inductors[0]?.value ?? 100) / 1000
  const XL = omega * L
  const Z = Math.sqrt(R * R + XL * XL)
  const I = V / Z
  const phi = Math.atan2(XL, R) * 180 / Math.PI
  const VR = I * R
  const VL = I * XL
  return `
      <h3>RL Series Circuit</h3>
      <div class="ce-section">
        <h4>1) Given</h4>
        <ul>
          <li>V = ${V} V (AC source)</li>
          <li>f = ${f} Hz</li>
          <li>R = ${R} Ω</li>
          <li>L = ${inductors[0]?.value ?? 100} mH</li>
        </ul>
      </div>
      <div class="ce-section">
        <h4>2) Inductive Reactance</h4>
        <div class="ce-formula">X<sub>L</sub> = 2πfL</div>
        <div class="ce-calc">X<sub>L</sub> = 2π × ${f} × ${(L).toFixed(3)} = ${XL.toFixed(2)} Ω</div>
      </div>
      <div class="ce-section">
        <h4>3) Impedance</h4>
        <div class="ce-formula">Z = √(R² + X<sub>L</sub>²)</div>
        <div class="ce-calc">Z = √(${R}² + ${XL.toFixed(2)}²) = ${Z.toFixed(2)} Ω</div>
      </div>
      <div class="ce-section">
        <h4>4) Current</h4>
        <div class="ce-formula">I = V / Z</div>
        <div class="ce-calc">I = ${V} / ${Z.toFixed(2)} = ${I.toFixed(4)} A</div>
      </div>
      <div class="ce-section">
        <h4>5) Phase Angle</h4>
        <div class="ce-formula">φ = arctan(X<sub>L</sub> / R)</div>
        <div class="ce-calc">φ = arctan(${XL.toFixed(2)} / ${R}) = ${phi.toFixed(2)}°</div>
        <div class="ce-note">Current lags voltage by ${phi.toFixed(2)}°</div>
      </div>
      <div class="ce-section">
        <h4>6) Voltage Drops</h4>
        <div class="ce-calc">V<sub>R</sub> = I × R = ${I.toFixed(4)} × ${R} = ${VR.toFixed(2)} V</div>
        <div class="ce-calc">V<sub>L</sub> = I × X<sub>L</sub> = ${I.toFixed(4)} × ${XL.toFixed(2)} = ${VL.toFixed(2)} V</div>
      </div>
      <div class="ce-section ce-summary">
        <h4>✅ Final Result</h4>
        <ul>
          <li>Z = ${Z.toFixed(2)} Ω</li>
          <li>I = ${I.toFixed(4)} A</li>
          <li>φ = ${phi.toFixed(2)}° (current lags)</li>
          <li>V<sub>R</sub> = ${VR.toFixed(2)} V | V<sub>L</sub> = ${VL.toFixed(2)} V</li>
        </ul>
      </div>
    `
}

export function explainACRC(ctx: ACExplainCtx): string {
  const { V, f, omega, resistors, capacitors } = ctx
  const R = resistors[0]?.value ?? 100
  const C = (capacitors[0]?.value ?? 100) * 1e-6
  const XC = 1 / (omega * C)
  const Z = Math.sqrt(R * R + XC * XC)
  const I = V / Z
  const phi = Math.atan2(-XC, R) * 180 / Math.PI
  const VR = I * R
  const VC = I * XC
  return `
      <h3>RC Series Circuit</h3>
      <div class="ce-section">
        <h4>1) Given</h4>
        <ul>
          <li>V = ${V} V (AC source)</li>
          <li>f = ${f} Hz</li>
          <li>R = ${R} Ω</li>
          <li>C = ${capacitors[0]?.value ?? 100} µF</li>
        </ul>
      </div>
      <div class="ce-section">
        <h4>2) Capacitive Reactance</h4>
        <div class="ce-formula">X<sub>C</sub> = 1 / (2πfC)</div>
        <div class="ce-calc">X<sub>C</sub> = 1 / (2π × ${f} × ${(C * 1e6).toFixed(2)}µF) = ${XC.toFixed(2)} Ω</div>
      </div>
      <div class="ce-section">
        <h4>3) Impedance</h4>
        <div class="ce-formula">Z = √(R² + X<sub>C</sub>²)</div>
        <div class="ce-calc">Z = √(${R}² + ${XC.toFixed(2)}²) = ${Z.toFixed(2)} Ω</div>
      </div>
      <div class="ce-section">
        <h4>4) Current</h4>
        <div class="ce-formula">I = V / Z</div>
        <div class="ce-calc">I = ${V} / ${Z.toFixed(2)} = ${I.toFixed(4)} A</div>
      </div>
      <div class="ce-section">
        <h4>5) Phase Angle</h4>
        <div class="ce-formula">φ = arctan(-X<sub>C</sub> / R)</div>
        <div class="ce-calc">φ = ${phi.toFixed(2)}°</div>
        <div class="ce-note">Current leads voltage by ${Math.abs(phi).toFixed(2)}°</div>
      </div>
      <div class="ce-section">
        <h4>6) Voltage Drops</h4>
        <div class="ce-calc">V<sub>R</sub> = I × R = ${I.toFixed(4)} × ${R} = ${VR.toFixed(2)} V</div>
        <div class="ce-calc">V<sub>C</sub> = I × X<sub>C</sub> = ${I.toFixed(4)} × ${XC.toFixed(2)} = ${VC.toFixed(2)} V</div>
      </div>
      <div class="ce-section ce-summary">
        <h4>✅ Final Result</h4>
        <ul>
          <li>Z = ${Z.toFixed(2)} Ω</li>
          <li>I = ${I.toFixed(4)} A</li>
          <li>φ = ${phi.toFixed(2)}° (current leads)</li>
          <li>V<sub>R</sub> = ${VR.toFixed(2)} V | V<sub>C</sub> = ${VC.toFixed(2)} V</li>
        </ul>
      </div>
    `
}
