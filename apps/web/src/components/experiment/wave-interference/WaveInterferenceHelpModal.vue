<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
import ExperimentHelpModal from '../shared/ExperimentHelpModal.vue';
import type { HelpSection } from '../shared/experiment-help-types';
const { t } = useI18n();

defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const sections: HelpSection[] = [
  {
    title: t('experiments.wiHelpS1Title'),
    blocks: [
      { type: 'p', text: t('experiments.wiHelpS1P1') },
      { type: 'p', text: t('experiments.wiHelpS1P2') },
      { type: 'p', text: t('experiments.wiHelpS1P3') },
    ],
  },
  {
    title: t('experiments.wiHelpS2Title'),
    blocks: [
      { type: 'p', text: t('experiments.wiHelpS2P1') },
      { type: 'formula', text: 'v = f · λ' },
      { type: 'p', text: t('experiments.wiHelpS2P2') },
      { type: 'formula', text: 'Δr = m · λ' },
      { type: 'p', text: t('experiments.wiHelpS2P3') },
      { type: 'formula', text: 'Δr = (m + ½) · λ' },
      { type: 'p', text: t('experiments.wiHelpS2P4') },
      { type: 'formula', text: ['Δy = λ · D / d', 'A = 2 · A₀ · |cos(Δφ / 2)|'] },
    ],
  },
  {
    title: t('experiments.wiHelpS3Title'),
    blocks: [
      {
        type: 'ordered',
        items: [
          t('experiments.wiHelpS3L1'),
          t('experiments.wiHelpS3L2'),
          t('experiments.wiHelpS3L3'),
          t('experiments.wiHelpS3L4'),
          t('experiments.wiHelpS3L5'),
        ],
      },
    ],
  },
  {
    title: t('experiments.wiHelpS4Title'),
    blocks: [
      { type: 'p', text: t('experiments.wiHelpS4P1') },
      {
        type: 'list',
        items: [
          t('experiments.wiHelpS4L1'),
          t('experiments.wiHelpS4L2'),
          t('experiments.wiHelpS4L3'),
        ],
      },
      { type: 'formula', text: 'λ = Δy · d / D' },
    ],
  },
  {
    title: t('experiments.wiHelpS5Title'),
    blocks: [
      {
        type: 'cards',
        items: [
          t('experiments.wiHelpS5E1'),
          t('experiments.wiHelpS5E2'),
          t('experiments.wiHelpS5E3'),
        ],
      },
    ],
  },
  {
    title: t('experiments.wiHelpS6Title'),
    blocks: [
      {
        type: 'list',
        items: [
          t('experiments.wiHelpS6L1'),
          t('experiments.wiHelpS6L2'),
          t('experiments.wiHelpS6L3'),
        ],
      },
    ],
  },
];
</script>

<template>
  <ExperimentHelpModal
    :open="open"
    :title="t('experiments.wiHelpTitle')"
    :sections="sections"
    @close="emit('close')"
  />
</template>
