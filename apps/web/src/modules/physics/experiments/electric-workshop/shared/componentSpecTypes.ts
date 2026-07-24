export interface ComponentSpec {
  descriptionKey?: string
  properties: { labelKey: string; valueKey: string }[]
  mechanism: { step: string; descKey: string }[]
  connectionGuide?: { terminal: string; descKey: string }[]
  benefitKey?: string
  formulaKey?: string
  formulaDescKey?: string
  applicationKeys: string[]
}
