import { ref, onMounted, onUnmounted } from 'vue';

/**
 * ملء الشاشة لتجارب الأحياء — يغلف منطق requestFullscreen/exitFullscreen
 * ويزامن الحالة عند الخروج بمفتاح ESC.
 * يعمل على العنصر `.experiment-page` (نفس نمط كل تجارب القسم).
 */
export function useFullscreen() {
  const isFullscreen = ref(false);

  async function toggleFullscreen(): Promise<void> {
    const el = document.querySelector('.experiment-page') as HTMLElement | null;
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
