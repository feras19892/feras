import type { ACExplainCtx } from './acExplainCalcs1'

export function explainACRLC(ctx: ACExplainCtx): string {
  const { V, f, omega, resistors, inductors, capacitors } = ctx
  const R = resistors[0]?.value ?? 100
  const L = (inductors[0]?.value ?? 100) / 1000
  const C = (capacitors[0]?.value ?? 100) * 1e-6
  const XL = omega * L
  const XC = 1 / (omega * C)
  const X = XL - XC
  const Z = Math.sqrt(R * R + X * X)
  const I = V / Z
  const phi = Math.atan2(X, R) * 180 / Math.PI
  return `
      <h3>RLC Series Circuit</h3>
      <div class="ce-section">
        <h4>1) Given</h4>
        <ul>
          <li>V = ${V} V (AC source)</li>
          <li>f = ${f} Hz</li>
          <li>R = ${R} Ω</li>
          <li>L = ${inductors[0]?.value ?? 100} mH</li>
          <li>C = ${capacitors[0]?.value ?? 100} µF</li>
        </ul>
      </div>
      <div class="ce-section">
        <h4>2) Reactances</h4>
        <div class="ce-calc">X<sub>L</sub> = 2πfL = ${XL.toFixed(2)} Ω</div>
        <div class="ce-calc">X<sub>C</sub> = 1/(2πfC) = ${XC.toFixed(2)} Ω</div>
        <div class="ce-calc">X = X<sub>L</sub> - X<sub>C</sub> = ${X.toFixed(2)} Ω</div>
      </div>
      <div class="ce-section">
        <h4>3) Impedance</h4>
        <div class="ce-formula">Z = √(R² + (X<sub>L</sub> - X<sub>C</sub>)²)</div>
        <div class="ce-calc">Z = √(${R}² + ${X.toFixed(2)}²) = ${Z.toFixed(2)} Ω</div>
      </div>
      <div class="ce-section">
        <h4>4) Current & Phase</h4>
        <div class="ce-calc">I = V / Z = ${V} / ${Z.toFixed(2)} = ${I.toFixed(4)} A</div>
        <div class="ce-calc">φ = arctan(X / R) = ${phi.toFixed(2)}°</div>
        <div class="ce-note">${X > 0 ? 'Current lags (inductive)' : X < 0 ? 'Current leads (capacitive)' : 'Resonance! (φ = 0)'}</div>
      </div>
      <div class="ce-section ce-summary">
        <h4>✅ Final Result</h4>
        <ul>
          <li>Z = ${Z.toFixed(2)} Ω</li>
          <li>I = ${I.toFixed(4)} A</li>
          <li>φ = ${phi.toFixed(2)}°</li>
          <li>${X > 0 ? 'Inductive behavior' : X < 0 ? 'Capacitive behavior' : 'At resonance!'}</li>
        </ul>
      </div>
    `
}

export function explainACTransformer(ctx: ACExplainCtx): string {
  const { V, transformers } = ctx
  const ratio = transformers[0]?.value ?? 2
  const Vp = V
  const Vs = Vp / ratio
  return `
      <h3>Transformer Circuit</h3>
      <div class="ce-section">
        <h4>1) Given</h4>
        <ul>
          <li>V<sub>p</sub> = ${Vp} V (primary)</li>
          <li>Turns ratio = ${ratio} : 1</li>
        </ul>
      </div>
      <div class="ce-section">
        <h4>2) Secondary Voltage</h4>
        <div class="ce-formula">V<sub>s</sub> = V<sub>p</sub> / ratio</div>
        <div class="ce-calc">V<sub>s</sub> = ${Vp} / ${ratio} = ${Vs.toFixed(2)} V</div>
      </div>
      <div class="ce-section ce-summary">
        <h4>✅ Final Result</h4>
        <ul>
          <li>V<sub>p</sub> = ${Vp} V</li>
          <li>V<sub>s</sub> = ${Vs.toFixed(2)} V</li>
          <li>Ratio = ${ratio}:1 (step-${ratio > 1 ? 'down' : 'up'})</li>
        </ul>
      </div>
    `
}

export function explainACFilter(ctx: ACExplainCtx): string {
  const { V, f, omega, resistors, capacitors } = ctx
  const R = resistors[0]?.value ?? 100
  const C = (capacitors[0]?.value ?? 100) * 1e-6
  const fc = 1 / (2 * Math.PI * R * C)
  const XC = 1 / (omega * C)
  const Z = Math.sqrt(R * R + XC * XC)
  const Vout = V * XC / Z
  return `
      <h3>Low-Pass Filter (RC)</h3>
      <div class="ce-section">
        <h4>1) Given</h4>
        <ul>
          <li>V<sub>in</sub> = ${V} V</li>
          <li>f = ${f} Hz</li>
          <li>R = ${R} Ω</li>
          <li>C = ${capacitors[0]?.value ?? 100} µF</li>
        </ul>
      </div>
      <div class="ce-section">
        <h4>2) Cutoff Frequency</h4>
        <div class="ce-formula">f<sub>c</sub> = 1 / (2πRC)</div>
        <div class="ce-calc">f<sub>c</sub> = 1 / (2π × ${R} × ${(C * 1e6).toFixed(2)}µF) = ${fc.toFixed(2)} Hz</div>
      </div>
      <div class="ce-section">
        <h4>3) Output Voltage</h4>
        <div class="ce-formula">V<sub>out</sub> = V<sub>in</sub> × X<sub>C</sub> / Z</div>
        <div class="ce-calc">X<sub>C</sub> = ${XC.toFixed(2)} Ω | Z = ${Z.toFixed(2)} Ω</div>
        <div class="ce-calc">V<sub>out</sub> = ${V} × ${XC.toFixed(2)} / ${Z.toFixed(2)} = ${Vout.toFixed(2)} V</div>
        <div class="ce-note">${f < fc ? 'f < fc → signal passes (low-pass)' : 'f > fc → signal attenuated'}</div>
      </div>
      <div class="ce-section ce-summary">
        <h4>✅ Final Result</h4>
        <ul>
          <li>f<sub>c</sub> = ${fc.toFixed(2)} Hz</li>
          <li>V<sub>out</sub> = ${Vout.toFixed(2)} V</li>
          <li>${f < fc ? 'Passband' : 'Stopband'}</li>
        </ul>
      </div>
    `
}
