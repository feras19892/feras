import { ref } from 'vue';
import { useI18n } from '../useI18n';

function getT() {
  return useI18n().t;
}

export type AssistantMessageType = 'warning' | 'info' | 'success' | 'tip';

export interface AssistantMessage {
  id: number;
  text: string;
  type: AssistantMessageType;
}

let msgId = 0;

// Only ONE message visible at a time
export const currentMessage = ref<AssistantMessage | null>(null);
export const assistantOpen = ref(true);

let dismissTimer: ReturnType<typeof setTimeout> | null = null;

function showMessage(text: string, type: AssistantMessageType) {
  // Replace current message immediately (never stack)
  currentMessage.value = {
    id: ++msgId,
    text,
    type,
  };
  // Clear previous timer
  if (dismissTimer) clearTimeout(dismissTimer);
  // Auto-dismiss after 6 seconds
  dismissTimer = setTimeout(() => {
    currentMessage.value = null;
  }, 6000);
}

export function clearAssistantMessages() {
  currentMessage.value = null;
  if (dismissTimer) clearTimeout(dismissTimer);
}

export function toggleAssistant() {
  assistantOpen.value = !assistantOpen.value;
}

// ── Idle messages pool (rotates when student is inactive) ──
const idleKeys = [
  'chemistryAssistant.idleMsg1',
  'chemistryAssistant.idleMsg2',
  'chemistryAssistant.idleMsg3',
  'chemistryAssistant.idleMsg4',
  'chemistryAssistant.idleMsg5',
  'chemistryAssistant.idleMsg6',
  'chemistryAssistant.idleMsg7',
  'chemistryAssistant.idleMsg8',
];
const idleTypes: AssistantMessageType[] = ['tip', 'info', 'tip', 'tip', 'tip', 'tip', 'warning', 'tip'];

let idleIndex = 0;
let idleTimer: ReturnType<typeof setInterval> | null = null;

export function startIdleMessages() {
  if (idleTimer) clearInterval(idleTimer);
  idleTimer = setInterval(() => {
    if (!currentMessage.value) {
      const idx = idleIndex % idleKeys.length;
      showMessage(getT()(idleKeys[idx]), idleTypes[idx]);
      idleIndex++;
    }
  }, 8000);
}

export function stopIdleMessages() {
  if (idleTimer) clearInterval(idleTimer);
}

// ── Contextual message helpers (SHORT & RICH) ──

export function warnDangerousChemical(chemicalName: string, chemicalId: string) {
  const acidChemicals = ['hcl', 'h2so4', 'hno3'];
  const baseChemicals = ['naoh', 'koh'];

  if (acidChemicals.includes(chemicalId)) {
    showMessage(getT()('chemistryAssistant.strongAcidWarning', { name: chemicalName }), 'warning');
  } else if (baseChemicals.includes(chemicalId)) {
    showMessage(getT()('chemistryAssistant.strongBaseWarning', { name: chemicalName }), 'warning');
  } else {
    showMessage(getT()('chemistryAssistant.chemicalGeneralWarning', { name: chemicalName }), 'tip');
  }
}

export function encourageStep(stepName: string) {
  const phrases = [
    getT()('chemistryAssistant.stepComplete1', { name: stepName }),
    getT()('chemistryAssistant.stepComplete2', { name: stepName }),
    getT()('chemistryAssistant.stepComplete3', { name: stepName }),
  ];
  showMessage(phrases[Math.floor(Math.random() * phrases.length)], 'success');
}

export function tipForStep(stepIndex: number, experimentName: string) {
  const expKeys: Record<string, string[]> = {
    'neutralization-hcl-naoh': [
      'chemistryAssistant.tipExp1_1',
      'chemistryAssistant.tipExp1_2',
      'chemistryAssistant.tipExp1_3',
      'chemistryAssistant.tipExp1_4',
      'chemistryAssistant.tipExp1_5',
      'chemistryAssistant.tipExp1_6',
    ],
    'neutralization-ch3cooh-naoh': [
      'chemistryAssistant.tipExp2_1',
      'chemistryAssistant.tipExp2_2',
      'chemistryAssistant.tipExp2_3',
      'chemistryAssistant.tipExp2_4',
      'chemistryAssistant.tipExp2_5',
      'chemistryAssistant.tipExp2_6',
    ],
  };
  const keys = expKeys[experimentName] || ['chemistryAssistant.defaultTip'];
  const key = keys[Math.min(stepIndex, keys.length - 1)];
  if (key) showMessage(getT()(key), 'tip');
}

export function warnOnAction(action: string) {
  const map: Record<string, AssistantMessageType> = {
    valveOpen: 'info',
    acidSelected: 'warning',
    baseSelected: 'warning',
    equivalenceApproaching: 'warning',
    equivalenceReached: 'success',
    equivalenceExceeded: 'warning',
  };
  const key = 'chemistryAssistant.' + action;
  const type = map[action] || 'info';
  showMessage(getT()(key), type);
}

export function welcomeMessage(experimentName: string) {
  showMessage(getT()('chemistryAssistant.welcomeMessage', { name: experimentName }), 'info');
}

export function quickFactAbout(chemicalId: string) {
  const keyMap: Record<string, string> = {
    hcl: 'chemistryAssistant.factHCl',
    naoh: 'chemistryAssistant.factNaOH',
    phenolphthalein: 'chemistryAssistant.factPhenolphthalein',
  };
  const key = keyMap[chemicalId];
  if (key) showMessage(getT()(key), 'tip');
}
