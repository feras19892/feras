# خطة شاملة: أسئلة/امتحان مرتبط بالتجارب

## 1. الملخص
ربط نظام أسئلة تفاعلي بكل تجربة في الفيزياء والكيمياء والأحياء.  
المدرس يضع أسئلة (اختيار من متعدد أو صح/خطأ أو إجابة قصيرة) مخصصة للتجربة.  
الطالب يحلّها بعد أو أثناء التجربة، وترسل الإجابات + النتيجة للمدرس كجزء من التقرير.

## 2. الهدف
- تقييم فهم الطالب للتجربة بشكل مباشر.
- حل مشكلة التجارب التي لا تحتوي على بيانات رقمية (مثل الأحياء).
- إعطاء المدرس تحكم كامل بأسئلة كل تجربة.
- الاستفادة من نظام `Quizzes` الموجود بالفعل في المشروع.

## 3. التجارب المشمولة بالمرحلة الأولى
1. الأحياء — القلب (Heart).
2. الأحياء — الخلية النباتية (Plant Cell).
3. الكيمياء — المعايرة (Titration).
4. الفيزياء — السقوط الحر (Free Fall) كاختبار توجيه.

## 4. نموذج البيانات (Database Schema)

### 4.1 جدول `experiment_question_templates`
```
id
school_id
experiment_id          -- مثل: 'heart', 'titration', 'freefall'
experiment_type        -- 'physics' | 'chemistry' | 'biology'
question_text          -- نص السؤال
question_type          -- 'multiple_choice' | 'true_false' | 'short_answer'
options                -- JSON  [{"label":"A", "text":"..."}]
correct_answer         -- القيمة الصحيحة
points                 -- الدرجة (افتراضي 1)
order_index            -- الترتيب
is_active              -- 0/1
```

### 4.2 جدول `student_experiment_quiz_attempts`
```
id
class_id
student_id
experiment_id
experiment_type
attempted_at
answers                -- JSON  [{"questionId": 1, "answer": "A", "isCorrect": true}]
score                  -- مجموع الدرجات
total_points           -- الدرجة الكاملة
status                 -- 'submitted' | 'graded'
report_id              -- رابط لتقرير experiment_reports (اختياري)
```

### 4.3 جدول `experiment_quiz_settings`
```
id
experiment_id
class_id
passing_score          -- 60% أو 70%
allow_retake           -- true/false
show_correct_answers   -- true/false
```

## 5. API Endpoints

### 5.1 للمدرس
- `GET   /api/experiments/:id/questions` — جلب أسئلة تجربة.
- `POST  /api/experiments/:id/questions` — إضافة/تحديث سؤال.
- `DELETE /api/experiments/:id/questions/:qid` — حذف سؤال.
- `PUT   /api/experiments/:id/quiz-settings` — إعدادات الامتحان.

### 5.2 للطالب
- `GET   /api/experiments/:id/quiz` — جلب الأسئلة المرئية للطالب.
- `POST  /api/experiments/:id/quiz/submit` — إرسال الإجابات وحساب النتيجة.

### 5.3 للمدرس (تقارير)
- `GET   /api/reports/:id/quiz-attempt` — إجابات الطالب على أسئلة التجربة.

## 6. الواجهات الأمامية

### 6.1 للمدرس
- `TeacherExperimentQuestions.vue` — صفحة إدارة الأسئلة لكل تجربة.
- `TeacherQuestionEditor.vue` — نموذج إضافة سؤال (نص + الخيارات + الإجابة).
- `TeacherQuizSettings.vue` — إعدادات الامتحان.

### 6.2 للطالب
- `ExperimentQuizModal.vue` — نافذة أسئلة تظهر داخل التجربة أو في صفحة التحليل.
- `ExperimentQuizResult.vue` — عرض النتيجة بعد الحل.

### 6.3 للتقرير
- إرسال الإجابات ضمن `SubmitReportModal` كـ `quizAttempt` JSON.

## 7. سير المدرس
1. يدخل إلى صفحة التجربة.
2. يضغط "إدارة الأسئلة".
3. يضيف أسئلة + يحدد الإجابة الصحيحة.
4. يضبط إعدادات الامتحان (درجة النجاح، عدد المحاولات).
5. يحفظ.

