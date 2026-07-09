const fs=require('fs');

// 1. Calorimetry experiment
let f='C:/Users/feras/Desktop/feras/apps/web/src/composables/calorimetry/useCalorimetryExperiment.ts';
let c=fs.readFileSync(f,'utf8');
c=c.replace('(t: any) => ({ mWater: t.mWater', '(t: CalorimetryTrial) => ({ mWater: t.mWater');
if(!c.includes('CalorimetryTrial')){
  c=c.replace("import { useI18n } from '../useI18n'", "import { useI18n } from '../useI18n'\nimport type { CalorimetryTrial } from './useCalorimetryTrials'");
}
fs.writeFileSync(f,c);

// 2. Light ray experiment
f='C:/Users/feras/Desktop/feras/apps/web/src/composables/lightray/useLightRayExperiment.ts';
c=fs.readFileSync(f,'utf8');
c=c.replace('// eslint-disable-next-line @typescript-eslint/no-explicit-any\nfunction getMediumName', 'function getMediumName');
c=c.replace('t: (key: string, ...args: any[]) => string', 't: (key: string, ...args: unknown[]) => string');
fs.writeFileSync(f,c);

// 3. Mirror renderer
f='C:/Users/feras/Desktop/feras/apps/web/src/composables/mirror/useMirrorRenderer.ts';
c=fs.readFileSync(f,'utf8');
c=c.replace('// eslint-disable-next-line @typescript-eslint/no-explicit-any\nexport function drawMirror', 'export function drawMirror');
c=c.replace('t?: (key: string, ...args: any[]) => string', 't?: (key: string, ...args: unknown[]) => string');
fs.writeFileSync(f,c);

// 4. ChemAnalysisPage.vue
f='C:/Users/feras/Desktop/feras/apps/web/src/modules/chemistry/analysis-calc/ChemAnalysisPage.vue';
c=fs.readFileSync(f,'utf8');
c=c.replace('(c: any) => ({ key: c.key, label: c.label, unit: c.unit })', '(c: { key: string; label: string; unit: string }) => ({ key: c.key, label: c.label, unit: c.unit })');
fs.writeFileSync(f,c);

// 5. AnalysisCalcExperiment.vue
f='C:/Users/feras/Desktop/feras/apps/web/src/modules/physics/experiments/analysis-calc/AnalysisCalcExperiment.vue';
c=fs.readFileSync(f,'utf8');
c=c.replace('(c: any) => ({ key: c.key, label: c.label, unit: c.unit })', '(c: { key: string; label: string; unit: string }) => ({ key: c.key, label: c.label, unit: c.unit })');
fs.writeFileSync(f,c);

console.log('Done fixing remaining any types');
