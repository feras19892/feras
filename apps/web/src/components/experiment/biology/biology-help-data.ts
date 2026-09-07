import type { HelpBlock, HelpSection } from '../shared/experiment-help-types';
import { biologyHelpTopics } from './biology-help-topics';

/**
 * سياق مساعدة خاص بتجربة أحياء — يتيح لكل تجربة عرض محتوى مساعدة
 * مخصص لها بدل المحتوى العام المشترك.
 */
export interface BiologyHelpContext {
  /** معرّف موضوع التجربة، مثل 'food-chain' أو 'water-cycle' أو 'heart' أو 'animal-cell' */
  topic: string;
  /** مفتاح i18n لعنوان التجربة، مثل 'biology.heartTitle' */
  titleKey?: string;
  /** مفتاح i18n لعنوان التجربة الفرعي (اختياري) */
  subtitleKey?: string;
  /** أجزاء/مراحل التجربة الرئيسية مع مفاتيح أسمائها (اختياري) */
  parts?: { id: string; nameKey: string }[];
}

type TFn = (key: string) => string;

/** الأقسام العامة الستة — المحتوى الأصلي المشترك، يُستخدم كبديل افتراضي */
function genericSections(t: TFn): HelpSection[] {
  return [
    {
      title: t('biology.bioHelpS1Title'),
      blocks: [
        { type: 'p', text: t('biology.bioHelpS1P1') },
        { type: 'p', text: t('biology.bioHelpS1P2') },
      ],
    },
    {
      title: t('biology.bioHelpS2Title'),
      blocks: [
        { type: 'p', text: t('biology.bioHelpS2P1') },
        {
          type: 'list',
          items: [
            t('biology.bioHelpS2L1'),
            t('biology.bioHelpS2L2'),
            t('biology.bioHelpS2L3'),
            t('biology.bioHelpS2L4'),
            t('biology.bioHelpS2L5'),
          ],
        },
      ],
    },
    {
      title: t('biology.bioHelpS3Title'),
      blocks: [
        { type: 'p', text: t('biology.bioHelpS3P1') },
        {
          type: 'list',
          items: [
            t('biology.bioHelpS3L1'),
            t('biology.bioHelpS3L2'),
            t('biology.bioHelpS3L3'),
            t('biology.bioHelpS3L4'),
          ],
        },
      ],
    },
    {
      title: t('biology.bioHelpS4Title'),
      blocks: [
        { type: 'p', text: t('biology.bioHelpS4P1') },
        {
          type: 'list',
          items: [
            t('biology.bioHelpS4L1'),
            t('biology.bioHelpS4L2'),
            t('biology.bioHelpS4L3'),
            t('biology.bioHelpS4L4'),
            t('biology.bioHelpS4L5'),
          ],
        },
        { type: 'p', text: t('biology.bioHelpS4P2') },
      ],
    },
    {
      title: t('biology.bioHelpS5Title'),
      blocks: [
        { type: 'p', text: t('biology.bioHelpS5P1') },
        {
          type: 'list',
          items: [
            t('biology.bioHelpS5L1'),
            t('biology.bioHelpS5L2'),
            t('biology.bioHelpS5L3'),
          ],
        },
      ],
    },
    {
      title: t('biology.bioHelpS6Title'),
      blocks: [
        {
          type: 'list',
          items: [
            t('biology.bioHelpS6L1'),
            t('biology.bioHelpS6L2'),
            t('biology.bioHelpS6L3'),
          ],
        },
      ],
    },
  ];
}

/** محتوى مخصص لتجربة السلسلة الغذائية */
function foodChainSections(t: TFn): HelpSection[] {
  return [
    {
      title: t('biology.bioHelpFcS1Title'),
      blocks: [
        { type: 'p', text: t('biology.bioHelpFcS1P1') },
        { type: 'p', text: t('biology.bioHelpFcS1P2') },
      ],
    },
    {
      title: t('biology.bioHelpFcS2Title'),
      blocks: [
        { type: 'p', text: t('biology.bioHelpFcS2P1') },
        {
          type: 'list',
          items: [
            t('biology.bioHelpFcS2L1'),
            t('biology.bioHelpFcS2L2'),
            t('biology.bioHelpFcS2L3'),
          ],
        },
      ],
    },
    {
      title: t('biology.bioHelpFcS3Title'),
      blocks: [
        { type: 'p', text: t('biology.bioHelpFcS3P1') },
        {
          type: 'ordered',
          items: [
            t('biology.bioHelpFcS3L1'),
            t('biology.bioHelpFcS3L2'),
            t('biology.bioHelpFcS3L3'),
            t('biology.bioHelpFcS3L4'),
          ],
        },
      ],
    },
    {
      title: t('biology.bioHelpFcS4Title'),
      blocks: [
        { type: 'p', text: t('biology.bioHelpFcS4P1') },
        {
          type: 'list',
          items: [
            t('biology.bioHelpFcS4L1'),
            t('biology.bioHelpFcS4L2'),
          ],
        },
      ],
    },
  ];
}

