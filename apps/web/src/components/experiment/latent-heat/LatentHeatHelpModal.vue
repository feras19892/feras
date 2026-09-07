<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
import ExperimentHelpModal from '../shared/ExperimentHelpModal.vue';
import type { HelpSection } from '../shared/experiment-help-types';
const { t } = useI18n();

defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const sections: HelpSection[] = [
  {
    title: t('experiments.lhHelpS1Title'),
    blocks: [
      { type: 'p', text: t('experiments.lhHelpS1P1') },
      { type: 'p', text: t('experiments.lhHelpS1P2') },
      { type: 'p', text: t('experiments.lhHelpS1P3') },
    ],
  },
  {
    title: t('experiments.lhHelpS2Title'),
    blocks: [
      { type: 'p', text: t('experiments.lhHelpS2P1') },
      { type: 'formula', text: t('experiments.lhHelpS2F1') },
      { type: 'p', text: t('experiments.lhHelpS2P2') },
      { type: 'formula', text: t('experiments.lhHelpS2F2') },
      { type: 'p', text: t('experiments.lhHelpS2P3') },
      { type: 'formula', text: t('experiments.lhHelpS2F3') },
      { type: 'p', text: t('experiments.lhHelpS2P4') },
    ],
  },
  {
    title: t('experiments.lhHelpS3Title'),
    blocks: [
      { type: 'p', text: t('experiments.lhHelpS3P1') },
      {
        type: 'ordered',
        items: [
          t('experiments.lhHelpS3L1'),
          t('experiments.lhHelpS3L2'),
          t('experiments.lhHelpS3L3'),
          t('experiments.lhHelpS3L4'),
          t('experiments.lhHelpS3L5'),
        ],
      },
    ],
  },
  {
    title: t('experiments.lhHelpS4Title'),
    blocks: [
      { type: 'p', text: t('experiments.lhHelpS4P1') },
      {
        type: 'list',
        items: [
          t('experiments.lhHelpS4L1'),
          t('experiments.lhHelpS4L2'),
          t('experiments.lhHelpS4L3'),
          t('experiments.lhHelpS4L4'),
        ],
      },
    ],
  },
  {
    title: t('experiments.lhHelpS5Title'),
    blocks: [
      {
        type: 'cards',
        items: [
          t('experiments.lhHelpS5E1'),
          t('experiments.lhHelpS5E2'),
          t('experiments.lhHelpS5E3'),
        ],
      },
    ],
  },
  {
    title: t('experiments.lhHelpS6Title'),
    blocks: [
      {
        type: 'list',
        items: [
          t('experiments.lhHelpS6L1'),
          t('experiments.lhHelpS6L2'),
          t('experiments.lhHelpS6L3'),
        ],
      },
    ],
  },
];
</script>

<template>
  <ExperimentHelpModal
    :open="open"
    :title="t('experiments.lhHelpTitle')"
    :sections="sections"
    @close="emit('close')"
  />
</template>