## 8. سير الطالب
1. يفتح التجربة وينفذها.
2. بعد الانتهاء، يظهر زر "امتحان التجربة".
3. يحل الأسئلة ويضغط "إنهاء".
4. ترى النتيجة مباشرة (إذا مسموح).
5. عند إرسال التقرير للمدرس، تُرفق الإجابات والعلامة.

## 9. التقرير المرسل للمدرس
```
تقرير تجربة: {sourceName}
الطالب: {name} | التاريخ: {date}

[جدول القياسات / الملاحظات]
[الرسم البياني/الصورة]

نتيجة الامتحان: {score} / {totalPoints} ({percentage}%)
الإجابات:
1. {question} — إجابة الطالب: {answer} (صح/خطأ)
2. ...

الاستنتاج: {conclusion}
مصادر الأخطاء: {errors}
التحسينات: {improvements}
```

## 10. الأمان والصلاحيات
- المدرس يملك `school_id` أو `class_id`؛ الأسئلة تنتمي للمدرس.
- الطالب يرى فقط الأسئلة المفعّلة للفصل الخاص به.
- `POST /submit` يتحقق من أن الطالب مسجل في `class_id`.
- لا يمكن للطالب تعديل إجابة بعد الإرسال إلا إذا `allow_retake = true`.

## 11. الملفات الجديدة
- `apps/api/src/modules/experiments/questions/handlers.ts`
- `apps/api/src/modules/experiments/questions/services.ts`
- `apps/api/src/modules/experiments/questions/schemas.ts`
- `apps/web/src/modules/quiz/TeacherExperimentQuestions.vue`
- `apps/web/src/modules/quiz/ExperimentQuizModal.vue`
- `apps/web/src/modules/quiz/ExperimentQuizResult.vue`
- `apps/web/src/services/experiment-quiz.service.ts`
- `apps/web/src/types/experiment-quiz.ts`

## 12. الملفات المعدّلة
- `apps/api/src/db/index.ts` — إضافة الجداول الجديدة.
- `apps/api/src/index.ts` — ربط الـ routes.
- `apps/web/src/components/experiment/SubmitReportModal.vue` — إضافة `quizAttempt` إلى البيانات المرسلة.
- `apps/web/src/modules/chemistry/analysis-calc/ChemAnalysisPage.vue` — عرض زر الامتحان بعد التجربة.
- `apps/web/src/pages/analysis-v3.vue` — عرض زر الامتحان للفيزياء.
- `apps/web/src/pages/biology/anatomy/heart.vue` — عرض زر الامتحان للأحياء.

## 13. الخطوات التنفيذية بالترتيب

### المرحلة 1: الأساس
1. إنشاء الجداول في `apps/api/src/db/index.ts`.
2. إنشاء handlers + services + schemas في API.
3. ربط الـ routes في `apps/api/src/index.ts`.
4. إنشاء `types/experiment-quiz.ts` في الواجهة.
5. إنشاء `services/experiment-quiz.service.ts`.

### المرحلة 2: إدارة المدرس
6. إنشاء `TeacherExperimentQuestions.vue`.
7. إنشاء `TeacherQuestionEditor.vue`.
8. إضافة رابط للأسئلة في صفحة المدرس/التجربة.

### المرحلة 3: الطالب
9. إنشاء `ExperimentQuizModal.vue`.
10. إنشاء `ExperimentQuizResult.vue`.
11. إضافة زر "امتحان التجربة" في تجارب الأحياء/الكيمياء/الفيزياء.

### المرحلة 4: التقرير
12. تعديل `SubmitReportModal` لاستقبال وإرسال `quizAttempt`.
13. تعديل `experiment_reports` لحفظ `quiz_attempt_id`.
14. تعديل عرض التقرير للمدرس لإظهار الأسئلة والإجابات.

## 14. معايير النجاح
- المدرس يستطيع إضافة 5 أسئلة لتجربة واحدة.
- الطالب يحل الأسئلة ويحصل على نتيجة.
- التقرير المرسل يحتوي على النتيجة والإجابات.
- لا يمكن للطالب من فصل آخر رؤية الأسئلة.
- الفحص (`typecheck`) سليم.

## 15. ملاحظات
- الاستفادة من نظام `Quizzes` الموجود تختصر وقت التنفيذ.
- لا نمسح التقارير الحالية؛ نضيف الامتحان كملحق اختياري.
- يمكن تفعيل الامتحان لبعض التجارب فقط.
