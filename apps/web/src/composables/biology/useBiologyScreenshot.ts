import { ref } from 'vue';
import { captureElement } from '../../utils/captureElement';

/**
 * يوفر ref للحاوية ودالة getScreenshot لالتقاط صورة للتقرير.
 * يُستخدم في تجارب الأحياء التي لا توفر لقطة شاشة ثلاثية الأبعاد جاهزة.
 */
export function useBiologyScreenshot() {
  const containerRef = ref<HTMLElement | null>(null);

  async function getScreenshot(): Promise<string | null> {
    if (!containerRef.value) return null;
    return captureElement(containerRef.value);
  }

  return { containerRef, getScreenshot };
}
