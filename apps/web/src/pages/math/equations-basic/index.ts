import type { Equation } from '../math-types';
import { equationsBasic_algebra } from './algebra';
import { equationsBasic_calculus } from './calculus';
import { equationsBasic_geometry } from './geometry';
import { equationsBasic_statistics } from './statistics';
import { equationsBasic_trigonometry } from './trigonometry';

export const equationsBasic: Equation[] = [
  ...equationsBasic_algebra,
  ...equationsBasic_calculus,
  ...equationsBasic_geometry,
  ...equationsBasic_statistics,
  ...equationsBasic_trigonometry,
];
