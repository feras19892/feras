// Strict profanity filter for Arabic, English, and Spanish
// Normalizes text to catch variations (leet-speak, diacritics, spaces, repetitions)

// --- Arabic bad words ---
const AR_BAD = [
  'كلب', 'كلاب', 'ابن', 'ختي', 'اخ', 'حمار', 'غبي', 'غبا', 'احمق', 'احمقا',
  'زاني', 'زانية', 'عاهر', 'عاهرة', 'قواد', 'شرموطة', 'شرموط', 'كس', 'كسك',
  'زب', 'زبك', 'طيز', 'طيزك', 'نيك', 'نيكك', 'منيك', 'متناك', 'متناكة',
  'خرا', 'خرى', 'وسخ', 'وسخة', 'حقير', 'حقيرة', 'داعر', 'داعرة', 'سافل', 'سافلة',
  'لعين', 'ملعون', 'كلب ابن', 'يا ابن', 'ختيست', 'كسمك', 'كسمه',
  'متخلف', 'معاق', 'شاذ', 'شاذة', 'داعشي', 'ارهابي', 'ارهاب',
  'اللعنة', 'تبا', 'تباً', 'سحقا', 'سحقاً', 'يلعن', 'يلعنك',
  'حيوان', 'بهيمة', 'رخيص', 'رخيصة', 'قذر', 'قذارة',
  'مخنث', 'لوطي', 'منحرف', 'منحرفة', 'سكير', 'سكيرة', 'عربيد',
  'حشاش', 'مدمن', 'تافه', 'تافهة', 'سخيف', 'سخيفة', 'رديء', 'رديئة',
  'بليد', 'بليدة', 'حمقا', 'غبياء',
];

// --- English bad words ---
const EN_BAD = [
  'fuck', 'fucker', 'fucking', 'fucked', 'motherfucker', 'motherfucking',
  'shit', 'shitty', 'bullshit', 'horseshit', 'dipshit',
  'bitch', 'bitching', 'bitchy', 'son of a bitch',
  'ass', 'asshole', 'asshat', 'dumbass', 'jackass', 'smartass',
  'dick', 'dickhead', 'dickish',
  'cock', 'cocksucker', 'cockhead',
  'pussy', 'pussies',
  'cunt', 'cunty',
  'bastard',
  'damn', 'goddamn', 'goddamnit',
  'hell', 'what the hell',
  'crap', 'crappy',
  'piss', 'pissed', 'piss off',
  'slut', 'slutty', 'whore', 'whoring',
  'douche', 'douchebag', 'douchey',
  'retard', 'retarded', 'retards',
  'fag', 'faggot', 'faggy',
  'nigger', 'nigga', 'nig',
  'spic', 'spick',
  'dyke', 'tranny', 'trannie',
  'wanker', 'prick', 'shag',
  'bollocks', 'bugger', 'bloody hell',
  'twat', 'twatish',
  'jerk', 'jerkoff',
  'screw', 'screw you', 'screw u',
  'suck', 'sucks', 'sucker',
  'lame', 'idiot', 'idiotic', 'imbecile',
  'moron', 'stupid', 'dumb',
  'kill yourself', 'kys',
  'rape', 'raping', 'rapist',
  'nazi', 'hitler',
];

// --- Spanish bad words ---
const ES_BAD = [
  'joder', 'jodido', 'jodida', 'jodidos', 'jodidas',
  'mierda', 'mierdas', 'mierdita',
  'puta', 'puto', 'putas', 'putos', 'putita', 'putito',
  'cabrón', 'cabron', 'cabrona', 'cabrones', 'cabronas',
  'coño', 'coños',
  'polla', 'pollas',
  'cono', 'conos',
  'verga', 'vergas',
  'pene', 'pito', 'pitos',
  'culo', 'culos',
  'maricón', 'maricon', 'maricona', 'maricones',
  'marica', 'maricas',
  'pendejo', 'pendeja', 'pendejos', 'pendejas',
  'idiota', 'idiotas',
  'estúpido', 'estupido', 'estúpida', 'estupida', 'estúpidos', 'estupidos',
  'imbecil', 'imbécil', 'imbeciles', 'imbéciles',
  'gilipollas',
  'capullo', 'capullos',
  'hijo de puta', 'hija de puta',
  'me cago', 'me cago en',
  'la hostia', 'hostia', 'hostias',
  'borracho', 'borracha',
  'pervertido', 'pervertida',
  'maldito', 'maldita', 'malditos', 'malditas',
  'diablo', 'demonio',
  'chinga', 'chingar', 'chingón', 'chingon',
  'pinche', 'pinches',
  'vergación', 'vergacion',
  'cojones', 'cojon',
  'follar', 'follando',
  'zorra', 'zorro', 'zorras', 'zorros',
  'guarra', 'guarras', 'guarro', 'guarros',
  'cerdo', 'cerda', 'cerdos', 'cerdas',
];

// --- Normalization helpers ---

