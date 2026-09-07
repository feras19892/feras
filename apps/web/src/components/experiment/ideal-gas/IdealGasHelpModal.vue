<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
import ExperimentHelpModal from '../shared/ExperimentHelpModal.vue';
import type { HelpSection } from '../shared/experiment-help-types';
const { t } = useI18n();

defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const sections: HelpSection[] = [
  {
    title: t('experiments.igHelpS1Title'),
    blocks: [
      { type: 'p', text: t('experiments.igHelpS1P1') },
      { type: 'p', text: t('experiments.igHelpS1P2') },
      { type: 'p', text: t('experiments.igHelpS1P3') },
    ],
  },
  {
    title: t('experiments.igHelpS2Title'),
    blocks: [
      { type: 'p', text: t('experiments.igHelpS2P1') },
      { type: 'formula', text: t('experiments.igHelpS2F1') },
      { type: 'p', text: t('experiments.igHelpS2P2') },
      { type: 'formula', text: t('experiments.igHelpS2F2') },
      { type: 'p', text: t('experiments.igHelpS2P3') },
      { type: 'formula', text: t('experiments.igHelpS2F3') },
      { type: 'p', text: t('experiments.igHelpS2P4') },
    ],
  },
  {
    title: t('experiments.igHelpS3Title'),
    blocks: [
      { type: 'p', text: t('experiments.igHelpS3P1') },
      {
        type: 'ordered',
        items: [
          t('experiments.igHelpS3L1'),
          t('experiments.igHelpS3L2'),
          t('experiments.igHelpS3L3'),
          t('experiments.igHelpS3L4'),
          t('experiments.igHelpS3L5'),
        ],
      },
    ],
  },
  {
    title: t('experiments.igHelpS4Title'),
    blocks: [
      { type: 'p', text: t('experiments.igHelpS4P1') },
      {
        type: 'list',
        items: [
          t('experiments.igHelpS4L1'),
          t('experiments.igHelpS4L2'),
          t('experiments.igHelpS4L3'),
          t('experiments.igHelpS4L4'),
        ],
      },
    ],
  },
  {
    title: t('experiments.igHelpS5Title'),
    blocks: [
      {
        type: 'cards',
        items: [
          t('experiments.igHelpS5E1'),
          t('experiments.igHelpS5E2'),
          t('experiments.igHelpS5E3'),
        ],
      },
    ],
  },
  {
    title: t('experiments.igHelpS6Title'),
    blocks: [
      {
        type: 'list',
        items: [
          t('experiments.igHelpS6L1'),
          t('experiments.igHelpS6L2'),
          t('experiments.igHelpS6L3'),
        ],
      },
    ],
  },
];
</script>

<template>
  <ExperimentHelpModal
    :open="open"
    :title="t('experiments.igHelpTitle')"
    :sections="sections"
    @close="emit('close')"
  />
</template>
