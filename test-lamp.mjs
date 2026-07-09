import { solveDC } from './packages/physics-engine/dist/solver/dc-solver.js';

const circuit = {
  nodes: [
    { id: 'n1', isGround: false, index: -1 },
    { id: 'n2', isGround: false, index: -1 },
    { id: 'n3', isGround: true, index: -1 },
  ],
  components: [
    {
      id: 'bat',
      type: 'DC_SOURCE',
      pins: [
        { id: 'bat-pos', componentId: 'bat', label: '+', localX: -15, localY: 0, nodeId: 'n1', polarity: '+' },
        { id: 'bat-neg', componentId: 'bat', label: '-', localX: 15, localY: 0, nodeId: 'n3', polarity: '-' },
      ],
      params: { voltage: 9, maxCurrent: 1 },
      state: { current: 0, voltageDrop: 0, power: 0, isBurnedOut: false },
    },
    {
      id: 'lamp',
      type: 'LAMP',
      pins: [
        { id: 'lamp-p1', componentId: 'lamp', label: 'p1', localX: -15, localY: 0, nodeId: 'n1' },
        { id: 'lamp-p2', componentId: 'lamp', label: 'p2', localX: 15, localY: 0, nodeId: 'n3' },
      ],
      params: { ratedVoltage: 12, ratedPower: 5, maxCurrent: 1 },
      state: { current: 0, voltageDrop: 0, power: 0, isBurnedOut: false, brightness: 0 },
    },
    {
      id: 'gnd',
      type: 'GROUND',
      pins: [
        { id: 'gnd-p1', componentId: 'gnd', label: 'GND', localX: 0, localY: -20, nodeId: 'n3' },
      ],
      params: {},
      state: { current: 0, voltageDrop: 0, power: 0, isBurnedOut: false },
    },
  ],
  wires: [
    { id: 'w1', fromPinId: 'bat-pos', toPinId: 'lamp-p1' },
    { id: 'w2', fromPinId: 'bat-neg', toPinId: 'gnd-p1' },
    { id: 'w3', fromPinId: 'lamp-p2', toPinId: 'gnd-p1' },
  ],
};

const r = solveDC(circuit);
console.log('converged:', r.converged);
console.log('nodeVoltages:', Array.from(r.nodeVoltages.entries()));
console.log('componentStates:', Array.from(r.componentStates.entries()).map(([id, s]) => [id, { V: s.voltageDrop, I: s.current, P: s.power }]));
