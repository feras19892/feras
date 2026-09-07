<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
import ExperimentHelpModal from '../shared/ExperimentHelpModal.vue';
import type { HelpSection } from '../shared/experiment-help-types';
const { t } = useI18n();

defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const sections: HelpSection[] = [
  {
    title: t('experiments.bsHelpS1Title'),
    blocks: [
      { type: 'p', text: t('experiments.bsHelpS1P1') },
      { type: 'p', text: t('experiments.bsHelpS1P2') },
      { type: 'p', text: t('experiments.bsHelpS1P3') },
    ],
  },
  {
    title: t('experiments.bsHelpS2Title'),
    blocks: [
      { type: 'p', text: t('experiments.bsHelpS2P1') },
      { type: 'formula', text: t('experiments.bsHelpS2F1') },
      { type: 'p', text: t('experiments.bsHelpS2P2') },
      { type: 'formula', text: t('experiments.bsHelpS2F2') },
      { type: 'p', text: t('experiments.bsHelpS2P3') },
      { type: 'formula', text: t('experiments.bsHelpS2F3') },
      { type: 'p', text: t('experiments.bsHelpS2P4') },
    ],
  },
  {
    title: t('experiments.bsHelpS3Title'),
    blocks: [
      { type: 'p', text: t('experiments.bsHelpS3P1') },
      {
        type: 'ordered',
        items: [
          t('experiments.bsHelpS3L1'),
          t('experiments.bsHelpS3L2'),
          t('experiments.bsHelpS3L3'),
          t('experiments.bsHelpS3L4'),
          t('experiments.bsHelpS3L5'),
        ],
      },
    ],
  },
  {
    title: t('experiments.bsHelpS4Title'),
    blocks: [
      { type: 'p', text: t('experiments.bsHelpS4P1') },
      {
        type: 'list',
        items: [
          t('experiments.bsHelpS4L1'),
          t('experiments.bsHelpS4L2'),
          t('experiments.bsHelpS4L3'),
          t('experiments.bsHelpS4L4'),
        ],
      },
    ],
  },
  {
    title: t('experiments.bsHelpS5Title'),
    blocks: [
      {
        type: 'cards',
        items: [
          t('experiments.bsHelpS5E1'),
          t('experiments.bsHelpS5E2'),
          t('experiments.bsHelpS5E3'),
        ],
      },
    ],
  },
  {
    title: t('experiments.bsHelpS6Title'),
    blocks: [
      {
        type: 'list',
        items: [
          t('experiments.bsHelpS6L1'),
          t('experiments.bsHelpS6L2'),
          t('experiments.bsHelpS6L3'),
        ],
      },
    ],
  },
];
</script>

<template>
  <ExperimentHelpModal
    :open="open"
    :title="t('experiments.bsHelpTitle')"
    :sections="sections"
    @close="emit('close')"
  />
</template>
