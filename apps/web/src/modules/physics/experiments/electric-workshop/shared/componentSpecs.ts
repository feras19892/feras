import type { ComponentType } from './types'

export interface ComponentSpec {
  properties: { labelKey: string; valueKey: string }[]
  mechanism: { step: string; descKey: string }[]
  formulaKey?: string
  formulaDescKey?: string
  applicationKeys: string[]
}

export const componentSpecs: Record<string, ComponentSpec> = {
  battery: {
    properties: [
      { labelKey: 'ew.spec.type', valueKey: 'ew.spec.battery.type' },
      { labelKey: 'ew.spec.unit', valueKey: 'ew.spec.battery.unit' },
      { labelKey: 'ew.spec.polarity', valueKey: 'ew.spec.battery.polarity' },
      { labelKey: 'ew.spec.internalResistance', valueKey: 'ew.spec.battery.internalResistance' },
      { labelKey: 'ew.spec.terminals', valueKey: 'ew.spec.battery.terminals' },
    ],
    mechanism: [
      { step: '1', descKey: 'ew.spec.battery.m1' },
      { step: '2', descKey: 'ew.spec.battery.m2' },
      { step: '3', descKey: 'ew.spec.battery.m3' },
      { step: '4', descKey: 'ew.spec.battery.m4' },
    ],
    formulaKey: 'ew.spec.battery.formula',
    formulaDescKey: 'ew.spec.battery.formulaDesc',
    applicationKeys: ['ew.spec.battery.app1', 'ew.spec.battery.app2', 'ew.spec.battery.app3'],
  },

  resistor: {
    properties: [
      { labelKey: 'ew.spec.type', valueKey: 'ew.spec.resistor.type' },
      { labelKey: 'ew.spec.unit', valueKey: 'ew.spec.resistor.unit' },
      { labelKey: 'ew.spec.relation', valueKey: 'ew.spec.resistor.relation' },
      { labelKey: 'ew.spec.terminals', valueKey: 'ew.spec.resistor.terminals' },
      { labelKey: 'ew.spec.maxPower', valueKey: 'ew.spec.resistor.maxPower' },
    ],
    mechanism: [
      { step: '1', descKey: 'ew.spec.resistor.m1' },
      { step: '2', descKey: 'ew.spec.resistor.m2' },
      { step: '3', descKey: 'ew.spec.resistor.m3' },
      { step: '4', descKey: 'ew.spec.resistor.m4' },
    ],
    formulaKey: 'ew.spec.resistor.formula',
    formulaDescKey: 'ew.spec.resistor.formulaDesc',
    applicationKeys: ['ew.spec.resistor.app1', 'ew.spec.resistor.app2', 'ew.spec.resistor.app3', 'ew.spec.resistor.app4'],
  },

  capacitor: {
    properties: [
      { labelKey: 'ew.spec.type', valueKey: 'ew.spec.capacitor.type' },
      { labelKey: 'ew.spec.unit', valueKey: 'ew.spec.capacitor.unit' },
      { labelKey: 'ew.spec.dcBehavior', valueKey: 'ew.spec.capacitor.dcBehavior' },
      { labelKey: 'ew.spec.acBehavior', valueKey: 'ew.spec.capacitor.acBehavior' },
      { labelKey: 'ew.spec.terminals', valueKey: 'ew.spec.capacitor.terminals' },
    ],
    mechanism: [
      { step: '1', descKey: 'ew.spec.capacitor.m1' },
      { step: '2', descKey: 'ew.spec.capacitor.m2' },
      { step: '3', descKey: 'ew.spec.capacitor.m3' },
      { step: '4', descKey: 'ew.spec.capacitor.m4' },
    ],
    formulaKey: 'ew.spec.capacitor.formula',
    formulaDescKey: 'ew.spec.capacitor.formulaDesc',
    applicationKeys: ['ew.spec.capacitor.app1', 'ew.spec.capacitor.app2', 'ew.spec.capacitor.app3', 'ew.spec.capacitor.app4'],
  },

  inductor: {
    properties: [
      { labelKey: 'ew.spec.type', valueKey: 'ew.spec.inductor.type' },
      { labelKey: 'ew.spec.unit', valueKey: 'ew.spec.inductor.unit' },
      { labelKey: 'ew.spec.dcBehavior', valueKey: 'ew.spec.inductor.dcBehavior' },
      { labelKey: 'ew.spec.acBehavior', valueKey: 'ew.spec.inductor.acBehavior' },
      { labelKey: 'ew.spec.terminals', valueKey: 'ew.spec.inductor.terminals' },
    ],
    mechanism: [
      { step: '1', descKey: 'ew.spec.inductor.m1' },
      { step: '2', descKey: 'ew.spec.inductor.m2' },
      { step: '3', descKey: 'ew.spec.inductor.m3' },
      { step: '4', descKey: 'ew.spec.inductor.m4' },
    ],
    formulaKey: 'ew.spec.inductor.formula',
    formulaDescKey: 'ew.spec.inductor.formulaDesc',
    applicationKeys: ['ew.spec.inductor.app1', 'ew.spec.inductor.app2', 'ew.spec.inductor.app3', 'ew.spec.inductor.app4'],
  },

  diode: {
    properties: [
      { labelKey: 'ew.spec.type', valueKey: 'ew.spec.diode.type' },
      { labelKey: 'ew.spec.unit', valueKey: 'ew.spec.diode.unit' },
      { labelKey: 'ew.spec.direction', valueKey: 'ew.spec.diode.direction' },
      { labelKey: 'ew.spec.thresholdVoltage', valueKey: 'ew.spec.diode.thresholdVoltage' },
      { labelKey: 'ew.spec.terminals', valueKey: 'ew.spec.diode.terminals' },
    ],
    mechanism: [
      { step: '1', descKey: 'ew.spec.diode.m1' },
      { step: '2', descKey: 'ew.spec.diode.m2' },
      { step: '3', descKey: 'ew.spec.diode.m3' },
      { step: '4', descKey: 'ew.spec.diode.m4' },
    ],
    formulaKey: 'ew.spec.diode.formula',
    formulaDescKey: 'ew.spec.diode.formulaDesc',
    applicationKeys: ['ew.spec.diode.app1', 'ew.spec.diode.app2', 'ew.spec.diode.app3', 'ew.spec.diode.app4'],
  },

  switch: {
    properties: [
      { labelKey: 'ew.spec.type', valueKey: 'ew.spec.switch.type' },
      { labelKey: 'ew.spec.unit', valueKey: 'ew.spec.switch.unit' },
      { labelKey: 'ew.spec.states', valueKey: 'ew.spec.switch.states' },
      { labelKey: 'ew.spec.resistanceOn', valueKey: 'ew.spec.switch.resistanceOn' },
      { labelKey: 'ew.spec.resistanceOff', valueKey: 'ew.spec.switch.resistanceOff' },
    ],
    mechanism: [
      { step: '1', descKey: 'ew.spec.switch.m1' },
      { step: '2', descKey: 'ew.spec.switch.m2' },
      { step: '3', descKey: 'ew.spec.switch.m3' },
      { step: '4', descKey: 'ew.spec.switch.m4' },
    ],
    formulaKey: 'ew.spec.switch.formula',
    formulaDescKey: 'ew.spec.switch.formulaDesc',
    applicationKeys: ['ew.spec.switch.app1', 'ew.spec.switch.app2', 'ew.spec.switch.app3', 'ew.spec.switch.app4'],
  },

  lamp: {
    properties: [
      { labelKey: 'ew.spec.type', valueKey: 'ew.spec.lamp.type' },
      { labelKey: 'ew.spec.unit', valueKey: 'ew.spec.lamp.unit' },
      { labelKey: 'ew.spec.behavior', valueKey: 'ew.spec.lamp.behavior' },
      { labelKey: 'ew.spec.brightness', valueKey: 'ew.spec.lamp.brightness' },
      { labelKey: 'ew.spec.terminals', valueKey: 'ew.spec.lamp.terminals' },
    ],
    mechanism: [
      { step: '1', descKey: 'ew.spec.lamp.m1' },
      { step: '2', descKey: 'ew.spec.lamp.m2' },
      { step: '3', descKey: 'ew.spec.lamp.m3' },
      { step: '4', descKey: 'ew.spec.lamp.m4' },
    ],
    formulaKey: 'ew.spec.lamp.formula',
    formulaDescKey: 'ew.spec.lamp.formulaDesc',
    applicationKeys: ['ew.spec.lamp.app1', 'ew.spec.lamp.app2', 'ew.spec.lamp.app3', 'ew.spec.lamp.app4'],
  },

  ammeter: {
    properties: [
      { labelKey: 'ew.spec.type', valueKey: 'ew.spec.ammeter.type' },
      { labelKey: 'ew.spec.unit', valueKey: 'ew.spec.ammeter.unit' },
      { labelKey: 'ew.spec.connectionMethod', valueKey: 'ew.spec.ammeter.connectionMethod' },
      { labelKey: 'ew.spec.resistance', valueKey: 'ew.spec.ammeter.resistance' },
      { labelKey: 'ew.spec.terminals', valueKey: 'ew.spec.ammeter.terminals' },
    ],
    mechanism: [
      { step: '1', descKey: 'ew.spec.ammeter.m1' },
      { step: '2', descKey: 'ew.spec.ammeter.m2' },
      { step: '3', descKey: 'ew.spec.ammeter.m3' },
      { step: '4', descKey: 'ew.spec.ammeter.m4' },
    ],
    formulaKey: 'ew.spec.ammeter.formula',
    formulaDescKey: 'ew.spec.ammeter.formulaDesc',
    applicationKeys: ['ew.spec.ammeter.app1', 'ew.spec.ammeter.app2', 'ew.spec.ammeter.app3'],
  },

  voltmeter: {
    properties: [
      { labelKey: 'ew.spec.type', valueKey: 'ew.spec.voltmeter.type' },
      { labelKey: 'ew.spec.unit', valueKey: 'ew.spec.voltmeter.unit' },
      { labelKey: 'ew.spec.connectionMethod', valueKey: 'ew.spec.voltmeter.connectionMethod' },
      { labelKey: 'ew.spec.resistance', valueKey: 'ew.spec.voltmeter.resistance' },
      { labelKey: 'ew.spec.terminals', valueKey: 'ew.spec.voltmeter.terminals' },
    ],
    mechanism: [
      { step: '1', descKey: 'ew.spec.voltmeter.m1' },
      { step: '2', descKey: 'ew.spec.voltmeter.m2' },
      { step: '3', descKey: 'ew.spec.voltmeter.m3' },
      { step: '4', descKey: 'ew.spec.voltmeter.m4' },
    ],
    formulaKey: 'ew.spec.voltmeter.formula',
    formulaDescKey: 'ew.spec.voltmeter.formulaDesc',
    applicationKeys: ['ew.spec.voltmeter.app1', 'ew.spec.voltmeter.app2', 'ew.spec.voltmeter.app3'],
  },

  relay: {
    properties: [
      { labelKey: 'ew.spec.type', valueKey: 'ew.spec.relay.type' },
      { labelKey: 'ew.spec.unit', valueKey: 'ew.spec.relay.unit' },
      { labelKey: 'ew.spec.terminals', valueKey: 'ew.spec.relay.terminals' },
      { labelKey: 'ew.spec.state', valueKey: 'ew.spec.relay.state' },
      { labelKey: 'ew.spec.coilResistance', valueKey: 'ew.spec.relay.coilResistance' },
    ],
    mechanism: [
      { step: '1', descKey: 'ew.spec.relay.m1' },
      { step: '2', descKey: 'ew.spec.relay.m2' },
      { step: '3', descKey: 'ew.spec.relay.m3' },
      { step: '4', descKey: 'ew.spec.relay.m4' },
    ],
    formulaKey: 'ew.spec.relay.formula',
    formulaDescKey: 'ew.spec.relay.formulaDesc',
    applicationKeys: ['ew.spec.relay.app1', 'ew.spec.relay.app2', 'ew.spec.relay.app3', 'ew.spec.relay.app4'],
  },

  breaker: {
    properties: [
      { labelKey: 'ew.spec.type', valueKey: 'ew.spec.breaker.type' },
      { labelKey: 'ew.spec.unit', valueKey: 'ew.spec.breaker.unit' },
      { labelKey: 'ew.spec.state', valueKey: 'ew.spec.breaker.state' },
      { labelKey: 'ew.spec.terminals', valueKey: 'ew.spec.breaker.terminals' },
      { labelKey: 'ew.spec.reset', valueKey: 'ew.spec.breaker.reset' },
    ],
    mechanism: [
      { step: '1', descKey: 'ew.spec.breaker.m1' },
      { step: '2', descKey: 'ew.spec.breaker.m2' },
      { step: '3', descKey: 'ew.spec.breaker.m3' },
      { step: '4', descKey: 'ew.spec.breaker.m4' },
    ],
    formulaKey: 'ew.spec.breaker.formula',
    formulaDescKey: 'ew.spec.breaker.formulaDesc',
    applicationKeys: ['ew.spec.breaker.app1', 'ew.spec.breaker.app2', 'ew.spec.breaker.app3'],
  },

  fuse: {
    properties: [
      { labelKey: 'ew.spec.type', valueKey: 'ew.spec.fuse.type' },
      { labelKey: 'ew.spec.unit', valueKey: 'ew.spec.fuse.unit' },
      { labelKey: 'ew.spec.state', valueKey: 'ew.spec.fuse.state' },
      { labelKey: 'ew.spec.terminals', valueKey: 'ew.spec.fuse.terminals' },
      { labelKey: 'ew.spec.reset', valueKey: 'ew.spec.fuse.reset' },
    ],
    mechanism: [
      { step: '1', descKey: 'ew.spec.fuse.m1' },
      { step: '2', descKey: 'ew.spec.fuse.m2' },
      { step: '3', descKey: 'ew.spec.fuse.m3' },
      { step: '4', descKey: 'ew.spec.fuse.m4' },
    ],
    formulaKey: 'ew.spec.fuse.formula',
    formulaDescKey: 'ew.spec.fuse.formulaDesc',
    applicationKeys: ['ew.spec.fuse.app1', 'ew.spec.fuse.app2', 'ew.spec.fuse.app3'],
  },

  ground: {
    properties: [
      { labelKey: 'ew.spec.type', valueKey: 'ew.spec.ground.type' },
      { labelKey: 'ew.spec.unit', valueKey: 'ew.spec.ground.unit' },
      { labelKey: 'ew.spec.voltage', valueKey: 'ew.spec.ground.voltage' },
      { labelKey: 'ew.spec.terminals', valueKey: 'ew.spec.ground.terminals' },
      { labelKey: 'ew.spec.function', valueKey: 'ew.spec.ground.function' },
    ],
    mechanism: [
      { step: '1', descKey: 'ew.spec.ground.m1' },
      { step: '2', descKey: 'ew.spec.ground.m2' },
      { step: '3', descKey: 'ew.spec.ground.m3' },
      { step: '4', descKey: 'ew.spec.ground.m4' },
    ],
    formulaKey: 'ew.spec.ground.formula',
    formulaDescKey: 'ew.spec.ground.formulaDesc',
    applicationKeys: ['ew.spec.ground.app1', 'ew.spec.ground.app2', 'ew.spec.ground.app3'],
  },

  multimeter: {
    properties: [
      { labelKey: 'ew.spec.type', valueKey: 'ew.spec.multimeter.type' },
      { labelKey: 'ew.spec.modes', valueKey: 'ew.spec.multimeter.modes' },
      { labelKey: 'ew.spec.redProbe', valueKey: 'ew.spec.multimeter.redProbe' },
      { labelKey: 'ew.spec.blackProbe', valueKey: 'ew.spec.multimeter.blackProbe' },
      { labelKey: 'ew.spec.terminals', valueKey: 'ew.spec.multimeter.terminals' },
    ],
    mechanism: [
      { step: '1', descKey: 'ew.spec.multimeter.m1' },
      { step: '2', descKey: 'ew.spec.multimeter.m2' },
      { step: '3', descKey: 'ew.spec.multimeter.m3' },
      { step: '4', descKey: 'ew.spec.multimeter.m4' },
      { step: '5', descKey: 'ew.spec.multimeter.m5' },
    ],
    formulaKey: 'ew.spec.multimeter.formula',
    formulaDescKey: 'ew.spec.multimeter.formulaDesc',
    applicationKeys: ['ew.spec.multimeter.app1', 'ew.spec.multimeter.app2', 'ew.spec.multimeter.app3', 'ew.spec.multimeter.app4'],
  },
}

export function getSpec(type: ComponentType): ComponentSpec | null {
  return componentSpecs[type] ?? null
}
