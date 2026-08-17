import { useI18n } from './useI18n'

export interface ReportTemplate {
  id: string
  label: string
  conclusion: string
  errors: string
  improvements: string
}

export function useReportTemplates() {
  const { t } = useI18n()

  const templates: ReportTemplate[] = [
    {
      id: 'standard',
      label: t('common.reportTemplates.standard', 'قياسي'),
      conclusion: t('reportTemplates.standardConclusion', 'خلصت من التجربة أن النتائج المتحصل عليها تتوافق مع القيم النظرية المتوقعة، حيث أن النسبة المئوية للخطأ ضمن النطاق المقبول.'),
      errors: t('reportTemplates.standardErrors', 'مصادر الخطأ تشمل: دقة الأجهزة المستخدمة، قراءة القياسات، والظروف البيئية المحيطة.'),
      improvements: t('reportTemplates.standardImprovements', 'يمكن تحسين النتائج باستخدام أجهزة أكثر دقة، وتكرار التجربة عدة مرات وأخذ المتوسط.'),
    },
    {
      id: 'detailed',
      label: t('common.reportTemplates.detailed', 'مفصل'),
      conclusion: t('reportTemplates.detailedConclusion', 'بناءً على البيانات المسجلة والتحليل الرياضي، نستنتج أن العلاقة بين المتغيرات خطية (أو عكسية حسب نوع التجربة)، وتتوافق نتائج التجربة مع القانون الفيزيائي المطبق مع نسبة خطأ مقبولة.'),
      errors: t('reportTemplates.detailedErrors', '1. خطأ في قراءة الأجهزة بسبب الدقة المحدودة.\n2. خطأ عشوائي في أخذ القياسات.\n3. عوامل خارجية مثل درجة الحرارة والرطوبة.\n4. خطأ نظامي ناتج عن معايرة الأجهزة.'),
      improvements: t('reportTemplates.detailedImprovements', '1. استخدام أجهزة رقمية أكثر دقة.\n2. تكرار التجربة 3 مرات على الأقل وحساب المتوسط.\n3. ضبط الظروف البيئية في المختبر.\n4. معايرة الأجهزة قبل بدء التجربة.'),
    },
    {
      id: 'minimal',
      label: t('common.reportTemplates.minimal', 'مختصر'),
      conclusion: t('reportTemplates.minimalConclusion', 'النتائج تؤكد العلاقة المتوقعة بين المتغيرات بنسبة خطأ مقبولة.'),
      errors: t('reportTemplates.minimalErrors', 'خطأ في قراءة القياسات ودقة الأجهزة.'),
      improvements: t('reportTemplates.minimalImprovements', 'تكرار التجربة لتحسين الدقة.'),
    },
    {
      id: 'chemistry',
      label: t('common.reportTemplates.chemistry', 'كيميائي'),
      conclusion: t('reportTemplates.chemistryConclusion', 'من خلال التحليل الكيميائي والقياسات المسجلة، نستنتج أن التفاعل قد تم بنجاح وأن النتائج تتوافق مع النظرية الكيميائية المتوقعة، مع مراعاة نسبة الخطأ التجريبية.'),
      errors: t('reportTemplates.chemistryErrors', 'مصادر الخطأ: عدم اكتمال التفاعل، فقدان بعض المادة أثناء النقل، دقة الميزان، ودرجة الحرارة المتغيرة.'),
      improvements: t('reportTemplates.chemistryImprovements', 'لتحسين النتائج: ضمان اكتمال التفاعل، استخدام ميزان رقمي دقيق، التحكم في درجة الحرارة، وتكرار التجربة.'),
    },
  ]

  function applyTemplate(template: ReportTemplate) {
    return {
      conclusion: template.conclusion,
      errors: template.errors,
      improvements: template.improvements,
    }
  }

  return { templates, applyTemplate }
}
