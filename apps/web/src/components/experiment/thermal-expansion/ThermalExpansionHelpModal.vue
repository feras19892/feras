<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
import ExperimentHelpModal from '../shared/ExperimentHelpModal.vue';
import type { HelpSection } from '../shared/experiment-help-types';
const { t } = useI18n();

defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const sections: HelpSection[] = [
  {
    title: t('experiments.teHelpS1Title'),
    blocks: [
      { type: 'p', text: t('experiments.teHelpS1P1') },
      { type: 'p', text: t('experiments.teHelpS1P2') },
      { type: 'p', text: t('experiments.teHelpS1P3') },
    ],
  },
  {
    title: t('experiments.teHelpS2Title'),
    blocks: [
      { type: 'p', text: t('experiments.teHelpS2P1') },
      { type: 'formula', text: t('experiments.teHelpS2F1') },
      { type: 'p', text: t('experiments.teHelpS2P2') },
      { type: 'formula', text: t('experiments.teHelpS2F2') },
      { type: 'p', text: t('experiments.teHelpS2P3') },
      { type: 'formula', text: t('experiments.teHelpS2F3') },
      { type: 'p', text: t('experiments.teHelpS2P4') },
    ],
  },
  {
    title: t('experiments.teHelpS3Title'),
    blocks: [
      { type: 'p', text: t('experiments.teHelpS3P1') },
      {
        type: 'ordered',
        items: [
          t('experiments.teHelpS3L1'),
          t('experiments.teHelpS3L2'),
          t('experiments.teHelpS3L3'),
          t('experiments.teHelpS3L4'),
          t('experiments.teHelpS3L5'),
        ],
      },
    ],
  },
  {
    title: t('experiments.teHelpS4Title'),
    blocks: [
      { type: 'p', text: t('experiments.teHelpS4P1') },
      {
        type: 'list',
        items: [
          t('experiments.teHelpS4L1'),
          t('experiments.teHelpS4L2'),
          t('experiments.teHelpS4L3'),
          t('experiments.teHelpS4L4'),
        ],
      },
    ],
  },
  {
    title: t('experiments.teHelpS5Title'),
    blocks: [
      {
        type: 'cards',
        items: [
          t('experiments.teHelpS5E1'),
          t('experiments.teHelpS5E2'),
          t('experiments.teHelpS5E3'),
        ],
      },
    ],
  },
  {
    title: t('experiments.teHelpS6Title'),
    blocks: [
      {
        type: 'list',
        items: [
          t('experiments.teHelpS6L1'),
          t('experiments.teHelpS6L2'),
          t('experiments.teHelpS6L3'),
        ],
      },
    ],
  },
];
</script>

<template>
  <ExperimentHelpModal
    :open="open"
    :title="t('experiments.teHelpTitle')"
    :sections="sections"
    @close="emit('close')"
  />
</template>
