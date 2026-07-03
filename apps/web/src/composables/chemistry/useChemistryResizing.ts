import { ref, onMounted, onUnmounted } from 'vue';

export function useChemistryResizing() {
  const leftWidth = ref(280);
  const rightWidth = ref(280);
  const resizingLeft = ref(false);
  const resizingRight = ref(false);
  let startX = 0;
  let startWidth = 0;

  function onLeftDown(e: MouseEvent) {
    resizingLeft.value = true;
    startX = e.clientX;
    startWidth = leftWidth.value;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }

  function onRightDown(e: MouseEvent) {
    resizingRight.value = true;
    startX = e.clientX;
    startWidth = rightWidth.value;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }

  function onMove(e: MouseEvent) {
    if (resizingLeft.value) {
      const delta = startX - e.clientX;
      leftWidth.value = Math.max(160, Math.min(480, startWidth + delta));
    }
    if (resizingRight.value) {
      const delta = e.clientX - startX;
      rightWidth.value = Math.max(160, Math.min(480, startWidth + delta));
    }
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
  });

  onUnmounted(() => {
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onUp);
  });

  return { leftWidth, rightWidth, onLeftDown, onRightDown };
}