/** محتوى مخصص لتجربة دورة الماء */
function waterCycleSections(t: TFn): HelpSection[] {
  return [
    {
      title: t('biology.bioHelpWcS1Title'),
      blocks: [
        { type: 'p', text: t('biology.bioHelpWcS1P1') },
        {
          type: 'ordered',
          items: [
            t('biology.bioHelpWcS1L1'),
            t('biology.bioHelpWcS1L2'),
            t('biology.bioHelpWcS1L3'),
            t('biology.bioHelpWcS1L4'),
          ],
        },
      ],
    },
    {
      title: t('biology.bioHelpWcS2Title'),
      blocks: [
        { type: 'p', text: t('biology.bioHelpWcS2P1') },
        {
          type: 'list',
          items: [
            t('biology.bioHelpWcS2L1'),
            t('biology.bioHelpWcS2L2'),
            t('biology.bioHelpWcS2L3'),
          ],
        },
      ],
    },
    {
      title: t('biology.bioHelpWcS3Title'),
      blocks: [
        { type: 'p', text: t('biology.bioHelpWcS3P1') },
        {
          type: 'list',
          items: [
            t('biology.bioHelpWcS3L1'),
            t('biology.bioHelpWcS3L2'),
            t('biology.bioHelpWcS3L3'),
          ],
        },
      ],
    },
  ];
}

/**
 * أقسام خاصة بالتجربة دون محتوى مخصص كامل: قسم "ما الذي تستكشفه" بعنوان
 * التجربة، وقسم "الأجزاء الرئيسية" عند توفّر ctx.parts، ثم تُستكمل بأقسام
 * التنقل والأدوات والأهداف العامة (bioHelpS2–bioHelpS6).
 */
function contextSections(ctx: BiologyHelpContext, t: TFn): HelpSection[] {
  const sections: HelpSection[] = [];

  const exploreBlocks: HelpBlock[] = [];
  if (ctx.titleKey) exploreBlocks.push({ type: 'p', text: t(ctx.titleKey) });
  if (ctx.subtitleKey) exploreBlocks.push({ type: 'p', text: t(ctx.subtitleKey) });
  exploreBlocks.push({ type: 'p', text: t('biology.bioHelpCtxS1P1') });
  sections.push({ title: t('biology.bioHelpCtxS1Title'), blocks: exploreBlocks });

  if (ctx.parts && ctx.parts.length > 0) {
    sections.push({
      title: t('biology.bioHelpCtxPartsTitle'),
      blocks: [
        { type: 'p', text: t('biology.bioHelpCtxPartsP1') },
        { type: 'list', items: ctx.parts.map((part) => t(part.nameKey)) },
      ],
    });
  }

  // أقسام التنقل ثلاثي الأبعاد والأدوات والأهداف والنصائح العامة (S2–S6)
  sections.push(...genericSections(t).slice(1));

  return sections;
}

/**
 * يبني أقسام المساعدة حسب سياق التجربة:
 * - بدون سياق → الأقسام العامة كاملة.
 * - topic مع محتوى مخصص (food-chain / water-cycle) → محتوى خاص به.
 * - غير ذلك مع titleKey أو parts → أقسام خاصة بالتجربة + الأقسام العامة S2–S6.
 * - وإلا → الأقسام العامة كاملة.
 */
export function buildBiologyHelpSections(
  ctx: BiologyHelpContext | undefined,
  t: TFn,
  locale: string,
): HelpSection[] {
  if (!ctx) return genericSections(t);

  const topic = (ctx.topic ?? '').replace(/^biology-/, '');
  if (topic === 'food-chain') return foodChainSections(t);
  if (topic === 'water-cycle') return waterCycleSections(t);

  const localeTopics = biologyHelpTopics[locale];
  if (localeTopics && localeTopics[topic]) {
    return localeTopics[topic];
  }

  if (ctx.titleKey || (ctx.parts && ctx.parts.length > 0)) {
    return contextSections(ctx, t);
  }

  return genericSections(t);
}
