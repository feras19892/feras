import { ref, computed, type Ref } from 'vue'

export interface ExperimentTrialsConfig<T extends { id: number }> {
  storageKey: string
  maxHistory?: number
  validateLoaded?: (raw: unknown) => raw is T
  getExtraData?: () => unknown
  setExtraData?: (data: unknown) => void
}

export function useExperimentTrials<T extends { id: number }>(config: ExperimentTrialsConfig<T>) {
  const trials = ref<T[]>([]) as Ref<T[]>
  const history = ref<T[][]>([]) as Ref<T[][]>
  const historyIndex = ref(-1)
  let nextId = 1
  const maxHistory = config.maxHistory ?? 20

  function pushHistory(): void {
    if (historyIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, historyIndex.value + 1)
    }
    history.value.push([...trials.value] as T[])
    historyIndex.value++
    if (history.value.length > maxHistory) {
      history.value.shift()
      historyIndex.value--
    }
  }

  function undo(): void {
    if (historyIndex.value > 0) {
      historyIndex.value--
      trials.value = [...history.value[historyIndex.value]] as T[]
      nextId = trials.value.length > 0 ? Math.max(...trials.value.map(tr => tr.id)) + 1 : 1
    }
  }

  function redo(): void {
    if (historyIndex.value < history.value.length - 1) {
      historyIndex.value++
      trials.value = [...history.value[historyIndex.value]] as T[]
      nextId = trials.value.length > 0 ? Math.max(...trials.value.map(tr => tr.id)) + 1 : 1
    }
  }

  function canUndo(): boolean { return historyIndex.value > 0 }
  function canRedo(): boolean { return historyIndex.value < history.value.length - 1 }

  function addTrial(trial: Omit<T, 'id'>): T {
    pushHistory()
    const newTrial = { ...trial, id: nextId++ } as T
    trials.value = [...trials.value, newTrial]
    save()
    return newTrial
  }

  function removeTrial(id: number): void {
    pushHistory()
    trials.value = trials.value.filter(tr => tr.id !== id)
    save()
  }

  function clearTrials(): void {
    pushHistory()
    trials.value = []
    nextId = 1
    save()
  }

  function save(): void {
    try {
      const payload = config.getExtraData
        ? { trials: trials.value, extra: config.getExtraData() }
        : trials.value
      localStorage.setItem(config.storageKey, JSON.stringify(payload))
    } catch { /* ignore */ }
  }

  function autoLoad(): void {
    try {
      const raw = localStorage.getItem(config.storageKey)
      if (!raw) return
      const parsed = JSON.parse(raw)
      const arr = Array.isArray(parsed) ? parsed : parsed.trials
      if (Array.isArray(arr)) {
        const valid = config.validateLoaded
          ? arr.filter(config.validateLoaded)
          : arr as T[]
        trials.value = valid
        nextId = valid.length > 0 ? Math.max(...valid.map(tr => tr.id)) + 1 : 1
        history.value = [[...valid]]
        historyIndex.value = 0
        if (config.setExtraData && parsed.extra !== undefined) config.setExtraData(parsed.extra)
      }
    } catch { /* ignore */ }
  }

  function exportCsv(filename: string, rows: (string | number)[][]): void {
    if (!trials.value.length) return
    const content = rows.map(row => row.map(cell => String(cell)).join(',')).join('\n')
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const trialCount = computed(() => trials.value.length)

  return {
    trials,
    trialCount,
    history,
    historyIndex,
    pushHistory,
    addTrial,
    removeTrial,
    clearTrials,
    undo,
    redo,
    canUndo,
    canRedo,
    save,
    autoLoad,
    exportCsv,
  }
}
