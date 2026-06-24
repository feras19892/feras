import { ref } from 'vue';

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
const idleMessages: { text: string; type: AssistantMessageType }[] = [
  { text: '💡 اختر الأدوات من اللوحة اليسرى واسحبها إلى مساحة العمل.', type: 'tip' },
  { text: '🧪 اضغط على "اختر تجربة" لبدء رحلتك الكيميائية.', type: 'info' },
  { text: '⚗️ حمض + قاعدة → ملح + ماء. المعادلة الأساسية للتعيير!', type: 'tip' },
  { text: '📐 MₐVₐ = MᵦVᵦ — قانون التعيير. اكتبه في دفترك!', type: 'tip' },
  { text: '🧪 HCl: حمض قوي pH≈1 | NaOH: قاعدة قوية pH≈13', type: 'tip' },
  { text: '🎯 الفينوفتالين: عديم اللون في الحمض، وردي في القلوية.', type: 'tip' },
  { text: '⚠️ السلامة أولاً! القفازات والنظارات واجبة في المختبر.', type: 'warning' },
  { text: '💡 كل قطرة من السحاحة = 0.05 mL. احسب بدقة!', type: 'tip' },
];

let idleIndex = 0;
let idleTimer: ReturnType<typeof setInterval> | null = null;

export function startIdleMessages() {
  if (idleTimer) clearInterval(idleTimer);
  idleTimer = setInterval(() => {
    if (!currentMessage.value) {
      const msg = idleMessages[idleIndex % idleMessages.length];
      showMessage(msg.text, msg.type);
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
    showMessage(`⚠️ ${chemicalName} حمض قوي! قفازات + نظارات واقية.`, 'warning');
  } else if (baseChemicals.includes(chemicalId)) {
    showMessage(`⚠️ ${chemicalName} قاعدة قوية! لا تلمسه بيدك.`, 'warning');
  } else {
    showMessage(`ℹ️ ${chemicalName}: تجنب الابتلاع والتعرض المباشر.`, 'tip');
  }
}

export function encourageStep(stepName: string) {
  const phrases = [
    `🎉 أحسنت! "${stepName}" مكتمل.`,
    `✨ رائع! أكملت "${stepName}" بنجاح.`,
    `👏 ممتاز! "${stepName}" تم. استمر!`,
  ];
  showMessage(phrases[Math.floor(Math.random() * phrases.length)], 'success');
}

export function tipForStep(stepIndex: number, experimentName: string) {
  const tips: Record<string, string[]> = {
    'neutralization-hcl-naoh': [
      '💡 ضع السحاحة فوق البيكر مباشرة.',
      '💡 3-5 قطرات فينوفتالين تكفي.',
      '💡 أبطئ السحاحة — كل قطرة تحسب!',
      '💡 الوردي = pH > 8.2. أغلق فوراً!',
      '💡 MₐVₐ = MᵦVᵦ — اكتب القراءة.',
      '💡 تجاوزت؟ ارجع بـ ◀️ نقطة.',
    ],
  };
  const expTips = tips[experimentName] || ['💡 استمر بتركيز!'];
  const tip = expTips[Math.min(stepIndex, expTips.length - 1)];
  if (tip) showMessage(tip, 'tip');
}

export function warnOnAction(action: string) {
  const messages: Record<string, { text: string; type: AssistantMessageType }> = {
    valveOpen: { text: '🔔 الصمام مفتوح! راقب نقطة التكافؤ.', type: 'info' },
    acidSelected: { text: '⚠️ حمض! ارتدِ معدات الوقاية.', type: 'warning' },
    baseSelected: { text: '⚠️ قاعدة! احذر السباش.', type: 'warning' },
    equivalenceApproaching: { text: '🎯 قارب التكافؤ! أبطئ إلى قطرة واحدة.', type: 'warning' },
    equivalenceReached: { text: '✅ التكافؤ! أغلق الصمام وسجل.', type: 'success' },
    equivalenceExceeded: { text: '⛔ تجاوزت! ارجع بـ ◀️ نقطة.', type: 'warning' },
  };
  const msg = messages[action];
  if (msg) showMessage(msg.text, msg.type);
}

export function welcomeMessage(experimentName: string) {
  showMessage(`🧪 مساعدك في "${experimentName}". لنبدأ!`, 'info');
}

export function quickFactAbout(chemicalId: string) {
  const facts: Record<string, string> = {
    hcl: '🔬 HCl: حمض قوي، pH ≈ 1. يذيب المعادن!',
    naoh: '🔬 NaOH: صودا كاوية، pH ≈ 13. يصنع الصابون!',
    phenolphthalein: '🔬 فينوفتالين: عديم اللون → وردي عند pH > 8.2',
  };
  const fact = facts[chemicalId];
  if (fact) showMessage(fact, 'tip');
}
