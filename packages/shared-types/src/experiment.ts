/**
 * BaseExperiment — الهيكل الموحد لكل تجربة في النظام
 *
 * يُستخدم في:
 *   • API (reports, experiments modules)
 *   • Web (composables, components)
 *   • Database (experiments table)
 */

export interface BaseExperiment {
  /** المعرف الفريد: "physics-pendulum" | "chemistry-titration" */
  id: string;

  /** الفئة العلمية */
  category: 'physics' | 'chemistry';

  /** المجال الفرعي: "mechanics" | "thermodynamics" | "organic" | "analytical" */
  subject: string;

  /** العنوان بجميع اللغات المدعومة */
  title: Record<string, string>;

  /** الوصف بجميع اللغات */
  description: Record<string, string>;

  /** الحالة الحالية للتجربة */
  currentState: ExperimentState;

  /** خطوات التجربة بالترتيب */
  steps: ExperimentStep[];

  /** معاملات التجربة (تختلف حسب النوع) */
  config: ExperimentConfig;

  /** الحد الأقصى للمدة بالثواني (اختياري) */
  maxDurationSeconds?: number;

  /** هل التجربة نشطة ومتاحة للطلاب */
  isActive: boolean;

  /** تاريخ الإنشاء ISO */
  createdAt: string;

  /** تاريخ آخر تحديث ISO */
  updatedAt: string;
}

export type ExperimentState =
  | 'idle'
  | 'running'
  | 'paused'
  | 'completed'
  | 'aborted';

export interface ExperimentStep {
  /** معرف الخطوة الفريد ضمن التجربة */
  id: string;

  /** الترتيب (0, 1, 2, ...) */
  order: number;

  /** عنوان الخطوة */
  title: Record<string, string>;

  /** تعليمات تنفيذ الخطوة */
  instruction: Record<string, string>;

  /** نوع الخطوة */
  type: 'setup' | 'measurement' | 'calculation' | 'observation' | 'conclusion';

  /** شروط اجتياز الخطوة (اختياري) */
  validation?: StepValidation;

  /** هل الخطوة إلزامية */
  required: boolean;
}

export interface StepValidation {
  /** نوع التحقق */
  type: 'range' | 'exact' | 'formula' | 'boolean';

  /** القيمة المتوقعة (لـ exact) */
  expectedValue?: number | string;

  /** نطاق القبول ±% (لـ range) */
  tolerance?: number;

  /** المعادلة المتوقعة كنص (لـ formula) */
  formula?: string;

  /** المتغيرات المطلوبة في المعادلة */
  variables?: string[];
}

/** معاملات التجربة — Record مرن لكل نوع */
export type ExperimentConfig = Record<string, unknown>;

/**
 * PhysicsExperimentConfig — مثال لمعاملات تجربة فيزياء
 */
export interface PhysicsExperimentConfig extends ExperimentConfig {
  gravity?: number;         // m/s²
  mass?: number;           // kg
  length?: number;         // m
  angle?: number;          // degrees
  temperature?: number;     // °C
  pressure?: number;       // Pa
}

/**
 * ChemistryExperimentConfig — مثال لمعاملات تجربة كيمياء
 */
export interface ChemistryExperimentConfig extends ExperimentConfig {
  reactants?: Array<{ name: string; concentration: number; volume: number }>;
  temperature?: number;   // °C
  ph?: number;
  indicator?: string;
}
