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
  viscosity: number;
  density: number;
  surfaceTension: number;
  chemicalId?: string;
  indicators?: string[];
  baseColor?: string;
  reactants?: Record<string, number>;
  equation?: string;
  precipitate?: boolean;
  precipitateColor?: string;
  gasEvolution?: boolean;
  gasType?: string;
}

export interface BuretteState {
  volume: number;
  maxVolume: number;
  valveOpen: boolean;
  color: string;
  opacity: number;
  chemicalId?: string;
}

export interface PipetteState {
  volume: number;
  maxVolume: number;
  color: string;
  opacity: number;
  label: string;
  chemicalId?: string;
}

export interface SepFunnelState {
  valveOpen: boolean;
  bottomLayerVolume: number;
  bottomLayerColor: string;
}
