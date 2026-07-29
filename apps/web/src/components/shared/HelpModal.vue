<script setup lang="ts">
defineProps<{
  title: string;
  sections: { heading: string; items: { label: string; desc: string }[] }[];
}>();
const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <div class="help-overlay" @click.self="emit('close')">
    <div class="help-modal">
      <div class="help-header">
        <h2>📖 {{ title }}</h2>
        <button class="help-close" @click="emit('close')">✕</button>
      </div>
      <div class="help-body">
        <div v-for="section in sections" :key="section.heading" class="help-section">
          <h3>{{ section.heading }}</h3>
          <ul>
            <li v-for="item in section.items" :key="item.label">
              <b>{{ item.label }}:</b> {{ item.desc }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.help-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 1rem; }
.help-modal { width: 100%; max-width: 550px; max-height: 80vh; background: #0f172a; border: 1px solid rgba(255,255,255,0.1); border-radius: 1rem; display: flex; flex-direction: column; overflow: hidden; }
.help-header { display: flex; align-items: center; justify-content: space-between; padding: 1.2rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.06); }
.help-header h2 { margin: 0; font-size: 1.1rem; font-weight: 800; color: #f1f5f9; }
.help-close { width: 30px; height: 30px; border-radius: 0.4rem; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.04); color: #94a3b8; cursor: pointer; font-size: 0.85rem; }
.help-close:hover { background: rgba(239,68,68,0.15); color: #f87171; }
.help-body { padding: 1.2rem 1.5rem; overflow-y: auto; }
.help-section { margin-bottom: 1.2rem; }
.help-section h3 { font-size: 0.9rem; font-weight: 700; color: #67e8f9; margin: 0 0 0.5rem; }
.help-section ul { list-style: none; padding: 0; margin: 0; }
.help-section li { font-size: 0.82rem; color: #94a3b8; padding: 0.2rem 0; padding-inline-start: 1rem; position: relative; }
.help-section li::before { content: '•'; position: absolute; inset-inline-start: 0; color: #64748b; }
.help-section li b { color: #e2e8f0; }
</style>
