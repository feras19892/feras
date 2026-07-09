const fs=require('fs');

const fixes=[
  {
    file:'C:/Users/feras/Desktop/feras/apps/web/src/composables/freefall/useFreeFallReport.ts',
    trialType:'FreeFallTrial', trialImport:'./useFreeFallTrials',
    iface:'interface FreeFallReportInput { params: { h: number; g: number; mass: number; airResistance: boolean }; trials: { trials: { value: FreeFallTrial[] }; trialStats: { value: { g_mean: number } }; calcResult: { value: string } } }',
    paramName:'ex',
  },
  {
    file:'C:/Users/feras/Desktop/feras/apps/web/src/composables/pendulum/usePendulumReport.ts',
    trialType:'PendulumTrial', trialImport:'./usePendulumTrials',
    iface:'interface PendulumReportInput { params: { length: number; angle: number; mass: number; gravity: number }; trials: { trials: { value: PendulumTrial[] }; trialStats: { value: { t_mean: number; g_mean: number } }; calcResult: { value: string } } }',
    paramName:'ex',
  },
  {
    file:'C:/Users/feras/Desktop/feras/apps/web/src/composables/projectile/useProjectileReport.ts',
    trialType:'ProjectileTrial', trialImport:'./useProjectileTrials',
    iface:'interface ProjectileReportInput { params: { v0: number; angle: number; g: number; h0: number }; trials: { trials: { value: ProjectileTrial[] }; trialStats: { value: { range_mean: number } }; calcResult: { value: string } } }',
    paramName:'ex',
  },
  {
    file:'C:/Users/feras/Desktop/feras/apps/web/src/composables/spring/useSpringReport.ts',
    trialType:'SpringTrial', trialImport:'./useSpringTrials',
    iface:'interface SpringReportInput { params: { k: number; mass: number; amplitude: number }; trials: { trials: { value: SpringTrial[] }; trialStats: { value: { t_mean: number; k_mean: number } }; calcResult: { value: string } } }',
    paramName:'ex',
  },
  {
    file:'C:/Users/feras/Desktop/feras/apps/web/src/composables/collision/useCollisionReport.ts',
    trialType:'CollisionTrial', trialImport:'./useCollisionTrials',
    iface:'interface CollisionReportInput { params: { m1: number; m2: number; v1: number; v2: number }; trials: { trials: { value: CollisionTrial[] }; trialStats: { value: { e_mean: number } }; calcResult: { value: string } } }',
    paramName:'experiment',
  },
];

for(const f of fixes){
  let c=fs.readFileSync(f.file,'utf8');
  if(!c.includes(f.trialType)){
    c=c.replace("import type { LabReportTable, LabReportStat }", `import type { ${f.trialType} } from '${f.trialImport}'\nimport type { LabReportTable, LabReportStat }`);
  }
  if(!c.includes(f.iface.split(' ')[1])){
    c=c.replace('export function use', `${f.iface}\n\nexport function use`);
  }
  c=c.replace(new RegExp('// eslint-disable-next-line @typescript-eslint/no-explicit-any\\s*\\n\\s*function openFullReport\\('+f.paramName+': any\\)'), `function openFullReport(${f.paramName}: ${f.iface.split(' ')[1]})`);
  c=c.replace(new RegExp('// eslint-disable-next-line @typescript-eslint/no-explicit-any\\s*\\n\\s*const trials: any\\[\\] = '+f.paramName+'\\.trials\\.trials\\.value'), `const trials = ${f.paramName}.trials.trials.value`);
  fs.writeFileSync(f.file,c);
  console.log('Fixed',f.file);
}
