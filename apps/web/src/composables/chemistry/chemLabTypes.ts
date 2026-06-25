import type { LabItem } from './useChemistryTools';
import type { LiquidState, BuretteState, PipetteState, SepFunnelState } from '@my-modern-app/chemistry-engine';
export type { LiquidState, BuretteState, PipetteState, SepFunnelState };

export interface ToolState {
  uid: string;
  type: 'beaker' | 'burette' | 'pipette' | 'other';
  volume: number;
  maxVolume: number;
  valveOpen?: boolean;
  color: string;
  label?: string;
  temp?: number;
  ph?: number;
  buretteNumber?: number;
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
