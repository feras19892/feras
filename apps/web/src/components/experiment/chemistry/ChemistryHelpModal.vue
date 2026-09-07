<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
import ExperimentHelpModal from '../shared/ExperimentHelpModal.vue';
import type { HelpSection } from '../shared/experiment-help-types';
const { t } = useI18n();

defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const sections: HelpSection[] = [
  {
    title: t('chemistry.chemHelpS1Title'),
    blocks: [
      { type: 'p', text: t('chemistry.chemHelpS1P1') },
      { type: 'p', text: t('chemistry.chemHelpS1P2') },
      {
        type: 'list',
        items: [
          t('chemistry.chemHelpS1L1'),
          t('chemistry.chemHelpS1L2'),
          t('chemistry.chemHelpS1L3'),
        ],
      },
    ],
  },
  {
    title: t('chemistry.chemHelpS2Title'),
    blocks: [
      { type: 'p', text: t('chemistry.chemHelpS2P1') },
      {
        type: 'cards',
        items: [
          t('chemistry.chemHelpS2E1'),
          t('chemistry.chemHelpS2E2'),
          t('chemistry.chemHelpS2E3'),
          t('chemistry.chemHelpS2E4'),
          t('chemistry.chemHelpS2E5'),
          t('chemistry.chemHelpS2E6'),
        ],
      },
    ],
  },
  {
    title: t('chemistry.chemHelpS3Title'),
    blocks: [
      { type: 'p', text: t('chemistry.chemHelpS3P1') },
      {
        type: 'ordered',
        items: [
          t('chemistry.chemHelpS3L1'),
          t('chemistry.chemHelpS3L2'),
          t('chemistry.chemHelpS3L3'),
          t('chemistry.chemHelpS3L4'),
        ],
      },
    ],
  },
  {
    title: t('chemistry.chemHelpS4Title'),
    blocks: [
      { type: 'p', text: t('chemistry.chemHelpS4P1') },
      {
        type: 'list',
        items: [
          t('chemistry.chemHelpS4L1'),
          t('chemistry.chemHelpS4L2'),
          t('chemistry.chemHelpS4L3'),
        ],
      },
    ],
  },
  {
    title: t('chemistry.chemHelpS5Title'),
    blocks: [
      { type: 'p', text: t('chemistry.chemHelpS5P1') },
      {
        type: 'list',
        items: [
          t('chemistry.chemHelpS5L1'),
          t('chemistry.chemHelpS5L2'),
          t('chemistry.chemHelpS5L3'),
          t('chemistry.chemHelpS5L4'),
        ],
      },
    ],
  },
];
</script>

<template>
  <ExperimentHelpModal
    :open="open"
    :title="t('chemistry.chemHelpTitle')"
    :sections="sections"
    @close="emit('close')"
  />
</template>
