import { refractiveIndex } from './usePrismCalculations'

interface PrismProps {
  prismAngle: number
  angleIncidence: number
  wavelength: number
  material: string
  angleRefraction1: number | null
  angleIncidence2: number | null
  angleEmergence: number | null
  deviation: number | null
  n: number
  totalInternalReflection: boolean
  running: boolean
}

// مصفوفة الأطوال الموجية السبعة لتوليد طيف التحلل الكامل
const SPECTRUM = [
  { wavelength: 650, color: '#FF0000', label: 'الأحمر' },
  { wavelength: 600, color: '#FF7F00', label: 'البرتقالي' },
  { wavelength: 580, color: '#FFFF00', label: 'الأصفر' },
  { wavelength: 530, color: '#00FF00', label: 'الأخضر' },
  { wavelength: 470, color: '#0000FF', label: 'الأزرق' },
  { wavelength: 430, color: '#4B0082', label: 'النيلي' },
  { wavelength: 400, color: '#8B00FF', label: 'البنفسجي' }
]

function toRad(deg: number) { return (deg * Math.PI) / 180 }
function toDeg(rad: number) { return (rad * 180) / Math.PI }

export function drawPrism(canvas: HTMLCanvasElement, props: PrismProps) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const W = canvas.width
  const H = canvas.height

  // 1. تنظيف مساحة العمل بالكامل باللون الخلفي الداكن للمختبر
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = '#161B22'
  ctx.fillRect(0, 0, W, H)

  // 2. بناء هندسة المنشور الثلاثي المتساوي الساقين في مركز الـ Canvas
  const prismSize = Math.min(W, H) * 0.5
  const centerX = W * 0.52
  const centerY = H * 0.55

  // حساب زوايا القاعدة بناءً على زاوية الرأس A
  const A_rad = toRad(props.prismAngle)
  const baseAngle = (Math.PI - A_rad) / 2

  // إيجاد نقاط رؤوس المثلث الثلاثة هندسياً
  const topY = centerY - (prismSize * Math.cos(baseAngle)) / 2
  const bottomY = centerY + (prismSize * Math.cos(baseAngle)) / 2
  const leftX = centerX - (prismSize * Math.sin(A_rad / 2))
  const rightX = centerX + (prismSize * Math.sin(A_rad / 2))

  const pA = { x: centerX, y: topY }     // رأس المنشور العلوي
  const pB = { x: leftX, y: bottomY }    // القاعدة يسار
  const pC = { x: rightX, y: bottomY }   // القاعدة يمين

  // رسم جسم المنشور الزجاجي
  ctx.beginPath()
  ctx.moveTo(pA.x, pA.y)
  ctx.lineTo(pB.x, pB.y)
  ctx.lineTo(pC.x, pC.y)
  ctx.closePath()
  ctx.fillStyle = 'rgba(103, 232, 249, 0.06)' // تعبئة زجاجية خفيفة
  ctx.fill()
  ctx.strokeStyle = '#8B95A5' // حدود فضية واضحة
  ctx.lineWidth = 2
  ctx.stroke()

  // حساب زاوية ميل السطح الأيسر الفاصل (AB) بالنسبة للأفق
  const edgeAB_angle = Math.atan2(pB.y - pA.y, pB.x - pA.x)
  // العمودي على السطح الأول متجه للخارج واليسار
  const normal1_angle = edgeAB_angle - Math.PI / 2

  // 3. تحديد نقطة سقوط الشعاع الأبيض على الوجه الأول (منتصف الضلع AB تماماً)
  const p1 = {
    x: (pA.x + pB.x) / 2,
    y: (pA.y + pB.y) / 2
  }

  // زاوية السقوط المعطاة من المؤشر θi
  const theta1_rad = toRad(props.angleIncidence)
  // اتجاه الشعاع الساقط الفعلي في الفراغ
  const incidentRay_angle = normal1_angle + Math.PI + theta1_rad

  // رسم خط السقوط الأبيض القادم من أقصى اليسار
  const sourceX = 0
  const sourceY = p1.y + (sourceX - p1.x) * Math.tan(incidentRay_angle)

  ctx.beginPath()
  ctx.moveTo(sourceX, sourceY)
  ctx.lineTo(p1.x, p1.y)
  ctx.strokeStyle = '#FFFFFF' // ضوء أبيض نقي
  ctx.lineWidth = 2.5
  ctx.shadowBlur = 10
  ctx.shadowColor = '#FFFFFF'
  ctx.stroke()
  ctx.shadowBlur = 0 // إلغاء التوهج للخطوط الداخلية لإبقاء الرسم حاداً

  // 4. تتبع وكسر الأشعة السبعة (Ray Tracing Engine) داخل وخارج الزجاج
  SPECTRUM.forEach((ray) => {
    // حساب معامل الانكسار الخاص بهذا الطول الموجي بناءً على معادلة كوشي للمادة المحددة
    const n_lambda = refractiveIndex(props.material, ray.wavelength)

    // السطح الأول: من الهواء (n=1) إلى الزجاج
    const sin_r1 = Math.sin(theta1_rad) / n_lambda
    if (Math.abs(sin_r1) > 1) return // حماية رياضيّة

    const r1_rad = Math.asin(sin_r1)
    // اتجاه الشعاع المكسور داخل الزجاج
    const refractedRay_angle = normal1_angle + Math.PI + r1_rad

    // حساب نقطة التقاطع الدقيقة P2 مع السطح الثاني للمثلث (الضلع AC) عبر تقاطع المستقيمات
    const p2 = getLineIntersection(
      p1.x, p1.y, 
      p1.x + Math.cos(refractedRay_angle) * W, p1.y + Math.sin(refractedRay_angle) * W,
      pA.x, pA.y, 
      pC.x, pC.y
    )

    if (!p2) return // إذا لم يتقاطع هندسياً يتجاهله لمنع الأخطاء

    // رسم الشعاع الملون الأحادي داخل جسم المنشور الزجاجي
    ctx.beginPath()
    ctx.moveTo(p1.x, p1.y)
    ctx.lineTo(p2.x, p2.y)
    ctx.strokeStyle = ray.color
    ctx.lineWidth = 1.5
    ctx.stroke()

    // السطح الثاني: من الزجاج إلى الهواء
    const edgeAC_angle = Math.atan2(pC.y - pA.y, pC.x - pA.x)
    const normal2_angle = edgeAC_angle + Math.PI / 2 // العمودي الفاصل الثاني متجهاً للخارج

    // حساب زاوية السقوط الداخلية الثانية r2
    // هندسياً: r2 = A - r1، ولكن المتجهات تضمنها بدقة هنا
    const internal_incident_angle = normal2_angle - refractedRay_angle - Math.PI

    const sin_thetaE = n_lambda * Math.sin(internal_incident_angle)

    ctx.save()
    if (Math.abs(sin_thetaE) >= 1) {
      // حالة الانعكاس الداخلي الكلي (TIR): ينعكس الشعاع لأسفل المنشور ويرتطم بالقاعدة
      const reflection_angle = normal2_angle - internal_incident_angle
      const pBase = getLineIntersection(
        p2.x, p2.y,
        p2.x + Math.cos(reflection_angle) * W, p2.y + Math.sin(reflection_angle) * W,
        pB.x, pB.y,
        pC.x, pC.y
      )
      
      ctx.beginPath()
      ctx.moveTo(p2.x, p2.y)
      if (pBase) {
        ctx.lineTo(pBase.x, pBase.y)
      } else {
        ctx.lineTo(p2.x + Math.cos(reflection_angle) * 100, p2.y + Math.sin(reflection_angle) * 100)
      }
      ctx.strokeStyle = ray.color
      ctx.setLineDash([3, 3]) // رسم الانعكاس الداخلي المكتوم كخط متقطع
      ctx.stroke()
    } else {
      // النفاذ الطبيعي والتشتت الخارجي في الهواء
      const thetaE_rad = Math.asin(sin_thetaE)
      const emergentRay_angle = normal2_angle - thetaE_rad

      // مد الشعاع الخارج الملون إلى حافة مساحة العمل اليمنى بالكامل دون توقف أو بتر
      const exitLength = W * 1.5
      const pExitEnd = {
        x: p2.x + Math.cos(emergentRay_angle) * exitLength,
        y: p2.y + Math.sin(emergentRay_angle) * exitLength
      }

      ctx.beginPath()
      ctx.moveTo(p2.x, p2.y)
      ctx.lineTo(pExitEnd.x, pExitEnd.y)
      ctx.strokeStyle = ray.color
      ctx.lineWidth = 2
      // إضافة توهج خفيف للأشعة الخارجة الملونة لتبدو كمختبر بصري حقيقي حاد
      ctx.shadowBlur = 4
      ctx.shadowColor = ray.color
      ctx.stroke()
    }
    ctx.restore()
  })

  // 5. رسم خطوط المحاور العمودية الوهمية (Normals) للمساعدة في الفهم الأكاديمي
  ctx.save()
  ctx.setLineDash([4, 4])
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)'
  ctx.lineWidth = 1

  // العمودي الأول على السطح AB
  ctx.beginPath()
  ctx.moveTo(p1.x - Math.cos(normal1_angle) * 40, p1.y - Math.sin(normal1_angle) * 40)
  ctx.lineTo(p1.x + Math.cos(normal1_angle) * 40, p1.y + Math.sin(normal1_angle) * 40)
  ctx.stroke()

  // رسم الحرف النصي للزوايا والنقاط الأساسية بشكل جمالي
  ctx.fillStyle = '#8B95A5'
  ctx.font = '12px Inter, Arial, sans-serif'
  ctx.fillText('A', pA.x - 4, pA.y - 8)
  ctx.restore()
}

// دالة هندسية رياضية لحساب نقطة تقاطع مستقيمين (Line-Line Intersection)
function getLineIntersection(
  p0_x: number, p0_y: number, p1_x: number, p1_y: number,
  p2_x: number, p2_y: number, p3_x: number, p3_y: number
): { x: number, y: number } | null {
  const s1_x = p1_x - p0_x
  const s1_y = p1_y - p0_y
  const s2_x = p3_x - p2_x
  const s2_y = p3_y - p2_y

  const s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y)
  const t = ( s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y)

  if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
    return {
      x: p0_x + (t * s1_x),
      y: p0_y + (t * s1_y)
    }
  }
  return null // لا يوجد تقاطع حقيقي على قطع المستقيمات المحددة
}
