import { fetchJson } from './http';

export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function ollamaChat(messages: OllamaMessage[]): Promise<string> {
  const data = await fetchJson<{ success: boolean; reply?: string; message?: string }>('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: messages[messages.length - 1]?.content || '',
      context: messages.slice(0, -1).filter(m => m.role !== 'system').map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    }),
  });
  if (!data.success) throw new Error(data.message || 'AI request failed');
  return data.reply || '';
}

export async function ollamaTags(): Promise<string[]> {
  const data = await fetchJson<{ success: boolean; models?: string[]; message?: string }>('/api/ai/models');
  if (!data.success) throw new Error(data.message || 'Failed to fetch models');
  return data.models || [];
}

export async function checkOllamaHealth(): Promise<boolean> {
  try {
    const data = await fetchJson<{ success: boolean; connected: boolean }>('/api/ai/health');
    return data.connected === true;
  } catch {
    return false;
  }
}
