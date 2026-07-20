import { ref, onMounted, onUnmounted } from 'vue'

export type DeviceType = 'phone' | 'tablet' | 'desktop'

export interface DeviceInfo {
  isTouch: boolean
  deviceType: DeviceType
  hitRadius: number
}

function detect(): DeviceInfo {
  const isTouch =
    (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0) ||
    (typeof window !== 'undefined' && 'ontouchstart' in window)

  const w = typeof window !== 'undefined' ? window.innerWidth : 1024
  let deviceType: DeviceType = 'desktop'
  if (w < 768) deviceType = 'phone'
  else if (w < 1024) deviceType = 'tablet'

  if (isTouch && w >= 1024) deviceType = 'tablet'

  const hitRadius = deviceType === 'phone' ? 28 : deviceType === 'tablet' ? 20 : 9

  return { isTouch, deviceType, hitRadius }
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
