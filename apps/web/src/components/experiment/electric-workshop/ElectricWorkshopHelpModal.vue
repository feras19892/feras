<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
import ExperimentHelpModal from '../shared/ExperimentHelpModal.vue';
import type { HelpSection } from '../shared/experiment-help-types';
const { t } = useI18n();

defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const sections: HelpSection[] = [
  {
    title: t('ew.ewHelpS1Title'),
    blocks: [
      { type: 'p', text: t('ew.ewHelpS1P1') },
      { type: 'p', text: t('ew.ewHelpS1P2') },
      {
        type: 'list',
        items: [
          t('ew.ewHelpS1L1'),
          t('ew.ewHelpS1L2'),
          t('ew.ewHelpS1L3'),
          t('ew.ewHelpS1L4'),
        ],
      },
    ],
  },
  {
    title: t('ew.ewHelpS2Title'),
    blocks: [
      { type: 'p', text: t('ew.ewHelpS2P1') },
      { type: 'formula', text: t('ew.ewHelpS2F1') },
      { type: 'formula', text: t('ew.ewHelpS2F2') },
      { type: 'formula', text: t('ew.ewHelpS2F3') },
      { type: 'formula', text: t('ew.ewHelpS2F4') },
      { type: 'p', text: t('ew.ewHelpS2P2') },
      { type: 'formula', text: t('ew.ewHelpS2F5') },
      { type: 'formula', text: t('ew.ewHelpS2F6') },
    ],
  },
  {
    title: t('ew.ewHelpS3Title'),
    blocks: [
      { type: 'p', text: t('ew.ewHelpS3P1') },
      {
        type: 'ordered',
        items: [
          t('ew.ewHelpS3L1'),
          t('ew.ewHelpS3L2'),
          t('ew.ewHelpS3L3'),
          t('ew.ewHelpS3L4'),
          t('ew.ewHelpS3L5'),
          t('ew.ewHelpS3L6'),
          t('ew.ewHelpS3L7'),
        ],
      },
    ],
  },
  {
    title: t('ew.ewHelpS4Title'),
    blocks: [
      { type: 'p', text: t('ew.ewHelpS4P1') },
      {
        type: 'list',
        items: [
          t('ew.ewHelpS4L1'),
          t('ew.ewHelpS4L2'),
          t('ew.ewHelpS4L3'),
          t('ew.ewHelpS4L4'),
          t('ew.ewHelpS4L5'),
        ],
      },
    ],
  },
  {
    title: t('ew.ewHelpS5Title'),
    blocks: [
      {
        type: 'cards',
        items: [
          t('ew.ewHelpS5E1'),
          t('ew.ewHelpS5E2'),
          t('ew.ewHelpS5E3'),
          t('ew.ewHelpS5E4'),
          t('ew.ewHelpS5E5'),
        ],
      },
    ],
  },
  {
    title: t('ew.ewHelpS6Title'),
    blocks: [
      {
        type: 'list',
        items: [
          t('ew.ewHelpS6L1'),
          t('ew.ewHelpS6L2'),
          t('ew.ewHelpS6L3'),
          t('ew.ewHelpS6L4'),
        ],
      },
    ],
  },
];
</script>

<template>
  <ExperimentHelpModal
    :open="open"
    :title="t('ew.ewHelpTitle')"
    :sections="sections"
    @close="emit('close')"
  />
</template>
