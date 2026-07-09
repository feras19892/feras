feras
├── .dockerignore
├── .env.example
├── .gitignore
├── .npmrc
├── ai_rules.md
├── ANALYSIS_CALC_PLAN.md
├── arabic_lines.csv
├── arabic_lines2.csv
├── AUTH_REBUILD_PLAN.md
├── build.txt
├── docker-compose.yml
├── lint-check.txt
├── lint-check2.txt
├── lint-check3.txt
├── lint-check4.txt
├── lint-check5.txt
├── lint-check6.txt
├── lint-check7.txt
├── lint-check-mirror.txt
├── lint-current.txt
├── lint-json.json
├── lint-live.txt
├── lint-live2.txt
├── lint-live3.txt
├── lint-live4.txt
├── lint-output.txt
├── lint-unix.txt
├── lint-web.txt
├── MIGRATION_RULES.md
├── package.json
├── parse_lint.py
├── PENDULUM_PLAN.md
├── PLAN_01_BACKEND.md
├── PLAN_02_FRONTEND_SERVICES.md
├── PLAN_03_COMPONENTS.md
├── PLAN_04_FLOW_CHECKLIST.md
├── pnpm-workspace.yaml
├── PRISM_DEEP_REPAIR_PLAN.md
├── PROJECT_REPAIR_PLAN.md
├── project_tree_clean.md
├── TEACHER_STUDENT_FULL_PLAN.md
├── TEACHER_STUDENT_MASTER_PLAN.md
├── TEACHER_STUDENT_PROGRESS.md
├── temp_lab_report.txt
├── turbo.json
├── typecheck.txt
├── typecheck2.txt
├── apps
│   ├── api
│   │   ├── .env
│   │   ├── .eslintrc.cjs
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── data
│   │   │   ├── app.db
│   │   │   ├── app.db-shm
│   │   │   └── app.db-wal
│   │   └── src
│   │       ├── index.ts
│   │       ├── db
│   │       │   ├── index.ts
│   │       │   ├── schema.ts
│   │       │   └── migrations
│   │       │       ├── 001_init.sql
│   │       │       ├── 002_reports.sql
│   │       │       ├── 003_enrich_reports.sql
│   │       │       ├── 004_admin_enhance.sql
│   │       │       ├── 005_admin_full.sql
│   │       │       └── README.md
│   │       ├── modules
│   │       │   ├── admin
│   │       │   │   ├── activity-service.ts
│   │       │   │   ├── audit-service.ts
│   │       │   │   ├── export-service.ts
│   │       │   │   ├── feedback-service.ts
│   │       │   │   ├── handlers.ts
│   │       │   │   ├── services.ts
│   │       │   │   ├── session-service.ts
│   │       │   │   ├── system-health-service.ts
│   │       │   │   ├── user-detail-service.ts
│   │       │   │   └── warning-service.ts
│   │       │   ├── ai
│   │       │   │   ├── handlers.ts
│   │       │   │   └── services.ts
│   │       │   ├── auth
│   │       │   │   ├── cookies.ts
│   │       │   │   ├── crypto.ts
│   │       │   │   ├── handlers.ts
│   │       │   │   ├── jwt.ts
│   │       │   │   ├── schemas.ts
│   │       │   │   └── services.ts
│   │       │   ├── classes
│   │       │   │   ├── handlers.ts
│   │       │   │   ├── schemas.ts
│   │       │   │   └── services.ts
│   │       │   ├── dashboard
│   │       │   │   ├── handlers.ts
│   │       │   │   └── services.ts
│   │       │   ├── feedback
│   │       │   │   └── handlers.ts
│   │       │   ├── notifications
│   │       │   │   ├── handlers.ts
│   │       │   │   ├── schemas.ts
│   │       │   │   └── services.ts
│   │       │   ├── reports
│   │       │   │   ├── handlers.ts
│   │       │   │   ├── schemas.ts
│   │       │   │   └── services.ts
│   │       │   └── settings
│   │       │       └── handlers.ts
│   │       ├── routes
│   │       │   └── index.ts
│   │       └── shared
│   │           ├── middleware
│   │           │   ├── auth.ts
│   │           │   ├── logger.ts
│   │           │   └── rate-limit.ts
│   │           └── utils
│   │               ├── hash.ts
│   │               └── http.ts
│   ├── web
│   │   ├── .eslintrc.cjs
│   │   ├── Dockerfile
│   │   ├── index.html
│   │   ├── lint_errors.txt
│   │   ├── lint-output.txt
│   │   ├── nginx.conf
│   │   ├── package.json
│   │   ├── playwright.config.ts
│   │   ├── thinlens-tsc.txt
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   ├── vite.config.ts.timestamp-1782593125798-9394244cac5028.mjs
│   │   ├── vitest.config.ts
│   │   ├── apps
│   │   │   └── web
│   │   │       └── src
│   │   │           ├── components
│   │   │           │   └── experiment
│   │   │           │       └── lever
│   │   │           ├── composables
│   │   │           │   └── lever
│   │   │           └── modules
│   │   │               └── physics
│   │   │                   └── experiments
│   │   │                       └── lever
│   │   ├── src
│   │   │   ├── App.vue
│   │   │   ├── env.d.ts
│   │   │   ├── main.ts
│   │   │   ├── router.ts
│   │   │   ├── vite-env.d.ts
│   │   │   ├── assets
│   │   │   │   └── README.md
│   │   │   ├── components
│   │   │   │   ├── admin
│   │   │   │   │   ├── AdminClassManager.vue
│   │   │   │   │   ├── AdminDashboard.vue
│   │   │   │   │   ├── AdminExportPanel.vue
│   │   │   │   │   ├── AdminFeedbackPanel.vue
│   │   │   │   │   ├── AdminGlobalSearch.vue
│   │   │   │   │   ├── AdminOverview.vue
│   │   │   │   │   ├── AdminReportViewer.vue
│   │   │   │   │   ├── AdminSmartReports.vue
│   │   │   │   │   ├── AdminSystemHealth.vue
│   │   │   │   │   ├── AdminUserDetail.vue
│   │   │   │   │   └── AdminUserManager.vue
│   │   │   │   ├── dev
│   │   │   │   │   ├── ExperimentMonitorPage.vue
│   │   │   │   │   └── ExperimentMonitorWidget.vue
│   │   │   │   ├── experiment
│   │   │   │   │   ├── DataTable.vue
│   │   │   │   │   ├── DeletableSection.vue
│   │   │   │   │   ├── EquationsPanel.vue
│   │   │   │   │   ├── ExperimentReport.vue
│   │   │   │   │   ├── GuidePanel.vue
│   │   │   │   │   ├── ParamPanel.vue
│   │   │   │   │   ├── SubmitReportModal.vue
│   │   │   │   │   ├── analysis-calc
│   │   │   │   │   │   ├── AnalysisChartWorkspace.vue
│   │   │   │   │   │   ├── AnalysisConclusionPanel.vue
│   │   │   │   │   │   ├── AnalysisDataTable.vue
│   │   │   │   │   │   ├── AnalysisEquationsPanel.vue
│   │   │   │   │   │   ├── AnalysisErrorPanel.vue
│   │   │   │   │   │   ├── AnalysisMediumPanel.vue
│   │   │   │   │   │   ├── AnalysisMenuBar.vue
│   │   │   │   │   │   ├── AnalysisReportExport.vue
│   │   │   │   │   │   ├── AnalysisReportPreview.vue
│   │   │   │   │   │   ├── AnalysisStatsPanel.vue
│   │   │   │   │   │   ├── AnalysisTab.vue
│   │   │   │   │   │   ├── AnalysisTabs.vue
│   │   │   │   │   │   ├── DataTab.vue
│   │   │   │   │   │   ├── EquationDetail.vue
│   │   │   │   │   │   ├── ReportTab.vue
│   │   │   │   │   │   └── StudentInfoPanel.vue
│   │   │   │   │   ├── boyles-law
│   │   │   │   │   │   ├── BoylesLawCanvas.vue
│   │   │   │   │   │   ├── BoylesLawMenuBar.vue
│   │   │   │   │   │   ├── BoylesLawStatusBar.vue
│   │   │   │   │   │   └── panels
│   │   │   │   │   ├── calorimetry
│   │   │   │   │   │   ├── CalorimetryCanvas.vue
│   │   │   │   │   │   ├── CalorimetryControlBar.vue
│   │   │   │   │   │   ├── CalorimetryHelpModal.vue
│   │   │   │   │   │   ├── CalorimetryMenuBar.vue
│   │   │   │   │   │   ├── CalorimetryOverlayPanels.vue
│   │   │   │   │   │   ├── CalorimetryPanelBody.vue
│   │   │   │   │   │   ├── CalorimetryStatusBar.vue
│   │   │   │   │   │   └── panels
│   │   │   │   │   │       ├── CalorimetryChartPanel.vue
│   │   │   │   │   │       ├── CalorimetryLawsPanel.vue
│   │   │   │   │   │       ├── CalorimetryParamsPanel.vue
│   │   │   │   │   │       ├── CalorimetryReadingsPanel.vue
│   │   │   │   │   │       ├── CalorimetryResultsPanel.vue
│   │   │   │   │   │       └── CalorimetryTrialsPanel.vue
│   │   │   │   │   ├── chemistry
│   │   │   │   │   │   ├── ANALYSIS_REPORT.md
│   │   │   │   │   │   ├── BUILD_PLAN_RETORT_STAND.md
│   │   │   │   │   │   ├── BuretteDisplay.vue
│   │   │   │   │   │   ├── ChemAnalysisButton.vue
│   │   │   │   │   │   ├── ChemicalCard.vue
│   │   │   │   │   │   ├── ChemicalShelfPanel.vue
│   │   │   │   │   │   ├── ChemReportModal.vue
│   │   │   │   │   │   ├── ContainerRenderers.vue
│   │   │   │   │   │   ├── ExperimentSelector.vue
│   │   │   │   │   │   ├── ExperimentStepsPanel.vue
│   │   │   │   │   │   ├── ExperimentTheoryPanel.vue
│   │   │   │   │   │   ├── floating-inspector.css
│   │   │   │   │   │   ├── FloatingInspector.vue
│   │   │   │   │   │   ├── GuidePanel.vue
│   │   │   │   │   │   ├── InspectorPanel.vue
│   │   │   │   │   │   ├── LabAssistant.vue
│   │   │   │   │   │   ├── LabBalance.vue
│   │   │   │   │   │   ├── LabBeaker.vue
│   │   │   │   │   │   ├── LabBeakerClamp.vue
│   │   │   │   │   │   ├── LabBeakerPhysics.vue
│   │   │   │   │   │   ├── LabBunsenBurner.vue
│   │   │   │   │   │   ├── LabBurette.vue
│   │   │   │   │   │   ├── LabDropper.vue
│   │   │   │   │   │   ├── LabErlenmeyer.vue
│   │   │   │   │   │   ├── LabFilterFunnel.vue
│   │   │   │   │   │   ├── LabGradCylinder.vue
│   │   │   │   │   │   ├── LabHeatingMantle.vue
│   │   │   │   │   │   ├── LabHotPlate.vue
│   │   │   │   │   │   ├── LabItemRenderer.css
│   │   │   │   │   │   ├── LabItemRenderer.vue
│   │   │   │   │   │   ├── LabPhMeter.vue
│   │   │   │   │   │   ├── LabPipette.vue
│   │   │   │   │   │   ├── LabRetortStandAssembly.vue
│   │   │   │   │   │   ├── LabRoundBottomFlask.vue
│   │   │   │   │   │   ├── LabRubberStopper.vue
│   │   │   │   │   │   ├── LabSeparatoryFunnel.vue
│   │   │   │   │   │   ├── LabSpatula.vue
│   │   │   │   │   │   ├── LabStatsPanel.vue
│   │   │   │   │   │   ├── LabStirringRod.vue
│   │   │   │   │   │   ├── LabTestTube.vue
│   │   │   │   │   │   ├── LabTestTubeRack.vue
│   │   │   │   │   │   ├── LabVolumetricFlask.vue
│   │   │   │   │   │   ├── LabVolumetricPipette.vue
│   │   │   │   │   │   ├── LabWatchGlass.vue
│   │   │   │   │   │   ├── LabWoodenBase.vue
│   │   │   │   │   │   ├── LeftPanel.vue
│   │   │   │   │   │   ├── MASTER_PLAN.md
│   │   │   │   │   │   ├── NotesPanel.vue
│   │   │   │   │   │   ├── PENDING_TOOLS.md
│   │   │   │   │   │   ├── RightPanel.vue
│   │   │   │   │   │   ├── TitrationDataTable.vue
│   │   │   │   │   │   ├── TOOL_ANALYSIS.md
│   │   │   │   │   │   ├── TOOLS_CATALOG.md
│   │   │   │   │   │   ├── UNIVERSITY_LAB_PLAN.md
│   │   │   │   │   │   ├── VISUAL_INTERACTION_PLAN.md
│   │   │   │   │   │   ├── WorkspaceActionsPanel.vue
│   │   │   │   │   │   ├── WorkspaceCanvas.vue
│   │   │   │   │   │   └── WorkspaceOverlays.vue
│   │   │   │   │   ├── collision
│   │   │   │   │   │   ├── CollisionCanvas.vue
│   │   │   │   │   │   ├── CollisionControlBar.vue
│   │   │   │   │   │   ├── CollisionDataPanel.vue
│   │   │   │   │   │   ├── CollisionEquationsPanel.vue
│   │   │   │   │   │   ├── CollisionHelpModal.vue
│   │   │   │   │   │   ├── CollisionMenuBar.vue
│   │   │   │   │   │   ├── CollisionOverlayPanels.vue
│   │   │   │   │   │   ├── CollisionPanelBody.vue
│   │   │   │   │   │   ├── CollisionParamsPanel.vue
│   │   │   │   │   │   ├── CollisionReport.vue
│   │   │   │   │   │   ├── CollisionSignalPanel.vue
│   │   │   │   │   │   ├── CollisionStatsPanel.vue
│   │   │   │   │   │   └── CollisionStatusBar.vue
│   │   │   │   │   ├── diffraction
│   │   │   │   │   │   ├── DiffractionCanvas.vue
│   │   │   │   │   │   ├── DiffractionControlBar.vue
│   │   │   │   │   │   ├── DiffractionHelpModal.vue
│   │   │   │   │   │   ├── DiffractionMenuBar.vue
│   │   │   │   │   │   ├── DiffractionOverlayPanels.vue
│   │   │   │   │   │   ├── DiffractionPanelBody.vue
│   │   │   │   │   │   ├── DiffractionStatusBar.vue
│   │   │   │   │   │   └── panels
│   │   │   │   │   │       ├── DiffractionChartPanel.vue
│   │   │   │   │   │       ├── DiffractionLawsPanel.vue
│   │   │   │   │   │       ├── DiffractionParamsPanel.vue
│   │   │   │   │   │       ├── DiffractionReadingsPanel.vue
│   │   │   │   │   │       ├── DiffractionResultsPanel.vue
│   │   │   │   │   │       └── DiffractionTrialsPanel.vue
│   │   │   │   │   ├── freefall
│   │   │   │   │   │   ├── FreeFallCanvas.vue
│   │   │   │   │   │   ├── FreeFallControlBar.vue
│   │   │   │   │   │   ├── FreeFallEquationsPanel.vue
│   │   │   │   │   │   ├── FreeFallGuidePanel.vue
│   │   │   │   │   │   ├── FreeFallHelpModal.vue
│   │   │   │   │   │   ├── FreeFallMenuBar.vue
│   │   │   │   │   │   ├── FreeFallOverlayPanels.vue
│   │   │   │   │   │   ├── FreeFallPanelBody.vue
│   │   │   │   │   │   ├── FreeFallParamsPanel.vue
│   │   │   │   │   │   ├── FreeFallReport.vue
│   │   │   │   │   │   ├── FreeFallReportPanel.vue
│   │   │   │   │   │   ├── FreeFallScatterPanel.vue
│   │   │   │   │   │   ├── FreeFallSignalPanel.vue
│   │   │   │   │   │   ├── FreeFallStatsPanel.vue
│   │   │   │   │   │   ├── FreeFallStatusBar.vue
│   │   │   │   │   │   └── FreeFallTablePanel.vue
│   │   │   │   │   ├── grating
│   │   │   │   │   │   ├── GratingCanvas.vue
│   │   │   │   │   │   ├── GratingControlBar.vue
│   │   │   │   │   │   ├── GratingHelpModal.vue
│   │   │   │   │   │   ├── GratingMenuBar.vue
│   │   │   │   │   │   ├── GratingOverlayPanels.vue
│   │   │   │   │   │   ├── GratingPanelBody.vue
│   │   │   │   │   │   ├── GratingStatusBar.vue
│   │   │   │   │   │   └── panels
│   │   │   │   │   │       ├── GratingChartPanel.vue
│   │   │   │   │   │       ├── GratingLawsPanel.vue
│   │   │   │   │   │       ├── GratingParamsPanel.vue
│   │   │   │   │   │       ├── GratingReadingsPanel.vue
│   │   │   │   │   │       ├── GratingResultsPanel.vue
│   │   │   │   │   │       └── GratingTrialsPanel.vue
│   │   │   │   │   ├── ideal-gas
│   │   │   │   │   │   ├── IdealGasCanvas.vue
│   │   │   │   │   │   ├── IdealGasControlBar.vue
│   │   │   │   │   │   ├── IdealGasHelpModal.vue
│   │   │   │   │   │   ├── IdealGasMenuBar.vue
│   │   │   │   │   │   ├── IdealGasOverlayPanels.vue
│   │   │   │   │   │   ├── IdealGasPanelBody.vue
│   │   │   │   │   │   ├── IdealGasStatusBar.vue
│   │   │   │   │   │   └── panels
│   │   │   │   │   │       ├── IdealGasChartPanel.vue
│   │   │   │   │   │       ├── IdealGasLawsPanel.vue
│   │   │   │   │   │       ├── IdealGasParamsPanel.vue
│   │   │   │   │   │       ├── IdealGasReadingsPanel.vue
│   │   │   │   │   │       ├── IdealGasResultsPanel.vue
│   │   │   │   │   │       └── IdealGasTrialsPanel.vue
│   │   │   │   │   ├── inclined
│   │   │   │   │   │   ├── InclinedCanvas.vue
│   │   │   │   │   │   ├── InclinedControlBar.vue
│   │   │   │   │   │   ├── InclinedEquationsPanel.vue
│   │   │   │   │   │   ├── InclinedHelpModal.vue
│   │   │   │   │   │   ├── InclinedMenuBar.vue
│   │   │   │   │   │   ├── InclinedOverlayPanels.vue
│   │   │   │   │   │   ├── InclinedPanelBody.vue
│   │   │   │   │   │   ├── InclinedParamsPanel.vue
│   │   │   │   │   │   ├── InclinedReport.vue
│   │   │   │   │   │   ├── InclinedScatterPanel.vue
│   │   │   │   │   │   ├── InclinedSignalPanel.vue
│   │   │   │   │   │   ├── InclinedStatsPanel.vue
│   │   │   │   │   │   ├── InclinedStatusBar.vue
│   │   │   │   │   │   └── InclinedTablePanel.vue
│   │   │   │   │   ├── interference
│   │   │   │   │   │   ├── InterferenceCanvas.vue
│   │   │   │   │   │   ├── InterferenceControlBar.vue
│   │   │   │   │   │   ├── InterferenceHelpModal.vue
│   │   │   │   │   │   ├── InterferenceMenuBar.vue
│   │   │   │   │   │   ├── InterferenceOverlayPanels.vue
│   │   │   │   │   │   ├── InterferencePanelBody.vue
│   │   │   │   │   │   ├── InterferenceStatusBar.vue
│   │   │   │   │   │   └── panels
│   │   │   │   │   │       ├── InterferenceChartPanel.vue
│   │   │   │   │   │       ├── InterferenceLawsPanel.vue
│   │   │   │   │   │       ├── InterferenceParamsPanel.vue
│   │   │   │   │   │       ├── InterferenceReadingsPanel.vue
│   │   │   │   │   │       ├── InterferenceResultsPanel.vue
│   │   │   │   │   │       └── InterferenceTrialsPanel.vue
│   │   │   │   │   ├── latent-heat
│   │   │   │   │   │   ├── LatentHeatCanvas.vue
│   │   │   │   │   │   ├── LatentHeatControlBar.vue
│   │   │   │   │   │   ├── LatentHeatHelpModal.vue
│   │   │   │   │   │   ├── LatentHeatMenuBar.vue
│   │   │   │   │   │   ├── LatentHeatOverlayPanels.vue
│   │   │   │   │   │   ├── LatentHeatPanelBody.vue
│   │   │   │   │   │   ├── LatentHeatStatusBar.vue
│   │   │   │   │   │   └── panels
│   │   │   │   │   │       ├── LatentHeatChartPanel.vue
│   │   │   │   │   │       ├── LatentHeatLawsPanel.vue
│   │   │   │   │   │       ├── LatentHeatParamsPanel.vue
│   │   │   │   │   │       ├── LatentHeatReadingsPanel.vue
│   │   │   │   │   │       ├── LatentHeatResultsPanel.vue
│   │   │   │   │   │       └── LatentHeatTrialsPanel.vue
│   │   │   │   │   ├── lever
│   │   │   │   │   │   ├── LeverCanvas.vue
│   │   │   │   │   │   ├── LeverControlBar.vue
│   │   │   │   │   │   ├── LeverHelpModal.vue
│   │   │   │   │   │   ├── LeverMenuBar.vue
│   │   │   │   │   │   ├── LeverOverlayPanels.vue
│   │   │   │   │   │   ├── LeverPanelBody.vue
│   │   │   │   │   │   └── LeverStatusBar.vue
│   │   │   │   │   ├── lightray
│   │   │   │   │   │   ├── LightRayCanvas.vue
│   │   │   │   │   │   ├── LightRayChart.vue
│   │   │   │   │   │   ├── LightRayControlBar.vue
│   │   │   │   │   │   ├── LightRayHelpModal.vue
│   │   │   │   │   │   ├── LightRayMenuBar.vue
│   │   │   │   │   │   ├── LightRayOverlayPanels.vue
│   │   │   │   │   │   ├── LightRayPanelBody.vue
│   │   │   │   │   │   └── LightRayStatusBar.vue
│   │   │   │   │   ├── mirror
│   │   │   │   │   │   ├── MirrorCanvas.vue
│   │   │   │   │   │   └── MirrorPanelBody.vue
│   │   │   │   │   ├── pendulum
│   │   │   │   │   │   ├── PendulumCanvas.vue
│   │   │   │   │   │   ├── PendulumControlBar.vue
│   │   │   │   │   │   ├── PendulumCutButton.vue
│   │   │   │   │   │   ├── PendulumDataPanel.vue
│   │   │   │   │   │   ├── PendulumEnvSelector.vue
│   │   │   │   │   │   ├── PendulumFFTPanel.vue
│   │   │   │   │   │   ├── PendulumHelpModal.vue
│   │   │   │   │   │   ├── PendulumLiveAnalysis.vue
│   │   │   │   │   │   ├── PendulumMenuBar.vue
│   │   │   │   │   │   ├── PendulumModeSwitcher.vue
│   │   │   │   │   │   ├── PendulumOverlayPanels.vue
│   │   │   │   │   │   ├── PendulumPanelBody.vue
│   │   │   │   │   │   ├── PendulumParamPanel.vue
│   │   │   │   │   │   ├── PendulumPhaseSpace.vue
│   │   │   │   │   │   ├── PendulumPhotogate.vue
│   │   │   │   │   │   ├── PendulumReport.vue
│   │   │   │   │   │   ├── PendulumScatterChart.vue
│   │   │   │   │   │   ├── PendulumSignalChart.vue
│   │   │   │   │   │   ├── PendulumStatusBar.vue
│   │   │   │   │   │   ├── PendulumStepTracker.vue
│   │   │   │   │   │   └── PendulumTutorCard.vue
│   │   │   │   │   ├── polarization
│   │   │   │   │   │   ├── PolarizationCanvas.vue
│   │   │   │   │   │   ├── PolarizationControlBar.vue
│   │   │   │   │   │   ├── PolarizationHelpModal.vue
│   │   │   │   │   │   ├── PolarizationMenuBar.vue
│   │   │   │   │   │   ├── PolarizationOverlayPanels.vue
│   │   │   │   │   │   ├── PolarizationPanelBody.vue
│   │   │   │   │   │   ├── PolarizationStatusBar.vue
│   │   │   │   │   │   └── panels
│   │   │   │   │   │       ├── PolarizationChartPanel.vue
│   │   │   │   │   │       ├── PolarizationLawsPanel.vue
│   │   │   │   │   │       ├── PolarizationParamsPanel.vue
│   │   │   │   │   │       ├── PolarizationReadingsPanel.vue
│   │   │   │   │   │       ├── PolarizationResultsPanel.vue
│   │   │   │   │   │       └── PolarizationTrialsPanel.vue
│   │   │   │   │   ├── prism
│   │   │   │   │   │   ├── PrismCanvas.vue
│   │   │   │   │   │   ├── PrismControlBar.vue
│   │   │   │   │   │   ├── PrismHelpModal.vue
│   │   │   │   │   │   ├── PrismMenuBar.vue
│   │   │   │   │   │   ├── PrismOverlayPanels.vue
│   │   │   │   │   │   ├── PrismPanelBody.vue
│   │   │   │   │   │   ├── PrismStatusBar.vue
│   │   │   │   │   │   └── panels
│   │   │   │   │   │       ├── PrismChartPanel.vue
│   │   │   │   │   │       ├── PrismLawsPanel.vue
│   │   │   │   │   │       ├── PrismParamsPanel.vue
│   │   │   │   │   │       ├── PrismReadingsPanel.vue
│   │   │   │   │   │       ├── PrismResultsPanel.vue
│   │   │   │   │   │       └── PrismTrialsPanel.vue
│   │   │   │   │   ├── projectile
│   │   │   │   │   │   ├── ProjectileCanvas.vue
│   │   │   │   │   │   ├── ProjectileControlBar.vue
│   │   │   │   │   │   ├── ProjectileHelpModal.vue
│   │   │   │   │   │   ├── ProjectileHintOverlay.vue
│   │   │   │   │   │   ├── ProjectileMenuBar.vue
│   │   │   │   │   │   ├── ProjectileOverlayPanels.vue
│   │   │   │   │   │   ├── ProjectilePanelBody.vue
│   │   │   │   │   │   ├── ProjectileReport.vue
│   │   │   │   │   │   ├── ProjectileStatusBar.vue
│   │   │   │   │   │   └── ProjectileStepTracker.vue
│   │   │   │   │   ├── resonance
│   │   │   │   │   │   ├── ResonanceCanvas.vue
│   │   │   │   │   │   ├── ResonanceControlBar.vue
│   │   │   │   │   │   ├── ResonanceHelpModal.vue
│   │   │   │   │   │   ├── ResonanceMenuBar.vue
│   │   │   │   │   │   ├── ResonanceOverlayPanels.vue
│   │   │   │   │   │   ├── ResonancePanelBody.vue
│   │   │   │   │   │   ├── ResonanceStatusBar.vue
│   │   │   │   │   │   └── panels
│   │   │   │   │   │       ├── ResonanceChartPanel.vue
│   │   │   │   │   │       ├── ResonanceLawsPanel.vue
│   │   │   │   │   │       ├── ResonanceParamsPanel.vue
│   │   │   │   │   │       ├── ResonanceReadingsPanel.vue
│   │   │   │   │   │       ├── ResonanceResultsPanel.vue
│   │   │   │   │   │       └── ResonanceTrialsPanel.vue
│   │   │   │   │   ├── specific-heat
│   │   │   │   │   │   ├── SpecificHeatCanvas.vue
│   │   │   │   │   │   ├── SpecificHeatControlBar.vue
│   │   │   │   │   │   ├── SpecificHeatMenuBar.vue
│   │   │   │   │   │   ├── SpecificHeatPanelBody.vue
│   │   │   │   │   │   ├── SpecificHeatStatusBar.vue
│   │   │   │   │   │   └── panels
│   │   │   │   │   ├── speed-of-sound
│   │   │   │   │   │   ├── SpeedOfSoundCanvas.vue
│   │   │   │   │   │   ├── SpeedOfSoundControlBar.vue
│   │   │   │   │   │   ├── SpeedOfSoundHelpModal.vue
│   │   │   │   │   │   ├── SpeedOfSoundMenuBar.vue
│   │   │   │   │   │   ├── SpeedOfSoundOverlayPanels.vue
│   │   │   │   │   │   ├── SpeedOfSoundPanelBody.vue
│   │   │   │   │   │   ├── SpeedOfSoundStatusBar.vue
│   │   │   │   │   │   └── panels
│   │   │   │   │   │       ├── SpeedOfSoundChartPanel.vue
│   │   │   │   │   │       ├── SpeedOfSoundLawsPanel.vue
│   │   │   │   │   │       ├── SpeedOfSoundParamsPanel.vue
│   │   │   │   │   │       ├── SpeedOfSoundReadingsPanel.vue
│   │   │   │   │   │       ├── SpeedOfSoundResultsPanel.vue
│   │   │   │   │   │       └── SpeedOfSoundTrialsPanel.vue
│   │   │   │   │   ├── spring
│   │   │   │   │   │   ├── downloadCsv.ts
│   │   │   │   │   │   ├── DraggablePanel.vue
│   │   │   │   │   │   ├── linearRegression.ts
│   │   │   │   │   │   ├── PanelCard.vue
│   │   │   │   │   │   ├── SpringCanvas.vue
│   │   │   │   │   │   ├── SpringControlBar.vue
│   │   │   │   │   │   ├── SpringDataPanel.vue
│   │   │   │   │   │   ├── SpringErrorPanel.vue
│   │   │   │   │   │   ├── SpringFFTPanel.vue
│   │   │   │   │   │   ├── SpringGuidePanel.vue
│   │   │   │   │   │   ├── SpringHelpModal.vue
│   │   │   │   │   │   ├── SpringLiveAnalysis.vue
│   │   │   │   │   │   ├── SpringMenuBar.vue
│   │   │   │   │   │   ├── SpringOverlayPanels.vue
│   │   │   │   │   │   ├── SpringPanelBody.vue
│   │   │   │   │   │   ├── SpringParamPanel.vue
│   │   │   │   │   │   ├── SpringPhotogate.vue
│   │   │   │   │   │   ├── SpringReport.css
│   │   │   │   │   │   ├── SpringReport.vue
│   │   │   │   │   │   ├── SpringScatterChart.vue
│   │   │   │   │   │   ├── SpringSignalChart.vue
│   │   │   │   │   │   ├── SpringStaticPanel.vue
│   │   │   │   │   │   ├── SpringStatusBar.vue
│   │   │   │   │   │   ├── SpringStepTracker.vue
│   │   │   │   │   │   └── SpringTutorCard.vue
│   │   │   │   │   ├── thermal-expansion
│   │   │   │   │   │   ├── ThermalExpansionCanvas.vue
│   │   │   │   │   │   ├── ThermalExpansionControlBar.vue
│   │   │   │   │   │   ├── ThermalExpansionHelpModal.vue
│   │   │   │   │   │   ├── ThermalExpansionMenuBar.vue
│   │   │   │   │   │   ├── ThermalExpansionOverlayPanels.vue
│   │   │   │   │   │   ├── ThermalExpansionPanelBody.vue
│   │   │   │   │   │   ├── ThermalExpansionStatusBar.vue
│   │   │   │   │   │   └── panels
│   │   │   │   │   │       ├── ThermalExpansionChartPanel.vue
│   │   │   │   │   │       ├── ThermalExpansionLawsPanel.vue
│   │   │   │   │   │       ├── ThermalExpansionParamsPanel.vue
│   │   │   │   │   │       ├── ThermalExpansionReadingsPanel.vue
│   │   │   │   │   │       ├── ThermalExpansionResultsPanel.vue
│   │   │   │   │   │       └── ThermalExpansionTrialsPanel.vue
│   │   │   │   │   ├── thinlens
│   │   │   │   │   │   ├── ThinLensCanvas.vue
│   │   │   │   │   │   └── ThinLensPanelBody.vue
│   │   │   │   │   └── wave-interference
│   │   │   │   │       ├── WaveInterferenceCanvas.vue
│   │   │   │   │       ├── WaveInterferenceControlBar.vue
│   │   │   │   │       ├── WaveInterferenceHelpModal.vue
│   │   │   │   │       ├── WaveInterferenceMenuBar.vue
│   │   │   │   │       ├── WaveInterferenceOverlayPanels.vue
│   │   │   │   │       ├── WaveInterferencePanelBody.vue
│   │   │   │   │       ├── WaveInterferenceStatusBar.vue
│   │   │   │   │       └── panels
│   │   │   │   │           ├── WaveInterferenceChartPanel.vue
│   │   │   │   │           ├── WaveInterferenceLawsPanel.vue
│   │   │   │   │           ├── WaveInterferenceParamsPanel.vue
│   │   │   │   │           ├── WaveInterferenceReadingsPanel.vue
│   │   │   │   │           ├── WaveInterferenceResultsPanel.vue
│   │   │   │   │           └── WaveInterferenceTrialsPanel.vue
│   │   │   │   ├── home
│   │   │   │   │   └── StudentClasses.vue
│   │   │   │   ├── landing
│   │   │   │   │   ├── LandingGuestButtons.vue
│   │   │   │   │   ├── LandingHeroSection.vue
│   │   │   │   │   ├── LandingLangSwitcher.vue
│   │   │   │   │   └── LandingLoginForm.vue
│   │   │   │   ├── layout
│   │   │   │   │   └── AppNavbar.vue
│   │   │   │   ├── shared
│   │   │   │   │   ├── FeedbackModal.vue
│   │   │   │   │   ├── NotificationBell.vue
│   │   │   │   │   ├── ReportCommentThread.vue
│   │   │   │   │   └── ReportViewer.vue
│   │   │   │   ├── student
│   │   │   │   │   ├── ReportResubmitModal.vue
│   │   │   │   │   ├── StudentProfile.vue
│   │   │   │   │   └── StudentReports.vue
│   │   │   │   ├── teacher
│   │   │   │   │   ├── ClassManager.vue
│   │   │   │   │   ├── CreateClassModal.vue
│   │   │   │   │   ├── GradeModal.vue
│   │   │   │   │   ├── ReportAIAnalyzer.vue
│   │   │   │   │   ├── StudentDetailModal.vue
│   │   │   │   │   ├── TeacherGrading.vue
│   │   │   │   │   ├── TeacherStats.vue
│   │   │   │   │   ├── TeacherStatsCharts.vue
│   │   │   │   │   ├── TeacherStatsComparison.vue
│   │   │   │   │   ├── TeacherStatsExport.vue
│   │   │   │   │   ├── TeacherStatsExpTable.vue
│   │   │   │   │   ├── TeacherStatsStudentTable.vue
│   │   │   │   │   └── TeacherStatsSummary.vue
│   │   │   │   └── ui
│   │   │   │       └── BranchCard.vue
│   │   │   ├── composables
│   │   │   │   ├── fuzz-physics-engines.test.ts
│   │   │   │   ├── property-physics.test.ts
│   │   │   │   ├── useAdmin.ts
│   │   │   │   ├── useExperimentMonitor.ts
│   │   │   │   ├── useExperimentReport.test.ts
│   │   │   │   ├── useExperimentReport.ts
│   │   │   │   ├── useI18n.test.ts
│   │   │   │   ├── useI18n.ts
│   │   │   │   ├── useNotifications.ts
│   │   │   │   ├── useReportGrading.ts
│   │   │   │   ├── useReportSubmission.ts
│   │   │   │   ├── admin
│   │   │   │   │   ├── useAdminExport.ts
│   │   │   │   │   ├── useAdminSystemHealth.ts
│   │   │   │   │   ├── useAdminUserDetail.ts
│   │   │   │   │   ├── useAdminUsers.ts
│   │   │   │   │   └── useAdminWarnings.ts
│   │   │   │   ├── analysis
│   │   │   │   │   ├── sendToAnalysis.ts
│   │   │   │   │   ├── useCrossTabSync.ts
│   │   │   │   │   ├── useSmartValidator.ts
│   │   │   │   │   └── useTheoreticalValues.ts
│   │   │   │   ├── auth
│   │   │   │   │   └── useAuthActions.ts
│   │   │   │   ├── boyles-law
│   │   │   │   │   ├── useBoylesLawCalculations.ts
│   │   │   │   │   ├── useBoylesLawExperiment.ts
│   │   │   │   │   ├── useBoylesLawLayout.ts
│   │   │   │   │   └── useBoylesLawTrials.ts
│   │   │   │   ├── calorimetry
│   │   │   │   │   ├── useCalorimetryCalculations.ts
│   │   │   │   │   ├── useCalorimetryExperiment.ts
│   │   │   │   │   ├── useCalorimetryLayout.ts
│   │   │   │   │   └── useCalorimetryTrials.ts
│   │   │   │   ├── chemistry
│   │   │   │   │   ├── ar-chemistry.ts
│   │   │   │   │   ├── chemColorUtils.ts
│   │   │   │   │   ├── chemDatabase.ts
│   │   │   │   │   ├── chemDataCore.ts
│   │   │   │   │   ├── chemDataExtended.ts
│   │   │   │   │   ├── chemEquations.ts
│   │   │   │   │   ├── chemEquationsComplex.ts
│   │   │   │   │   ├── chemEquationsGas.ts
│   │   │   │   │   ├── chemEquationsNeutralization.ts
│   │   │   │   │   ├── chemEquationsPrecipitation.ts
│   │   │   │   │   ├── chemEquationsRedox.ts
│   │   │   │   │   ├── chemLabIds.ts
│   │   │   │   │   ├── chemLabTypes.ts
│   │   │   │   │   ├── chemTypeChecks.ts
│   │   │   │   │   ├── fluidSimRenderer.ts
│   │   │   │   │   ├── fluidSimTypes.ts
│   │   │   │   │   ├── fuzz-chemistry.test.ts
│   │   │   │   │   ├── liquidSimRenderer.ts
│   │   │   │   │   ├── liquidSimTypes.ts
│   │   │   │   │   ├── metaballRenderer.ts
│   │   │   │   │   ├── metaballTypes.ts
│   │   │   │   │   ├── property-chemistry.test.ts
│   │   │   │   │   ├── sendToAnalysis.ts
│   │   │   │   │   ├── solidFluidRenderer.ts
│   │   │   │   │   ├── solidFluidTypes.ts
│   │   │   │   │   ├── useBalance.ts
│   │   │   │   │   ├── useBeakerScale.ts
│   │   │   │   │   ├── useBuretteMixRecorder.ts
│   │   │   │   │   ├── useChemCalculations.ts
│   │   │   │   │   ├── useChemicalLocale.ts
│   │   │   │   │   ├── useChemistryHistory.ts
│   │   │   │   │   ├── useChemistryLab.ts
│   │   │   │   │   ├── useChemistryResizing.ts
│   │   │   │   │   ├── useChemistrySession.ts
│   │   │   │   │   ├── useChemistryTools.ts
│   │   │   │   │   ├── useDropPhysics.ts
│   │   │   │   │   ├── useExecActions.ts
│   │   │   │   │   ├── useExperiments.ts
│   │   │   │   │   ├── useFluidSimulation.ts
│   │   │   │   │   ├── useLabAssistant.ts
│   │   │   │   │   ├── useLabSimulation.ts
│   │   │   │   │   ├── useLiquidSimulation.ts
│   │   │   │   │   ├── useMetaballFluid.ts
│   │   │   │   │   ├── usePhMeter.ts
│   │   │   │   │   ├── usePipetteActions.ts
│   │   │   │   │   ├── useReactionEngine.ts
│   │   │   │   │   ├── useSimpleFluid.ts
│   │   │   │   │   ├── useSolidFluid.ts
│   │   │   │   │   ├── useSpillDrops.ts
│   │   │   │   │   ├── useStepControl.ts
│   │   │   │   │   ├── useTitrationRecorder.ts
│   │   │   │   │   ├── useToolStateBuilder.ts
│   │   │   │   │   └── useWorkspaceDrag.ts
│   │   │   │   ├── collision
│   │   │   │   │   ├── collisionUtils.test.ts
│   │   │   │   │   ├── collisionUtils.ts
│   │   │   │   │   ├── useCollisionExperiment.ts
│   │   │   │   │   ├── useCollisionLab.ts
│   │   │   │   │   ├── useCollisionLayout.ts
│   │   │   │   │   ├── useCollisionReport.ts
│   │   │   │   │   └── useCollisionTrials.ts
│   │   │   │   ├── diffraction
│   │   │   │   │   ├── useDiffractionCalculations.ts
│   │   │   │   │   ├── useDiffractionExperiment.ts
│   │   │   │   │   ├── useDiffractionLayout.ts
│   │   │   │   │   └── useDiffractionTrials.ts
│   │   │   │   ├── experiment
│   │   │   │   │   ├── useAnomalyWatcher.ts
│   │   │   │   │   ├── useStartupDiagnostics.ts
│   │   │   │   │   ├── analysis
│   │   │   │   │   │   ├── chart-drawer.ts
│   │   │   │   │   │   ├── chart-regression.ts
│   │   │   │   │   │   ├── useChartWorkspace.ts
│   │   │   │   │   │   └── useEquationSolver.ts
│   │   │   │   │   └── collision
│   │   │   │   │       ├── collision-drawers.ts
│   │   │   │   │       ├── collision-hud.ts
│   │   │   │   │       └── useCollisionCanvas.ts
│   │   │   │   ├── freefall
│   │   │   │   │   ├── freeFallUtils.test.ts
│   │   │   │   │   ├── freeFallUtils.ts
│   │   │   │   │   ├── useFreeFallExperiment.ts
│   │   │   │   │   ├── useFreeFallLab.ts
│   │   │   │   │   ├── useFreeFallLayout.ts
│   │   │   │   │   ├── useFreeFallReport.ts
│   │   │   │   │   └── useFreeFallTrials.ts
│   │   │   │   ├── grating
│   │   │   │   │   ├── useGratingCalculations.ts
│   │   │   │   │   ├── useGratingExperiment.ts
│   │   │   │   │   ├── useGratingLayout.ts
│   │   │   │   │   └── useGratingTrials.ts
│   │   │   │   ├── ideal-gas
│   │   │   │   │   ├── useIdealGasCalculations.ts
│   │   │   │   │   ├── useIdealGasExperiment.ts
│   │   │   │   │   ├── useIdealGasLayout.ts
│   │   │   │   │   └── useIdealGasTrials.ts
│   │   │   │   ├── inclined
│   │   │   │   │   ├── inclinedUtils.ts
│   │   │   │   │   ├── useInclinedExperiment.ts
│   │   │   │   │   ├── useInclinedLab.ts
│   │   │   │   │   ├── useInclinedLayout.ts
│   │   │   │   │   └── useInclinedTrials.ts
│   │   │   │   ├── interference
│   │   │   │   │   ├── useInterferenceCalculations.ts
│   │   │   │   │   ├── useInterferenceExperiment.ts
│   │   │   │   │   ├── useInterferenceLayout.ts
│   │   │   │   │   └── useInterferenceTrials.ts
│   │   │   │   ├── latent-heat
│   │   │   │   │   ├── useLatentHeatCalculations.ts
│   │   │   │   │   ├── useLatentHeatExperiment.ts
│   │   │   │   │   ├── useLatentHeatLayout.ts
│   │   │   │   │   └── useLatentHeatTrials.ts
│   │   │   │   ├── lever
│   │   │   │   │   ├── useLeverExperiment.ts
│   │   │   │   │   ├── useLeverLab.ts
│   │   │   │   │   ├── useLeverLayout.ts
│   │   │   │   │   └── useLeverTrials.ts
│   │   │   │   ├── lightray
│   │   │   │   │   ├── useLightRayExperiment.ts
│   │   │   │   │   ├── useLightRayLayout.ts
│   │   │   │   │   └── useLightRayTrials.ts
│   │   │   │   ├── mirror
│   │   │   │   │   ├── drawMirrorRays.ts
│   │   │   │   │   ├── mirrorArcHit.ts
│   │   │   │   │   ├── useMirrorExperiment.ts
│   │   │   │   │   ├── useMirrorLayout.ts
│   │   │   │   │   ├── useMirrorRenderer.ts
│   │   │   │   │   └── useMirrorTrials.ts
│   │   │   │   ├── pendulum
│   │   │   │   │   ├── pendulumUtils.test.ts
│   │   │   │   │   ├── pendulumUtils.ts
│   │   │   │   │   ├── usePendulumDrag.ts
│   │   │   │   │   ├── usePendulumExperiment.ts
│   │   │   │   │   ├── usePendulumLab.ts
│   │   │   │   │   ├── usePendulumLayout.ts
│   │   │   │   │   ├── usePendulumReport.ts
│   │   │   │   │   └── usePendulumTrials.ts
│   │   │   │   ├── polarization
│   │   │   │   │   ├── usePolarizationCalculations.ts
│   │   │   │   │   ├── usePolarizationExperiment.ts
│   │   │   │   │   ├── usePolarizationLayout.ts
│   │   │   │   │   └── usePolarizationTrials.ts
│   │   │   │   ├── prism
│   │   │   │   │   ├── prism-drawing.ts
│   │   │   │   │   ├── prism-geometry.ts
│   │   │   │   │   ├── prism-raytracer.ts
│   │   │   │   │   ├── useMaterialName.ts
│   │   │   │   │   ├── usePrismCalculations.test.ts
│   │   │   │   │   ├── usePrismCalculations.ts
│   │   │   │   │   ├── usePrismExperiment.ts
│   │   │   │   │   ├── usePrismInteraction.ts
│   │   │   │   │   ├── usePrismLayout.ts
│   │   │   │   │   ├── usePrismMinDeviation.ts
│   │   │   │   │   ├── usePrismRenderer.ts
│   │   │   │   │   ├── usePrismTrials.test.ts
│   │   │   │   │   └── usePrismTrials.ts
│   │   │   │   ├── projectile
│   │   │   │   │   ├── TARGET_ENHANCEMENT_PLAN.md
│   │   │   │   │   ├── TARGET_FEATURE_PLAN.md
│   │   │   │   │   ├── useProjectileDigitalScreen.ts
│   │   │   │   │   ├── useProjectileDraw.ts
│   │   │   │   │   ├── useProjectileExperiment.ts
│   │   │   │   │   ├── useProjectileGrid.ts
│   │   │   │   │   ├── useProjectileHints.ts
│   │   │   │   │   ├── useProjectileLab.ts
│   │   │   │   │   ├── useProjectileLayout.ts
│   │   │   │   │   ├── useProjectileReport.ts
│   │   │   │   │   ├── useProjectileTargetDraw.ts
│   │   │   │   │   └── useProjectileTrials.ts
│   │   │   │   ├── resonance
│   │   │   │   │   ├── useResonanceCalculations.ts
│   │   │   │   │   ├── useResonanceExperiment.ts
│   │   │   │   │   ├── useResonanceLayout.ts
│   │   │   │   │   └── useResonanceTrials.ts
│   │   │   │   ├── specific-heat
│   │   │   │   │   ├── useSpecificHeatCalculations.ts
│   │   │   │   │   ├── useSpecificHeatExperiment.ts
│   │   │   │   │   ├── useSpecificHeatLayout.ts
│   │   │   │   │   └── useSpecificHeatTrials.ts
│   │   │   │   ├── speed-of-sound
│   │   │   │   │   ├── useSpeedOfSoundCalculations.ts
│   │   │   │   │   ├── useSpeedOfSoundExperiment.ts
│   │   │   │   │   ├── useSpeedOfSoundLayout.ts
│   │   │   │   │   └── useSpeedOfSoundTrials.ts
│   │   │   │   ├── spring
│   │   │   │   │   ├── drawSpringDigital.ts
│   │   │   │   │   ├── physicsUtils.test.ts
│   │   │   │   │   ├── physicsUtils.ts
│   │   │   │   │   ├── useSpringDraw.ts
│   │   │   │   │   ├── useSpringExperiment.ts
│   │   │   │   │   ├── useSpringExperimentActions.ts
│   │   │   │   │   ├── useSpringExperimentState.ts
│   │   │   │   │   ├── useSpringLab.ts
│   │   │   │   │   ├── useSpringLayout.ts
│   │   │   │   │   ├── useSpringReport.ts
│   │   │   │   │   ├── useSpringScene.ts
│   │   │   │   │   ├── useSpringStatic.ts
│   │   │   │   │   └── useSpringTrials.ts
│   │   │   │   ├── teacher
│   │   │   │   │   ├── useClassManager.ts
│   │   │   │   │   └── useTeacherStatsCharts.ts
│   │   │   │   ├── thermal-expansion
│   │   │   │   │   ├── useThermalExpansionCalculations.ts
│   │   │   │   │   ├── useThermalExpansionExperiment.ts
│   │   │   │   │   ├── useThermalExpansionLayout.ts
│   │   │   │   │   └── useThermalExpansionTrials.ts
│   │   │   │   ├── thinlens
│   │   │   │   │   ├── useThinLensExperiment.ts
│   │   │   │   │   ├── useThinLensLayout.ts
│   │   │   │   │   ├── useThinLensRenderer.ts
│   │   │   │   │   └── useThinLensTrials.ts
│   │   │   │   └── wave-interference
│   │   │   │       ├── useWaveInterferenceCalculations.ts
│   │   │   │       ├── useWaveInterferenceExperiment.ts
│   │   │   │       ├── useWaveInterferenceLayout.ts
│   │   │   │       └── useWaveInterferenceTrials.ts
│   │   │   ├── locales
│   │   │   │   ├── admin.ts
│   │   │   │   ├── admin-user.ts
│   │   │   │   ├── ai.ts
│   │   │   │   ├── ar.ts
│   │   │   │   ├── auth.ts
│   │   │   │   ├── chemistry.ts
│   │   │   │   ├── chemistry-analysis.ts
│   │   │   │   ├── chemistry-assistant.ts
│   │   │   │   ├── chemistry-chemicals.ts
│   │   │   │   ├── chemistry-experiments.ts
│   │   │   │   ├── chemistry-lab.ts
│   │   │   │   ├── chemistry-report.ts
│   │   │   │   ├── chemistry-shelf.ts
│   │   │   │   ├── chemistry-tools.ts
│   │   │   │   ├── common.ts
│   │   │   │   ├── dashboard.ts
│   │   │   │   ├── en.ts
│   │   │   │   ├── es.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── landing.ts
│   │   │   │   ├── settings.ts
│   │   │   │   ├── teacher.ts
│   │   │   │   ├── types.ts
│   │   │   │   ├── analysis
│   │   │   │   │   ├── ar.ts
│   │   │   │   │   ├── en.ts
│   │   │   │   │   ├── es.ts
│   │   │   │   │   └── index.ts
│   │   │   │   └── experiments
│   │   │   │       ├── ar-1.ts
│   │   │   │       ├── ar-2.ts
│   │   │   │       ├── ar-3.ts
│   │   │   │       ├── ar-4.ts
│   │   │   │       ├── en-1.ts
│   │   │   │       ├── en-2.ts
│   │   │   │       ├── en-3.ts
│   │   │   │       ├── en-4.ts
│   │   │   │       ├── es-1.ts
│   │   │   │       ├── es-2.ts
│   │   │   │       ├── es-3.ts
│   │   │   │       ├── es-4.ts
│   │   │   │       └── index.ts
│   │   │   ├── modules
│   │   │   │   ├── auth
│   │   │   │   │   ├── types.ts
│   │   │   │   │   ├── components
│   │   │   │   │   │   └── LoginForm.vue
│   │   │   │   │   ├── composables
│   │   │   │   │   │   └── useAuth.ts
│   │   │   │   │   └── stores
│   │   │   │   │       └── auth.ts
│   │   │   │   ├── chemistry
│   │   │   │   │   ├── chemistry-landing.css
│   │   │   │   │   ├── ChemistryLanding.vue
│   │   │   │   │   └── analysis-calc
│   │   │   │   │       ├── ChemAnalysisConclusionPanel.vue
│   │   │   │   │       ├── ChemAnalysisDataTable.vue
│   │   │   │   │       ├── ChemAnalysisMenuBar.vue
│   │   │   │   │       ├── ChemAnalysisPage.vue
│   │   │   │   │       ├── ChemAnalysisReportExport.vue
│   │   │   │   │       ├── ChemAnalysisStatsPanel.vue
│   │   │   │   │       ├── ChemAnalysisTab.vue
│   │   │   │   │       ├── ChemAnalysisTabs.vue
│   │   │   │   │       ├── ChemChartCanvas.vue
│   │   │   │   │       ├── ChemDataTab.vue
│   │   │   │   │       ├── ChemReportTab.vue
│   │   │   │   │       └── ChemStudentInfoPanel.vue
│   │   │   │   ├── dashboard
│   │   │   │   │   ├── types.ts
│   │   │   │   │   ├── components
│   │   │   │   │   │   └── DashboardCard.vue
│   │   │   │   │   └── composables
│   │   │   │   │       └── useDashboard.ts
│   │   │   │   ├── physics
│   │   │   │   │   ├── branches-page.vue
│   │   │   │   │   ├── branch-page.vue
│   │   │   │   │   ├── catalog.ts
│   │   │   │   │   ├── experiment-loader.ts
│   │   │   │   │   ├── experiment-page.vue
│   │   │   │   │   ├── experiments
│   │   │   │   │   │   ├── analysis-calc
│   │   │   │   │   │   │   └── AnalysisCalcExperiment.vue
│   │   │   │   │   │   ├── biot-savart
│   │   │   │   │   │   │   └── BiotSavartExperiment.vue
│   │   │   │   │   │   ├── boyles-law
│   │   │   │   │   │   │   └── BoylesLawExperiment.vue
│   │   │   │   │   │   ├── calorimetry
│   │   │   │   │   │   │   └── CalorimetryExperiment.vue
│   │   │   │   │   │   ├── collision
│   │   │   │   │   │   │   ├── CollisionExperiment.vue
│   │   │   │   │   │   │   └── useCollisionPhysics.ts
│   │   │   │   │   │   ├── diffraction
│   │   │   │   │   │   │   └── DiffractionExperiment.vue
│   │   │   │   │   │   ├── faraday
│   │   │   │   │   │   │   └── FaradayExperiment.vue
│   │   │   │   │   │   ├── freefall
│   │   │   │   │   │   │   ├── FreeFallExperiment.vue
│   │   │   │   │   │   │   └── useFreeFallPhysics.ts
│   │   │   │   │   │   ├── grating
│   │   │   │   │   │   │   └── GratingExperiment.vue
│   │   │   │   │   │   ├── ideal-gas
│   │   │   │   │   │   │   └── IdealGasExperiment.vue
│   │   │   │   │   │   ├── inclined
│   │   │   │   │   │   │   ├── InclinedExperiment.vue
│   │   │   │   │   │   │   └── useInclinedPhysics.ts
│   │   │   │   │   │   ├── interference
│   │   │   │   │   │   │   └── InterferenceExperiment.vue
│   │   │   │   │   │   ├── joule-equivalent
│   │   │   │   │   │   │   └── JouleEquivalentExperiment.vue
│   │   │   │   │   │   ├── latent-heat
│   │   │   │   │   │   │   └── LatentHeatExperiment.vue
│   │   │   │   │   │   ├── lever
│   │   │   │   │   │   │   ├── LeverExperiment.vue
│   │   │   │   │   │   │   ├── PLAN.md
│   │   │   │   │   │   │   ├── useLeverBeamPhysics.ts
│   │   │   │   │   │   │   └── useLeverPhysics.ts
│   │   │   │   │   │   ├── lightray
│   │   │   │   │   │   │   └── LightRayExperiment.vue
│   │   │   │   │   │   ├── mirror
│   │   │   │   │   │   │   └── MirrorExperiment.vue
│   │   │   │   │   │   ├── pendulum
│   │   │   │   │   │   │   ├── PendulumExperiment.vue
│   │   │   │   │   │   │   ├── PendulumSpringBridge.ts
│   │   │   │   │   │   │   └── usePendulumPhysics.ts
│   │   │   │   │   │   ├── polarization
│   │   │   │   │   │   │   └── PolarizationExperiment.vue
│   │   │   │   │   │   ├── prism
│   │   │   │   │   │   │   └── PrismExperiment.vue
│   │   │   │   │   │   ├── projectile
│   │   │   │   │   │   │   ├── ProjectileExperiment.vue
│   │   │   │   │   │   │   ├── projectileTheoretical.ts
│   │   │   │   │   │   │   └── useProjectilePhysics.ts
│   │   │   │   │   │   ├── rc-circuit
│   │   │   │   │   │   │   └── RcCircuitExperiment.vue
│   │   │   │   │   │   ├── resonance
│   │   │   │   │   │   │   └── ResonanceExperiment.vue
│   │   │   │   │   │   ├── specific-heat
│   │   │   │   │   │   │   └── SpecificHeatExperiment.vue
│   │   │   │   │   │   ├── speed-of-sound
│   │   │   │   │   │   │   └── SpeedOfSoundExperiment.vue
│   │   │   │   │   │   ├── spring
│   │   │   │   │   │   │   ├── fft.ts
│   │   │   │   │   │   │   ├── SpringExperiment.vue
│   │   │   │   │   │   │   └── useSpringPhysics.ts
│   │   │   │   │   │   ├── thermal-expansion
│   │   │   │   │   │   │   └── ThermalExpansionExperiment.vue
│   │   │   │   │   │   ├── thinlens
│   │   │   │   │   │   │   └── ThinLensExperiment.vue
│   │   │   │   │   │   └── wave-interference
│   │   │   │   │   │       └── WaveInterferenceExperiment.vue
│   │   │   │   │   └── experiment-template
│   │   │   │   │       ├── ExperimentShell.vue
│   │   │   │   │       ├── types.ts
│   │   │   │   │       └── composables
│   │   │   │   │           └── useExperimentRunner.ts
│   │   │   │   └── settings
│   │   │   │       ├── types.ts
│   │   │   │       └── components
│   │   │   │           └── ThemeToggle.vue
│   │   │   ├── pages
│   │   │   │   ├── admin.vue
│   │   │   │   ├── dashboard.vue
│   │   │   │   ├── index.vue
│   │   │   │   ├── language.vue
│   │   │   │   ├── login.vue
│   │   │   │   └── register.vue
│   │   │   ├── services
│   │   │   │   ├── admin.service.ts
│   │   │   │   ├── ai.service.ts
│   │   │   │   ├── class.service.ts
│   │   │   │   ├── home.service.ts
│   │   │   │   ├── http.test.ts
│   │   │   │   ├── http.ts
│   │   │   │   ├── notification.service.ts
│   │   │   │   └── report.service.ts
│   │   │   ├── shared
│   │   │   │   ├── composables
│   │   │   │   │   ├── useMediaQuery.ts
│   │   │   │   │   └── useTheme.ts
│   │   │   │   ├── types
│   │   │   │   │   └── globals.ts
│   │   │   │   ├── ui
│   │   │   │   │   ├── BaseButton.vue
│   │   │   │   │   └── BaseInput.vue
│   │   │   │   └── utils
│   │   │   │       ├── cn.ts
│   │   │   │       └── formatDate.ts
│   │   │   ├── stores
│   │   │   │   ├── analysis.store.ts
│   │   │   │   ├── chemistry-analysis.store.ts
│   │   │   │   └── i18n.store.ts
│   │   │   ├── tools
│   │   │   │   └── i18n-audit.ts
│   │   │   ├── types
│   │   │   │   ├── chemistry.ts
│   │   │   │   ├── physics.ts
│   │   │   │   └── router.ts
│   │   │   └── utils
│   │   │       ├── lab-report.build-html.ts
│   │   │       ├── lab-report.send.ts
│   │   │       ├── lab-report.ts
│   │   │       └── lab-report.types.ts
│   │   └── tests
│   │       ├── monkey-tabs.spec.ts
│   │       ├── performance-leak.spec.ts
│   │       ├── visual-regression.spec.ts
│   │       └── visual-regression.spec.ts-snapshots
│   │           ├── -chemistry-chromium-win32.png
│   │           ├── -physics-mechanics-analysis-calc-chromium-win32.png
│   │           ├── -physics-mechanics-collision-chromium-win32.png
│   │           ├── -physics-mechanics-freefall-chromium-win32.png
│   │           ├── -physics-mechanics-inclined-chromium-win32.png
│   │           ├── -physics-mechanics-pendulum-chromium-win32.png
│   │           ├── -physics-mechanics-projectile-chromium-win32.png
│   │           └── -physics-mechanics-spring-chromium-win32.png
│   └── worker
│       ├── package.json
│       ├── tsconfig.json
│       └── src
│           ├── index.ts
│           └── jobs
│               ├── processImages.ts
│               └── sendEmail.ts
├── packages
│   ├── chemistry-engine
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src
│   │       ├── color.ts
│   │       ├── equations.ts
│   │       ├── index.ts
│   │       ├── reactions.ts
│   │       ├── type-checks.ts
│   │       └── types.ts
│   ├── config
│   │   ├── package.json
│   │   ├── eslint
│   │   │   └── index.js
│   │   └── typescript
│   │       └── base.json
│   ├── shared-types
│   │   ├── package.json
│   │   └── src
│   │       ├── api-responses.ts
│   │       ├── auth.ts
│   │       ├── class.ts
│   │       ├── index.ts
│   │       └── user.ts
│   └── ui-kit
│       ├── package.json
│       └── src
│           ├── index.ts
│           ├── Button
│           │   └── Button.vue
│           └── Input
│               └── Input.vue
└── toolbox
    ├── generators
    │   └── index.js
    └── scripts
        ├── auto-save.ps1
        ├── auto-save.sh
        ├── clean.js
        ├── save-now.bat
        └── start-auto-save.bat
