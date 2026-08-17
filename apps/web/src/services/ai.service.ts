import { ollamaChat, ollamaTags } from './ollama';

export async function analyzeReport(data: {
  experiment_name: string;
  student_name?: string;
  readings: string;
  columns?: string;
  equations?: string;
  plots?: string;
  conclusion?: string;
  chart_snapshot?: string;
}): Promise<{ success: boolean; analysis: string; grade?: number; message?: string }> {
  try {
    const reportContext = [
      `التجربة: ${data.experiment_name}`,
      `الطالب: ${data.student_name || 'غير محدد'}`,
      `القراءات: ${data.readings || 'لا توجد'}`,
      `الأعمدة: ${data.columns || 'لا توجد'}`,
      `المعادلات: ${data.equations || 'لا توجد'}`,
      `الرسومات: ${data.plots || 'لا توجد'}`,
      `الخاتمة: ${data.conclusion || 'لا توجد'}`,
      data.chart_snapshot ? 'يوجد رسم بياني (chart snapshot)' : 'لا يوجد رسم بياني',
    ].join('\n');

    const systemPrompt = `أنت خبير في تقييم تقارير التجارب العلمية. حلل التقرير التالي بشكل شامل واحترافي.

يجب أن يكون تحليلك باللغة العربية ويشمل:
1. ملخص التقرير
2. تقييم جودة البيانات والقراءات
3. تقييم المعادلات والرسومات
4. تقييم الخاتمة
5. درجة مقترحة من 100
6. توصيات للتحسين

في نهاية التحليل، اكتب سطرًا بالصيغة التالية بالضبط:
GRADE: <رقم من 0 إلى 100>`;

    const aiAnalysis = await ollamaChat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: reportContext },
    ]);

    const gradeMatch = aiAnalysis.match(/GRADE:\s*(\d+)/i);
    const grade = gradeMatch ? Math.min(100, Math.max(0, parseInt(gradeMatch[1], 10))) : 0;
    const cleanAnalysis = aiAnalysis.replace(/GRADE:\s*\d+/i, '').trim();

    return { success: true, analysis: cleanAnalysis, grade };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, analysis: '', message: `Ollama error: ${msg}` };
  }
}

export async function getAiModels(): Promise<{ success: boolean; models: string[]; message?: string }> {
  try {
    const models = await ollamaTags();
    return { success: true, models };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, models: [], message: msg };
  }
}

export async function checkAiHealth(): Promise<{ success: boolean; connected: boolean; modelCount: number }> {
  try {
    const models = await ollamaTags();
    return { success: true, connected: true, modelCount: models.length };
  } catch {
    return { success: true, connected: false, modelCount: 0 };
  }
}
