import { ref, reactive, computed } from 'vue'
import { useChemistryLayout } from './useChemistryLayout'
import { getSubstance, phenolphthaleinColor } from './substance-registry'

export interface ChemistryContainer {
  id: string
  type: 'beaker' | 'erlenmeyer' | 'burette' | 'testtube'
  x: number
  y: number
  label: string
  contents: string[] // substance IDs
  volume: number // ml
  color: string
  ph: number
  temp: number
}

export interface ChemistryState {
  running: boolean
  paused: boolean
  step: number
  time: number
  success: boolean
}

export type ChemistryExperimentApi = ReturnType<typeof useChemistryExperiment>

export function useChemistryExperiment() {
  const layout = useChemistryLayout()

  const state = reactive<ChemistryState>({
    running: false,
    paused: false,
    step: 0,
    time: 0,
    success: false,
  })

  const containers = reactive<ChemistryContainer[]>([
    { id: 'beaker-1', type: 'beaker', x: 200, y: 300, label: 'Beaker A', contents: [], volume: 0, color: '#ffffff', ph: 7, temp: 25 },
    { id: 'erlenmeyer-1', type: 'erlenmeyer', x: 400, y: 300, label: 'Flask B', contents: [], volume: 0, color: '#ffffff', ph: 7, temp: 25 },
  ])

  const burnerOn = ref(false)
  const flameIntensity = ref(0.5)

  const currentInstruction = computed(() => {
    const steps = [
      'Welcome to the Chemistry Lab. Select a scenario to begin.',
      'Step 1: Place a glassware on the workbench.',
      'Step 2: Select a substance from the inventory.',
    ]
    return steps[state.step] ?? ''
  })

  function start() { state.running = true; state.paused = false }
  function pause() { state.paused = !state.paused }
  function reset() { state.running = false; state.paused = false; state.step = 0; state.time = 0; state.success = false }
  function nextStep() { state.step += 1 }

  const selectedSubstance = ref<string | null>(null)

  function selectSubstance(id: string | null) { selectedSubstance.value = id }

  function pourSubstance(containerId: string, amount: number = 10) {
    const container = containers.find(c => c.id === containerId)
    if (!container || !selectedSubstance.value) return false
    const substance = getSubstance(selectedSubstance.value)
    if (!substance) return false

    container.contents.push(selectedSubstance.value)
    container.volume = Math.min(container.volume + amount, 250)

    // Calculate new pH and color based on contents
    const hasAcid = container.contents.some(id => getSubstance(id)?.type === 'acid')
    const hasBase = container.contents.some(id => getSubstance(id)?.type === 'base')
    const hasIndicator = container.contents.some(id => getSubstance(id)?.type === 'indicator')

    if (hasIndicator) {
      // Phenolphthalein color based on effective pH
      if (hasBase && !hasAcid) {
        container.ph = 13
        container.color = phenolphthaleinColor(13)
      } else if (hasAcid && hasBase) {
        // Neutralized - approximately neutral
        container.ph = 7
        container.color = phenolphthaleinColor(7)
      } else {
        container.ph = substance.ph
        container.color = phenolphthaleinColor(substance.ph)
      }
    } else {
      container.ph = substance.ph
      container.color = substance.color
    }

    return true
  }

  function toggleBurner() { burnerOn.value = !burnerOn.value }
  function setFlameIntensity(v: number) { flameIntensity.value = Math.max(0, Math.min(1, v)) }

  function getColumnPanels(side: 'data' | 'ctrl') {
    return layout.columnMap[side].filter(id => layout.visible.value.includes(id))
  }

  return {
    state,
    containers,
    burnerOn,
    flameIntensity,
    currentInstruction,
    selectedSubstance,
    layout,
    start, pause, reset, nextStep,
    selectSubstance,
    pourSubstance,
    toggleBurner, setFlameIntensity,
    getColumnPanels,
    handleDrop(id: string, x: number, y: number) {
      // panel reordering - placeholder for Phase 1+
      console.log('drop', id, x, y)
    },
  }
}
