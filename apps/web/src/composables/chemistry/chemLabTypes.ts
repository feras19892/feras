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
  chemicalId?: string;  // معرف المادة الأساسية (حمض/قاعدة/ملح)
  indicators?: string[]; // معرفات الكواشف اللونية المضافة
  baseColor?: string;     // لون السائل الأساسي بدون كواشف
  reactants?: Record<string, number>; // المواد الموجودة بالحاوية: {chemicalId: volume}
  equation?: string;      // المعادلة الكيميائية الحالية
  precipitate?: boolean;   // هل يوجد ترسيب
  gasEvolution?: boolean;  // هل يوجد تحرر غاز
}

export interface BuretteState {
  volume: number;
  maxVolume: number;
  valveOpen: boolean;
  color: string;
  opacity: number;
  chemicalId?: string;  // معرف المادة الكيميائية الموجودة
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
