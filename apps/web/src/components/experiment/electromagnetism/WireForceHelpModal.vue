<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
import ExperimentHelpModal from '../shared/ExperimentHelpModal.vue';
import type { HelpSection } from '../shared/experiment-help-types';
const { t } = useI18n();

defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const sections: HelpSection[] = [
  {
    title: t('experiments.wfHelpS1Title'),
    blocks: [
      { type: 'p', text: t('experiments.wfHelpS1P1') },
      { type: 'p', text: t('experiments.wfHelpS1P2') },
      { type: 'p', text: t('experiments.wfHelpS1P3') },
    ],
  },
  {
    title: t('experiments.wfHelpS2Title'),
    blocks: [
      { type: 'p', text: t('experiments.wfHelpS2P1') },
      { type: 'formula', text: t('experiments.wfHelpS2F1') },
      { type: 'p', text: t('experiments.wfHelpS2P2') },
      { type: 'formula', text: t('experiments.wfHelpS2F2') },
      { type: 'p', text: t('experiments.wfHelpS2P3') },
    ],
  },
  {
    title: t('experiments.wfHelpS3Title'),
    blocks: [
      { type: 'p', text: t('experiments.wfHelpS3P1') },
      {
        type: 'ordered',
        items: [
          t('experiments.wfHelpS3L1'),
          t('experiments.wfHelpS3L2'),
          t('experiments.wfHelpS3L3'),
          t('experiments.wfHelpS3L4'),
          t('experiments.wfHelpS3L5'),
        ],
      },
    ],
  },
  {
    title: t('experiments.wfHelpS4Title'),
    blocks: [
      { type: 'p', text: t('experiments.wfHelpS4P1') },
      {
        type: 'list',
        items: [
          t('experiments.wfHelpS4L1'),
          t('experiments.wfHelpS4L2'),
          t('experiments.wfHelpS4L3'),
          t('experiments.wfHelpS4L4'),
        ],
      },
    ],
  },
  {
    title: t('experiments.wfHelpS5Title'),
    blocks: [
      {
        type: 'cards',
        items: [
          t('experiments.wfHelpS5E1'),
          t('experiments.wfHelpS5E2'),
          t('experiments.wfHelpS5E3'),
        ],
      },
    ],
  },
  {
    title: t('experiments.wfHelpS6Title'),
    blocks: [
      {
        type: 'list',
        items: [
          t('experiments.wfHelpS6L1'),
          t('experiments.wfHelpS6L2'),
          t('experiments.wfHelpS6L3'),
        ],
      },
    ],
  },
];
</script>

<template>
  <ExperimentHelpModal
    :open="open"
    :title="t('experiments.wfHelpTitle')"
    :sections="sections"
    @close="emit('close')"
  />
</template>
