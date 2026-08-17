import type { Equation } from './math-types';
import { equationsBasic } from './equations-basic/index';
import { equationsPhysics } from './equations-physics';
import { equationsAdvanced } from './equations-advanced/index';

export const equations: Equation[] = [
  ...equationsBasic,
  ...equationsPhysics,
  ...equationsAdvanced,
];
