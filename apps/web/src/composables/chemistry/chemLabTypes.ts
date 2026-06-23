import type { LabItem } from './useChemistryTools';

export interface LiquidState {
  volume: number;
  maxVolume: number;
  color: string;
  opacity: number;
  label: string;
  stirred: number;
  temperature: number;
  ph: number | null;
  heated: boolean;
  viscosity: number;      // 0.0–1.0 (0=ماء, 1=عسل كثيف)
  density: number;      // g/cm³ (1.0=ماء, 1.26=حامض الكبريتيك)
  surfaceTension: number; // 0.0–1.0 (قوة التماسك السطحي)
}

export interface BuretteState {
  volume: number;
  maxVolume: number;
  valveOpen: boolean;
  color: string;
  opacity: number;
}

export interface PipetteState {
  volume: number;
  maxVolume: number;
  color: string;
  opacity: number;
  label: string;
}

export interface SepFunnelState {
  valveOpen: boolean;
  bottomLayerVolume: number;
  bottomLayerColor: string;
}

export interface SavedSession {
  items: LabItem[];
  liquids: Record<string, LiquidState>;
  burettes: Record<string, BuretteState>;
  pipettes: Record<string, PipetteState>;
  sepFunnels: Record<string, SepFunnelState>;
  burners: Record<string, { on: boolean; intensity: number }>;
  tares: Record<string, number>;
  zoomMap: Record<string, number>;
  rackSlots?: Record<string, (string | null)[]>;
  pourFlows?: Record<string, string>;
  tiltAngles?: Record<string, number>;
}
