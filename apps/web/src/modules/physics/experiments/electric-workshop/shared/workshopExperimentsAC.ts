import type { WorkshopComponent, WorkshopWire } from './types'
import { WIRE_COLORS } from './types'
import type { ExperimentContext } from './workshopExperimentsDC'

export type ACExperimentName = 'ac_rl' | 'ac_rc' | 'ac_rlc' | 'ac_transformer' | 'ac_filter' | 'ac_powerfactor' | 'ac_resonance'

export function loadACExperiment(name: ACExperimentName, ctx: ExperimentContext) {
  const { components, addComponent, addWire } = ctx

  if (name === 'ac_rl') {
    addComponent('acsource', 200, 200)
    const src = components[components.length - 1]
    src.acAmplitude = 220; src.acFrequency = 50; src.value = 220

    addComponent('resistor', 400, 200)
    const r = components[components.length - 1]; r.value = 100

    addComponent('inductor', 600, 200)
    const l = components[components.length - 1]; l.value = 100

    addComponent('oscilloscope', 400, 400)
    const osc = components[components.length - 1]

    addComponent('ground', 200, 320)
    const gnd = components[components.length - 1]

    addWire(src.id, 1, r.id, 0, WIRE_COLORS.red, [])
    addWire(r.id, 1, l.id, 0, WIRE_COLORS.red, [])
    addWire(l.id, 1, src.id, 0, WIRE_COLORS.black, [{x:680,y:200},{x:680,y:320},{x:178,y:320}])
    addWire(gnd.id, 0, src.id, 0, WIRE_COLORS.black, [])
    addWire(osc.id, 0, l.id, 0, WIRE_COLORS.blue, [{x:400,y:400},{x:400,y:300},{x:600,y:300}])
    addWire(osc.id, 1, l.id, 1, WIRE_COLORS.blue, [{x:480,y:400},{x:480,y:360},{x:680,y:360},{x:680,y:320}])
  }

  if (name === 'ac_rc') {
    addComponent('acsource', 200, 200)
    const src = components[components.length - 1]
    src.acAmplitude = 220; src.acFrequency = 50; src.value = 220

    addComponent('resistor', 400, 200)
    const r = components[components.length - 1]; r.value = 100

    addComponent('capacitor', 600, 200)
    const c = components[components.length - 1]; c.value = 100

    addComponent('oscilloscope', 400, 400)
    const osc = components[components.length - 1]

    addComponent('ground', 200, 320)
    const gnd = components[components.length - 1]

    addWire(src.id, 1, r.id, 0, WIRE_COLORS.red, [])
    addWire(r.id, 1, c.id, 0, WIRE_COLORS.red, [])
    addWire(c.id, 1, src.id, 0, WIRE_COLORS.black, [{x:680,y:200},{x:680,y:320},{x:178,y:320}])
    addWire(gnd.id, 0, src.id, 0, WIRE_COLORS.black, [])
    addWire(osc.id, 0, c.id, 0, WIRE_COLORS.blue, [{x:400,y:400},{x:400,y:300},{x:600,y:300}])
    addWire(osc.id, 1, c.id, 1, WIRE_COLORS.blue, [{x:480,y:400},{x:480,y:360},{x:680,y:360},{x:680,y:320}])
  }

  if (name === 'ac_rlc') {
    addComponent('acsource', 200, 200)
    const src = components[components.length - 1]
    src.acAmplitude = 220; src.acFrequency = 50; src.value = 220

    addComponent('resistor', 380, 200)
    const r = components[components.length - 1]; r.value = 50

    addComponent('inductor', 540, 200)
    const l = components[components.length - 1]; l.value = 100

    addComponent('capacitor', 700, 200)
    const c = components[components.length - 1]; c.value = 100

    addComponent('oscilloscope', 460, 400)
    const osc = components[components.length - 1]

    addComponent('ground', 200, 320)
    const gnd = components[components.length - 1]

    addWire(src.id, 1, r.id, 0, WIRE_COLORS.red, [])
    addWire(r.id, 1, l.id, 0, WIRE_COLORS.red, [])
    addWire(l.id, 1, c.id, 0, WIRE_COLORS.red, [])
    addWire(c.id, 1, src.id, 0, WIRE_COLORS.black, [{x:780,y:200},{x:780,y:320},{x:178,y:320}])
    addWire(gnd.id, 0, src.id, 0, WIRE_COLORS.black, [])
    addWire(osc.id, 0, c.id, 0, WIRE_COLORS.blue, [{x:460,y:400},{x:460,y:300},{x:700,y:300}])
    addWire(osc.id, 1, c.id, 1, WIRE_COLORS.blue, [{x:540,y:400},{x:540,y:360},{x:780,y:360},{x:780,y:320}])
  }

  if (name === 'ac_transformer') {
    addComponent('acsource', 200, 200)
    const src = components[components.length - 1]
    src.acAmplitude = 220; src.acFrequency = 50; src.value = 220

    addComponent('transformer', 440, 200)
    const tf = components[components.length - 1]; tf.transformerRatio = 2; tf.value = 2

    addComponent('lamp', 700, 200)
    const lamp = components[components.length - 1]; lamp.value = 12

    addComponent('ground', 200, 320)
    const gnd = components[components.length - 1]

    addWire(src.id, 1, tf.id, 0, WIRE_COLORS.red, [])
    addWire(tf.id, 1, src.id, 0, WIRE_COLORS.black, [{x:520,y:200},{x:520,y:320},{x:178,y:320}])
    addWire(tf.id, 2, lamp.id, 0, WIRE_COLORS.red, [{x:440,y:230},{x:440,y:280},{x:700,y:280},{x:700,y:230}])
    addWire(lamp.id, 1, tf.id, 3, WIRE_COLORS.black, [{x:760,y:230},{x:760,y:300},{x:520,y:300},{x:520,y:230}])
    addWire(gnd.id, 0, src.id, 0, WIRE_COLORS.black, [])
  }

  if (name === 'ac_filter') {
    addComponent('acsource', 200, 200)
    const src = components[components.length - 1]
    src.acAmplitude = 220; src.acFrequency = 50; src.value = 220

    addComponent('resistor', 400, 200)
    const r = components[components.length - 1]; r.value = 1000

    addComponent('capacitor', 600, 280)
    const c = components[components.length - 1]; c.value = 10

    addComponent('oscilloscope', 500, 420)
    const osc = components[components.length - 1]

    addComponent('ground', 200, 380)
    const gnd = components[components.length - 1]

    addWire(src.id, 1, r.id, 0, WIRE_COLORS.red, [])
    addWire(r.id, 1, c.id, 0, WIRE_COLORS.red, [{x:480,y:200},{x:480,y:280},{x:600,y:280}])
    addWire(c.id, 1, gnd.id, 0, WIRE_COLORS.black, [{x:680,y:280},{x:680,y:380},{x:240,y:380}])
    addWire(src.id, 0, gnd.id, 0, WIRE_COLORS.black, [{x:178,y:240},{x:178,y:380}])
    addWire(osc.id, 0, c.id, 0, WIRE_COLORS.blue, [{x:500,y:420},{x:500,y:350},{x:600,y:350},{x:600,y:280}])
    addWire(osc.id, 1, c.id, 1, WIRE_COLORS.blue, [{x:580,y:420},{x:580,y:380},{x:680,y:380}])
  }

  if (name === 'ac_powerfactor') {
    addComponent('acsource', 200, 200)
    const src = components[components.length - 1]
    src.acAmplitude = 220; src.acFrequency = 50; src.value = 220

    addComponent('resistor', 400, 200)
    const r = components[components.length - 1]; r.value = 100

    addComponent('inductor', 600, 200)
    const l = components[components.length - 1]; l.value = 200

    addComponent('capacitor', 600, 340)
    const c = components[components.length - 1]; c.value = 50

    addComponent('ammeter', 400, 340)
    const amm = components[components.length - 1]; amm.value = 0

    addComponent('voltmeter', 400, 100)
    const v1 = components[components.length - 1]; v1.value = 0

    addComponent('ground', 200, 400)
    const gnd = components[components.length - 1]

    addWire(src.id, 1, r.id, 0, WIRE_COLORS.red, [])
    addWire(r.id, 1, l.id, 0, WIRE_COLORS.red, [{x:480,y:200},{x:600,y:200}])
    addWire(l.id, 1, c.id, 1, WIRE_COLORS.red, [{x:680,y:200},{x:680,y:340}])
    addWire(c.id, 0, amm.id, 1, WIRE_COLORS.black, [{x:560,y:340},{x:440,y:340}])
    addWire(amm.id, 0, src.id, 0, WIRE_COLORS.black, [{x:360,y:340},{x:178,y:340},{x:178,y:240}])
    addWire(gnd.id, 0, src.id, 0, WIRE_COLORS.green, [{x:200,y:400},{x:178,y:400},{x:178,y:340}])
    addWire(v1.id, 0, amm.id, 0, WIRE_COLORS.blue, [{x:380,y:130},{x:380,y:320},{x:360,y:320}])
    addWire(v1.id, 1, src.id, 1, WIRE_COLORS.blue, [{x:420,y:130},{x:420,y:170},{x:240,y:170}])
  }

  if (name === 'ac_resonance') {
    addComponent('acsource', 200, 200)
    const src = components[components.length - 1]
    src.acAmplitude = 220; src.acFrequency = 50; src.value = 220

    addComponent('resistor', 400, 200)
    const r = components[components.length - 1]; r.value = 50

    addComponent('inductor', 560, 200)
    const l = components[components.length - 1]; l.value = 100

    addComponent('capacitor', 720, 200)
    const c = components[components.length - 1]; c.value = 100

    addComponent('oscilloscope', 560, 380)
    const osc = components[components.length - 1]

    addComponent('ammeter', 400, 340)
    const amm = components[components.length - 1]; amm.value = 0

    addComponent('ground', 200, 400)
    const gnd = components[components.length - 1]

    addWire(src.id, 1, r.id, 0, WIRE_COLORS.red, [])
    addWire(r.id, 1, l.id, 0, WIRE_COLORS.red, [{x:480,y:200},{x:560,y:200}])
    addWire(l.id, 1, c.id, 0, WIRE_COLORS.red, [{x:640,y:200},{x:720,y:200}])
    addWire(c.id, 1, amm.id, 1, WIRE_COLORS.black, [{x:800,y:200},{x:800,y:340},{x:440,y:340}])
    addWire(amm.id, 0, src.id, 0, WIRE_COLORS.black, [{x:360,y:340},{x:178,y:340},{x:178,y:240}])
    addWire(gnd.id, 0, src.id, 0, WIRE_COLORS.green, [{x:200,y:400},{x:178,y:400},{x:178,y:340}])
    addWire(osc.id, 0, c.id, 0, WIRE_COLORS.blue, [{x:560,y:380},{x:560,y:260},{x:720,y:260}])
    addWire(osc.id, 1, c.id, 1, WIRE_COLORS.blue, [{x:640,y:380},{x:640,y:300},{x:800,y:300}])
  }
}
