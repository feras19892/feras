import type { LiquidState, BuretteState, PipetteState, SepFunnelState } from '@my-modern-app/chemistry-engine';
export type { LiquidState, BuretteState, PipetteState, SepFunnelState };

export interface ToolState {
  uid: string;
  type: 'beaker' | 'burette' | 'pipette' | 'sep-funnel' | 'other';
  volume: number;
  maxVolume: number;
  valveOpen?: boolean;
  color: string;
  opacity?: number;
  label?: string;
  ph?: number;
  buretteNumber?: number;
  gasEvolution?: boolean;
  gasType?: string;
  precipitate?: boolean;
  precipitateColor?: string;
  equation?: string;
  temperature?: number;
  stirred?: number;
  heated?: boolean;
  viscosity?: number;
  density?: number;
  surfaceTension?: number;
  chemicalId?: string;
  indicators?: string[];
  baseColor?: string;
  reactants?: Record<string, number>;
}
