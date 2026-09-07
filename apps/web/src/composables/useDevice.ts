import { ref, onMounted, onUnmounted } from 'vue'

export type DeviceType = 'phone' | 'tablet' | 'desktop'

export interface DeviceInfo {
  isTouch: boolean
  isCoarsePointer: boolean
  deviceType: DeviceType
  hitRadius: number
  prefersReducedMotion: boolean
}

function detect(): DeviceInfo {
  // كشف اللمس بطرق متعددة لدعم أفضل على الموبايل والتابلت
  const isTouch =
    (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0) ||
    (typeof window !== 'undefined' && 'ontouchstart' in window) ||
    (typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(pointer: coarse)').matches)

  // كشف المؤشر الخشن (اللمس)  vs المؤشر الدقيق (الماوس)
  const isCoarsePointer =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(pointer: coarse)').matches

  // كشف عدم دعم hover (الشاشات اللمسية)
  const hasNoHover =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(hover: none)').matches

  // تفضيل تقليل الحركة لذوي الاحتياجات الخاصة وتحسين الأداء
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const w = typeof window !== 'undefined' ? window.innerWidth : 1024
  let deviceType: DeviceType = 'desktop'

  // تحديد نوع الجهاز بناءً على عرض الشاشة وقدرات اللمس
  if (w < 640) {
    deviceType = 'phone'
  } else if (w < 1024 || (isTouch && hasNoHover && w < 1280)) {
    deviceType = 'tablet'
  }

  // إذا كان الجهاز يدعم اللمس ولا يدعم hover، فهو تابلت حتى لو كانت الشاشة كبيرة
  if (isTouch && hasNoHover && deviceType === 'desktop') {
    deviceType = 'tablet'
  }

  // نصف قطر اللمس الأكبر للموبايل لتحسين تجربة اللمس
  const hitRadius = deviceType === 'phone' ? 44 : deviceType === 'tablet' ? 32 : 9

  return {
    isTouch,
    isCoarsePointer,
    deviceType,
    hitRadius,
    prefersReducedMotion,
  }
}

export function useDevice() {
  const info = ref<DeviceInfo>(detect())

  function update() {
    info.value = detect()
  }

  onMounted(() => {
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', update)
    window.removeEventListener('orientationchange', update)
  })

  return info
}
