import { ref } from 'vue'

export function useCollisionReport() {
  const canvasSnapshot = ref<string | null>(null)

  function captureSnapshot(canvasRef: { captureSnapshot?: () => string } | null) {
    if (!canvasRef || !canvasRef.captureSnapshot) return
    canvasSnapshot.value = canvasRef.captureSnapshot()
  }

  function onSnapshot(dataUrl: string) {
    canvasSnapshot.value = dataUrl
  }

  function openFullReport(experiment: any) {
    const imgTag = canvasSnapshot.value ? `<img src="${canvasSnapshot.value}" style="max-width:100%;border-radius:8px;margin:1rem 0;" />` : ''
    const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title>تقرير تجربة التصادم</title>
<style>
body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; padding: 2rem; color: #1e293b; }
.container { max-width: 800px; margin: 0 auto; background: #fff; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,.1); }
h1 { color: #0f172a; border-bottom: 3px solid #06b6d4; padding-bottom: .5rem; }
table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
th, td { border: 1px solid #e2e8f0; padding: .6rem; text-align: center; }
th { background: #f1f5f9; font-weight: 600; }
</style>
</head>
<body>
<div class="container">
<h1>💥 تقرير تجربة التصادم في بعد واحد</h1>
<p><strong>التاريخ:</strong> ${new Date().toLocaleString('ar-SA')}</p>
${imgTag}
<h2>📋 البيانات المسجلة</h2>
<table>
<tr><th>#</th><th>m₁ (kg)</th><th>m₂ (kg)</th><th>v₁i (m/s)</th><th>v₂i (m/s)</th><th>e</th><th>v₁f (m/s)</th><th>v₂f (m/s)</th><th>Loss %</th></tr>
${experiment.trials.trials.value.map((t: any, i: number) =>
  `<tr><td>${i + 1}</td><td>${t.m1}</td><td>${t.m2}</td><td>${t.v1i}</td><td>${t.v2i}</td><td>${t.e}</td><td>${t.v1f}</td><td>${t.v2f}</td><td>${t.lossPercent}%</td></tr>`
).join('')}
</table>
</div>
</body>
</html>`
    const w = window.open('', '_blank')
    if (w) { w.document.open(); w.document.write(html); w.document.close() }
  }

  return { canvasSnapshot, captureSnapshot, onSnapshot, openFullReport }
}
