<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
import ExperimentHelpModal from '../shared/ExperimentHelpModal.vue';
import type { HelpSection } from '../shared/experiment-help-types';
const { t } = useI18n();

defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const sections: HelpSection[] = [
  {
    title: t('experiments.genHelpS1Title'),
    blocks: [
      { type: 'p', text: t('experiments.genHelpS1P1') },
      { type: 'p', text: t('experiments.genHelpS1P2') },
      { type: 'p', text: t('experiments.genHelpS1P3') },
    ],
  },
  {
    title: t('experiments.genHelpS2Title'),
    blocks: [
      { type: 'p', text: t('experiments.genHelpS2P1') },
      { type: 'formula', text: t('experiments.genHelpS2F1') },
      { type: 'p', text: t('experiments.genHelpS2P2') },
      { type: 'formula', text: t('experiments.genHelpS2F2') },
      { type: 'p', text: t('experiments.genHelpS2P3') },
      { type: 'formula', text: t('experiments.genHelpS2F3') },
      { type: 'p', text: t('experiments.genHelpS2P4') },
      { type: 'formula', text: t('experiments.genHelpS2F4') },
    ],
  },
  {
    title: t('experiments.genHelpS3Title'),
    blocks: [
      { type: 'p', text: t('experiments.genHelpS3P1') },
      {
        type: 'ordered',
        items: [
          t('experiments.genHelpS3L1'),
          t('experiments.genHelpS3L2'),
          t('experiments.genHelpS3L3'),
          t('experiments.genHelpS3L4'),
          t('experiments.genHelpS3L5'),
        ],
      },
    ],
  },
  {
    title: t('experiments.genHelpS4Title'),
    blocks: [
      { type: 'p', text: t('experiments.genHelpS4P1') },
      {
        type: 'list',
        items: [
          t('experiments.genHelpS4L1'),
          t('experiments.genHelpS4L2'),
          t('experiments.genHelpS4L3'),
          t('experiments.genHelpS4L4'),
        ],
      },
    ],
  },
  {
    title: t('experiments.genHelpS5Title'),
    blocks: [
      {
        type: 'cards',
        items: [
          t('experiments.genHelpS5E1'),
          t('experiments.genHelpS5E2'),
          t('experiments.genHelpS5E3'),
        ],
      },
    ],
  },
  {
    title: t('experiments.genHelpS6Title'),
    blocks: [
      {
        type: 'list',
        items: [
          t('experiments.genHelpS6L1'),
          t('experiments.genHelpS6L2'),
          t('experiments.genHelpS6L3'),
        ],
      },
    ],
  },
];
</script>

<template>
  <ExperimentHelpModal
    :open="open"
    :title="t('experiments.genHelpTitle')"
    :sections="sections"
    @close="emit('close')"
  />
</template>
