import type { Equation } from '../math-types';

import { algebraEquations } from './algebra';
import { geometryEquations } from './geometry';
import { trigonometryEquations } from './trigonometry';
import { calculusEquations } from './calculus';
import { statisticsEquations } from './statistics';
import { number_theoryEquations } from './number-theory';
import { mechanicsEquations } from './mechanics';
import { waves_opticsEquations } from './waves-optics';
import { electricityEquations } from './electricity';
import { electromagnetismEquations } from './electromagnetism';
import { heatEquations } from './heat';

export const equations: Equation[] = [
  ...algebraEquations,
  ...geometryEquations,
  ...trigonometryEquations,
  ...calculusEquations,
  ...statisticsEquations,
  ...number_theoryEquations,
  ...mechanicsEquations,
  ...waves_opticsEquations,
  ...electricityEquations,
  ...electromagnetismEquations,
  ...heatEquations,
];
