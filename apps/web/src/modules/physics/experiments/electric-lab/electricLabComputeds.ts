import { type Ref, type Reactive } from 'vue'
import type { CircuitComponent } from './types'
import { createBasicComputeds } from './electricLabComputedsBasic'
import { createAdvancedComputeds } from './electricLabComputedsAdvanced'
import { createNewComputeds } from './electricLabComputedsNew'
import { createNewComputeds2 } from './electricLabComputedsNew2'
import { createNewComputeds3 } from './electricLabComputedsNew3'
import { createNewComputeds4 } from './electricLabComputedsNew4'
import { createNewComputeds5 } from './electricLabComputedsNew5'

export function createComputeds(
  components: Reactive<CircuitComponent[]>,
  running: Ref<boolean>,
  activePresetId: Ref<string | null>,
) {
  const basic = createBasicComputeds(components, running, activePresetId)
  const advanced = createAdvancedComputeds(components, running, activePresetId)
  const newC = createNewComputeds(components, running, activePresetId)
  const newC2 = createNewComputeds2(components, running, activePresetId)
  const newC3 = createNewComputeds3(components, running, activePresetId)
  const newC4 = createNewComputeds4(components, running, activePresetId)
  const newC5 = createNewComputeds5(components, running, activePresetId)
  return { ...basic, ...advanced, ...newC, ...newC2, ...newC3, ...newC4, ...newC5 }
}
