import { WIRE_COLORS } from './types'
import type { ExperimentContext } from './workshopExperimentsDC'

export type ExperimentName2 = 'kvl' | 'kcl' | 'vdivider' | 'cdivider' | 'bseries' | 'bparallel' | 'relay' | 'rc_charge' | 'rl_transient' | 'wheatstone' | 'thevenin' | 'superposition' | 'maxpower'

export function loadDCExperiment2(name: ExperimentName2, ctx: ExperimentContext) {
  const { components, addComponent, rotateComponent, addWire } = ctx

  if (name === 'kvl') {
    addComponent('battery', 200, 400)
    const bat = components[components.length - 1]; bat.value = 12
    rotateComponent(bat.id)

    addComponent('ammeter', 420, 300)
    const amm = components[components.length - 1]; amm.value = 0
    rotateComponent(amm.id)

    addComponent('resistor', 560, 300)
    const r1 = components[components.length - 1]; r1.value = 2

    addComponent('resistor', 700, 300)
    const r2 = components[components.length - 1]; r2.value = 4

    addComponent('resistor', 840, 300)
    const r3 = components[components.length - 1]; r3.value = 6

    addComponent('voltmeter', 560, 180)
    const v1 = components[components.length - 1]; v1.value = 0
    addComponent('voltmeter', 700, 180)
    const v2 = components[components.length - 1]; v2.value = 0
    addComponent('voltmeter', 840, 180)
    const v3 = components[components.length - 1]; v3.value = 0

    addWire(bat.id, 0, amm.id, 0, WIRE_COLORS.red, [{x:200,y:378},{x:200,y:300},{x:420,y:300}])
    addWire(amm.id, 1, r1.id, 0, WIRE_COLORS.red, [{x:460,y:300},{x:560,y:300}])
    addWire(r1.id, 1, r2.id, 0, WIRE_COLORS.red, [{x:600,y:300},{x:700,y:300}])
    addWire(r2.id, 1, r3.id, 0, WIRE_COLORS.red, [{x:740,y:300},{x:840,y:300}])
    addWire(r3.id, 1, bat.id, 1, WIRE_COLORS.black, [{x:880,y:300},{x:880,y:422},{x:200,y:422}])

    addWire(v1.id, 0, r1.id, 0, WIRE_COLORS.blue, [{x:560,y:180},{x:560,y:270}])
    addWire(v1.id, 1, r1.id, 1, WIRE_COLORS.blue, [{x:600,y:180},{x:600,y:270}])
    addWire(v2.id, 0, r2.id, 0, WIRE_COLORS.blue, [{x:700,y:180},{x:700,y:270}])
    addWire(v2.id, 1, r2.id, 1, WIRE_COLORS.blue, [{x:740,y:180},{x:740,y:270}])
    addWire(v3.id, 0, r3.id, 0, WIRE_COLORS.blue, [{x:840,y:180},{x:840,y:270}])
    addWire(v3.id, 1, r3.id, 1, WIRE_COLORS.blue, [{x:880,y:180},{x:880,y:270}])
  }

  if (name === 'kcl') {
    addComponent('battery', 200, 400)
    const bat = components[components.length - 1]; bat.value = 12
    rotateComponent(bat.id)

    addComponent('ammeter', 380, 300)
    const amm0 = components[components.length - 1]; amm0.value = 0
    rotateComponent(amm0.id)

    addComponent('resistor', 540, 200)
    const r1 = components[components.length - 1]; r1.value = 6
    addComponent('ammeter', 420, 200)
    const amm1 = components[components.length - 1]; amm1.value = 0
    rotateComponent(amm1.id)

    addComponent('resistor', 540, 300)
    const r2 = components[components.length - 1]; r2.value = 3
    addComponent('ammeter', 420, 300)
    const amm2 = components[components.length - 1]; amm2.value = 0
    rotateComponent(amm2.id)

    addComponent('resistor', 540, 400)
    const r3 = components[components.length - 1]; r3.value = 2
    addComponent('ammeter', 420, 400)
    const amm3 = components[components.length - 1]; amm3.value = 0
    rotateComponent(amm3.id)

    addComponent('voltmeter', 700, 300)
    const v1 = components[components.length - 1]; v1.value = 0

    addWire(bat.id, 0, amm0.id, 0, WIRE_COLORS.red, [{x:200,y:378},{x:200,y:300},{x:380,y:300}])
    addWire(amm0.id, 1, amm1.id, 0, WIRE_COLORS.red, [{x:420,y:300},{x:420,y:200}])
    addWire(amm1.id, 1, r1.id, 0, WIRE_COLORS.red, [{x:460,y:200},{x:540,y:200}])
    addWire(amm0.id, 1, amm2.id, 0, WIRE_COLORS.red, [{x:420,y:300}])
    addWire(amm2.id, 1, r2.id, 0, WIRE_COLORS.red, [{x:460,y:300},{x:540,y:300}])
    addWire(amm0.id, 1, amm3.id, 0, WIRE_COLORS.red, [{x:420,y:300},{x:420,y:400}])
    addWire(amm3.id, 1, r3.id, 0, WIRE_COLORS.red, [{x:460,y:400},{x:540,y:400}])

    addWire(r1.id, 1, bat.id, 1, WIRE_COLORS.black, [{x:580,y:200},{x:880,y:200},{x:880,y:422},{x:200,y:422}])
    addWire(r2.id, 1, bat.id, 1, WIRE_COLORS.black, [{x:580,y:300},{x:880,y:300}])
    addWire(r3.id, 1, bat.id, 1, WIRE_COLORS.black, [{x:580,y:400},{x:880,y:400}])

    addWire(v1.id, 0, r2.id, 0, WIRE_COLORS.blue, [{x:700,y:270},{x:540,y:300}])
    addWire(v1.id, 1, r2.id, 1, WIRE_COLORS.blue, [{x:700,y:330},{x:580,y:300}])
  }

  if (name === 'vdivider') {
    addComponent('battery', 200, 400)
    const bat = components[components.length - 1]; bat.value = 12
    rotateComponent(bat.id)

    addComponent('ammeter', 420, 300)
    const amm = components[components.length - 1]; amm.value = 0
    rotateComponent(amm.id)

    addComponent('resistor', 560, 300)
    const r1 = components[components.length - 1]; r1.value = 8

    addComponent('resistor', 720, 300)
    const r2 = components[components.length - 1]; r2.value = 4

    addComponent('voltmeter', 560, 180)
    const v1 = components[components.length - 1]; v1.value = 0
    addComponent('voltmeter', 720, 180)
    const v2 = components[components.length - 1]; v2.value = 0

    addWire(bat.id, 0, amm.id, 0, WIRE_COLORS.red, [{x:200,y:378},{x:200,y:300},{x:420,y:300}])
    addWire(amm.id, 1, r1.id, 0, WIRE_COLORS.red, [{x:460,y:300},{x:560,y:300}])
    addWire(r1.id, 1, r2.id, 0, WIRE_COLORS.red, [{x:600,y:300},{x:720,y:300}])
    addWire(r2.id, 1, bat.id, 1, WIRE_COLORS.black, [{x:760,y:300},{x:760,y:422},{x:200,y:422}])

    addWire(v1.id, 0, r1.id, 0, WIRE_COLORS.blue, [{x:560,y:180},{x:560,y:270}])
    addWire(v1.id, 1, r1.id, 1, WIRE_COLORS.blue, [{x:600,y:180},{x:600,y:270}])
    addWire(v2.id, 0, r2.id, 0, WIRE_COLORS.blue, [{x:720,y:180},{x:720,y:270}])
    addWire(v2.id, 1, r2.id, 1, WIRE_COLORS.blue, [{x:760,y:180},{x:760,y:270}])
  }

  if (name === 'cdivider') {
    addComponent('battery', 200, 400)
    const bat = components[components.length - 1]; bat.value = 12
    rotateComponent(bat.id)

    addComponent('ammeter', 380, 300)
    const amm0 = components[components.length - 1]; amm0.value = 0
    rotateComponent(amm0.id)

    addComponent('resistor', 520, 300)
    const r1 = components[components.length - 1]; r1.value = 2

    addComponent('ammeter', 660, 220)
    const amm2 = components[components.length - 1]; amm2.value = 0
    rotateComponent(amm2.id)
    addComponent('resistor', 800, 220)
    const r2 = components[components.length - 1]; r2.value = 6

    addComponent('ammeter', 660, 380)
    const amm3 = components[components.length - 1]; amm3.value = 0
    rotateComponent(amm3.id)
    addComponent('resistor', 800, 380)
    const r3 = components[components.length - 1]; r3.value = 3

    addComponent('voltmeter', 900, 300)
    const v1 = components[components.length - 1]; v1.value = 0

    addWire(bat.id, 0, amm0.id, 0, WIRE_COLORS.red, [{x:200,y:378},{x:200,y:300},{x:380,y:300}])
    addWire(amm0.id, 1, r1.id, 0, WIRE_COLORS.red, [{x:420,y:300},{x:520,y:300}])
    addWire(r1.id, 1, amm2.id, 0, WIRE_COLORS.red, [{x:560,y:300},{x:560,y:220},{x:660,y:220}])
    addWire(r1.id, 1, amm3.id, 0, WIRE_COLORS.red, [{x:560,y:300},{x:560,y:380},{x:660,y:380}])
    addWire(amm2.id, 1, r2.id, 0, WIRE_COLORS.red, [{x:700,y:220},{x:800,y:220}])
    addWire(amm3.id, 1, r3.id, 0, WIRE_COLORS.red, [{x:700,y:380},{x:800,y:380}])
    addWire(r2.id, 1, bat.id, 1, WIRE_COLORS.black, [{x:840,y:220},{x:960,y:220},{x:960,y:422},{x:200,y:422}])
    addWire(r3.id, 1, bat.id, 1, WIRE_COLORS.black, [{x:840,y:380},{x:960,y:380}])

    addWire(v1.id, 0, r2.id, 0, WIRE_COLORS.blue, [{x:900,y:270},{x:800,y:220}])
    addWire(v1.id, 1, r2.id, 1, WIRE_COLORS.blue, [{x:900,y:330},{x:840,y:220}])
  }

  if (name === 'bseries') {
    addComponent('battery', 200, 300)
    const bat1 = components[components.length - 1]; bat1.value = 6

    addComponent('battery', 360, 300)
    const bat2 = components[components.length - 1]; bat2.value = 9

    addComponent('ammeter', 500, 300)
    const amm = components[components.length - 1]; amm.value = 0

    addComponent('resistor', 660, 300)
    const r1 = components[components.length - 1]; r1.value = 5

    addComponent('voltmeter', 280, 160)
    const v1 = components[components.length - 1]; v1.value = 0

    addComponent('voltmeter', 660, 160)
    const v2 = components[components.length - 1]; v2.value = 0

    addWire(bat1.id, 1, bat2.id, 0, WIRE_COLORS.black, [])
    addWire(bat2.id, 1, amm.id, 0, WIRE_COLORS.black, [])
    addWire(amm.id, 1, r1.id, 0, WIRE_COLORS.red, [])
    addWire(r1.id, 1, bat1.id, 0, WIRE_COLORS.red, [{x:760,y:300},{x:760,y:460},{x:120,y:460},{x:120,y:300}])

    addWire(v1.id, 0, bat2.id, 1, WIRE_COLORS.blue, [{x:280,y:230},{x:400,y:230},{x:400,y:300}])
    addWire(v1.id, 1, bat1.id, 0, WIRE_COLORS.blue, [{x:280,y:190},{x:120,y:190},{x:120,y:300}])

    addWire(v2.id, 0, r1.id, 0, WIRE_COLORS.blue, [{x:640,y:230}])
    addWire(v2.id, 1, r1.id, 1, WIRE_COLORS.blue, [{x:680,y:230}])
  }

  if (name === 'bparallel') {
    addComponent('battery', 200, 300)
    const bat1 = components[components.length - 1]; bat1.value = 12

    addComponent('battery', 200, 460)
    const bat2 = components[components.length - 1]; bat2.value = 12

    addComponent('ammeter', 420, 380)
    const amm = components[components.length - 1]; amm.value = 0

    addComponent('resistor', 660, 380)
    const r1 = components[components.length - 1]; r1.value = 4

    addComponent('voltmeter', 660, 200)
    const v1 = components[components.length - 1]; v1.value = 0

    addWire(bat1.id, 0, amm.id, 0, WIRE_COLORS.red, [{x:178,y:300},{x:120,y:300},{x:120,y:380},{x:407,y:380}])
    addWire(bat2.id, 0, amm.id, 0, WIRE_COLORS.red, [{x:178,y:460},{x:120,y:460},{x:120,y:380}])
    addWire(amm.id, 1, r1.id, 0, WIRE_COLORS.red, [])
    addWire(r1.id, 1, bat1.id, 1, WIRE_COLORS.black, [{x:760,y:380},{x:760,y:540},{x:222,y:540},{x:222,y:300}])
    addWire(r1.id, 1, bat2.id, 1, WIRE_COLORS.black, [{x:760,y:380},{x:760,y:540},{x:222,y:540},{x:222,y:460}])

    addWire(v1.id, 0, r1.id, 0, WIRE_COLORS.blue, [{x:640,y:270}])
    addWire(v1.id, 1, r1.id, 1, WIRE_COLORS.blue, [{x:680,y:270}])
  }

  if (name === 'relay') {
    addComponent('battery', 200, 200)
    const bat1 = components[components.length - 1]; bat1.value = 12

    addComponent('switch', 400, 200)
    const sw = components[components.length - 1]; sw.closed = true

    addComponent('relay', 600, 200)
    const relay = components[components.length - 1]; relay.value = 10

    addWire(bat1.id, 1, sw.id, 0, WIRE_COLORS.red, [])
    addWire(sw.id, 1, relay.id, 0, WIRE_COLORS.red, [])
    addWire(relay.id, 1, bat1.id, 0, WIRE_COLORS.black, [{x:700,y:160},{x:700,y:280},{x:178,y:280}])

    addComponent('battery', 200, 500)
    const bat2 = components[components.length - 1]; bat2.value = 12

    addComponent('lamp', 400, 500)
    const lamp = components[components.length - 1]; lamp.value = 6

    addWire(bat2.id, 1, lamp.id, 0, WIRE_COLORS.red, [])
    addWire(lamp.id, 1, relay.id, 2, WIRE_COLORS.red, [{x:500,y:500},{x:500,y:400},{x:600,y:400},{x:600,y:220}])
    addWire(relay.id, 3, bat2.id, 0, WIRE_COLORS.black, [{x:700,y:220},{x:800,y:220},{x:800,y:560},{x:178,y:560}])
  }

  if (name === 'rc_charge') {
    addComponent('battery', 200, 400)
    const bat = components[components.length - 1]; bat.value = 12
    rotateComponent(bat.id)

    addComponent('switch', 380, 300)
    const sw = components[components.length - 1]; sw.closed = false

    addComponent('resistor', 540, 300)
    const r = components[components.length - 1]; r.value = 1000

    addComponent('capacitor', 720, 300)
    const cap = components[components.length - 1]; cap.value = 100

    addComponent('oscilloscope', 540, 460)
    const osc = components[components.length - 1]

    addWire(bat.id, 0, sw.id, 0, WIRE_COLORS.red, [{x:200,y:378},{x:200,y:300},{x:380,y:300}])
    addWire(sw.id, 1, r.id, 0, WIRE_COLORS.red, [{x:420,y:300},{x:540,y:300}])
    addWire(r.id, 1, cap.id, 0, WIRE_COLORS.red, [{x:580,y:300},{x:720,y:300}])
    addWire(cap.id, 1, bat.id, 1, WIRE_COLORS.black, [{x:760,y:300},{x:760,y:422},{x:200,y:422}])
    addWire(osc.id, 0, cap.id, 0, WIRE_COLORS.blue, [{x:540,y:430},{x:540,y:360},{x:720,y:360}])
    addWire(osc.id, 1, cap.id, 1, WIRE_COLORS.blue, [{x:600,y:430},{x:600,y:380},{x:760,y:380}])
  }

  if (name === 'rl_transient') {
    addComponent('battery', 200, 400)
    const bat = components[components.length - 1]; bat.value = 12
    rotateComponent(bat.id)

    addComponent('switch', 380, 300)
    const sw = components[components.length - 1]; sw.closed = false

    addComponent('resistor', 540, 300)
    const r = components[components.length - 1]; r.value = 100

    addComponent('inductor', 720, 300)
    const ind = components[components.length - 1]; ind.value = 100

    addComponent('oscilloscope', 540, 460)
    const osc = components[components.length - 1]

    addWire(bat.id, 0, sw.id, 0, WIRE_COLORS.red, [{x:200,y:378},{x:200,y:300},{x:380,y:300}])
    addWire(sw.id, 1, r.id, 0, WIRE_COLORS.red, [{x:420,y:300},{x:540,y:300}])
    addWire(r.id, 1, ind.id, 0, WIRE_COLORS.red, [{x:580,y:300},{x:720,y:300}])
    addWire(ind.id, 1, bat.id, 1, WIRE_COLORS.black, [{x:760,y:300},{x:760,y:422},{x:200,y:422}])
    addWire(osc.id, 0, ind.id, 0, WIRE_COLORS.blue, [{x:540,y:430},{x:540,y:360},{x:720,y:360}])
    addWire(osc.id, 1, ind.id, 1, WIRE_COLORS.blue, [{x:600,y:430},{x:600,y:380},{x:760,y:380}])
  }

  if (name === 'wheatstone') {
    addComponent('battery', 200, 420)
    const bat = components[components.length - 1]; bat.value = 12
    rotateComponent(bat.id)

    addComponent('resistor', 420, 220)
    const r1 = components[components.length - 1]; r1.value = 1000

    addComponent('resistor', 420, 380)
    const r2 = components[components.length - 1]; r2.value = 2000

    addComponent('resistor', 660, 220)
    const r3 = components[components.length - 1]; r3.value = 3000

    addComponent('resistor', 660, 380)
    const r4 = components[components.length - 1]; r4.value = 4000

    addComponent('voltmeter', 540, 300)
    const v1 = components[components.length - 1]; v1.value = 0

    addWire(bat.id, 0, r1.id, 0, WIRE_COLORS.red, [{x:200,y:398},{x:200,y:220},{x:420,y:220}])
    addWire(bat.id, 0, r2.id, 0, WIRE_COLORS.red, [{x:200,y:398},{x:200,y:380},{x:420,y:380}])
    addWire(r1.id, 1, r3.id, 0, WIRE_COLORS.red, [{x:460,y:220},{x:660,y:220}])
    addWire(r2.id, 1, r4.id, 0, WIRE_COLORS.red, [{x:460,y:380},{x:660,y:380}])
    addWire(r3.id, 1, bat.id, 1, WIRE_COLORS.black, [{x:700,y:220},{x:700,y:440},{x:200,y:440}])
    addWire(r4.id, 1, bat.id, 1, WIRE_COLORS.black, [{x:700,y:380},{x:700,y:440}])
    addWire(v1.id, 0, r1.id, 1, WIRE_COLORS.blue, [{x:540,y:270},{x:460,y:270},{x:460,y:220}])
    addWire(v1.id, 1, r2.id, 1, WIRE_COLORS.blue, [{x:540,y:330},{x:460,y:330},{x:460,y:380}])
  }

  if (name === 'thevenin') {
    addComponent('battery', 200, 400)
    const bat = components[components.length - 1]; bat.value = 12
    rotateComponent(bat.id)

    addComponent('resistor', 420, 300)
    const r1 = components[components.length - 1]; r1.value = 4

    addComponent('resistor', 600, 300)
    const r2 = components[components.length - 1]; r2.value = 6

    addComponent('voltmeter', 600, 160)
    const v1 = components[components.length - 1]; v1.value = 0

    addComponent('ammeter', 780, 300)
    const amm = components[components.length - 1]; amm.value = 0

    addComponent('resistor', 920, 300)
    const rL = components[components.length - 1]; rL.value = 10

    addWire(bat.id, 0, r1.id, 0, WIRE_COLORS.red, [{x:200,y:378},{x:200,y:300},{x:420,y:300}])
    addWire(r1.id, 1, r2.id, 0, WIRE_COLORS.red, [{x:460,y:300},{x:600,y:300}])
    addWire(r2.id, 1, amm.id, 0, WIRE_COLORS.red, [{x:640,y:300},{x:780,y:300}])
    addWire(amm.id, 1, rL.id, 0, WIRE_COLORS.red, [{x:820,y:300},{x:920,y:300}])
    addWire(rL.id, 1, bat.id, 1, WIRE_COLORS.black, [{x:960,y:300},{x:960,y:422},{x:200,y:422}])
    addWire(v1.id, 0, r2.id, 0, WIRE_COLORS.blue, [{x:600,y:230},{x:600,y:270}])
    addWire(v1.id, 1, r2.id, 1, WIRE_COLORS.blue, [{x:640,y:230},{x:640,y:270}])
  }

  if (name === 'superposition') {
    addComponent('battery', 200, 300)
    const bat1 = components[components.length - 1]; bat1.value = 6

    addComponent('battery', 200, 500)
    const bat2 = components[components.length - 1]; bat2.value = 9

    addComponent('resistor', 440, 300)
    const r1 = components[components.length - 1]; r1.value = 2

    addComponent('resistor', 640, 300)
    const r2 = components[components.length - 1]; r2.value = 4

    addComponent('resistor', 640, 500)
    const r3 = components[components.length - 1]; r3.value = 3

    addComponent('ammeter', 840, 300)
    const amm = components[components.length - 1]; amm.value = 0

    addComponent('voltmeter', 640, 160)
    const v1 = components[components.length - 1]; v1.value = 0

    addWire(bat1.id, 1, r1.id, 0, WIRE_COLORS.red, [{x:240,y:300},{x:440,y:300}])
    addWire(r1.id, 1, r2.id, 0, WIRE_COLORS.red, [{x:480,y:300},{x:640,y:300}])
    addWire(r2.id, 1, amm.id, 0, WIRE_COLORS.red, [{x:680,y:300},{x:840,y:300}])
    addWire(amm.id, 1, bat1.id, 0, WIRE_COLORS.black, [{x:880,y:300},{x:880,y:580},{x:120,y:580},{x:120,y:300}])
    addWire(bat2.id, 1, r3.id, 0, WIRE_COLORS.red, [{x:240,y:500},{x:640,y:500}])
    addWire(r3.id, 1, r2.id, 1, WIRE_COLORS.black, [{x:680,y:500},{x:680,y:300}])
    addWire(bat2.id, 0, bat1.id, 0, WIRE_COLORS.black, [{x:120,y:500},{x:120,y:300}])
    addWire(v1.id, 0, r2.id, 0, WIRE_COLORS.blue, [{x:640,y:230},{x:640,y:270}])
    addWire(v1.id, 1, r2.id, 1, WIRE_COLORS.blue, [{x:680,y:230},{x:680,y:270}])
  }

  if (name === 'maxpower') {
    addComponent('battery', 200, 400)
    const bat = components[components.length - 1]; bat.value = 12
    rotateComponent(bat.id)

    addComponent('resistor', 420, 300)
    const r1 = components[components.length - 1]; r1.value = 5

    addComponent('ammeter', 600, 300)
    const amm = components[components.length - 1]; amm.value = 0

    addComponent('resistor', 780, 300)
    const rL = components[components.length - 1]; rL.value = 5

    addComponent('voltmeter', 780, 160)
    const v1 = components[components.length - 1]; v1.value = 0

    addWire(bat.id, 0, r1.id, 0, WIRE_COLORS.red, [{x:200,y:378},{x:200,y:300},{x:420,y:300}])
    addWire(r1.id, 1, amm.id, 0, WIRE_COLORS.red, [{x:460,y:300},{x:600,y:300}])
    addWire(amm.id, 1, rL.id, 0, WIRE_COLORS.red, [{x:640,y:300},{x:780,y:300}])
    addWire(rL.id, 1, bat.id, 1, WIRE_COLORS.black, [{x:820,y:300},{x:820,y:422},{x:200,y:422}])
    addWire(v1.id, 0, rL.id, 0, WIRE_COLORS.blue, [{x:780,y:230},{x:780,y:270}])
    addWire(v1.id, 1, rL.id, 1, WIRE_COLORS.blue, [{x:820,y:230},{x:820,y:270}])
  }
}
