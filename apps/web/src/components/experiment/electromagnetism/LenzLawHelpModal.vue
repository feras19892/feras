<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
import ExperimentHelpModal from '../shared/ExperimentHelpModal.vue';
import type { HelpSection } from '../shared/experiment-help-types';
const { t } = useI18n();

defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const sections: HelpSection[] = [
  {
    title: t('experiments.lzHelpS1Title'),
    blocks: [
      { type: 'p', text: t('experiments.lzHelpS1P1') },
      { type: 'p', text: t('experiments.lzHelpS1P2') },
      { type: 'p', text: t('experiments.lzHelpS1P3') },
    ],
  },
  {
    title: t('experiments.lzHelpS2Title'),
    blocks: [
      { type: 'p', text: t('experiments.lzHelpS2P1') },
      { type: 'formula', text: t('experiments.lzHelpS2F1') },
      { type: 'p', text: t('experiments.lzHelpS2P2') },
      { type: 'formula', text: t('experiments.lzHelpS2F2') },
      { type: 'p', text: t('experiments.lzHelpS2P3') },
    ],
  },
  {
    title: t('experiments.lzHelpS3Title'),
    blocks: [
      { type: 'p', text: t('experiments.lzHelpS3P1') },
      {
        type: 'ordered',
        items: [
          t('experiments.lzHelpS3L1'),
          t('experiments.lzHelpS3L2'),
          t('experiments.lzHelpS3L3'),
          t('experiments.lzHelpS3L4'),
          t('experiments.lzHelpS3L5'),
        ],
      },
    ],
  },
  {
    title: t('experiments.lzHelpS4Title'),
    blocks: [
      { type: 'p', text: t('experiments.lzHelpS4P1') },
      {
        type: 'list',
        items: [
          t('experiments.lzHelpS4L1'),
          t('experiments.lzHelpS4L2'),
          t('experiments.lzHelpS4L3'),
          t('experiments.lzHelpS4L4'),
        ],
      },
    ],
  },
  {
    title: t('experiments.lzHelpS5Title'),
    blocks: [
      {
        type: 'cards',
        items: [
          t('experiments.lzHelpS5E1'),
          t('experiments.lzHelpS5E2'),
          t('experiments.lzHelpS5E3'),
        ],
      },
    ],
  },
  {
    title: t('experiments.lzHelpS6Title'),
    blocks: [
      {
        type: 'list',
        items: [
          t('experiments.lzHelpS6L1'),
          t('experiments.lzHelpS6L2'),
          t('experiments.lzHelpS6L3'),
        ],
      },
    ],
  },
];
</script>

<template>
  <ExperimentHelpModal
    :open="open"
    :title="t('experiments.lzHelpTitle')"
    :sections="sections"
    @close="emit('close')"
  />
</template>
