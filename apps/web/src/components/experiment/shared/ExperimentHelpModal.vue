<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
import type { HelpSection } from './experiment-help-types';
const { direction } = useI18n();

defineProps<{
  open: boolean;
  title: string;
  sections: HelpSection[];
}>();

const emit = defineEmits<{ (e: 'close'): void }>();
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="overlay" @click.self="emit('close')">
      <div class="modal" :dir="direction">
        <div class="modal-header">
          <h3>{{ title }}</h3>
          <button class="close-btn" @click="emit('close')">&#x2715;</button>
        </div>
        <div class="modal-body">
          <section v-for="(section, sIdx) in sections" :key="section.title + sIdx" class="help-section">
            <h4>{{ section.title }}</h4>

            <template v-for="(block, bIdx) in section.blocks" :key="`${block.type}-${bIdx}`">
              <p v-if="block.type === 'p'" class="help-p">{{ block.text }}</p>

              <ul v-else-if="block.type === 'list'" class="help-list">
                <li v-for="(item, i) in block.items" :key="i">{{ item }}</li>
              </ul>

              <ol v-else-if="block.type === 'ordered'" class="help-ordered">
                <li v-for="(item, i) in block.items" :key="i">{{ item }}</li>
              </ol>

              <div v-else-if="block.type === 'formula'" class="formula">
                <template v-if="Array.isArray(block.text)">
                  <div v-for="(line, i) in block.text" :key="i" class="formula-line">{{ line }}</div>
                </template>
                <template v-else>{{ block.text }}</template>
              </div>

              <div v-else-if="block.type === 'cards'" class="element-grid">
                <div v-for="(item, i) in block.items" :key="i" class="element">{{ item }}</div>
              </div>
            </template>
          </section>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay { position: fixed; inset: 0; z-index: 300; background: rgba(0,0,0,.6); display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
.modal { background: #131a25; border: 1px solid #2D3645; border-radius: 12px; max-width: 720px; width: 100%; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 20px 60px rgba(0,0,0,.5); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.2rem; border-bottom: 1px solid #2D3645; flex-shrink: 0; }
.modal-header h3 { margin: 0; font-size: 1rem; color: #e2e8f0; }
.close-btn { background: transparent; border: 1px solid #2D3645; color: #8B95A5; border-radius: 6px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 1rem; padding: 0; }
.close-btn:hover { background: rgba(91,141,184,.1); color: #5B8DB8; }
.modal-body { overflow-y: auto; padding: 1.2rem; font-size: .82rem; color: #cbd5e1; line-height: 1.8; text-align: start; }
.help-section { margin-bottom: 1.4rem; }
.help-section h4 { margin: 0 0 .5rem; font-size: .9rem; color: #5B8DB8; border-bottom: 1px solid #2D3645; padding-bottom: .3rem; }
.help-p { margin: .4rem 0; white-space: pre-line; }
.help-list, .help-ordered { margin: .4rem 0; padding-inline-start: 1.2rem; }
.help-list li, .help-ordered li { margin-bottom: .25rem; }
.formula { background: #1a2332; border: 1px solid #2D3645; border-radius: 6px; padding: .6rem .8rem; font-family: monospace; font-size: .9rem; color: #5B8DB8; text-align: center; margin: .6rem 0; direction: ltr; white-space: pre-line; }
.formula-line + .formula-line { margin-top: .4rem; }
.element-grid { display: flex; flex-direction: column; gap: .35rem; }
.element { background: #1a2332; border-radius: 6px; padding: .4rem .6rem; font-size: .78rem; }
</style>
