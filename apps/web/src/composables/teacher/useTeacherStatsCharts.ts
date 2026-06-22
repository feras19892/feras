import { ref, watch, onMounted, onUnmounted } from 'vue'

export function useTeacherStatsCharts(
  statsRef: { value: { distribution?: Record<string, number>; total?: number } | null },
  reportLabel = 'report'
) {
  const barCanvas = ref<HTMLCanvasElement | null>(null)
  const pieCanvas = ref<HTMLCanvasElement | null>(null)

  function drawBarChart() {
    const canvas = barCanvas.value
    if (!canvas || !statsRef.value) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    const w = 500, h = 220
    canvas.width = w * dpr; canvas.height = h * dpr
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px'
    ctx.scale(dpr, dpr)

    const dist = statsRef.value.distribution || {}
    const labels = Object.keys(dist)
    const values = Object.values(dist) as number[]
    const max = Math.max(...values, 1)

    ctx.clearRect(0, 0, w, h)
    const barW = 50, gap = 30, startX = 40, chartH = h - 60
    const colors = ['#f87171', '#fbbf24', '#60a5fa', '#34d399', '#a78bfa']

    labels.forEach((label, i) => {
      const v = values[i]
      const barH = (v / max) * chartH
      const x = startX + i * (barW + gap)
      const y = h - 40 - barH
      ctx.fillStyle = colors[i]
      ctx.fillRect(x, y, barW, barH)
      ctx.fillStyle = '#94a3b8'
      ctx.font = '11px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(label, x + barW / 2, h - 15)
      if (v > 0) {
        ctx.fillStyle = '#e2e8f0'
        ctx.fillText(String(v), x + barW / 2, y - 5)
      }
    })
  }

  function drawPieChart() {
    const canvas = pieCanvas.value
    if (!canvas || !statsRef.value) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    const w = 220, h = 220
    canvas.width = w * dpr; canvas.height = h * dpr
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px'
    ctx.scale(dpr, dpr)

    const dist = statsRef.value.distribution || {}
    const values = Object.values(dist) as number[]
    const total = values.reduce((a, b) => a + b, 0)
    if (total === 0) return

    ctx.clearRect(0, 0, w, h)
    const cx = w / 2, cy = h / 2, r = 80
    const colors = ['#f87171', '#fbbf24', '#60a5fa', '#34d399', '#a78bfa']
    let start = -Math.PI / 2

    values.forEach((v, i) => {
      const slice = (v / total) * 2 * Math.PI
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, r, start, start + slice)
      ctx.closePath()
      ctx.fillStyle = colors[i]
      ctx.fill()
      start += slice
    })

    ctx.beginPath()
    ctx.arc(cx, cy, 45, 0, 2 * Math.PI)
    ctx.fillStyle = 'rgba(15,23,42,0.95)'
    ctx.fill()
    ctx.fillStyle = '#e2e8f0'
    ctx.font = 'bold 14px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${total}`, cx, cy - 6)
    ctx.font = '10px sans-serif'
    ctx.fillStyle = '#94a3b8'
    ctx.fillText(reportLabel, cx, cy + 8)
  }

  watch(() => statsRef.value, () => {
    setTimeout(() => { drawBarChart(); drawPieChart() }, 100)
  }, { deep: true })

  let resizeTimer: ReturnType<typeof setTimeout> | null = null
  function onResize() {
    if (resizeTimer) clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => { drawBarChart(); drawPieChart() }, 200)
  }

  onMounted(() => window.addEventListener('resize', onResize))
  onUnmounted(() => window.removeEventListener('resize', onResize))

  return { barCanvas, pieCanvas, drawBarChart, drawPieChart }
}
