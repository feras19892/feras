feras/
|-- apps/
|   |-- api/
|   |   |-- data/
|   |   |   |-- app.db
|   |   |   |-- app.db-shm
|   |   |   `-- app.db-wal
|   |   |-- src/
|   |   |   |-- db/
|   |   |   |   |-- migrations/
|   |   |   |   |   |-- 001_init.sql
|   |   |   |   |   |-- 002_reports.sql
|   |   |   |   |   |-- 003_enrich_reports.sql
|   |   |   |   |   |-- 004_admin_enhance.sql
|   |   |   |   |   |-- 005_admin_full.sql
|   |   |   |   |   `-- README.md
|   |   |   |   |-- index.ts
|   |   |   |   `-- schema.ts
|   |   |   |-- modules/
|   |   |   |   |-- activity/
|   |   |   |   |   `-- service.ts
|   |   |   |   |-- admin/
|   |   |   |   |   |-- audit-service.ts
|   |   |   |   |   |-- export-service.ts
|   |   |   |   |   |-- feedback-service.ts
|   |   |   |   |   |-- handlers.ts
|   |   |   |   |   |-- services.ts
|   |   |   |   |   |-- system-health-service.ts
|   |   |   |   |   |-- user-detail-service.ts
|   |   |   |   |   `-- warning-service.ts
|   |   |   |   |-- ai/
|   |   |   |   |   |-- handlers.ts
|   |   |   |   |   `-- services.ts
|   |   |   |   |-- auth/
|   |   |   |   |   |-- cookies.ts
|   |   |   |   |   |-- crypto.ts
|   |   |   |   |   |-- handlers.ts
|   |   |   |   |   |-- jwt.ts
|   |   |   |   |   |-- middleware.ts
|   |   |   |   |   |-- schemas.ts
|   |   |   |   |   `-- services.ts
|   |   |   |   |-- classes/
|   |   |   |   |   |-- handlers.ts
|   |   |   |   |   |-- schemas.ts
|   |   |   |   |   `-- services.ts
|   |   |   |   |-- dashboard/
|   |   |   |   |   |-- handlers.ts
|   |   |   |   |   `-- services.ts
|   |   |   |   |-- feedback/
|   |   |   |   |   `-- handlers.ts
|   |   |   |   |-- notifications/
|   |   |   |   |   |-- handlers.ts
|   |   |   |   |   |-- schemas.ts
|   |   |   |   |   `-- services.ts
|   |   |   |   |-- reports/
|   |   |   |   |   |-- handlers.ts
|   |   |   |   |   |-- schemas.ts
|   |   |   |   |   `-- services.ts
|   |   |   |   |-- sessions/
|   |   |   |   |   `-- service.ts
|   |   |   |   `-- settings/
|   |   |   |       `-- handlers.ts
|   |   |   |-- shared/
|   |   |   |   |-- middleware/
|   |   |   |   |   |-- logger.ts
|   |   |   |   |   `-- rate-limit.ts
|   |   |   |   `-- utils/
|   |   |   |       |-- hash.ts
|   |   |   |       `-- http.ts
|   |   |   `-- index.ts
|   |   |-- Dockerfile
|   |   |-- package.json
|   |   `-- tsconfig.json
|   |-- web/
|   |   |-- apps/
|   |   |   `-- web/
|   |   |       `-- src/
|   |   |           |-- components/
|   |   |           |   `-- experiment/
|   |   |           |       `-- lever/
|   |   |           |-- composables/
|   |   |           |   `-- lever/
|   |   |           `-- modules/
|   |   |               `-- physics/
|   |   |                   `-- experiments/
|   |   |                       `-- lever/
|   |   |-- src/
|   |   |   |-- assets/
|   |   |   |   `-- README.md
|   |   |   |-- components/
|   |   |   |   |-- admin/
|   |   |   |   |   |-- AdminClassManager.vue
|   |   |   |   |   |-- AdminDashboard.vue
|   |   |   |   |   |-- AdminExportPanel.vue
|   |   |   |   |   |-- AdminFeedbackPanel.vue
|   |   |   |   |   |-- AdminGlobalSearch.vue
|   |   |   |   |   |-- AdminOverview.vue
|   |   |   |   |   |-- AdminReportViewer.vue
|   |   |   |   |   |-- AdminSmartReports.vue
|   |   |   |   |   |-- AdminSystemHealth.vue
|   |   |   |   |   |-- AdminUserDetail.vue
|   |   |   |   |   `-- AdminUserManager.vue
|   |   |   |   |-- dev/
|   |   |   |   |   |-- ExperimentMonitorPage.vue
|   |   |   |   |   `-- ExperimentMonitorWidget.vue
|   |   |   |   |-- experiment/
|   |   |   |   |   |-- analysis-calc/
|   |   |   |   |   |   |-- AnalysisChartWorkspace.vue
|   |   |   |   |   |   |-- AnalysisConclusionPanel.vue
|   |   |   |   |   |   |-- AnalysisDataTable.vue
|   |   |   |   |   |   |-- AnalysisEquationsPanel.vue
|   |   |   |   |   |   |-- AnalysisErrorPanel.vue
|   |   |   |   |   |   |-- AnalysisMediumPanel.vue
|   |   |   |   |   |   |-- AnalysisMenuBar.vue
|   |   |   |   |   |   |-- AnalysisReportExport.vue
|   |   |   |   |   |   |-- AnalysisReportPreview.vue
|   |   |   |   |   |   |-- AnalysisStatsPanel.vue
|   |   |   |   |   |   |-- AnalysisTab.vue
|   |   |   |   |   |   |-- AnalysisTabs.vue
|   |   |   |   |   |   |-- DataTab.vue
|   |   |   |   |   |   |-- EquationDetail.vue
|   |   |   |   |   |   |-- ReportTab.vue
|   |   |   |   |   |   `-- StudentInfoPanel.vue
|   |   |   |   |   |-- biot-savart/
|   |   |   |   |   |   |-- panels/
|   |   |   |   |   |   |-- BiotSavartCanvas.vue
|   |   |   |   |   |   |-- BiotSavartControlBar.vue
|   |   |   |   |   |   |-- BiotSavartPanelBody.vue
|   |   |   |   |   |   `-- BiotSavartStatusBar.vue
|   |   |   |   |   |-- boyles-law/
|   |   |   |   |   |   |-- panels/
|   |   |   |   |   |   |   |-- BoylesLawChartPanel.vue
|   |   |   |   |   |   |   |-- BoylesLawLawsPanel.vue
|   |   |   |   |   |   |   |-- BoylesLawParamsPanel.vue
|   |   |   |   |   |   |   |-- BoylesLawReadingsPanel.vue
|   |   |   |   |   |   |   |-- BoylesLawReferencePanel.vue
|   |   |   |   |   |   |   |-- BoylesLawResultsPanel.vue
|   |   |   |   |   |   |   |-- BoylesLawTrialsPanel.vue
|   |   |   |   |   |   |   `-- BoylesLawWorksheetPanel.vue
|   |   |   |   |   |   |-- BoylesLawCanvas.vue
|   |   |   |   |   |   |-- BoylesLawControlBar.vue
|   |   |   |   |   |   |-- BoylesLawMenuBar.vue
|   |   |   |   |   |   |-- BoylesLawOverlayPanels.vue
|   |   |   |   |   |   |-- BoylesLawPanelBody.vue
|   |   |   |   |   |   `-- BoylesLawStatusBar.vue
|   |   |   |   |   |-- calorimetry/
|   |   |   |   |   |   |-- panels/
|   |   |   |   |   |   |   |-- CalorimetryChartPanel.vue
|   |   |   |   |   |   |   |-- CalorimetryLawsPanel.vue
|   |   |   |   |   |   |   |-- CalorimetryParamsPanel.vue
|   |   |   |   |   |   |   |-- CalorimetryReadingsPanel.vue
|   |   |   |   |   |   |   |-- CalorimetryReferencePanel.vue
|   |   |   |   |   |   |   |-- CalorimetryResultsPanel.vue
|   |   |   |   |   |   |   |-- CalorimetryTrialsPanel.vue
|   |   |   |   |   |   |   `-- CalorimetryWorksheetPanel.vue
|   |   |   |   |   |   |-- CalorimetryCanvas.vue
|   |   |   |   |   |   |-- CalorimetryControlBar.vue
|   |   |   |   |   |   |-- CalorimetryHelpModal.vue
|   |   |   |   |   |   |-- CalorimetryMenuBar.vue
|   |   |   |   |   |   |-- CalorimetryOverlayPanels.vue
|   |   |   |   |   |   |-- CalorimetryPanelBody.vue
|   |   |   |   |   |   `-- CalorimetryStatusBar.vue
|   |   |   |   |   |-- chemistry/
|   |   |   |   |   |   |-- ANALYSIS_REPORT.md
|   |   |   |   |   |   |-- BUILD_PLAN_RETORT_STAND.md
|   |   |   |   |   |   |-- BuretteDisplay.vue
|   |   |   |   |   |   |-- ChemAnalysisButton.vue
|   |   |   |   |   |   |-- ChemicalCard.vue
|   |   |   |   |   |   |-- ChemicalShelfPanel.vue
|   |   |   |   |   |   |-- ChemReportModal.vue
|   |   |   |   |   |   |-- ContainerRenderers.vue
|   |   |   |   |   |   |-- ExperimentSelector.vue
|   |   |   |   |   |   |-- ExperimentStepsPanel.vue
|   |   |   |   |   |   |-- ExperimentTheoryPanel.vue
|   |   |   |   |   |   |-- floating-inspector.css
|   |   |   |   |   |   |-- FloatingInspector.vue
|   |   |   |   |   |   |-- GuidePanel.vue
|   |   |   |   |   |   |-- InspectorPanel.vue
|   |   |   |   |   |   |-- LabAssistant.vue
|   |   |   |   |   |   |-- LabBalance.vue
|   |   |   |   |   |   |-- LabBeaker.css
|   |   |   |   |   |   |-- LabBeaker.vue
|   |   |   |   |   |   |-- LabBeakerClamp.vue
|   |   |   |   |   |   |-- LabBeakerPhysics.vue
|   |   |   |   |   |   |-- LabBunsenBurner.vue
|   |   |   |   |   |   |-- LabBurette.vue
|   |   |   |   |   |   |-- LabDropper.vue
|   |   |   |   |   |   |-- LabErlenmeyer.vue
|   |   |   |   |   |   |-- LabFilterFunnel.vue
|   |   |   |   |   |   |-- LabGradCylinder.vue
|   |   |   |   |   |   |-- LabHeatingMantle.vue
|   |   |   |   |   |   |-- LabHotPlate.vue
|   |   |   |   |   |   |-- LabItemRenderer.css
|   |   |   |   |   |   |-- LabItemRenderer.vue
|   |   |   |   |   |   |-- LabPhMeter.vue
|   |   |   |   |   |   |-- LabPipette.vue
|   |   |   |   |   |   |-- LabRetortStandAssembly.css
|   |   |   |   |   |   |-- LabRetortStandAssembly.vue
|   |   |   |   |   |   |-- LabRoundBottomFlask.vue
|   |   |   |   |   |   |-- LabRubberStopper.vue
|   |   |   |   |   |   |-- LabSeparatoryFunnel.vue
|   |   |   |   |   |   |-- LabSpatula.vue
|   |   |   |   |   |   |-- LabStatsPanel.vue
|   |   |   |   |   |   |-- LabStirringRod.vue
|   |   |   |   |   |   |-- LabTestTube.vue
|   |   |   |   |   |   |-- LabTestTubeRack.vue
|   |   |   |   |   |   |-- LabVolumetricFlask.vue
|   |   |   |   |   |   |-- LabVolumetricPipette.vue
|   |   |   |   |   |   |-- LabWatchGlass.vue
|   |   |   |   |   |   |-- LabWoodenBase.vue
|   |   |   |   |   |   |-- LeftPanel.vue
|   |   |   |   |   |   |-- MASTER_PLAN.md
|   |   |   |   |   |   |-- NotesPanel.vue
|   |   |   |   |   |   |-- PENDING_TOOLS.md
|   |   |   |   |   |   |-- RightPanel.vue
|   |   |   |   |   |   |-- TitrationDataTable.vue
|   |   |   |   |   |   |-- TOOL_ANALYSIS.md
|   |   |   |   |   |   |-- TOOLS_CATALOG.md
|   |   |   |   |   |   |-- UNIVERSITY_LAB_PLAN.md
|   |   |   |   |   |   |-- VISUAL_INTERACTION_PLAN.md
|   |   |   |   |   |   |-- WorkspaceActionsPanel.vue
|   |   |   |   |   |   |-- WorkspaceCanvas.vue
|   |   |   |   |   |   `-- WorkspaceOverlays.vue
|   |   |   |   |   |-- collision/
|   |   |   |   |   |   |-- panels/
|   |   |   |   |   |   |   |-- CollisionReferencePanel.vue
|   |   |   |   |   |   |   `-- CollisionWorksheetPanel.vue
|   |   |   |   |   |   |-- CollisionCanvas.vue
|   |   |   |   |   |   |-- CollisionControlBar.vue
|   |   |   |   |   |   |-- CollisionDataPanel.vue
|   |   |   |   |   |   |-- CollisionEquationsPanel.vue
|   |   |   |   |   |   |-- CollisionHelpModal.vue
|   |   |   |   |   |   |-- CollisionMenuBar.vue
|   |   |   |   |   |   |-- CollisionOverlayPanels.vue
|   |   |   |   |   |   |-- CollisionPanelBody.vue
|   |   |   |   |   |   |-- CollisionParamsPanel.vue
|   |   |   |   |   |   |-- CollisionReport.vue
|   |   |   |   |   |   |-- CollisionScatterChart.vue
|   |   |   |   |   |   |-- CollisionSignalPanel.vue
|   |   |   |   |   |   |-- CollisionStatsPanel.vue
|   |   |   |   |   |   `-- CollisionStatusBar.vue
|   |   |   |   |   |-- diffraction/
|   |   |   |   |   |   |-- panels/
|   |   |   |   |   |   |   |-- DiffractionChartPanel.vue
|   |   |   |   |   |   |   |-- DiffractionLawsPanel.vue
|   |   |   |   |   |   |   |-- DiffractionParamsPanel.vue
|   |   |   |   |   |   |   |-- DiffractionReadingsPanel.vue
|   |   |   |   |   |   |   |-- DiffractionReferencePanel.vue
|   |   |   |   |   |   |   |-- DiffractionResultsPanel.vue
|   |   |   |   |   |   |   |-- DiffractionTrialsPanel.vue
|   |   |   |   |   |   |   `-- DiffractionWorksheetPanel.vue
|   |   |   |   |   |   |-- DiffractionCanvas.vue
|   |   |   |   |   |   |-- DiffractionControlBar.vue
|   |   |   |   |   |   |-- DiffractionHelpModal.vue
|   |   |   |   |   |   |-- DiffractionMenuBar.vue
|   |   |   |   |   |   |-- DiffractionOverlayPanels.vue
|   |   |   |   |   |   |-- DiffractionPanelBody.vue
|   |   |   |   |   |   `-- DiffractionStatusBar.vue
|   |   |   |   |   |-- faraday/
|   |   |   |   |   |   |-- panels/
|   |   |   |   |   |   |-- FaradayCanvas.vue
|   |   |   |   |   |   |-- FaradayControlBar.vue
|   |   |   |   |   |   |-- FaradayMenuBar.vue
|   |   |   |   |   |   |-- FaradayPanelBody.vue
|   |   |   |   |   |   `-- FaradayStatusBar.vue
|   |   |   |   |   |-- freefall/
|   |   |   |   |   |   |-- panels/
|   |   |   |   |   |   |   |-- FreeFallReferencePanel.vue
|   |   |   |   |   |   |   `-- FreeFallWorksheetPanel.vue
|   |   |   |   |   |   |-- FreeFallCanvas.vue
|   |   |   |   |   |   |-- FreeFallControlBar.vue
|   |   |   |   |   |   |-- FreeFallEquationsPanel.vue
|   |   |   |   |   |   |-- FreeFallGuidePanel.vue
|   |   |   |   |   |   |-- FreeFallHelpModal.vue
|   |   |   |   |   |   |-- FreeFallMenuBar.vue
|   |   |   |   |   |   |-- FreeFallOverlayPanels.vue
|   |   |   |   |   |   |-- FreeFallPanelBody.vue
|   |   |   |   |   |   |-- FreeFallParamsPanel.vue
|   |   |   |   |   |   |-- FreeFallReport.vue
|   |   |   |   |   |   |-- FreeFallReportPanel.vue
|   |   |   |   |   |   |-- FreeFallScatterPanel.vue
|   |   |   |   |   |   |-- FreeFallSignalPanel.vue
|   |   |   |   |   |   |-- FreeFallStatsPanel.vue
|   |   |   |   |   |   |-- FreeFallStatusBar.vue
|   |   |   |   |   |   `-- FreeFallTablePanel.vue
|   |   |   |   |   |-- grating/
|   |   |   |   |   |   |-- panels/
|   |   |   |   |   |   |   |-- GratingChartPanel.vue
|   |   |   |   |   |   |   |-- GratingLawsPanel.vue
|   |   |   |   |   |   |   |-- GratingParamsPanel.vue
|   |   |   |   |   |   |   |-- GratingReadingsPanel.vue
|   |   |   |   |   |   |   |-- GratingResultsPanel.vue
|   |   |   |   |   |   |   `-- GratingTrialsPanel.vue
|   |   |   |   |   |   |-- GratingCanvas.vue
|   |   |   |   |   |   |-- GratingControlBar.vue
|   |   |   |   |   |   |-- GratingHelpModal.vue
|   |   |   |   |   |   |-- GratingMenuBar.vue
|   |   |   |   |   |   |-- GratingOverlayPanels.vue
|   |   |   |   |   |   |-- GratingPanelBody.vue
|   |   |   |   |   |   `-- GratingStatusBar.vue
|   |   |   |   |   |-- ideal-gas/
|   |   |   |   |   |   |-- panels/
|   |   |   |   |   |   |   |-- IdealGasChartPanel.vue
|   |   |   |   |   |   |   |-- IdealGasLawsPanel.vue
|   |   |   |   |   |   |   |-- IdealGasParamsPanel.vue
|   |   |   |   |   |   |   |-- IdealGasReadingsPanel.vue
|   |   |   |   |   |   |   |-- IdealGasReferencePanel.vue
|   |   |   |   |   |   |   |-- IdealGasResultsPanel.vue
|   |   |   |   |   |   |   |-- IdealGasTrialsPanel.vue
|   |   |   |   |   |   |   `-- IdealGasWorksheetPanel.vue
|   |   |   |   |   |   |-- IdealGasCanvas.vue
|   |   |   |   |   |   |-- IdealGasControlBar.vue
|   |   |   |   |   |   |-- IdealGasHelpModal.vue
|   |   |   |   |   |   |-- IdealGasMenuBar.vue
|   |   |   |   |   |   |-- IdealGasOverlayPanels.vue
|   |   |   |   |   |   |-- IdealGasPanelBody.vue
|   |   |   |   |   |   `-- IdealGasStatusBar.vue
|   |   |   |   |   |-- inclined/
|   |   |   |   |   |   |-- panels/
|   |   |   |   |   |   |   |-- InclinedReferencePanel.vue
|   |   |   |   |   |   |   `-- InclinedWorksheetPanel.vue
|   |   |   |   |   |   |-- InclinedCanvas.vue
|   |   |   |   |   |   |-- InclinedControlBar.vue
|   |   |   |   |   |   |-- InclinedEquationsPanel.vue
|   |   |   |   |   |   |-- InclinedHelpModal.vue
|   |   |   |   |   |   |-- InclinedMenuBar.vue
|   |   |   |   |   |   |-- InclinedOverlayPanels.vue
|   |   |   |   |   |   |-- InclinedPanelBody.vue
|   |   |   |   |   |   |-- InclinedParamsPanel.vue
|   |   |   |   |   |   |-- InclinedReport.vue
|   |   |   |   |   |   |-- InclinedScatterPanel.vue
|   |   |   |   |   |   |-- InclinedSignalPanel.vue
|   |   |   |   |   |   |-- InclinedStatsPanel.vue
|   |   |   |   |   |   |-- InclinedStatusBar.vue
|   |   |   |   |   |   `-- InclinedTablePanel.vue
|   |   |   |   |   |-- interference/
|   |   |   |   |   |   |-- panels/
|   |   |   |   |   |   |   |-- InterferenceChartPanel.vue
|   |   |   |   |   |   |   |-- InterferenceLawsPanel.vue
|   |   |   |   |   |   |   |-- InterferenceParamsPanel.vue
|   |   |   |   |   |   |   |-- InterferenceReadingsPanel.vue
|   |   |   |   |   |   |   |-- InterferenceReferencePanel.vue
|   |   |   |   |   |   |   |-- InterferenceResultsPanel.vue
|   |   |   |   |   |   |   |-- InterferenceTrialsPanel.vue
|   |   |   |   |   |   |   `-- InterferenceWorksheetPanel.vue
|   |   |   |   |   |   |-- InterferenceCanvas.vue
|   |   |   |   |   |   |-- InterferenceControlBar.vue
|   |   |   |   |   |   |-- InterferenceHelpModal.vue
|   |   |   |   |   |   |-- InterferenceMenuBar.vue
|   |   |   |   |   |   |-- InterferenceOverlayPanels.vue
|   |   |   |   |   |   |-- InterferencePanelBody.vue
|   |   |   |   |   |   `-- InterferenceStatusBar.vue
|   |   |   |   |   |-- latent-heat/
|   |   |   |   |   |   |-- panels/
|   |   |   |   |   |   |   |-- LatentHeatChartPanel.vue
|   |   |   |   |   |   |   |-- LatentHeatLawsPanel.vue
|   |   |   |   |   |   |   |-- LatentHeatParamsPanel.vue
|   |   |   |   |   |   |   |-- LatentHeatReadingsPanel.vue
|   |   |   |   |   |   |   |-- LatentHeatReferencePanel.vue
|   |   |   |   |   |   |   |-- LatentHeatResultsPanel.vue
|   |   |   |   |   |   |   |-- LatentHeatTrialsPanel.vue
|   |   |   |   |   |   |   `-- LatentHeatWorksheetPanel.vue
|   |   |   |   |   |   |-- LatentHeatCanvas.vue
|   |   |   |   |   |   |-- LatentHeatControlBar.vue
|   |   |   |   |   |   |-- LatentHeatHelpModal.vue
|   |   |   |   |   |   |-- LatentHeatMenuBar.vue
|   |   |   |   |   |   |-- LatentHeatOverlayPanels.vue
|   |   |   |   |   |   |-- LatentHeatPanelBody.vue
|   |   |   |   |   |   `-- LatentHeatStatusBar.vue
|   |   |   |   |   |-- lever/
|   |   |   |   |   |   |-- panels/
|   |   |   |   |   |   |   |-- LeverReferencePanel.vue
|   |   |   |   |   |   |   `-- LeverWorksheetPanel.vue
|   |   |   |   |   |   |-- LeverCanvas.vue
|   |   |   |   |   |   |-- LeverControlBar.vue
|   |   |   |   |   |   |-- LeverHelpModal.vue
|   |   |   |   |   |   |-- LeverMenuBar.vue
|   |   |   |   |   |   |-- LeverOverlayPanels.vue
|   |   |   |   |   |   |-- LeverPanelBody.vue
|   |   |   |   |   |   `-- LeverStatusBar.vue
|   |   |   |   |   |-- lightray/
|   |   |   |   |   |   |-- panels/
|   |   |   |   |   |   |   |-- LightRayReferencePanel.vue
|   |   |   |   |   |   |   `-- LightRayWorksheetPanel.vue
|   |   |   |   |   |   |-- LightRayCanvas.vue
|   |   |   |   |   |   |-- LightRayChart.vue
|   |   |   |   |   |   |-- LightRayControlBar.vue
|   |   |   |   |   |   |-- LightRayHelpModal.vue
|   |   |   |   |   |   |-- LightRayMenuBar.vue
|   |   |   |   |   |   |-- LightRayOverlayPanels.vue
|   |   |   |   |   |   |-- LightRayPanelBody.vue
|   |   |   |   |   |   `-- LightRayStatusBar.vue
|   |   |   |   |   |-- mirror/
|   |   |   |   |   |   |-- panels/
|   |   |   |   |   |   |   |-- MirrorReferencePanel.vue
|   |   |   |   |   |   |   `-- MirrorWorksheetPanel.vue
|   |   |   |   |   |   |-- MirrorCanvas.vue
|   |   |   |   |   |   |-- MirrorHelpModal.vue
|   |   |   |   |   |   `-- MirrorPanelBody.vue
|   |   |   |   |   |-- pendulum/
|   |   |   |   |   |   |-- panels/
|   |   |   |   |   |   |   |-- PendulumReferencePanel.vue
|   |   |   |   |   |   |   `-- PendulumWorksheetPanel.vue
|   |   |   |   |   |   |-- PendulumCanvas.vue
|   |   |   |   |   |   |-- PendulumControlBar.vue
|   |   |   |   |   |   |-- PendulumCutButton.vue
|   |   |   |   |   |   |-- PendulumDataPanel.vue
|   |   |   |   |   |   |-- PendulumEnvSelector.vue
|   |   |   |   |   |   |-- PendulumFFTPanel.vue
|   |   |   |   |   |   |-- PendulumHelpModal.vue
|   |   |   |   |   |   |-- PendulumLiveAnalysis.vue
|   |   |   |   |   |   |-- PendulumMenuBar.vue
|   |   |   |   |   |   |-- PendulumModeSwitcher.vue
|   |   |   |   |   |   |-- PendulumOverlayPanels.vue
|   |   |   |   |   |   |-- PendulumPanelBody.vue
|   |   |   |   |   |   |-- PendulumParamPanel.vue
|   |   |   |   |   |   |-- PendulumPhaseSpace.vue
|   |   |   |   |   |   |-- PendulumPhotogate.vue
|   |   |   |   |   |   |-- PendulumReport.vue
|   |   |   |   |   |   |-- PendulumScatterChart.vue
|   |   |   |   |   |   |-- PendulumSignalChart.vue
|   |   |   |   |   |   |-- PendulumStatusBar.vue
|   |   |   |   |   |   |-- PendulumStepTracker.vue
|   |   |   |   |   |   `-- PendulumTutorCard.vue
|   |   |   |   |   |-- polarization/
|   |   |   |   |   |   |-- panels/
|   |   |   |   |   |   |   |-- PolarizationChartPanel.vue
|   |   |   |   |   |   |   |-- PolarizationLawsPanel.vue
|   |   |   |   |   |   |   |-- PolarizationParamsPanel.vue
|   |   |   |   |   |   |   |-- PolarizationReadingsPanel.vue
|   |   |   |   |   |   |   |-- PolarizationReferencePanel.vue
|   |   |   |   |   |   |   |-- PolarizationResultsPanel.vue
|   |   |   |   |   |   |   |-- PolarizationTrialsPanel.vue
|   |   |   |   |   |   |   `-- PolarizationWorksheetPanel.vue
|   |   |   |   |   |   |-- PolarizationCanvas.vue
|   |   |   |   |   |   |-- PolarizationControlBar.vue
|   |   |   |   |   |   |-- PolarizationHelpModal.vue
|   |   |   |   |   |   |-- PolarizationMenuBar.vue
|   |   |   |   |   |   |-- PolarizationOverlayPanels.vue
|   |   |   |   |   |   |-- PolarizationPanelBody.vue
|   |   |   |   |   |   `-- PolarizationStatusBar.vue
|   |   |   |   |   |-- prism/
|   |   |   |   |   |   |-- panels/
|   |   |   |   |   |   |   |-- PrismChartPanel.vue
|   |   |   |   |   |   |   |-- PrismLawsPanel.vue
|   |   |   |   |   |   |   |-- PrismParamsPanel.vue
|   |   |   |   |   |   |   |-- PrismReadingsPanel.vue
|   |   |   |   |   |   |   |-- PrismReferencePanel.vue
|   |   |   |   |   |   |   |-- PrismResultsPanel.vue
|   |   |   |   |   |   |   |-- PrismTrialsPanel.vue
|   |   |   |   |   |   |   `-- PrismWorksheetPanel.vue
|   |   |   |   |   |   |-- PrismCanvas.vue
|   |   |   |   |   |   |-- PrismControlBar.vue
|   |   |   |   |   |   |-- PrismHelpModal.vue
|   |   |   |   |   |   |-- PrismMenuBar.vue
|   |   |   |   |   |   |-- PrismOverlayPanels.vue
|   |   |   |   |   |   |-- PrismPanelBody.vue
|   |   |   |   |   |   `-- PrismStatusBar.vue
|   |   |   |   |   |-- projectile/
|   |   |   |   |   |   |-- panels/
|   |   |   |   |   |   |   |-- ProjectileReferencePanel.vue
|   |   |   |   |   |   |   `-- ProjectileWorksheetPanel.vue
|   |   |   |   |   |   |-- ProjectileCanvas.vue
|   |   |   |   |   |   |-- ProjectileControlBar.vue
|   |   |   |   |   |   |-- ProjectileHelpModal.vue
|   |   |   |   |   |   |-- ProjectileHintOverlay.vue
|   |   |   |   |   |   |-- ProjectileMenuBar.vue
|   |   |   |   |   |   |-- ProjectileOverlayPanels.vue
|   |   |   |   |   |   |-- ProjectilePanelBody.vue
|   |   |   |   |   |   |-- ProjectileReport.vue
|   |   |   |   |   |   |-- ProjectileStatusBar.vue
|   |   |   |   |   |   `-- ProjectileStepTracker.vue
|   |   |   |   |   |-- rc-circuit/
|   |   |   |   |   |   |-- panels/
|   |   |   |   |   |   |-- RcCircuitCanvas.vue
|   |   |   |   |   |   |-- RcCircuitControlBar.vue
|   |   |   |   |   |   |-- RcCircuitMenuBar.vue
|   |   |   |   |   |   |-- RcCircuitPanelBody.vue
|   |   |   |   |   |   `-- RcCircuitStatusBar.vue
|   |   |   |   |   |-- resonance/
|   |   |   |   |   |   |-- panels/
|   |   |   |   |   |   |   |-- ResonanceChartPanel.vue
|   |   |   |   |   |   |   |-- ResonanceLawsPanel.vue
|   |   |   |   |   |   |   |-- ResonanceParamsPanel.vue
|   |   |   |   |   |   |   |-- ResonanceReadingsPanel.vue
|   |   |   |   |   |   |   |-- ResonanceReferencePanel.vue
|   |   |   |   |   |   |   |-- ResonanceResultsPanel.vue
|   |   |   |   |   |   |   |-- ResonanceTrialsPanel.vue
|   |   |   |   |   |   |   `-- ResonanceWorksheetPanel.vue
|   |   |   |   |   |   |-- ResonanceCanvas.vue
|   |   |   |   |   |   |-- ResonanceControlBar.vue
|   |   |   |   |   |   |-- ResonanceHelpModal.vue
|   |   |   |   |   |   |-- ResonanceMenuBar.vue
|   |   |   |   |   |   |-- ResonanceOverlayPanels.vue
|   |   |   |   |   |   |-- ResonancePanelBody.vue
|   |   |   |   |   |   `-- ResonanceStatusBar.vue
|   |   |   |   |   |-- specific-heat/
|   |   |   |   |   |   |-- panels/
|   |   |   |   |   |   |   |-- SpecificHeatChartPanel.vue
|   |   |   |   |   |   |   |-- SpecificHeatLawsPanel.vue
|   |   |   |   |   |   |   |-- SpecificHeatParamsPanel.vue
|   |   |   |   |   |   |   |-- SpecificHeatReadingsPanel.vue
|   |   |   |   |   |   |   |-- SpecificHeatReferencePanel.vue
|   |   |   |   |   |   |   |-- SpecificHeatResultsPanel.vue
|   |   |   |   |   |   |   |-- SpecificHeatTrialsPanel.vue
|   |   |   |   |   |   |   `-- SpecificHeatWorksheetPanel.vue
|   |   |   |   |   |   |-- SpecificHeatControlBar.vue
|   |   |   |   |   |   |-- SpecificHeatHelpModal.vue
|   |   |   |   |   |   |-- SpecificHeatLab.vue
|   |   |   |   |   |   |-- SpecificHeatMenuBar.vue
|   |   |   |   |   |   |-- SpecificHeatOverlayPanels.vue
|   |   |   |   |   |   |-- SpecificHeatPanelBody.vue
|   |   |   |   |   |   `-- SpecificHeatStatusBar.vue
|   |   |   |   |   |-- speed-of-sound/
|   |   |   |   |   |   |-- panels/
|   |   |   |   |   |   |   |-- SpeedOfSoundChartPanel.vue
|   |   |   |   |   |   |   |-- SpeedOfSoundLawsPanel.vue
|   |   |   |   |   |   |   |-- SpeedOfSoundParamsPanel.vue
|   |   |   |   |   |   |   |-- SpeedOfSoundReadingsPanel.vue
|   |   |   |   |   |   |   |-- SpeedOfSoundReferencePanel.vue
|   |   |   |   |   |   |   |-- SpeedOfSoundResultsPanel.vue
|   |   |   |   |   |   |   |-- SpeedOfSoundTrialsPanel.vue
|   |   |   |   |   |   |   `-- SpeedOfSoundWorksheetPanel.vue
|   |   |   |   |   |   |-- SpeedOfSoundCanvas.vue
|   |   |   |   |   |   |-- SpeedOfSoundControlBar.vue
|   |   |   |   |   |   |-- SpeedOfSoundHelpModal.vue
|   |   |   |   |   |   |-- SpeedOfSoundMenuBar.vue
|   |   |   |   |   |   |-- SpeedOfSoundOverlayPanels.vue
|   |   |   |   |   |   |-- SpeedOfSoundPanelBody.vue
|   |   |   |   |   |   `-- SpeedOfSoundStatusBar.vue
|   |   |   |   |   |-- spring/
|   |   |   |   |   |   |-- panels/
|   |   |   |   |   |   |   |-- SpringReferencePanel.vue
|   |   |   |   |   |   |   `-- SpringWorksheetPanel.vue
|   |   |   |   |   |   |-- downloadCsv.ts
|   |   |   |   |   |   |-- DraggablePanel.vue
|   |   |   |   |   |   |-- linearRegression.ts
|   |   |   |   |   |   |-- PanelCard.vue
|   |   |   |   |   |   |-- SpringCanvas.vue
|   |   |   |   |   |   |-- SpringControlBar.vue
|   |   |   |   |   |   |-- SpringDataPanel.vue
|   |   |   |   |   |   |-- SpringErrorPanel.vue
|   |   |   |   |   |   |-- SpringFFTPanel.vue
|   |   |   |   |   |   |-- SpringGuidePanel.vue
|   |   |   |   |   |   |-- SpringHelpModal.vue
|   |   |   |   |   |   |-- SpringLiveAnalysis.vue
|   |   |   |   |   |   |-- SpringMenuBar.vue
|   |   |   |   |   |   |-- SpringOverlayPanels.vue
|   |   |   |   |   |   |-- SpringPanelBody.vue
|   |   |   |   |   |   |-- SpringParamPanel.vue
|   |   |   |   |   |   |-- SpringPhotogate.vue
|   |   |   |   |   |   |-- SpringReport.css
|   |   |   |   |   |   |-- SpringReport.vue
|   |   |   |   |   |   |-- SpringScatterChart.vue
|   |   |   |   |   |   |-- SpringSignalChart.vue
|   |   |   |   |   |   |-- SpringStaticPanel.vue
|   |   |   |   |   |   |-- SpringStatusBar.vue
|   |   |   |   |   |   |-- SpringStepTracker.vue
|   |   |   |   |   |   `-- SpringTutorCard.vue
|   |   |   |   |   |-- thermal-expansion/
|   |   |   |   |   |   |-- panels/
|   |   |   |   |   |   |   |-- ThermalExpansionChartPanel.vue
|   |   |   |   |   |   |   |-- ThermalExpansionLawsPanel.vue
|   |   |   |   |   |   |   |-- ThermalExpansionParamsPanel.vue
|   |   |   |   |   |   |   |-- ThermalExpansionReadingsPanel.vue
|   |   |   |   |   |   |   |-- ThermalExpansionReferencePanel.vue
|   |   |   |   |   |   |   |-- ThermalExpansionResultsPanel.vue
|   |   |   |   |   |   |   |-- ThermalExpansionTrialsPanel.vue
|   |   |   |   |   |   |   `-- ThermalExpansionWorksheetPanel.vue
|   |   |   |   |   |   |-- ThermalExpansionCanvas.vue
|   |   |   |   |   |   |-- ThermalExpansionControlBar.vue
|   |   |   |   |   |   |-- ThermalExpansionHelpModal.vue
|   |   |   |   |   |   |-- ThermalExpansionMenuBar.vue
|   |   |   |   |   |   |-- ThermalExpansionOverlayPanels.vue
|   |   |   |   |   |   |-- ThermalExpansionPanelBody.vue
|   |   |   |   |   |   `-- ThermalExpansionStatusBar.vue
|   |   |   |   |   |-- thinlens/
|   |   |   |   |   |   |-- panels/
|   |   |   |   |   |   |   |-- ThinLensReferencePanel.vue
|   |   |   |   |   |   |   `-- ThinLensWorksheetPanel.vue
|   |   |   |   |   |   |-- ThinLensCanvas.vue
|   |   |   |   |   |   |-- ThinLensHelpModal.vue
|   |   |   |   |   |   `-- ThinLensPanelBody.vue
|   |   |   |   |   |-- wave-interference/
|   |   |   |   |   |   |-- panels/
|   |   |   |   |   |   |   |-- WaveInterferenceChartPanel.vue
|   |   |   |   |   |   |   |-- WaveInterferenceLawsPanel.vue
|   |   |   |   |   |   |   |-- WaveInterferenceParamsPanel.vue
|   |   |   |   |   |   |   |-- WaveInterferenceReadingsPanel.vue
|   |   |   |   |   |   |   |-- WaveInterferenceReferencePanel.vue
|   |   |   |   |   |   |   |-- WaveInterferenceResultsPanel.vue
|   |   |   |   |   |   |   |-- WaveInterferenceTrialsPanel.vue
|   |   |   |   |   |   |   `-- WaveInterferenceWorksheetPanel.vue
|   |   |   |   |   |   |-- WaveInterferenceCanvas.vue
|   |   |   |   |   |   |-- WaveInterferenceControlBar.vue
|   |   |   |   |   |   |-- WaveInterferenceHelpModal.vue
|   |   |   |   |   |   |-- WaveInterferenceMenuBar.vue
|   |   |   |   |   |   |-- WaveInterferenceOverlayPanels.vue
|   |   |   |   |   |   |-- WaveInterferencePanelBody.vue
|   |   |   |   |   |   `-- WaveInterferenceStatusBar.vue
|   |   |   |   |   |-- DataTable.vue
|   |   |   |   |   |-- DeletableSection.vue
|   |   |   |   |   |-- EquationsPanel.vue
|   |   |   |   |   |-- ExperimentReport.vue
|   |   |   |   |   |-- GuidePanel.vue
|   |   |   |   |   |-- ParamPanel.vue
|   |   |   |   |   `-- SubmitReportModal.vue
|   |   |   |   |-- home/
|   |   |   |   |   `-- StudentClasses.vue
|   |   |   |   |-- landing/
|   |   |   |   |   |-- LandingGuestButtons.vue
|   |   |   |   |   |-- LandingHeroSection.vue
|   |   |   |   |   |-- LandingLangSwitcher.vue
|   |   |   |   |   `-- LandingLoginForm.vue
|   |   |   |   |-- layout/
|   |   |   |   |   `-- AppNavbar.vue
|   |   |   |   |-- shared/
|   |   |   |   |   |-- FeedbackModal.vue
|   |   |   |   |   |-- NotificationBell.vue
|   |   |   |   |   |-- ReportCommentThread.vue
|   |   |   |   |   `-- ReportViewer.vue
|   |   |   |   |-- student/
|   |   |   |   |   |-- ReportResubmitModal.vue
|   |   |   |   |   |-- StudentProfile.vue
|   |   |   |   |   `-- StudentReports.vue
|   |   |   |   |-- teacher/
|   |   |   |   |   |-- ClassManager.vue
|   |   |   |   |   |-- CreateClassModal.vue
|   |   |   |   |   |-- GradeModal.vue
|   |   |   |   |   |-- ReportAIAnalyzer.vue
|   |   |   |   |   |-- StudentDetailModal.vue
|   |   |   |   |   |-- TeacherGrading.vue
|   |   |   |   |   |-- TeacherStats.vue
|   |   |   |   |   |-- TeacherStatsCharts.vue
|   |   |   |   |   |-- TeacherStatsComparison.vue
|   |   |   |   |   |-- TeacherStatsExport.vue
|   |   |   |   |   |-- TeacherStatsExpTable.vue
|   |   |   |   |   |-- TeacherStatsStudentTable.vue
|   |   |   |   |   `-- TeacherStatsSummary.vue
|   |   |   |   `-- ui/
|   |   |   |       `-- BranchCard.vue
|   |   |   |-- composables/
|   |   |   |   |-- admin/
|   |   |   |   |   |-- useAdminExport.ts
|   |   |   |   |   |-- useAdminSystemHealth.ts
|   |   |   |   |   |-- useAdminUserDetail.ts
|   |   |   |   |   |-- useAdminUsers.ts
|   |   |   |   |   `-- useAdminWarnings.ts
|   |   |   |   |-- analysis/
|   |   |   |   |   |-- sendToAnalysis.ts
|   |   |   |   |   |-- useCrossTabSync.ts
|   |   |   |   |   |-- useSmartValidator.ts
|   |   |   |   |   `-- useTheoreticalValues.ts
|   |   |   |   |-- auth/
|   |   |   |   |   `-- useAuthActions.ts
|   |   |   |   |-- biot-savart/
|   |   |   |   |   |-- useBiotSavartCalculations.ts
|   |   |   |   |   |-- useBiotSavartExperiment.ts
|   |   |   |   |   |-- useBiotSavartLayout.ts
|   |   |   |   |   `-- useBiotSavartTrials.ts
|   |   |   |   |-- boyles-law/
|   |   |   |   |   |-- useBoylesLawCalculations.ts
|   |   |   |   |   |-- useBoylesLawExperiment.ts
|   |   |   |   |   |-- useBoylesLawLayout.ts
|   |   |   |   |   `-- useBoylesLawTrials.ts
|   |   |   |   |-- calorimetry/
|   |   |   |   |   |-- useCalorimetryCalculations.ts
|   |   |   |   |   |-- useCalorimetryExperiment.ts
|   |   |   |   |   |-- useCalorimetryLayout.ts
|   |   |   |   |   `-- useCalorimetryTrials.ts
|   |   |   |   |-- chemistry/
|   |   |   |   |   |-- ar-chemistry.ts
|   |   |   |   |   |-- chemColorUtils.ts
|   |   |   |   |   |-- chemDatabase.ts
|   |   |   |   |   |-- chemDataCore.ts
|   |   |   |   |   |-- chemDataExtended.ts
|   |   |   |   |   |-- chemEquations.ts
|   |   |   |   |   |-- chemEquationsComplex.ts
|   |   |   |   |   |-- chemEquationsGas.ts
|   |   |   |   |   |-- chemEquationsNeutralization.ts
|   |   |   |   |   |-- chemEquationsPrecipitation.ts
|   |   |   |   |   |-- chemEquationsRedox.ts
|   |   |   |   |   |-- chemLabIds.ts
|   |   |   |   |   |-- chemLabTypes.ts
|   |   |   |   |   |-- chemTypeChecks.ts
|   |   |   |   |   |-- fluidSimRenderer.ts
|   |   |   |   |   |-- fluidSimTypes.ts
|   |   |   |   |   |-- fuzz-chemistry.test.ts
|   |   |   |   |   |-- liquidSimRenderer.ts
|   |   |   |   |   |-- liquidSimTypes.ts
|   |   |   |   |   |-- metaballRenderer.ts
|   |   |   |   |   |-- metaballTypes.ts
|   |   |   |   |   |-- property-chemistry.test.ts
|   |   |   |   |   |-- sendToAnalysis.ts
|   |   |   |   |   |-- solidFluidRenderer.ts
|   |   |   |   |   |-- solidFluidTypes.ts
|   |   |   |   |   |-- useBalance.ts
|   |   |   |   |   |-- useBeakerScale.ts
|   |   |   |   |   |-- useBuretteMixRecorder.ts
|   |   |   |   |   |-- useChemCalculations.ts
|   |   |   |   |   |-- useChemicalLocale.ts
|   |   |   |   |   |-- useChemistryHistory.ts
|   |   |   |   |   |-- useChemistryLab.ts
|   |   |   |   |   |-- useChemistryResizing.ts
|   |   |   |   |   |-- useChemistrySession.ts
|   |   |   |   |   |-- useChemistryTools.ts
|   |   |   |   |   |-- useDropPhysics.ts
|   |   |   |   |   |-- useExecActions.ts
|   |   |   |   |   |-- useExperiments.ts
|   |   |   |   |   |-- useFluidSimulation.ts
|   |   |   |   |   |-- useLabAssistant.ts
|   |   |   |   |   |-- useLabSimulation.ts
|   |   |   |   |   |-- useLiquidSimulation.ts
|   |   |   |   |   |-- useMetaballFluid.ts
|   |   |   |   |   |-- usePhMeter.ts
|   |   |   |   |   |-- usePipetteActions.ts
|   |   |   |   |   |-- useReactionEngine.ts
|   |   |   |   |   |-- useRetortStandAnalog.ts
|   |   |   |   |   |-- useRetortStandAssembly.ts
|   |   |   |   |   |-- useRetortStandDrag.ts
|   |   |   |   |   |-- useSimpleFluid.ts
|   |   |   |   |   |-- useSolidFluid.ts
|   |   |   |   |   |-- useSpillDrops.ts
|   |   |   |   |   |-- useStepControl.ts
|   |   |   |   |   |-- useTitrationRecorder.ts
|   |   |   |   |   |-- useToolStateBuilder.ts
|   |   |   |   |   |-- useWorkspaceDrag.ts
|   |   |   |   |   `-- workspaceDragSnap.ts
|   |   |   |   |-- collision/
|   |   |   |   |   |-- collisionUtils.test.ts
|   |   |   |   |   |-- collisionUtils.ts
|   |   |   |   |   |-- useCollisionExperiment.ts
|   |   |   |   |   |-- useCollisionLab.ts
|   |   |   |   |   |-- useCollisionLayout.ts
|   |   |   |   |   |-- useCollisionReport.ts
|   |   |   |   |   `-- useCollisionTrials.ts
|   |   |   |   |-- diffraction/
|   |   |   |   |   |-- useDiffractionCalculations.ts
|   |   |   |   |   |-- useDiffractionExperiment.ts
|   |   |   |   |   |-- useDiffractionLayout.ts
|   |   |   |   |   `-- useDiffractionTrials.ts
|   |   |   |   |-- experiment/
|   |   |   |   |   |-- analysis/
|   |   |   |   |   |   |-- chart-drawer.ts
|   |   |   |   |   |   |-- chart-regression.ts
|   |   |   |   |   |   |-- useChartWorkspace.ts
|   |   |   |   |   |   `-- useEquationSolver.ts
|   |   |   |   |   |-- collision/
|   |   |   |   |   |   |-- collision-drawers.ts
|   |   |   |   |   |   |-- collision-hud.ts
|   |   |   |   |   |   `-- useCollisionCanvas.ts
|   |   |   |   |   |-- useAnomalyWatcher.ts
|   |   |   |   |   `-- useStartupDiagnostics.ts
|   |   |   |   |-- faraday/
|   |   |   |   |   |-- useFaradayCalculations.ts
|   |   |   |   |   |-- useFaradayExperiment.ts
|   |   |   |   |   |-- useFaradayLayout.ts
|   |   |   |   |   `-- useFaradayTrials.ts
|   |   |   |   |-- freefall/
|   |   |   |   |   |-- freeFallUtils.test.ts
|   |   |   |   |   |-- freeFallUtils.ts
|   |   |   |   |   |-- useFreeFallExperiment.ts
|   |   |   |   |   |-- useFreeFallLab.ts
|   |   |   |   |   |-- useFreeFallLayout.ts
|   |   |   |   |   |-- useFreeFallReport.ts
|   |   |   |   |   `-- useFreeFallTrials.ts
|   |   |   |   |-- grating/
|   |   |   |   |   |-- useGratingCalculations.ts
|   |   |   |   |   |-- useGratingExperiment.ts
|   |   |   |   |   |-- useGratingLayout.ts
|   |   |   |   |   `-- useGratingTrials.ts
|   |   |   |   |-- ideal-gas/
|   |   |   |   |   |-- useIdealGasCalculations.ts
|   |   |   |   |   |-- useIdealGasExperiment.ts
|   |   |   |   |   |-- useIdealGasLayout.ts
|   |   |   |   |   `-- useIdealGasTrials.ts
|   |   |   |   |-- inclined/
|   |   |   |   |   |-- inclinedUtils.ts
|   |   |   |   |   |-- useInclinedExperiment.ts
|   |   |   |   |   |-- useInclinedLab.ts
|   |   |   |   |   |-- useInclinedLayout.ts
|   |   |   |   |   `-- useInclinedTrials.ts
|   |   |   |   |-- interference/
|   |   |   |   |   |-- useInterferenceCalculations.ts
|   |   |   |   |   |-- useInterferenceExperiment.ts
|   |   |   |   |   |-- useInterferenceLayout.ts
|   |   |   |   |   `-- useInterferenceTrials.ts
|   |   |   |   |-- latent-heat/
|   |   |   |   |   |-- useLatentHeatCalculations.ts
|   |   |   |   |   |-- useLatentHeatExperiment.ts
|   |   |   |   |   |-- useLatentHeatLayout.ts
|   |   |   |   |   `-- useLatentHeatTrials.ts
|   |   |   |   |-- lever/
|   |   |   |   |   |-- useLeverExperiment.ts
|   |   |   |   |   |-- useLeverLab.ts
|   |   |   |   |   |-- useLeverLayout.ts
|   |   |   |   |   `-- useLeverTrials.ts
|   |   |   |   |-- lightray/
|   |   |   |   |   |-- useLightRayExperiment.ts
|   |   |   |   |   |-- useLightRayLayout.ts
|   |   |   |   |   `-- useLightRayTrials.ts
|   |   |   |   |-- mirror/
|   |   |   |   |   |-- drawMirrorRays.ts
|   |   |   |   |   |-- mirrorArcHit.ts
|   |   |   |   |   |-- useMirrorExperiment.ts
|   |   |   |   |   |-- useMirrorLayout.ts
|   |   |   |   |   |-- useMirrorRenderer.ts
|   |   |   |   |   `-- useMirrorTrials.ts
|   |   |   |   |-- pendulum/
|   |   |   |   |   |-- pendulumUtils.test.ts
|   |   |   |   |   |-- pendulumUtils.ts
|   |   |   |   |   |-- usePendulumDrag.ts
|   |   |   |   |   |-- usePendulumExperiment.ts
|   |   |   |   |   |-- usePendulumLab.ts
|   |   |   |   |   |-- usePendulumLayout.ts
|   |   |   |   |   |-- usePendulumReport.ts
|   |   |   |   |   `-- usePendulumTrials.ts
|   |   |   |   |-- polarization/
|   |   |   |   |   |-- usePolarizationCalculations.ts
|   |   |   |   |   |-- usePolarizationExperiment.ts
|   |   |   |   |   |-- usePolarizationLayout.ts
|   |   |   |   |   `-- usePolarizationTrials.ts
|   |   |   |   |-- prism/
|   |   |   |   |   |-- prism-drawing.ts
|   |   |   |   |   |-- prism-geometry.ts
|   |   |   |   |   |-- prism-raytracer.ts
|   |   |   |   |   |-- useMaterialName.ts
|   |   |   |   |   |-- usePrismCalculations.test.ts
|   |   |   |   |   |-- usePrismCalculations.ts
|   |   |   |   |   |-- usePrismExperiment.ts
|   |   |   |   |   |-- usePrismInteraction.ts
|   |   |   |   |   |-- usePrismLayout.ts
|   |   |   |   |   |-- usePrismMinDeviation.ts
|   |   |   |   |   |-- usePrismRenderer.ts
|   |   |   |   |   |-- usePrismTrials.test.ts
|   |   |   |   |   `-- usePrismTrials.ts
|   |   |   |   |-- projectile/
|   |   |   |   |   |-- TARGET_ENHANCEMENT_PLAN.md
|   |   |   |   |   |-- TARGET_FEATURE_PLAN.md
|   |   |   |   |   |-- useProjectileDigitalScreen.ts
|   |   |   |   |   |-- useProjectileDraw.ts
|   |   |   |   |   |-- useProjectileExperiment.ts
|   |   |   |   |   |-- useProjectileGrid.ts
|   |   |   |   |   |-- useProjectileHints.ts
|   |   |   |   |   |-- useProjectileLab.ts
|   |   |   |   |   |-- useProjectileLayout.ts
|   |   |   |   |   |-- useProjectileReport.ts
|   |   |   |   |   |-- useProjectileTargetDraw.ts
|   |   |   |   |   `-- useProjectileTrials.ts
|   |   |   |   |-- rc-circuit/
|   |   |   |   |   |-- useRcCircuitCalculations.ts
|   |   |   |   |   |-- useRcCircuitExperiment.ts
|   |   |   |   |   |-- useRcCircuitLayout.ts
|   |   |   |   |   `-- useRcCircuitTrials.ts
|   |   |   |   |-- resonance/
|   |   |   |   |   |-- useResonanceCalculations.ts
|   |   |   |   |   |-- useResonanceExperiment.ts
|   |   |   |   |   |-- useResonanceLayout.ts
|   |   |   |   |   `-- useResonanceTrials.ts
|   |   |   |   |-- specific-heat/
|   |   |   |   |   |-- useSpecificHeatCalculations.ts
|   |   |   |   |   |-- useSpecificHeatExperiment.ts
|   |   |   |   |   |-- useSpecificHeatLayout.ts
|   |   |   |   |   `-- useSpecificHeatTrials.ts
|   |   |   |   |-- speed-of-sound/
|   |   |   |   |   |-- useSpeedOfSoundCalculations.ts
|   |   |   |   |   |-- useSpeedOfSoundExperiment.ts
|   |   |   |   |   |-- useSpeedOfSoundLayout.ts
|   |   |   |   |   `-- useSpeedOfSoundTrials.ts
|   |   |   |   |-- spring/
|   |   |   |   |   |-- drawSpringDigital.ts
|   |   |   |   |   |-- physicsUtils.test.ts
|   |   |   |   |   |-- physicsUtils.ts
|   |   |   |   |   |-- useSpringDraw.ts
|   |   |   |   |   |-- useSpringExperiment.ts
|   |   |   |   |   |-- useSpringExperimentActions.ts
|   |   |   |   |   |-- useSpringExperimentState.ts
|   |   |   |   |   |-- useSpringLab.ts
|   |   |   |   |   |-- useSpringLayout.ts
|   |   |   |   |   |-- useSpringReport.ts
|   |   |   |   |   |-- useSpringScene.ts
|   |   |   |   |   |-- useSpringStatic.ts
|   |   |   |   |   `-- useSpringTrials.ts
|   |   |   |   |-- teacher/
|   |   |   |   |   |-- useClassManager.ts
|   |   |   |   |   `-- useTeacherStatsCharts.ts
|   |   |   |   |-- thermal-expansion/
|   |   |   |   |   |-- thermalExpansionCanvas.utils.ts
|   |   |   |   |   |-- useThermalExpansionCalculations.ts
|   |   |   |   |   |-- useThermalExpansionExperiment.ts
|   |   |   |   |   |-- useThermalExpansionLayout.ts
|   |   |   |   |   `-- useThermalExpansionTrials.ts
|   |   |   |   |-- thinlens/
|   |   |   |   |   |-- useThinLensExperiment.ts
|   |   |   |   |   |-- useThinLensLayout.ts
|   |   |   |   |   |-- useThinLensRenderer.ts
|   |   |   |   |   `-- useThinLensTrials.ts
|   |   |   |   |-- wave-interference/
|   |   |   |   |   |-- useWaveInterferenceCalculations.ts
|   |   |   |   |   |-- useWaveInterferenceExperiment.ts
|   |   |   |   |   |-- useWaveInterferenceLayout.ts
|   |   |   |   |   `-- useWaveInterferenceTrials.ts
|   |   |   |   |-- fuzz-physics-engines.test.ts
|   |   |   |   |-- physics-utils-bounds.test.ts
|   |   |   |   |-- property-physics.test.ts
|   |   |   |   |-- useAdmin.ts
|   |   |   |   |-- useExperimentMonitor.ts
|   |   |   |   |-- useExperimentReport.test.ts
|   |   |   |   |-- useExperimentReport.ts
|   |   |   |   |-- useI18n.test.ts
|   |   |   |   |-- useI18n.ts
|   |   |   |   |-- useNotifications.ts
|   |   |   |   |-- useReportGrading.ts
|   |   |   |   `-- useReportSubmission.ts
|   |   |   |-- locales/
|   |   |   |   |-- analysis/
|   |   |   |   |   |-- ar.ts
|   |   |   |   |   |-- en.ts
|   |   |   |   |   |-- es.ts
|   |   |   |   |   `-- index.ts
|   |   |   |   |-- experiments/
|   |   |   |   |   |-- ar-1.ts
|   |   |   |   |   |-- ar-2.ts
|   |   |   |   |   |-- ar-3.ts
|   |   |   |   |   |-- ar-4.ts
|   |   |   |   |   |-- en-1.ts
|   |   |   |   |   |-- en-2.ts
|   |   |   |   |   |-- en-3.ts
|   |   |   |   |   |-- en-4.ts
|   |   |   |   |   |-- es-1.ts
|   |   |   |   |   |-- es-2.ts
|   |   |   |   |   |-- es-3.ts
|   |   |   |   |   |-- es-4.ts
|   |   |   |   |   `-- index.ts
|   |   |   |   |-- admin-user.ts
|   |   |   |   |-- admin.ts
|   |   |   |   |-- ai.ts
|   |   |   |   |-- ar.ts
|   |   |   |   |-- auth.ts
|   |   |   |   |-- chemistry-analysis.ts
|   |   |   |   |-- chemistry-assistant.ts
|   |   |   |   |-- chemistry-chemicals.ts
|   |   |   |   |-- chemistry-experiments.ts
|   |   |   |   |-- chemistry-lab.ts
|   |   |   |   |-- chemistry-report.ts
|   |   |   |   |-- chemistry-shelf.ts
|   |   |   |   |-- chemistry-tools.ts
|   |   |   |   |-- chemistry.ts
|   |   |   |   |-- common.ts
|   |   |   |   |-- dashboard.ts
|   |   |   |   |-- en.ts
|   |   |   |   |-- es.ts
|   |   |   |   |-- index.ts
|   |   |   |   |-- landing.ts
|   |   |   |   |-- settings.ts
|   |   |   |   |-- teacher.ts
|   |   |   |   `-- types.ts
|   |   |   |-- modules/
|   |   |   |   |-- auth/
|   |   |   |   |   |-- components/
|   |   |   |   |   |   `-- LoginForm.vue
|   |   |   |   |   |-- composables/
|   |   |   |   |   |   `-- useAuth.ts
|   |   |   |   |   |-- stores/
|   |   |   |   |   |   `-- auth.ts
|   |   |   |   |   `-- types.ts
|   |   |   |   |-- chemistry/
|   |   |   |   |   |-- analysis-calc/
|   |   |   |   |   |   |-- ChemAnalysisConclusionPanel.vue
|   |   |   |   |   |   |-- ChemAnalysisDataTable.vue
|   |   |   |   |   |   |-- ChemAnalysisMenuBar.vue
|   |   |   |   |   |   |-- ChemAnalysisPage.vue
|   |   |   |   |   |   |-- ChemAnalysisReportExport.vue
|   |   |   |   |   |   |-- ChemAnalysisStatsPanel.vue
|   |   |   |   |   |   |-- ChemAnalysisTab.vue
|   |   |   |   |   |   |-- ChemAnalysisTabs.vue
|   |   |   |   |   |   |-- ChemChartCanvas.vue
|   |   |   |   |   |   |-- ChemDataTab.vue
|   |   |   |   |   |   |-- ChemReportTab.vue
|   |   |   |   |   |   `-- ChemStudentInfoPanel.vue
|   |   |   |   |   |-- chemistry-landing.css
|   |   |   |   |   `-- ChemistryLanding.vue
|   |   |   |   |-- dashboard/
|   |   |   |   |   |-- components/
|   |   |   |   |   |   `-- DashboardCard.vue
|   |   |   |   |   |-- composables/
|   |   |   |   |   |   `-- useDashboard.ts
|   |   |   |   |   `-- types.ts
|   |   |   |   |-- physics/
|   |   |   |   |   |-- experiment-template/
|   |   |   |   |   |   |-- composables/
|   |   |   |   |   |   |   `-- useExperimentRunner.ts
|   |   |   |   |   |   |-- ExperimentShell.vue
|   |   |   |   |   |   `-- types.ts
|   |   |   |   |   |-- experiments/
|   |   |   |   |   |   |-- analysis-calc/
|   |   |   |   |   |   |   `-- AnalysisCalcExperiment.vue
|   |   |   |   |   |   |-- biot-savart/
|   |   |   |   |   |   |   `-- BiotSavartExperiment.vue
|   |   |   |   |   |   |-- boyles-law/
|   |   |   |   |   |   |   `-- BoylesLawExperiment.vue
|   |   |   |   |   |   |-- calorimetry/
|   |   |   |   |   |   |   `-- CalorimetryExperiment.vue
|   |   |   |   |   |   |-- collision/
|   |   |   |   |   |   |   |-- CollisionExperiment.vue
|   |   |   |   |   |   |   `-- useCollisionPhysics.ts
|   |   |   |   |   |   |-- diffraction/
|   |   |   |   |   |   |   `-- DiffractionExperiment.vue
|   |   |   |   |   |   |-- faraday/
|   |   |   |   |   |   |   `-- FaradayExperiment.vue
|   |   |   |   |   |   |-- freefall/
|   |   |   |   |   |   |   |-- FreeFallExperiment.vue
|   |   |   |   |   |   |   `-- useFreeFallPhysics.ts
|   |   |   |   |   |   |-- grating/
|   |   |   |   |   |   |   `-- GratingExperiment.vue
|   |   |   |   |   |   |-- ideal-gas/
|   |   |   |   |   |   |   `-- IdealGasExperiment.vue
|   |   |   |   |   |   |-- inclined/
|   |   |   |   |   |   |   |-- InclinedExperiment.vue
|   |   |   |   |   |   |   `-- useInclinedPhysics.ts
|   |   |   |   |   |   |-- interference/
|   |   |   |   |   |   |   `-- InterferenceExperiment.vue
|   |   |   |   |   |   |-- latent-heat/
|   |   |   |   |   |   |   `-- LatentHeatExperiment.vue
|   |   |   |   |   |   |-- lever/
|   |   |   |   |   |   |   |-- LeverExperiment.vue
|   |   |   |   |   |   |   |-- PLAN.md
|   |   |   |   |   |   |   |-- useLeverBeamPhysics.ts
|   |   |   |   |   |   |   `-- useLeverPhysics.ts
|   |   |   |   |   |   |-- lightray/
|   |   |   |   |   |   |   `-- LightRayExperiment.vue
|   |   |   |   |   |   |-- mirror/
|   |   |   |   |   |   |   `-- MirrorExperiment.vue
|   |   |   |   |   |   |-- pendulum/
|   |   |   |   |   |   |   |-- PendulumExperiment.vue
|   |   |   |   |   |   |   |-- PendulumSpringBridge.ts
|   |   |   |   |   |   |   `-- usePendulumPhysics.ts
|   |   |   |   |   |   |-- polarization/
|   |   |   |   |   |   |   `-- PolarizationExperiment.vue
|   |   |   |   |   |   |-- prism/
|   |   |   |   |   |   |   `-- PrismExperiment.vue
|   |   |   |   |   |   |-- projectile/
|   |   |   |   |   |   |   |-- ProjectileExperiment.vue
|   |   |   |   |   |   |   |-- projectileTheoretical.ts
|   |   |   |   |   |   |   `-- useProjectilePhysics.ts
|   |   |   |   |   |   |-- rc-circuit/
|   |   |   |   |   |   |   `-- RcCircuitExperiment.vue
|   |   |   |   |   |   |-- resonance/
|   |   |   |   |   |   |   `-- ResonanceExperiment.vue
|   |   |   |   |   |   |-- specific-heat/
|   |   |   |   |   |   |   `-- SpecificHeatExperiment.vue
|   |   |   |   |   |   |-- speed-of-sound/
|   |   |   |   |   |   |   `-- SpeedOfSoundExperiment.vue
|   |   |   |   |   |   |-- spring/
|   |   |   |   |   |   |   |-- fft.ts
|   |   |   |   |   |   |   |-- SpringExperiment.vue
|   |   |   |   |   |   |   `-- useSpringPhysics.ts
|   |   |   |   |   |   |-- thermal-expansion/
|   |   |   |   |   |   |   `-- ThermalExpansionExperiment.vue
|   |   |   |   |   |   |-- thinlens/
|   |   |   |   |   |   |   `-- ThinLensExperiment.vue
|   |   |   |   |   |   `-- wave-interference/
|   |   |   |   |   |       `-- WaveInterferenceExperiment.vue
|   |   |   |   |   |-- branch-page.vue
|   |   |   |   |   |-- branches-page.vue
|   |   |   |   |   |-- catalog.ts
|   |   |   |   |   |-- experiment-loader.ts
|   |   |   |   |   `-- experiment-page.vue
|   |   |   |   `-- settings/
|   |   |   |       |-- components/
|   |   |   |       |   `-- ThemeToggle.vue
|   |   |   |       `-- types.ts
|   |   |   |-- pages/
|   |   |   |   |-- admin.vue
|   |   |   |   |-- dashboard.vue
|   |   |   |   |-- index.vue
|   |   |   |   |-- language.vue
|   |   |   |   |-- login.vue
|   |   |   |   `-- register.vue
|   |   |   |-- services/
|   |   |   |   |-- admin.service.ts
|   |   |   |   |-- ai.service.ts
|   |   |   |   |-- class.service.ts
|   |   |   |   |-- home.service.ts
|   |   |   |   |-- http.test.ts
|   |   |   |   |-- http.ts
|   |   |   |   |-- notification.service.ts
|   |   |   |   `-- report.service.ts
|   |   |   |-- shared/
|   |   |   |   |-- composables/
|   |   |   |   |   |-- useMediaQuery.ts
|   |   |   |   |   `-- useTheme.ts
|   |   |   |   |-- types/
|   |   |   |   |   `-- globals.ts
|   |   |   |   |-- ui/
|   |   |   |   |   |-- BaseButton.vue
|   |   |   |   |   `-- BaseInput.vue
|   |   |   |   `-- utils/
|   |   |   |       |-- cn.ts
|   |   |   |       `-- formatDate.ts
|   |   |   |-- stores/
|   |   |   |   |-- analysis.store.ts
|   |   |   |   |-- chemistry-analysis.store.ts
|   |   |   |   `-- i18n.store.ts
|   |   |   |-- tools/
|   |   |   |   `-- i18n-audit.ts
|   |   |   |-- types/
|   |   |   |   |-- chemistry.ts
|   |   |   |   |-- physics.ts
|   |   |   |   `-- router.ts
|   |   |   |-- utils/
|   |   |   |   |-- lab-report.build-html.ts
|   |   |   |   |-- lab-report.send.ts
|   |   |   |   |-- lab-report.ts
|   |   |   |   `-- lab-report.types.ts
|   |   |   |-- App.vue
|   |   |   |-- main.ts
|   |   |   `-- router.ts
|   |   |-- test-results/
|   |   |-- tests/
|   |   |   |-- visual-regression.spec.ts-snapshots/
|   |   |   |-- i18n-ui.spec.ts
|   |   |   |-- monkey-tabs.spec.ts
|   |   |   |-- performance-leak.spec.ts
|   |   |   |-- physics-bounds.spec.ts
|   |   |   `-- visual-regression.spec.ts
|   |   |-- Dockerfile
|   |   |-- index.html
|   |   |-- lint_errors.txt
|   |   |-- lint-output.txt
|   |   |-- nginx.conf
|   |   |-- package.json
|   |   |-- playwright.config.ts
|   |   |-- thinlens-tsc.txt
|   |   |-- tsconfig.json
|   |   |-- vite.config.ts
|   |   `-- vitest.config.ts
|   `-- worker/
|       |-- src/
|       |   |-- jobs/
|       |   |   |-- processImages.ts
|       |   |   `-- sendEmail.ts
|       |   `-- index.ts
|       |-- package.json
|       `-- tsconfig.json
|-- packages/
|   |-- chemistry-engine/
|   |   |-- src/
|   |   |   |-- color.ts
|   |   |   |-- equations.ts
|   |   |   |-- index.ts
|   |   |   |-- reactions.ts
|   |   |   |-- type-checks.ts
|   |   |   `-- types.ts
|   |   |-- package.json
|   |   `-- tsconfig.json
|   |-- config/
|   |   |-- eslint/
|   |   |   `-- index.js
|   |   |-- typescript/
|   |   |   `-- base.json
|   |   `-- package.json
|   |-- shared-types/
|   |   |-- src/
|   |   |   |-- api-responses.ts
|   |   |   |-- auth.ts
|   |   |   |-- class.ts
|   |   |   |-- index.ts
|   |   |   `-- user.ts
|   |   `-- package.json
|   `-- ui-kit/
|       |-- src/
|       |   |-- Button/
|       |   |   `-- Button.vue
|       |   |-- Input/
|       |   |   `-- Input.vue
|       |   `-- index.ts
|       `-- package.json
|-- toolbox/
|   |-- generators/
|   |   `-- index.js
|   `-- scripts/
|       |-- audit-files.js
|       |-- auto-save.ps1
|       |-- auto-save.sh
|       |-- clean.js
|       |-- project-tree.js
|       |-- save-now.bat
|       `-- start-auto-save.bat
|-- ai_rules.md
|-- ANALYSIS_CALC_PLAN.md
|-- arabic_lines.csv
|-- arabic_lines2.csv
|-- AUTH_REBUILD_PLAN.md
|-- build.txt
|-- docker-compose.yml
|-- fix-any-remaining.js
|-- fix-reports.js
|-- fix-spring-imports.js
|-- FULL_PROJECT_TREE.md
|-- lint-check-mirror.txt
|-- lint-check.txt
|-- lint-check2.txt
|-- lint-check3.txt
|-- lint-check4.txt
|-- lint-check5.txt
|-- lint-check6.txt
|-- lint-check7.txt
|-- lint-current.txt
|-- lint-json.json
|-- lint-live.txt
|-- lint-live2.txt
|-- lint-live3.txt
|-- lint-live4.txt
|-- lint-output.txt
|-- lint-unix.txt
|-- lint-web.txt
|-- MIGRATION_RULES.md
|-- package-lock.json
|-- package.json
|-- parse_lint.py
|-- PENDULUM_PLAN.md
|-- PLAN_01_BACKEND.md
|-- PLAN_02_FRONTEND_SERVICES.md
|-- PLAN_03_COMPONENTS.md
|-- PLAN_04_FLOW_CHECKLIST.md
|-- pnpm-lock.yaml
|-- pnpm-workspace.yaml
|-- PRISM_DEEP_REPAIR_PLAN.md
|-- PROJECT_REPAIR_PLAN.md
|-- PROJECT_STRUCTURE.md
|-- project_tree_clean.md
|-- PROJECT_TREE.md
|-- TEACHER_STUDENT_FULL_PLAN.md
|-- TEACHER_STUDENT_MASTER_PLAN.md
|-- TEACHER_STUDENT_PROGRESS.md
|-- temp_lab_report.txt
|-- turbo.json
|-- typecheck.txt
`-- typecheck2.txt
