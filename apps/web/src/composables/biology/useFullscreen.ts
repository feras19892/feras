import { ref, onMounted, onUnmounted } from 'vue';

/**
 * ملء الشاشة لمكون التجربة — يستهدف جذر صفحة التجربة (.experiment-page).
 * يستبدل النسخ المكررة في كل مكونات الأحياء.
 * يزامن الحالة عند الخروج بمفتاح ESC عبر مستمع fullscreenchange.
 */
export function useFullscreen(rootSelector = '.experiment-page') {
  const isFullscreen = ref(false);

  async function toggleFullscreen(): Promise<void> {
    const el = document.querySelector(rootSelector) as HTMLElement | null;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
        isFullscreen.value = true;
      } else {
        await document.exitFullscreen();
        isFullscreen.value = false;
      }
    } catch {
      isFullscreen.value = !!document.fullscreenElement;
    }
  }

  function onFsChange(): void {
    isFullscreen.value = !!document.fullscreenElement;
  }

  onMounted(() => document.addEventListener('fullscreenchange', onFsChange));
  onUnmounted(() => document.removeEventListener('fullscreenchange', onFsChange));

  return { isFullscreen, toggleFullscreen };
}
