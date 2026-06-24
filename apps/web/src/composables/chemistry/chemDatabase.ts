import { reactive } from 'vue';

export type ChemicalCategory = 'acid' | 'base' | 'salt' | 'solvent' | 'indicator' | 'solid' | 'gas';
export type HazardLevel = 'safe' | 'caution' | 'warning' | 'danger';
export type PhysicalState = 'liquid' | 'solid' | 'gas';

export interface Chemical {
  id: string;
  nameAr: string;
  formula: string;
  category: ChemicalCategory;
  physicalState: PhysicalState;
  concentration?: number;
  ph?: number;
  color: string;
  opacity: number;
  density?: number;
  molarMass?: number;
  boilingPoint?: number;
  hazardLevel: HazardLevel;
  description?: string;
}

import { chemDataCore } from './chemDataCore';
import { chemDataExtended } from './chemDataExtended';

export const chemicals: Chemical[] = [...chemDataCore, ...chemDataExtended];

export const selectedChemical = reactive<Chemical>({ ...chemicals[0] });
