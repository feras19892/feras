<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n';

const props = defineProps<{
  xRayMode: boolean;
  insideView: boolean;
  crossSectionMode: boolean;
  heartbeatEnabled: boolean;
  bloodFlowEnabled: boolean;
  autoRotate: boolean;
  isExploded: boolean;
}>();

const emit = defineEmits<{
  toggleXRay: [];
  toggleInsideView: [];
  toggleCrossSection: [];
  toggleHeartbeat: [];
  toggleBloodFlow: [];
  toggleAutoRotate: [];
  resetCamera: [];
  resetAll: [];
}>();

const { t } = useI18n();
</script>

<template>
  <div class="floating-toolbar">
    <button class="tool-btn" :class="{ active: props.xRayMode }" :title="t('biology.xRayMode')" @click.stop="emit('toggleXRay')">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    </button>
    <button class="tool-btn" :class="{ active: props.insideView }" :title="t('biology.insideView')" @click.stop="emit('toggleInsideView')">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    </button>
    <button class="tool-btn" :class="{ active: props.crossSectionMode }" :title="t('biology.crossSection')" @click.stop="emit('toggleCrossSection')">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 12h18M3 6h18M3 18h18" />
      </svg>
    </button>
    <button class="tool-btn" :class="{ active: props.heartbeatEnabled }" :title="t('biology.enableHeartbeat')" @click.stop="emit('toggleHeartbeat')">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
    <button class="tool-btn" :class="{ active: props.bloodFlowEnabled, disabled: props.isExploded }" :disabled="props.isExploded" :title="t('biology.showBloodFlow')" @click.stop="emit('toggleBloodFlow')">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
      </svg>
    </button>
    <button class="tool-btn" :class="{ active: props.autoRotate }" :title="t('biology.autoRotate')" @click.stop="emit('toggleAutoRotate')">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
      </svg>
    </button>
    <div class="tool-divider" />
    <button class="tool-btn" :title="t('biology.resetCameraLabel')" @click.stop="emit('resetCamera')">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M23 4v6h-6M1 20v-6h6" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
      </svg>
    </button>
    <button class="tool-btn danger" :title="t('biology.resetAllLabel')" @click.stop="emit('resetAll')">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </svg>
    </button>
  </div>
</template>
