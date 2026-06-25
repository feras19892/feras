# Project Tree: my-modern-app (Vue + Hono Monorepo)

```
feras/
├── Root Configuration
│   ├── package.json                # Root: turbo, pnpm workspace
│   ├── turbo.json                  # Pipeline: build, dev, lint, typecheck
│   ├── pnpm-workspace.yaml         # apps/*, packages/*
│   ├── pnpm-lock.yaml
│   ├── docker-compose.yml          # api (3000), web (80) + physlab network
│   ├── .env.example                # NODE_ENV, PORT, DATABASE_URL, JWT_SECRET
│   ├── .gitignore
│   ├── .dockerignore
│   └── *.md Plans                 # MIGRATION_RULES, AUTH_REBUILD_PLAN, PENDULUM_PLAN, ...
│
├── apps/
│   ├── api/                       # Hono + SQLite backend
│   │   ├── src/
│   │   │   ├── index.ts           # Server entry: CORS, routes, port 3000
│   │   │   ├── db/
│   │   │   │   └── index.ts       # SQLite connection + migrations
│   │   │   ├── modules/
│   │   │   │   ├── auth/          # handlers.ts, services.ts, schemas.ts, jwt.ts, crypto.ts, cookies.ts
│   │   │   │   ├── admin/         # handlers.ts, activity-service.ts, session-service.ts
│   │   │   │   ├── dashboard/
│   │   │   │   ├── classes/
│   │   │   │   ├── reports/
│   │   │   │   ├── notifications/
│   │   │   │   ├── settings/
│   │   │   │   └── feedback/
│   │   │   └── shared/
│   │   │       └── middleware/
│   │   │           ├── auth.ts     # JWT verification middleware
│   │   │           └── rate-limit.ts
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── web/                       # Vue 3 + Vite + Pinia frontend
│   │   ├── src/
│   │   │   ├── main.ts            # Entry: Pinia, Router, i18n init
│   │   │   ├── App.vue
│   │   │   ├── router.ts          # Route guards + meta.requiresAuth/roles
│   │   │   ├── env.d.ts
│   │   │   ├── composables/
│   │   │   │   ├── auth/
│   │   │   │   │   └── useAuthActions.ts
│   │   │   │   ├── chemistry/
│   │   │   │   │   ├── useChemistryLab.ts
│   │   │   │   │   ├── useChemistryHistory.ts
│   │   │   │   │   ├── useChemistrySession.ts
│   │   │   │   │   ├── useChemistryTools.ts
│   │   │   │   │   ├── useDropPhysics.ts
│   │   │   │   │   ├── useExecActions.ts
│   │   │   │   │   ├── useExperiments.ts
│   │   │   │   │   ├── useLabSimulation.ts
│   │   │   │   │   ├── useLiquidSimulation.ts
│   │   │   │   │   ├── useMetaballFluid.ts
│   │   │   │   │   ├── usePipetteActions.ts
│   │   │   │   │   ├── useReactionEngine.ts
│   │   │   │   │   ├── useTitrationRecorder.ts
│   │   │   │   │   ├── useToolStateBuilder.ts
│   │   │   │   │   ├── useWorkspaceDrag.ts
│   │   │   │   │   └── ... (metaballRenderer, metaballTypes, etc.)
│   │   │   │   ├── prism/
│   │   │   │   │   └── usePrismExperiment.ts
│   │   │   │   └── spring/
│   │   │   │       └── drawSpringDigital.ts
│   │   │   ├── components/
│   │   │   │   ├── admin/
│   │   │   │   │   ├── AdminDashboard.vue
│   │   │   │   │   └── AdminSmartReports.vue
│   │   │   │   ├── experiment/
│   │   │   │   │   ├── chemistry/
│   │   │   │   │   │   ├── ChemAnalysisButton.vue
│   │   │   │   │   │   ├── ChemAnalysisTab.vue
│   │   │   │   │   │   ├── ExperimentSelector.vue
│   │   │   │   │   │   ├── ExperimentTheoryPanel.vue
│   │   │   │   │   │   ├── ExperimentStepsPanel.vue
│   │   │   │   │   │   ├── FloatingInspector.vue
│   │   │   │   │   │   ├── InspectorPanel.vue
│   │   │   │   │   │   ├── LabItemRenderer.vue
│   │   │   │   │   │   ├── LeftPanel.vue
│   │   │   │   │   │   ├── RightPanel.vue
│   │   │   │   │   │   ├── WorkspaceCanvas.vue
│   │   │   │   │   │   ├── WorkspaceOverlays.vue
│   │   │   │   │   │   ├── ContainerRenderers.vue
│   │   │   │   │   │   └── LabBeaker.vue / LabTestTube.vue / ...
│   │   │   │   │   ├── analysis-calc/
│   │   │   │   │   │   └── AnalysisTabs.vue
│   │   │   │   │   ├── collision/
│   │   │   │   │   │   ├── CollisionDataPanel.vue
│   │   │   │   │   │   └── CollisionReport.vue
│   │   │   │   │   ├── freefall/
│   │   │   │   │   ├── inclined/
│   │   │   │   │   ├── lever/
│   │   │   │   │   ├── lightray/
│   │   │   │   │   ├── mirror/
│   │   │   │   │   ├── pendulum/
│   │   │   │   │   ├── prism/
│   │   │   │   │   ├── projectile/
│   │   │   │   │   ├── spring/
│   │   │   │   │   └── thinlens/
│   │   │   │   └── layout/
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   │   └── stores/
│   │   │   │   │       └── auth.ts        # Pinia: guest mode + JWT state
│   │   │   │   ├── chemistry/
│   │   │   │   │   ├── ChemistryLanding.vue
│   │   │   │   │   └── analysis-calc/
│   │   │   │   │       └── ChemAnalysisTab.vue
│   │   │   │   └── experiments/
│   │   │   │       ├── analysis-calc/
│   │   │   │       │   └── AnalysisCalcExperiment.vue
│   │   │   │       ├── collision/
│   │   │   │       ├── freefall/
│   │   │   │       ├── inclined/
│   │   │   │       ├── lever/
│   │   │   │       ├── lightray/
│   │   │   │       ├── mirror/
│   │   │   │       ├── pendulum/
│   │   │   │       ├── prism/
│   │   │   │       ├── projectile/
│   │   │   │       ├── spring/
│   │   │   │       └── thinlens/
│   │   │   ├── pages/
│   │   │   │   ├── admin.vue
│   │   │   │   ├── dashboard.vue
│   │   │   │   ├── index.vue
│   │   │   │   ├── language.vue
│   │   │   │   ├── login.vue
│   │   │   │   └── register.vue
│   │   │   ├── services/
│   │   │   │   ├── http.ts
│   │   │   │   ├── admin.service.ts
│   │   │   │   ├── class.service.ts
│   │   │   │   ├── home.service.ts
│   │   │   │   ├── notification.service.ts
│   │   │   │   └── report.service.ts
│   │   │   ├── stores/
│   │   │   │   ├── analysis.store.ts
│   │   │   │   ├── chemistry-analysis.store.ts
│   │   │   │   └── i18n.store.ts
│   │   │   ├── types/
│   │   │   │   ├── chemistry.ts
│   │   │   │   ├── physics.ts
│   │   │   │   └── router.ts
│   │   │   ├── utils/
│   │   │   │   └── lab-report*.ts
│   │   │   └── shared/
│   │   │       ├── composables/
│   │   │       ├── types/
│   │   │       ├── ui/
│   │   │       │   ├── BaseButton.vue
│   │   │       │   └── BaseInput.vue
│   │   │       └── utils/
│   │   ├── tests/
│   │   ├── public/
│   │   ├── index.html
│   │   ├── vite.config.ts           # Proxy /api -> localhost:3000
│   │   ├── nginx.conf
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── worker/                      # Background jobs
│       ├── src/
│       │   ├── index.ts
│       │   └── jobs/
│       │       ├── processImages.ts
│       │       └── sendEmail.ts
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── config/
│   │   ├── eslint/
│   │   │   └── index.js
│   │   ├── typescript/
│   │   │   └── base.json
│   │   └── package.json
│   ├── shared-types/
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── user.ts            # User, UserRole, RegisterCredentials
│   │   │   ├── auth.ts
│   │   │   ├── class.ts
│   │   │   └── api-responses.ts
│   │   └── package.json
│   └── ui-kit/
│       ├── src/
│       │   ├── Button/
│       │   ├── Input/
│       │   └── index.ts
│       └── package.json
│
├── modules/
│   └── chemistry/
│       └── experiments/
│
└── toolbox/
    ├── generators/
    │   └── index.js
    └── scripts/
        ├── auto-save.ps1 / .sh
        ├── clean.js
        └── *.bat
```
