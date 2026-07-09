# هيكل المشروع — PhysLab (Vue + Hono Monorepo)

## الجذر — Root
```
feras/
├── package.json              # إعدادات Turbo + pnpm workspace
├── turbo.json                # خطوط أنابيب: build, dev, lint, typecheck
├── pnpm-workspace.yaml       # apps/*, packages/*
├── docker-compose.yml        # api (3000) + web (80)
├── .env.example              # PORT, DB_PATH, JWT_SECRET, OLLAMA_URL
└── *.md                      # خطط التطوير (12 خطة)
```

## التطبيقات — Apps

### apps/api/ — الخادم (Hono + SQLite)
```
api/
├── src/
│   ├── index.ts              # نقطة الدخول — CORS + routes + port 3000
│   ├── db/
│   │   ├── index.ts          # اتصال SQLite + migrations
│   │   ├── schema.ts
│   │   └── migrations/       # 001_init → 005_admin_full.sql
│   ├── modules/              # 9 وحدات
│   │   ├── ai/               # Ollama: analyze, models, health
│   │   ├── auth/             # JWT + bcrypt + cookies
│   │   ├── admin/            # إدارة + صحة النظام + مراجعة
│   │   ├── classes/          # إنشاء/انضمام الفصول
│   │   ├── dashboard/        # إحصائيات المعلم
│   │   ├── reports/          # التقارير + التصحيح + التعليقات
│   │   ├── notifications/    # الإشعارات الفورية
│   │   ├── settings/         # إعدادات المستخدم
│   │   └── feedback/         # ملاحظات النظام
│   ├── shared/
│   │   └── middleware/       # auth.ts | rate-limit.ts | logger.ts
│   └── routes/
│       └── index.ts
├── data/
│   └── app.db                # قاعدة البيانات SQLite
├── Dockerfile
├── package.json
└── tsconfig.json
```

### apps/web/ — الواجهة (Vue 3 + Vite + Pinia)
```
web/
├── src/
│   ├── main.ts               # Pinia + Router + i18n
│   ├── App.vue
│   ├── router.ts             # حماية المسارات + أدوار
│   ├── pages/                # 6 صفحات
│   │   ├── index.vue         # الصفحة الرئيسية
│   │   ├── login.vue
│   │   ├── register.vue
│   │   ├── dashboard.vue     # لوحة المعلم/الطالب
│   │   ├── admin.vue         # لوحة الأدمن
│   │   └── language.vue
│   ├── components/           # ~150 مكون
│   │   ├── admin/            # 12 مكون (AdminDashboard, AdminUserManager...)
│   │   ├── teacher/          # ClassManager, TeacherGrading, ReportAIAnalyzer...
│   │   ├── student/          # StudentReports, ReportResubmitModal...
│   │   ├── home/
│   │   ├── landing/
│   │   ├── layout/
│   │   │   └── AppNavbar.vue
│   │   ├── shared/           # NotificationBell, ReportViewer, FeedbackModal...
│   │   ├── experiment/
│   │   │   ├── analysis-calc/  # أداة تحليل البيانات
│   │   │   ├── chemistry/      # معمل كيمياء افتراضي (~40 أداة)
│   │   │   ├── collision/
│   │   │   ├── freefall/
│   │   │   ├── inclined/
│   │   │   ├── pendulum/
│   │   │   ├── prism/
│   │   │   ├── projectile/
│   │   │   ├── spring/
│   │   │   ├── mirror/
│   │   │   ├── lightray/
│   │   │   ├── diffraction/
│   │   │   ├── interference/
│   │   │   ├── grating/
│   │   │   ├── polarization/
│   │   │   ├── ideal-gas/
│   │   │   ├── boyles-law/
│   │   │   ├── calorimetry/
│   │   │   ├── specific-heat/
│   │   │   ├── latent-heat/
│   │   │   ├── thermal-expansion/
│   │   │   ├── speed-of-sound/
│   │   │   ├── resonance/
│   │   │   ├── rc-circuit/
│   │   │   ├── faraday/
│   │   │   ├── biot-savart/
│   │   │   ├── joule-equivalent/
│   │   │   ├── wave-interference/
│   │   │   └── thinlens/
│   │   └── ui/
│   │       └── BranchCard.vue
│   ├── composables/          # ~120 composable
│   │   ├── auth/
│   │   ├── admin/
│   │   ├── teacher/
│   │   ├── analysis/
│   │   ├── experiment/
│   │   ├── chemistry/          # محاكاة الكيمياء + التفاعلات
│   │   ├── [25 experiment folders]  # لكل تجربة: Experiment + Layout + Trials + Report
│   │   └── useI18n.ts
│   ├── modules/
│   │   ├── auth/               # Pinia store + LoginForm.vue + useAuth.ts
│   │   ├── dashboard/
│   │   ├── chemistry/
│   │   │   └── analysis-calc/  # ChemAnalysisTab, ChemReportTab...
│   │   ├── physics/
│   │   │   └── experiments/    # ~25 تجربة فيزياء
│   │   └── settings/
│   ├── services/             # 7 services
│   │   ├── http.ts           # fetch مع refresh-token تلقائي
│   │   ├── ai.service.ts     # Ollama: analyzeReport, getModels, health
│   │   ├── report.service.ts
│   │   ├── class.service.ts
│   │   ├── admin.service.ts
│   │   ├── home.service.ts
│   │   └── notification.service.ts
│   ├── stores/
│   │   ├── auth.ts             # حالة المصادقة
│   │   ├── analysis.store.ts
│   │   ├── chemistry-analysis.store.ts
│   │   └── i18n.store.ts
│   ├── locales/              # الترجمة (ar | en | es)
│   │   ├── ar.ts, en.ts, es.ts
│   │   ├── admin.ts, auth.ts, teacher.ts, dashboard.ts
│   │   ├── chemistry*.ts (8 ملفات)
│   │   ├── analysis/           # أدوات التحليل
│   │   └── experiments/        # 12 ملف تجارب
│   ├── types/
│   │   ├── chemistry.ts
│   │   ├── physics.ts
│   │   └── router.ts
│   ├── shared/
│   │   ├── ui/
│   │   │   ├── BaseButton.vue
│   │   │   └── BaseInput.vue
│   │   ├── composables/
│   │   ├── types/
│   │   └── utils/
│   └── utils/
│       └── lab-report*.ts    # بناء وتصدير التقارير
├── tests/                    # Playwright E2E
│   ├── performance-leak.spec.ts
│   ├── monkey-tabs.spec.ts
│   ├── visual-regression.spec.ts
│   └── visual-regression.spec.ts-snapshots/
├── vite.config.ts            # proxy /api → localhost:3000
├── playwright.config.ts
├── Dockerfile
├── nginx.conf
└── package.json
```

