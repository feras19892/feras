# خطة المحور الثالث: توحيد بنية وتجريد نظام التجارب
## Experiment Schema & Type Unification

**المدة المُقدرة:** 3-4 ساعات  
**التبعيات:** لا شيء (يمكن البدء فوراً)  
**الأولوية:** عالٍ

---

## المرحلة 3.1: تصميم واجهة BaseExperiment (45 دقيقة)

**الملف المُنشأ:** `packages/shared-types/src/experiment.ts`

**المهام:**
1. تحليل 30 تجربة فيزياء و 57 ملف كيمياء لاستخراج الحقول المشتركة.
2. صياغة `BaseExperiment`:
   ```ts
   export interface BaseExperiment {
     id: string;                    // "physics-pendulum", "chemistry-titration"
     category: 'physics' | 'chemistry';
     subject: string;               // "mechanics", "thermodynamics", "organic"
     title: Record<string, string>;        // { ar: "...
