import type { WorkshopComponent, WorkshopWire } from './types'
import { WIRE_COLORS } from './types'
import { loadDCExperiment2, type ExperimentName2 } from './workshopExperimentsDC2'
import { loadDCExperiment3, type ExperimentName3 } from './workshopExperimentsDC3'

export type ExperimentName = 'ohm' | 'series' | 'parallel' | 'mixed' | ExperimentName2 | ExperimentName3

export interface ExperimentContext {
  components: WorkshopComponent[]
  wires: WorkshopWire[]
  addComponent: (type: any, x: number, y: number) => void
  rotateComponent: (id: number) => void
  addWire: (fromCompId: number, fromTermIndex: number, toCompId: number, toTermIndex: number, color: string, manualPoints?: { x: number; y: number }[]) => void
}

export function loadDCExperiment(name: ExperimentName, ctx: ExperimentContext) {
  const { components, addComponent, rotateComponent, addWire } = ctx

  if (name === 'ohm') {
    addComponent('battery', 200, 400)
    const bat = components[components.length - 1]; bat.value = 12
    rotateComponent(bat.id)

    addComponent('ammeter', 420, 300)
    const amm = components[components.length - 1]

    addComponent('resistor', 660, 300)
    const r1 = components[components.length - 1]; r1.value = 10

    addComponent('voltmeter', 660, 160)
    const v1 = components[components.length - 1]

    addWire(bat.id, 0, amm.id, 0, WIRE_COLORS.red, [{x:320,y:378},{x:320,y:300}])
    addWire(amm.id, 1, r1.id, 0, WIRE_COLORS.red, [])
    addWire(r1.id, 1, bat.id, 1, WIRE_COLORS.black, [{x:760,y:300},{x:760,y:520},{x:200,y:520}])
    addWire(v1.id, 0, r1.id, 0, WIRE_COLORS.blue, [{x:640,y:230}])
    addWire(v1.id, 1, r1.id, 1, WIRE_COLORS.blue, [{x:680,y:230}])
  }
  else if (name === 'series') {
    addComponent('battery', 200, 400)
    const bat = components[components.length - 1]; bat.value = 12
    rotateComponent(bat.id)

    addComponent('ammeter', 320, 300)
    const amm = components[components.length - 1]

    addComponent('resistor', 460, 300)
    const r1 = components[components.length - 1]; r1.value = 10

    addComponent('ammeter', 600, 300)
    const amm2 = components[components.length - 1]

    addComponent('resistor', 740, 300)
    const r2 = components[components.length - 1]; r2.value = 20

    addComponent('voltmeter', 460, 160)
    const v1 = components[components.length - 1]

    addComponent('voltmeter', 740, 160)
    const v2 = components[components.length - 1]

    addWire(bat.id, 0, amm.id, 0, WIRE_COLORS.red, [{x:250,y:378},{x:250,y:300}])
    addWire(amm.id, 1, r1.id, 0, WIRE_COLORS.red, [])
    addWire(r1.id, 1, amm2.id, 0, WIRE_COLORS.red, [])
    addWire(amm2.id, 1, r2.id, 0, WIRE_COLORS.red, [])
    addWire(r2.id, 1, bat.id, 1, WIRE_COLORS.black, [{x:820,y:300},{x:820,y:520},{x:200,y:520}])
    addWire(v1.id, 0, r1.id, 0, WIRE_COLORS.blue, [{x:440,y:230}])
    addWire(v1.id, 1, r1.id, 1, WIRE_COLORS.blue, [{x:480,y:230}])
    addWire(v2.id, 0, r2.id, 0, WIRE_COLORS.blue, [{x:720,y:230}])
    addWire(v2.id, 1, r2.id, 1, WIRE_COLORS.blue, [{x:760,y:230}])
  }
  else if (name === 'parallel') {
    addComponent('battery', 200, 420)
    const bat = components[components.length - 1]; bat.value = 12
    rotateComponent(bat.id)

    addComponent('ammeter', 320, 300)
    const amm = components[components.length - 1]

    addComponent('ammeter', 460, 200)
    const amm1 = components[components.length - 1]

    addComponent('resistor', 640, 200)
    const r1 = components[components.length - 1]; r1.value = 10

    addComponent('ammeter', 460, 400)
    const amm2 = components[components.length - 1]

    addComponent('resistor', 640, 400)
    const r2 = components[components.length - 1]; r2.value = 20

    addComponent('voltmeter', 540, 80)
    const v1 = components[components.length - 1]

    addWire(bat.id, 0, amm.id, 0, WIRE_COLORS.red, [{x:260,y:398},{x:260,y:300}])
    addWire(amm.id, 1, amm1.id, 0, WIRE_COLORS.red, [{x:380,y:300},{x:380,y:200}])
    addWire(amm.id, 1, amm2.id, 0, WIRE_COLORS.red, [{x:380,y:300},{x:380,y:400}])
    addWire(amm1.id, 1, r1.id, 0, WIRE_COLORS.red, [])
    addWire(amm2.id, 1, r2.id, 0, WIRE_COLORS.red, [])
    addWire(r2.id, 1, r1.id, 1, WIRE_COLORS.black, [{x:720,y:400},{x:720,y:200}])
    addWire(r1.id, 1, bat.id, 1, WIRE_COLORS.black, [{x:720,y:200},{x:720,y:540},{x:200,y:540}])
    addWire(v1.id, 0, r1.id, 0, WIRE_COLORS.blue, [{x:527,y:140},{x:615,y:140}])
    addWire(v1.id, 1, r1.id, 1, WIRE_COLORS.blue, [{x:553,y:120},{x:665,y:120}])
  }
  else if (name === 'mixed') {
    addComponent('battery', 200, 520)
    const bat = components[components.length - 1]; bat.value = 12
    rotateComponent(bat.id)

    addComponent('ammeter', 300, 400)
    const amm = components[components.length - 1]

    addComponent('resistor', 420, 400)
    const r1 = components[components.length - 1]; r1.value = 10

    addComponent('ammeter', 540, 400)
    const amm2 = components[components.length - 1]

    addComponent('resistor', 660, 400)
    const r2 = components[components.length - 1]; r2.value = 20

    addComponent('ammeter', 800, 300)
    const amm3 = components[components.length - 1]

    addComponent('resistor', 940, 300)
    const r3 = components[components.length - 1]; r3.value = 30

    addComponent('ammeter', 800, 500)
    const amm4 = components[components.length - 1]

    addComponent('resistor', 940, 500)
    const r4 = components[components.length - 1]; r4.value = 40

    addComponent('voltmeter', 420, 260)
    const v1 = components[components.length - 1]

    addComponent('voltmeter', 660, 260)
    const v2 = components[components.length - 1]

    addComponent('voltmeter', 870, 140)
    const v3 = components[components.length - 1]

    addWire(bat.id, 0, amm.id, 0, WIRE_COLORS.red, [{x:240,y:498},{x:240,y:400}])
    addWire(amm.id, 1, r1.id, 0, WIRE_COLORS.red, [])
    addWire(r1.id, 1, amm2.id, 0, WIRE_COLORS.red, [])
    addWire(amm2.id, 1, r2.id, 0, WIRE_COLORS.red, [])
    addWire(r2.id, 1, amm3.id, 0, WIRE_COLORS.red, [{x:740,y:400},{x:740,y:300}])
    addWire(r2.id, 1, amm4.id, 0, WIRE_COLORS.red, [{x:740,y:400},{x:740,y:500}])
    addWire(amm3.id, 1, r3.id, 0, WIRE_COLORS.red, [])
    addWire(amm4.id, 1, r4.id, 0, WIRE_COLORS.red, [])
    addWire(r4.id, 1, r3.id, 1, WIRE_COLORS.black, [{x:1000,y:500},{x:1000,y:300}])
    addWire(r3.id, 1, bat.id, 1, WIRE_COLORS.black, [{x:1000,y:300},{x:1000,y:660},{x:200,y:660}])
    addWire(v1.id, 0, r1.id, 0, WIRE_COLORS.blue, [{x:400,y:330}])
    addWire(v1.id, 1, r1.id, 1, WIRE_COLORS.blue, [{x:440,y:330}])
    addWire(v2.id, 0, r2.id, 0, WIRE_COLORS.blue, [{x:640,y:330}])
    addWire(v2.id, 1, r2.id, 1, WIRE_COLORS.blue, [{x:680,y:330}])
    addWire(v3.id, 0, r3.id, 0, WIRE_COLORS.blue, [{x:857,y:200},{x:915,y:200}])
    addWire(v3.id, 1, r3.id, 1, WIRE_COLORS.blue, [{x:883,y:200},{x:965,y:200}])
  }

  const part2Names: ExperimentName2[] = ['kvl', 'kcl', 'vdivider', 'cdivider', 'bseries', 'bparallel', 'relay']
  if (part2Names.includes(name as ExperimentName2)) {
    loadDCExperiment2(name as ExperimentName2, ctx)
  }

  const part3Names: ExperimentName3[] = ['rc_charge', 'rl_transient', 'wheatstone', 'thevenin', 'superposition', 'maxpower']
  if (part3Names.includes(name as ExperimentName3)) {
    loadDCExperiment3(name as ExperimentName3, ctx)
  }
}
