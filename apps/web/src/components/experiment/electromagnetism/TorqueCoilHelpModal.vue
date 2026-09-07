<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
import ExperimentHelpModal from '../shared/ExperimentHelpModal.vue';
import type { HelpSection } from '../shared/experiment-help-types';
const { t } = useI18n();

defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const sections: HelpSection[] = [
  {
    title: t('experiments.tcHelpS1Title'),
    blocks: [
      { type: 'p', text: t('experiments.tcHelpS1P1') },
      { type: 'p', text: t('experiments.tcHelpS1P2') },
      { type: 'p', text: t('experiments.tcHelpS1P3') },
    ],
  },
  {
    title: t('experiments.tcHelpS2Title'),
    blocks: [
      { type: 'p', text: t('experiments.tcHelpS2P1') },
      { type: 'formula', text: t('experiments.tcHelpS2F1') },
      { type: 'p', text: t('experiments.tcHelpS2P2') },
      { type: 'formula', text: t('experiments.tcHelpS2F2') },
      { type: 'p', text: t('experiments.tcHelpS2P3') },
      { type: 'formula', text: t('experiments.tcHelpS2F3') },
    ],
  },
  {
    title: t('experiments.tcHelpS3Title'),
    blocks: [
      { type: 'p', text: t('experiments.tcHelpS3P1') },
      {
        type: 'ordered',
        items: [
          t('experiments.tcHelpS3L1'),
          t('experiments.tcHelpS3L2'),
          t('experiments.tcHelpS3L3'),
          t('experiments.tcHelpS3L4'),
          t('experiments.tcHelpS3L5'),
        ],
      },
    ],
  },
  {
    title: t('experiments.tcHelpS4Title'),
    blocks: [
      { type: 'p', text: t('experiments.tcHelpS4P1') },
      {
        type: 'list',
        items: [
          t('experiments.tcHelpS4L1'),
          t('experiments.tcHelpS4L2'),
          t('experiments.tcHelpS4L3'),
          t('experiments.tcHelpS4L4'),
        ],
      },
    ],
  },
  {
    title: t('experiments.tcHelpS5Title'),
    blocks: [
      {
        type: 'cards',
        items: [
          t('experiments.tcHelpS5E1'),
          t('experiments.tcHelpS5E2'),
          t('experiments.tcHelpS5E3'),
        ],
      },
    ],
  },
  {
    title: t('experiments.tcHelpS6Title'),
    blocks: [
      {
        type: 'list',
        items: [
          t('experiments.tcHelpS6L1'),
          t('experiments.tcHelpS6L2'),
          t('experiments.tcHelpS6L3'),
        ],
      },
    ],
  },
];
</script>

<template>
  <ExperimentHelpModal
    :open="open"
    :title="t('experiments.tcHelpTitle')"
    :sections="sections"
    @close="emit('close')"
  />
</template>
