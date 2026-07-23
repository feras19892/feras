const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'gemma4';
export async function ollamaChat(messages) {
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
    const data = await res.json();
    if (data.error)
        throw new Error(data.error);
    return data.message?.content ?? '';
}
export async function ollamaTags() {
    const res = await fetch(`${OLLAMA_URL}/api/tags`);
    if (!res.ok)
        throw new Error(`Ollama tags request failed: ${res.status}`);
    const data = await res.json();
    return (data.models ?? []).map((m) => m.name);
}
