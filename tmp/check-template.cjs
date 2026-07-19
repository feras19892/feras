const fs = require('fs')
const f = fs.readFileSync('c:/Users/feras/Desktop/feras/apps/web/src/modules/physics/experiments/electric-workshop/ac/ACLab.vue', 'utf8')
const m = f.match(/<template>([\s\S]*?)<\/template>/)
if (m) {
  const t = m[1]
  const lines = t.split('\n')
  console.log('Template lines:', lines.length)
  console.log('Has ac-lab:', t.includes('ac-lab'))
  console.log('Has ac-canvas:', t.includes('ac-canvas'))
  console.log('Has ac-palette:', t.includes('ac-palette'))
  console.log('Has ac-bottom-bar:', t.includes('ac-bottom-bar'))
  console.log('Has onAddComponent:', t.includes('onAddComponent'))
  console.log('Has toggleRun:', t.includes('toggleRun'))
  console.log('Has loadExp:', t.includes('loadExp'))
}
// Check script section for errors
const s = f.match(/<script setup[^>]*>([\s\S]*?)<\/script>/)
if (s) {
  const script = s[1]
  console.log('\nScript length:', script.length)
  console.log('Has useWorkshop ac:', script.includes("useWorkshop('ac')"))
  console.log('Has acComponents:', script.includes('acComponents'))
  console.log('Has dcComponents:', script.includes('dcComponents'))
  // Check for leftover DC references
  const dcRefs = script.match(/dcComponents|dc-/g)
  if (dcRefs) console.log('Leftover dc references:', dcRefs)
  else console.log('No leftover dc references in script')
}
