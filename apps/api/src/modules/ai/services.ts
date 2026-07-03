const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'gemma4';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function ollamaChat(messages: ChatMessage[]): Promise<string> {
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages,
      stream: false,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Ollama request failed: ${res.status} ${text}`);
  }

  const data = await res.json() as { message?: { content?: string }; error?: string };
  if (data.error) throw new Error(data.error);
  return data.message?.content ?? '';
}

export async function ollamaTags(): Promise<string[]> {
  const res = await fetch(`${OLLAMA_URL}/api/tags`);
  if (!res.ok) throw new Error(`Ollama tags request failed: ${res.status}`);
  const data = await res.json() as { models?: { name: string }[] };
  return (data.models ?? []).map((m) => m.name);
}