### apps/worker/ — الوظائف الخلفية
```
worker/
├── src/
│   ├── index.ts
│   └── jobs/
│       ├── processImages.ts
│       └── sendEmail.ts
├── package.json
└── tsconfig.json
```

## الحزم المشتركة — Packages
```
packages/
├── chemistry-engine/         # محرك الكيمياء
│   └── src/
│       ├── color.ts
│       ├── equations.ts
│       ├── reactions.ts
│       └── types.ts
├── shared-types/             # أنواع TypeScript المشتركة
│   └── src/
│       ├── user.ts
│       ├── auth.ts
│       ├── class.ts
│       └── api-responses.ts
├── ui-kit/                   # مكونات UI مشتركة
│   └── src/
│       ├── Button/Button.vue
│       └── Input/Input.vue
└── config/                   # ESLint + TypeScript presets
```

## الأدوات — Toolbox
```
toolbox/
├── generators/
│   └── index.js
└── scripts/
    ├── auto-save.ps1 / .sh
    ├── clean.js
    └── *.bat
```

---

## ملخص الأرقام

| الطبقة | العدد |
|--------|-------|
| تجارب الفيزياء | 25+ |
| تجارب الكيمياء | 10+ |
| وحدات API | 9 |
| مكونات Vue | ~150 |
| Composables | ~120 |
| لغات الواجهة | 3 (ar, en, es) |
| اختبارات E2E | 4 (Playwright) |
| خدمات Frontend | 7 |
| migrations DB | 5 |

**المكدس التقني:**
- **Backend:** Hono (Node.js) + SQLite + bcrypt + jose (JWT)
- **Frontend:** Vue 3 + Vite + Pinia + i18n + Playwright + Vitest
- **AI:** Ollama (محلي) — llama3 / gemma4
- **Build:** Turbo + pnpm
- **Deploy:** Docker + Docker Compose
