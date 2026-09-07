<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
import ExperimentHelpModal from '../shared/ExperimentHelpModal.vue';
import type { HelpSection } from '../shared/experiment-help-types';
const { t } = useI18n();

defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const sections: HelpSection[] = [
  {
    title: t('experiments.ccHelpS1Title'),
    blocks: [
      { type: 'p', text: t('experiments.ccHelpS1P1') },
      { type: 'p', text: t('experiments.ccHelpS1P2') },
      { type: 'p', text: t('experiments.ccHelpS1P3') },
    ],
  },
  {
    title: t('experiments.ccHelpS2Title'),
    blocks: [
      { type: 'p', text: t('experiments.ccHelpS2P1') },
      { type: 'formula', text: t('experiments.ccHelpS2F1') },
      { type: 'p', text: t('experiments.ccHelpS2P2') },
      { type: 'formula', text: t('experiments.ccHelpS2F2') },
      { type: 'p', text: t('experiments.ccHelpS2P3') },
    ],
  },
  {
    title: t('experiments.ccHelpS3Title'),
    blocks: [
      { type: 'p', text: t('experiments.ccHelpS3P1') },
      {
        type: 'ordered',
        items: [
          t('experiments.ccHelpS3L1'),
          t('experiments.ccHelpS3L2'),
          t('experiments.ccHelpS3L3'),
          t('experiments.ccHelpS3L4'),
          t('experiments.ccHelpS3L5'),
        ],
      },
    ],
  },
  {
    title: t('experiments.ccHelpS4Title'),
    blocks: [
      { type: 'p', text: t('experiments.ccHelpS4P1') },
      {
        type: 'list',
        items: [
          t('experiments.ccHelpS4L1'),
          t('experiments.ccHelpS4L2'),
          t('experiments.ccHelpS4L3'),
          t('experiments.ccHelpS4L4'),
        ],
      },
    ],
  },
  {
    title: t('experiments.ccHelpS5Title'),
    blocks: [
      {
        type: 'cards',
        items: [
          t('experiments.ccHelpS5E1'),
          t('experiments.ccHelpS5E2'),
          t('experiments.ccHelpS5E3'),
        ],
      },
    ],
  },
  {
    title: t('experiments.ccHelpS6Title'),
    blocks: [
      {
        type: 'list',
        items: [
          t('experiments.ccHelpS6L1'),
          t('experiments.ccHelpS6L2'),
          t('experiments.ccHelpS6L3'),
        ],
      },
    ],
  },
];
</script>

<template>
  <ExperimentHelpModal
    :open="open"
    :title="t('experiments.ccHelpTitle')"
    :sections="sections"
    @close="emit('close')"
  />
</template>
