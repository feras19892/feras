import { ref, onUnmounted } from 'vue'

export function useVoiceRecorder() {
  const isRecording = ref(false)
  const audioBlob = ref<Blob | null>(null)
  const audioUrl = ref<string | null>(null)
  const duration = ref(0)
  const error = ref('')

  let mediaRecorder: MediaRecorder | null = null
  let chunks: Blob[] = []
  let stream: MediaStream | null = null
  let timerInterval: ReturnType<typeof setInterval> | null = null

  async function startRecording() {
    error.value = ''
    if (!navigator.mediaDevices?.getUserMedia) {
      error.value = 'المتصفح لا يدعم التسجيل الصوتي'
      return false
    }
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      chunks = []
      mediaRecorder = new MediaRecorder(stream)
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data)
      }
      mediaRecorder.onstop = () => {
        audioBlob.value = new Blob(chunks, { type: 'audio/webm' })
        if (audioUrl.value) URL.revokeObjectURL(audioUrl.value)
        audioUrl.value = URL.createObjectURL(audioBlob.value)
      }
      mediaRecorder.start()
      isRecording.value = true
      duration.value = 0
      timerInterval = setInterval(() => { duration.value++ }, 1000)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'فشل الوصول إلى الميكروفون'
      return false
    }
  }

  function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop()
    }
    if (stream) {
      stream.getTracks().forEach(t => t.stop())
      stream = null
    }
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
    isRecording.value = false
  }

  function clearRecording() {
    if (audioUrl.value) URL.revokeObjectURL(audioUrl.value)
    audioBlob.value = null
    audioUrl.value = null
    duration.value = 0
  }

  onUnmounted(() => {
    stopRecording()
    if (audioUrl.value) URL.revokeObjectURL(audioUrl.value)
  })

  return {
    isRecording,
    audioBlob,
    audioUrl,
    duration,
    error,
    startRecording,
    stopRecording,
    clearRecording,
  }
}
