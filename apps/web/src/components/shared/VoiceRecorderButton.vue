<script setup lang="ts">
import { computed } from 'vue'
import { useVoiceRecorder } from '../../composables/useVoiceRecorder'

const props = defineProps<{ modelValue?: Blob | null }>()
const emit = defineEmits<{
  (e: 'update:modelValue', blob: Blob | null): void
}>()

const recorder = useVoiceRecorder()

const formattedDuration = computed(() => {
  const m = Math.floor(recorder.duration.value / 60)
  const s = recorder.duration.value % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

async function toggleRecording() {
  if (recorder.isRecording.value) {
    recorder.stopRecording()
    if (recorder.audioBlob.value) emit('update:modelValue', recorder.audioBlob.value)
  } else {
    recorder.clearRecording()
    emit('update:modelValue', null)
    await recorder.startRecording()
  }
}

function clearRecording() {
  recorder.clearRecording()
  emit('update:modelValue', null)
}
</script>

<template>
  <div class="voice-recorder">
    <button
      :class="['rec-btn', { recording: recorder.isRecording.value }]"
      @click="toggleRecording"
      :title="recorder.isRecording.value ? 'إيقاف التسجيل' : 'بدء تسجيل صوتي'"
    >
      {{ recorder.isRecording.value ? '⏹️' : '🎤' }}
    </button>
    <span v-if="recorder.isRecording.value" class="rec-duration">{{ formattedDuration }}</span>
    <span v-if="recorder.error.value" class="rec-error">{{ recorder.error.value }}</span>
    <div v-if="recorder.audioUrl.value && !recorder.isRecording.value" class="rec-preview">
      <audio :src="recorder.audioUrl.value" controls class="rec-audio" />
      <button class="rec-clear" @click="clearRecording">✕</button>
    </div>
  </div>
</template>

<style scoped>
.voice-recorder { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.rec-btn {
  width: 2rem; height: 2rem; border-radius: 50%; border: none;
  background: rgba(99,102,241,0.15); color: #a5b4fc; font-size: 1rem;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.rec-btn:hover { background: rgba(99,102,241,0.25); }
.rec-btn.recording { background: rgba(239,68,68,0.2); color: #f87171; animation: pulse 1.5s infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
.rec-duration { font-size: 0.8rem; color: #f87171; font-weight: 700; font-variant-numeric: tabular-nums; }
.rec-error { font-size: 0.75rem; color: #f87171; }
.rec-preview { display: flex; align-items: center; gap: 0.3rem; }
.rec-audio { height: 2rem; max-width: 200px; }
.rec-clear {
  width: 1.5rem; height: 1.5rem; border-radius: 50%; border: none;
  background: rgba(239,68,68,0.15); color: #f87171; cursor: pointer; font-size: 0.7rem;
}
</style>
