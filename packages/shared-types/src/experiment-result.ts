/**
 * ExperimentResult — شكل البيانات عند انتهاء الطالب من التجربة
 *
 * يُخزَّن في: experiment_reports (جدول التقارير)
 * يُنشأ في: الواجهة (Web) بعد انتهاء التجربة
 * يُقرأ في: API (reports module) + Web (teacher dashboard)
 */

export interface ExperimentResult {
  /** معرف التجربة (يربط بـ BaseExperiment.id) */
  experimentId: string;

  /** معرف الطالب */
  studentId: number;

  /** معرف التقرير في قاعدة البيانات (اختياري عند الإنشاء) */
  reportId?: number;

  /** معرف الفصل (لربطها بالـ class) */
  classId?: string;

  /** متى بدأ الطالب التجربة */
  startedAt: string; // ISO 8601

  /** متى أنهى الطالب التجربة */
  completedAt: string; // ISO 8601

  /** المدة الإجمالية بالثواني */
  totalDurationSeconds: number;

  /** عدد الخطوات المُنجزة */
  stepsCompleted: number;

  /** إجمالي عدد الخطوات */
  totalSteps: number;

  /** نسبة الدقة (0-100) */
  accuracyScore: number;

  /** القراءات الخام التي أدخلها الطالب */
  rawData: ExperimentReading[];

  /** القيم المُشتقة (نتائج الحسابات) */
  calculatedValues?: Record<string, number>;

  /** هل نجح الطالب في التجربة */
  passed: boolean;

  /** ملاحظات المعلم (تُضاف لاحقاً) */
  teacherNotes?: string;

  /** الدرجة النهائية (تُضيفها لاحقاً) */
  grade?: number;

  /** حالة التقرير */
  status: 'draft' | 'submitted' | 'graded' | 'resubmitted';

  /** تاريخ الإنشاء */
  createdAt: string;

  /** تاريخ آخر تحديث */
  updatedAt: string;
}

/** قراءة واحدة أثناء التجربة */
export interface ExperimentReading {
  /** معرف الخطوة المرتبطة */
  stepId: string;

  /** اسم المتغير */
  variable: string;

  /** القيمة المُدخلة */
  value: number | string;

  /** الوحدة */
  unit?: string;

  /** وقت القراءة */
  timestamp: string; // ISO 8601
}

/**
 * ExperimentProgress — تتبع حالة الطالب أثناء التجربة (real-time)
 */
export interface ExperimentProgress {
  experimentId: string;
  studentId: number;
  currentStepIndex: number;
  currentState: 'idle' | 'running' | 'paused';
  elapsedSeconds: number;
  lastSavedAt: string;
}
