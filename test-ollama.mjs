// Quick Ollama connectivity test
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'gemma4';

function normalizeModelName(name) {
  // Strip tags like :latest so "gemma4" matches "gemma4:latest"
  return String(name).split(':')[0].trim().toLowerCase();
}

async function testOllama() {
  console.log(`Testing Ollama at: ${OLLAMA_URL}`);
  console.log(`Using model: ${OLLAMA_MODEL}`);
  console.log('---');

  // 1. Check /api/tags (list models)
  let tagsData;
  try {
    const tagsRes = await fetch(`${OLLAMA_URL}/api/tags`);
    if (!tagsRes.ok) throw new Error(`HTTP ${tagsRes.status}`);
    tagsData = await tagsRes.json();
    console.log('1. /api/tags -> OK');
    console.log('   Models:', (tagsData.models || []).map(m => m.name).join(', ') || 'None');
  } catch (err) {
    console.log('1. /api/tags -> FAILED:', err.message);
    console.log('\nOllama is not reachable. Make sure Ollama is running.');
    process.exit(1);
  }

  // 2. Check if configured model exists (compare base name without tags)
  const models = tagsData.models || [];
  const modelNames = models.map(m => m.name);
  const normalizedTarget = normalizeModelName(OLLAMA_MODEL);
  const foundModel = models.find(m => normalizeModelName(m.name) === normalizedTarget);

  if (!foundModel) {
    console.log(`\nWARNING: Model "${OLLAMA_MODEL}" is not installed.`);
    console.log('Installed models:', modelNames.join(', ') || 'None');
  } else {
    console.log(`2. Model "${foundModel.name}" is installed.`);
  }

  // 3. Quick chat test (use exact installed name, or fallback to first installed model)
  const chatModel = foundModel ? foundModel.name : (modelNames[0] || OLLAMA_MODEL);
  console.log(`3. /api/chat quick test with model "${chatModel}"...`);
  try {
    const chatRes = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: chatModel,
        messages: [{ role: 'user', content: 'Say hi in one word' }],
        stream: false,
      }),
    });
    if (!chatRes.ok) throw new Error(`HTTP ${chatRes.status}`);
    const chatData = await chatRes.json();
    console.log('   Response:', chatData.message?.content || '(empty)');
    console.log('\nOllama is connected and working!');
  } catch (err) {
    console.log('   FAILED:', err.message);
  }
}

testOllama();
