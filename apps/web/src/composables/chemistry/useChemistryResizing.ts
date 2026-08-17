import { ref, onMounted, onUnmounted } from 'vue';

export function useChemistryResizing() {
  const leftWidth = ref(280);
  const rightWidth = ref(280);
  const resizingLeft = ref(false);
  const resizingRight = ref(false);
  let startX = 0;
  let startWidth = 0;

  function onLeftDown(e: MouseEvent | TouchEvent) {
    resizingLeft.value = true;
    startX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    startWidth = leftWidth.value;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }

  function onRightDown(e: MouseEvent | TouchEvent) {
    resizingRight.value = true;
    startX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    startWidth = rightWidth.value;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }

  function onMove(e: MouseEvent | TouchEvent) {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    if (resizingLeft.value) {
      const delta = startX - clientX;
      leftWidth.value = Math.max(160, Math.min(480, startWidth + delta));
    }
    if (resizingRight.value) {
      const delta = clientX - startX;
      rightWidth.value = Math.max(160, Math.min(480, startWidth + delta));
    }
    if ('touches' in e) e.preventDefault();
  }

  function onUp() {
    resizingLeft.value = false;
    resizingRight.value = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }

  onMounted(() => {
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
  });

  onUnmounted(() => {
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onUp);
    window.removeEventListener('touchmove', onMove);
    window.removeEventListener('touchend', onUp);
  });

  return { leftWidth, rightWidth, onLeftDown, onRightDown };
}
