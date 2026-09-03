import { ollamaChat } from '../modules/ai/services.js';

const ARABIC_CHARS = /[\u0600-\u06FF]/;
const OLLAMA_TRANSLATE_TIMEOUT_MS = 10_000;
const TRANSLATION_MODEL = process.env.OLLAMA_TRANSLATION_MODEL || 'gemma4:latest';

function looksArabic(text: string): boolean {
  const noSpace = text.replace(/\s+/g, '');
  if (!noSpace.length) return false;
  const arabicCount = noSpace.match(ARABIC_CHARS)?.length || 0;
  return arabicCount / noSpace.length > 0.5;
}

export async function translateToArabic(text: string): Promise<string | null> {
  const trimmed = text.trim();
  if (!trimmed) return null;

  // Fast path: mostly Arabic text does not need Ollama.
  if (looksArabic(trimmed)) return trimmed;

  const prompt = `Translate the following text into Arabic. If it is already in Arabic, return it unchanged. Output only the translation, nothing else, no explanation and no quotes around the output.

${trimmed}`;

  try {
    const translation = await ollamaChat(
      [
        { role: 'system', content: 'You are a precise translator. Always answer in Arabic only.' },
        { role: 'user', content: prompt },
      ],
      AbortSignal.timeout(OLLAMA_TRANSLATE_TIMEOUT_MS),
      TRANSLATION_MODEL,
    );
    return translation.trim() || null;
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[translation] Ollama translation failed:', err);
    }
    return null;
  }
}
