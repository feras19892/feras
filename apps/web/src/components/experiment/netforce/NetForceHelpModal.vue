<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
import ExperimentHelpModal from '../shared/ExperimentHelpModal.vue';
import type { HelpSection } from '../shared/experiment-help-types';
const { t } = useI18n();

defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const sections: HelpSection[] = [
  {
    title: t('experiments.nfHelpS1Title'),
    blocks: [
      { type: 'p', text: t('experiments.nfHelpS1P1') },
      { type: 'p', text: t('experiments.nfHelpS1P2') },
      { type: 'p', text: t('experiments.nfHelpS1P3') },
    ],
  },
  {
    title: t('experiments.nfHelpS2Title'),
    blocks: [
      { type: 'p', text: t('experiments.nfHelpS2P1') },
      { type: 'formula', text: 'F_net = √(ΣFx² + ΣFy²)' },
      { type: 'p', text: t('experiments.nfHelpS2P2') },
      { type: 'formula', text: 'F_net = m · a' },
      { type: 'p', text: t('experiments.nfHelpS2P3') },
      { type: 'formula', text: 'f_s ≤ μ_s · N' },
      { type: 'p', text: t('experiments.nfHelpS2P4') },
      { type: 'formula', text: 'Fc = m · ω² · r = m · v² / r' },
    ],
  },
  {
    title: t('experiments.nfHelpS3Title'),
    blocks: [
      {
        type: 'ordered',
        items: [
          t('experiments.nfHelpS3L1'),
          t('experiments.nfHelpS3L2'),
          t('experiments.nfHelpS3L3'),
          t('experiments.nfHelpS3L4'),
          t('experiments.nfHelpS3L5'),
        ],
      },
    ],
  },
  {
    title: t('experiments.nfHelpS4Title'),
    blocks: [
      {
        type: 'list',
        items: [
          t('experiments.nfHelpS4L1'),
          t('experiments.nfHelpS4L2'),
          t('experiments.nfHelpS4L3'),
          t('experiments.nfHelpS4L4'),
        ],
      },
    ],
  },
  {
    title: t('experiments.nfHelpS5Title'),
    blocks: [
      {
        type: 'cards',
        items: [
          t('experiments.nfHelpS5E1'),
          t('experiments.nfHelpS5E2'),
          t('experiments.nfHelpS5E3'),
        ],
      },
    ],
  },
  {
    title: t('experiments.nfHelpS6Title'),
    blocks: [
      {
        type: 'list',
        items: [
          t('experiments.nfHelpS6L1'),
          t('experiments.nfHelpS6L2'),
          t('experiments.nfHelpS6L3'),
        ],
      },
    ],
  },
];
</script>

<template>
  <ExperimentHelpModal
    :open="open"
    :title="t('experiments.nfHelpTitle')"
    :sections="sections"
    @close="emit('close')"
  />
</template>
