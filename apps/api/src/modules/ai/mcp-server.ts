import { Server } from '@modelcontextprotocol/sdk/server';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types';
import { ollamaChat, ollamaTags } from './services.js';
import type { ChatMessage } from './services.js';

const server = new Server(
  { name: 'ollama-mcp', version: '1.0.0' },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'ollama_chat',
      description: 'Send a conversation to the locally running Ollama server and return the assistant reply.',
      inputSchema: {
        type: 'object',
        properties: {
          messages: {
            type: 'array',
            description: 'Array of chat messages with role and content',
            items: {
              type: 'object',
              properties: {
                role: { type: 'string', enum: ['system', 'user', 'assistant'] },
                content: { type: 'string' },
              },
              required: ['role', 'content'],
            },
          },
        },
        required: ['messages'],
      },
    },
    {
      name: 'ollama_list_models',
      description: 'List the models currently available in the local Ollama server.',
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'ollama_health',
      description: 'Check whether the local Ollama server is reachable.',
      inputSchema: { type: 'object', properties: {} },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name } = request.params;
  const args = (request.params.arguments ?? {}) as Record<string, unknown>;

  try {
    if (name === 'ollama_chat') {
      const messages = args.messages as ChatMessage[] | undefined;
      if (!Array.isArray(messages)) {
        return { content: [{ type: 'text', text: 'Invalid messages: must be an array' }], isError: true };
      }
      const reply = await ollamaChat(messages);
      return { content: [{ type: 'text', text: reply }] };
    }

    if (name === 'ollama_list_models') {
      const models = await ollamaTags();
      return { content: [{ type: 'text', text: JSON.stringify(models, null, 2) }] };
    }

    if (name === 'ollama_health') {
      const models = await ollamaTags();
      return { content: [{ type: 'text', text: `Ollama is healthy with ${models.length} model(s) loaded.` }] };
    }

    return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { content: [{ type: 'text', text: `Error: ${message}` }], isError: true };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error('Ollama MCP server connected on stdio');