function normalizeArabic(text: string): string {
  return text
    .replace(/[\u064B-\u0652\u0670\u0640]/g, '') // remove diacritics + tatweel
    .replace(/إ|أ|آ|ٱ/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function normalizeLatin(text: string): string {
  return text
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[ç]/g, 'c')
    .replace(/[@]/g, 'a')
    .replace(/[$]/g, 's')
    .replace(/[!]/g, 'i')
    .replace(/[0]/g, 'o')
    .replace(/[1]/g, 'i')
    .replace(/[3]/g, 'e')
    .replace(/[4]/g, 'a')
    .replace(/[5]/g, 's')
    .replace(/[7]/g, 't')
    .replace(/[*]/g, '')
    .replace(/[.]/g, '')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

const ARABIC_LETTER = /[ء-ي]/;

function checkList(text: string, list: string[], lang: 'ar' | 'latin' = 'latin'): string[] {
  const matches: string[] = [];
  for (const word of list) {
    if (lang === 'latin') {
      const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (new RegExp(`\\b${escaped}\\b`, 'i').test(text)) {
        matches.push(word);
      }
    } else {
      let idx = text.indexOf(word);
      while (idx !== -1) {
        const afterIdx = idx + word.length;
        const after = afterIdx < text.length ? text[afterIdx] : '';
        if (!ARABIC_LETTER.test(after)) {
          matches.push(word);
          break;
        }
        idx = text.indexOf(word, idx + 1);
      }
    }
  }
  return matches;
}

export interface FilterResult {
  clean: boolean;
  flaggedWords: string[];
  language: 'ar' | 'en' | 'es' | 'mixed';
  cleanedContent: string;
  blockedReason?: string;
}

// Patterns for URLs, phone numbers, and social media handles
const URL_PATTERN = /https?:\/\/[\w\S]+|www\.[\w\S]+\.[a-z]{2,}/gi;
const PHONE_PATTERN = /\+?\d[\d\s-]{7,}\d/g;
const SOCIAL_PATTERNS = [
  /@[a-zA-Z0-9_.]{3,}\b/g, // @handles (Twitter, Instagram, etc.)
  /\b(snapchat|snap|insta|instagram|telegram|tiktok|whatsapp|facebook|youtube|twitter|discord)\b[\s:]*[@\w]+/gi,
];

function detectUrls(text: string): boolean {
  return URL_PATTERN.test(text);
}

function detectPhones(text: string): boolean {
  // Match sequences of 8+ digits (with possible spaces/dashes)
  const matches = text.match(PHONE_PATTERN);
  return !!matches && matches.some(m => m.replace(/\D/g, '').length >= 8);
}

function detectSocial(text: string): boolean {
  return SOCIAL_PATTERNS.some(p => p.test(text));
}

export function filterMessage(content: string): FilterResult {
  const arText = normalizeArabic(content);
  const latinText = normalizeLatin(content);

  const arHits = checkList(arText, AR_BAD, 'ar');
  const enHits = checkList(latinText, EN_BAD, 'latin');
  const esHits = checkList(latinText, ES_BAD, 'latin');

  const allHits = [...arHits, ...enHits, ...esHits];

  // Check for URLs, phones, and social media
  const hasUrls = detectUrls(content);
  const hasPhones = detectPhones(content);
  const hasSocial = detectSocial(content);

  const extraBlocked: string[] = [];
  if (hasUrls) extraBlocked.push('روابط خارجية');
  if (hasPhones) extraBlocked.push('أرقام هواتف');
  if (hasSocial) extraBlocked.push('حسابات تواصل اجتماعي');

  const isClean = allHits.length === 0 && extraBlocked.length === 0;

  let cleanedContent = content;
  if (allHits.length > 0) {
    for (const word of AR_BAD) {
      const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      cleanedContent = cleanedContent.replace(
        new RegExp(`${escaped}(?![\u0621-\u064A])`, 'gi'), '***',
      );
    }
    for (const word of [...EN_BAD, ...ES_BAD]) {
      const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      cleanedContent = cleanedContent.replace(
        new RegExp(`\\b${escaped}\\b`, 'gi'), '***',
      );
    }
  }
  // Clean URLs and phones
  if (hasUrls) cleanedContent = cleanedContent.replace(URL_PATTERN, '[رابط محظور]');
  if (hasPhones) cleanedContent = cleanedContent.replace(PHONE_PATTERN, '[رقم محظور]');
  for (const p of SOCIAL_PATTERNS) {
    cleanedContent = cleanedContent.replace(p, '[حساب محظور]');
  }

  const languages: string[] = [];
  if (arHits.length > 0) languages.push('ar');
  if (enHits.length > 0) languages.push('en');
  if (esHits.length > 0) languages.push('es');

  const blockedReason = extraBlocked.length > 0
    ? `محتوى محظور: ${extraBlocked.join(', ')}`
    : undefined;

  return {
    clean: isClean,
    flaggedWords: [...allHits, ...extraBlocked],
    language: (languages.length <= 1 ? languages[0] || 'en' : 'mixed') as 'ar' | 'en' | 'es' | 'mixed',
    cleanedContent,
    blockedReason,
  };
}
