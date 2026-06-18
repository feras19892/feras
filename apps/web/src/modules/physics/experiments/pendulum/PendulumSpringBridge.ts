/**
 * Compute horizontal spring coupling force between two pendulum bobs.
 * F = -k * (x2 - x1)  [restoring force toward equilibrium separation]
 * Positive return = force on bob1 toward bob2 (to the right)
 */

export interface SpringBridgeParams {
  springK: number       // N/m
  restLength: number    // m, natural length of horizontal spring
}

export function computeCouplingForce(
  x1: number,
  x2: number,
  params: SpringBridgeParams,
): { force1: number; force2: number } {
  const displacement = x2 - x1 - params.restLength
  const force = -params.springK * displacement
  return { force1: force, force2: -force }
}

export function computeCouplingTorque(
  theta1: number,
  theta2: number,
  length: number,
  mass: number,
  params: SpringBridgeParams,
): { torque1: number; torque2: number } {
  const x1 = length * Math.sin(theta1)
  const x2 = length * Math.sin(theta2)
  const { force1, force2 } = computeCouplingForce(x1, x2, params)
  // Torque = F * L * cos(theta)  [horizontal force × vertical lever arm component]
  const lever = length * Math.cos(theta1)  // approximate, both have similar angle
  return {
    torque1: (force1 / mass) * lever,
    torque2: (force2 / mass) * lever,
  }
}
