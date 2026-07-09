const fs=require('fs');
const files=[
  'C:/Users/feras/Desktop/feras/apps/web/src/components/experiment/spring/SpringOverlayPanels.vue',
  'C:/Users/feras/Desktop/feras/apps/web/src/components/experiment/spring/SpringPanelBody.vue',
];
for(const f of files){
  let c=fs.readFileSync(f,'utf8');
  c=c.replace("import type { Trial }", "import type { SpringTrial }");
  c=c.replace(/\bTrial\b/g, 'SpringTrial');
  fs.writeFileSync(f,c);
  console.log('Fixed',f);
}
