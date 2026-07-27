// Strict profanity filter for Arabic, English, and Spanish
// Normalizes text to catch variations (leet-speak, diacritics, spaces, repetitions)

// --- Arabic bad words ---
const AR_BAD = [
  'كلب', 'كلاب', 'ابن', 'ختي', 'اخ', 'حمار', 'حمار', 'غبي', 'غبا', 'احمق', 'احمقا',
  'زاني', 'زانية', 'عاهر', 'عاهرة', 'قواد', 'شرموطة', 'شرموط', 'كس', 'كسك',
  'زب', 'زبك', 'زبك', 'طيز', 'طيزك', 'نيك', 'نيكك', 'منيك', 'متناك', 'متناكة',
  'خرا', 'خرى', 'وسخ', 'وسخة', 'حقير', 'حقيرة', 'داعر', 'داعرة', 'سافل', 'سافلة',
  'لعين', 'ملعون', 'كلب ابن', 'يا ابن', 'ختيست', 'كسمك', 'كسمه', 'كسمك',
  'متخلف', 'معاق', 'شاذ', 'شاذة', 'داعشي', 'ارهابي', 'ارهاب',
  'اللعنة', 'تبا', 'تباً', 'سحقا', 'سحقاً', 'يلعن', 'يلعنك', 'يلعنك',
  'حيوان', 'بهيمة', 'رخيص', 'رخيصة', 'قذر', 'قذارة', 'وسخ',
  'مخنث', 'لوطي', 'منحرف', 'منحرفة', 'سكير', 'سكيرة', 'عربيد',
  'حشاش', 'مدمن', 'تافه', 'تافهة', 'سخيف', 'سخيفة', 'رديء', 'رديئة',
  'بليد', 'بليدة', 'احمق', 'حمقا', 'غبا', 'غبياء',
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
  'bastard', 'bitch',
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
  'hate', 'kill yourself', 'kys',
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
  'maricón', 'maricon', 'maricón', 'maricona', 'maricones',
  'marica', 'maricas',
  'pendejo', 'pendeja', 'pendejos', 'pendejas',
  'idiota', 'idiotas',
  'estúpido', 'estupido', 'estúpida', 'estupida', 'estúpidos', 'estupidos',
  'imbecil', 'imbécil', 'imbeciles', 'imbéciles',
  'gilipollas', 'gilipollas',
  'capullo', 'capullos',
  'hijo de puta', 'hija de puta',
  'me cago', 'me cago en',
  'la hostia', 'hostia', 'hostias',
  'tío', 'tia',
  'borracho', 'borracha',
  'pervertido', 'pervertida',
  'maldito', 'maldita', 'malditos', 'malditas',
  'diablo', 'demonio',
  'chinga', 'chingar', 'chingón', 'chingon',
  'pinche', 'pinches',
  'pendejo', 'cabrón',
  'vergación', 'vergacion',
  'cojones', 'cojon',
  'follar', 'follando',
  'zorra', 'zorro', 'zorras', 'zorros',
  'guarra', 'guarras', 'guarro', 'guarros',
  'cerdo', 'cerda', 'cerdos', 'cerdas',
  'loco', 'loca',
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

function checkList(text: string, list: string[]): string[] {
  const matches: string[] = [];
  for (const word of list) {
    if (text.includes(word)) {
      matches.push(word);
    }
  }
  return matches;
}

export interface FilterResult {
  clean: boolean;
  flaggedWords: string[];
  language: 'ar' | 'en' | 'es' | 'mixed';
  cleanedContent: string;
}

export function filterMessage(content: string): FilterResult {
  const arText = normalizeArabic(content);
  const latinText = normalizeLatin(content);

  const arHits = checkList(arText, AR_BAD);
  const enHits = checkList(latinText, EN_BAD);
  const esHits = checkList(latinText, ES_BAD);

  const allHits = [...arHits, ...enHits, ...esHits];

  let cleanedContent = content;
  if (allHits.length > 0) {
    for (const word of [...AR_BAD, ...EN_BAD, ...ES_BAD]) {
      const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      cleanedContent = cleanedContent.replace(new RegExp(escaped, 'gi'), '***');
    }
  }

  const languages: string[] = [];
  if (arHits.length > 0) languages.push('ar');
  if (enHits.length > 0) languages.push('en');
  if (esHits.length > 0) languages.push('es');

  return {
    clean: allHits.length === 0,
    flaggedWords: allHits,
    language: (languages.length <= 1 ? languages[0] || 'en' : 'mixed') as 'ar' | 'en' | 'es' | 'mixed',
    cleanedContent,
  };
}
