<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
import ExperimentHelpModal from '../shared/ExperimentHelpModal.vue';
import type { HelpSection } from '../shared/experiment-help-types';
const { t } = useI18n();

defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const sections: HelpSection[] = [
  {
    title: t('experiments.acHelpS1Title'),
    blocks: [
      { type: 'p', text: t('experiments.acHelpS1P1') },
      { type: 'p', text: t('experiments.acHelpS1P2') },
    ],
  },
  {
    title: t('experiments.acHelpS2Title'),
    blocks: [
      { type: 'p', text: t('experiments.acHelpS2P1') },
      {
        type: 'list',
        items: [
          t('experiments.acHelpS2L1'),
          t('experiments.acHelpS2L2'),
        ],
      },
    ],
  },
  {
    title: t('experiments.acHelpS3Title'),
    blocks: [
      { type: 'p', text: t('experiments.acHelpS3P1') },
      {
        type: 'list',
        items: [
          t('experiments.acHelpS3L1'),
          t('experiments.acHelpS3L2'),
          t('experiments.acHelpS3L3'),
        ],
      },
    ],
  },
  {
    title: t('experiments.acHelpS4Title'),
    blocks: [
      { type: 'p', text: t('experiments.acHelpS4P1') },
      {
        type: 'list',
        items: [
          t('experiments.acHelpS4L1'),
          t('experiments.acHelpS4L2'),
          t('experiments.acHelpS4L3'),
        ],
      },
    ],
  },
  {
    title: t('experiments.acHelpS5Title'),
    blocks: [
      {
        type: 'list',
        items: [
          t('experiments.acHelpS5L1'),
          t('experiments.acHelpS5L2'),
          t('experiments.acHelpS5L3'),
        ],
      },
    ],
  },
  {
    title: t('experiments.acHelpS6Title'),
    blocks: [
      {
        type: 'list',
        items: [
          t('experiments.acHelpS6L1'),
          t('experiments.acHelpS6L2'),
          t('experiments.acHelpS6L3'),
        ],
      },
    ],
  },
];
</script>

<template>
  <ExperimentHelpModal
    :open="open"
    :title="t('experiments.acHelpTitle')"
    :sections="sections"
    @close="emit('close')"
  />
</template>
