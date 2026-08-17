import type { Equation } from '../math-types';
import { equationsAdvanced_electromagnetism } from './electromagnetism';
import { equationsAdvanced_electricity } from './electricity';
import { equationsAdvanced_heat } from './heat';
import { equationsAdvanced_mechanics } from './mechanics';
import { equationsAdvanced_waves_optics } from './waves-optics';
import { equationsAdvanced_algebra } from './algebra';
import { equationsAdvanced_calculus } from './calculus';
import { equationsAdvanced_geometry } from './geometry';
import { equationsAdvanced_number_theory } from './number-theory';
import { equationsAdvanced_statistics } from './statistics';
import { equationsAdvanced_trigonometry } from './trigonometry';

export const equationsAdvanced: Equation[] = [
  ...equationsAdvanced_electromagnetism,
  ...equationsAdvanced_electricity,
  ...equationsAdvanced_heat,
  ...equationsAdvanced_mechanics,
  ...equationsAdvanced_waves_optics,
  ...equationsAdvanced_algebra,
  ...equationsAdvanced_calculus,
  ...equationsAdvanced_geometry,
  ...equationsAdvanced_number_theory,
  ...equationsAdvanced_statistics,
  ...equationsAdvanced_trigonometry,
];
