export { type PresetDef } from './electricLabPresetHelpers'
import { basicPresets } from './electricLabPresetsBasic'
import { advancedPresets } from './electricLabPresetsAdvanced'
import { newPresets } from './electricLabPresetsNew'
import { newPresets2 } from './electricLabPresetsNew2'
import { newPresets3 } from './electricLabPresetsNew3'
import { newPresets4 } from './electricLabPresetsNew4'
import { newPresets5 } from './electricLabPresetsNew5'

export const presetDefs = [...basicPresets, ...advancedPresets, ...newPresets, ...newPresets2, ...newPresets3, ...newPresets4, ...newPresets5]
