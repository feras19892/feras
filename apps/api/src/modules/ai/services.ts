const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const OLLAMA_TIMEOUT_MS = 120_000;

export async function ollamaChat(messages: ChatMessage[], signal?: AbortSignal, model?: string): Promise<string> {
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: model || OLLAMA_MODEL,
      messages,
      stream: false,
    }),
    signal: signal ?? AbortSignal.timeout(OLLAMA_TIMEOUT_MS),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Ollama request failed: ${res.status} ${text}`);
  }

  const data = await res.json() as { message?: { content?: string }; error?: string };
  if (data.error) throw new Error(data.error);
  const content = data.message?.content ?? '';
  if (!content.trim()) throw new Error('Ollama returned an empty response');
  return content;
}

export async function ollamaTags(): Promise<string[]> {
  const res = await fetch(`${OLLAMA_URL}/api/tags`, {
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Ollama tags request failed: ${res.status}`);
  const data = await res.json() as { models?: { name: string }[] };
  return (data.models ?? []).map((m) => m.name);
}
