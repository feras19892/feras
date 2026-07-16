import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { createFlowVisualization, updateFlowParticles } from './heart-flow';

describe('heart-flow', () => {
  it('creates a flow group with tubes and particles', () => {
    const { group, particles } = createFlowVisualization();

    expect(group).toBeInstanceOf(THREE.Group);
    expect(particles.length).toBe(16);

    const tubes = group.children.filter((child) => child instanceof THREE.Mesh);
    expect(tubes.length).toBeGreaterThanOrEqual(2);
  });

  it('updates particle positions along curves', () => {
    const { particles } = createFlowVisualization();
    const initialPositions = particles.map((p) => p.mesh.position.clone());

    updateFlowParticles(particles, 0.5);

    for (let i = 0; i < particles.length; i += 1) {
      const updated = particles[i].mesh.position;
      expect(updated.equals(initialPositions[i])).toBe(false);
    }
  });
});
