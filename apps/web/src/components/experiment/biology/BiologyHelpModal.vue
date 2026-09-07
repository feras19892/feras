<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from '@/composables/useI18n';
import ExperimentHelpModal from '../shared/ExperimentHelpModal.vue';
import { buildBiologyHelpSections } from './biology-help-data';
import type { BiologyHelpContext } from './biology-help-data';
const { t, locale } = useI18n();

const props = defineProps<{ open: boolean; context?: BiologyHelpContext }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const sections = computed(() => buildBiologyHelpSections(props.context, t, locale.value));
const title = computed(() =>
  props.context?.titleKey ? t(props.context.titleKey) : t('biology.bioHelpTitle'),
);
</script>

<template>
  <ExperimentHelpModal
    :open="open"
    :title="title"
    :sections="sections"
    @close="emit('close')"
  />
</template>
