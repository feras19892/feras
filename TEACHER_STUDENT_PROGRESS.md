# Teacher-Student Feature — Build Progress

## Completed (All 4 Phases)

### Phase 1: Backend Foundation
- `002_reports.sql` — adds `is_active` to classes + creates `experiment_reports`
- `classes/{schemas,services,handlers}.ts` — CRUD + join + stats endpoints
- `reports/{schemas,services,handlers}.ts` — submit + list + grade endpoints
- `src/index.ts` — registers `/api/classes` and `/api/reports`

### Phase 2: Class Management
- `useClassManager.ts` — composable using real API (not localStorage)
- `class.service.ts` — frontend service for all class operations
- `ClassManager.vue` — expandable class cards showing enrolled students
- `StudentClasses.vue` — join by code + list enrolled classes via API

### Phase 3: Report Submission + Grading
- `SubmitReportModal.vue` — select class + send report data
- `AnalysisCalcExperiment.vue` — "Send to Teacher" opens modal with analysis data
- `TeacherGrading.vue` — view class reports, assign grades (0-100), add feedback
- `report.service.ts` — frontend service for report operations

### Phase 4: Student Reports + Notifications + Stats
- `StudentReports.vue` — student views their submitted reports + grades
- `AppNavbar.vue` — red badge on "Grading" tab showing pending count
- `TeacherGrading.vue` — stats bar (total, graded, pending, average)

## Key Flows
```
Teacher: Create Class → Copy Code
Student: Join by Code → Run Experiment → Click "Send to Teacher" in Analysis
Teacher: See Red Badge → Open Grading → Select Class → Grade Reports
Student: Open "My Reports" → See Grades + Feedback
```

## Next Steps / Testing
1. Restart API server to apply migration `002_reports.sql`
2. Login as teacher → create class → copy code
3. Login as student → join with code → go to experiment → analyze → send
4. Login as teacher → check grading tab → see student + grade

## Known Issues
- `PanelId` type errors in `SpringExperiment.vue` — pre-existing, unrelated
