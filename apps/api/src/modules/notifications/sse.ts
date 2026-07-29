type SSEClient = {
  userId: number;
  controller: ReadableStreamDefaultController;
};

const clients = new Map<number, Set<SSEClient>>();

export function addSSEClient(userId: number, controller: ReadableStreamDefaultController): () => void {
  if (!clients.has(userId)) clients.set(userId, new Set());
  const client: SSEClient = { userId, controller };
  clients.get(userId)!.add(client);

  return () => {
    clients.get(userId)?.delete(client);
    if (clients.get(userId)?.size === 0) clients.delete(userId);
  };
}

export function pushToUser(userId: number, event: string, data: unknown): void {
  const userClients = clients.get(userId);
  if (!userClients || userClients.size === 0) return;

  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of userClients) {
    try {
      client.controller.enqueue(new TextEncoder().encode(payload));
    } catch {
      // client disconnected, will be cleaned up
    }
  }
}

export function pushToUsers(userIds: number[], event: string, data: unknown): void {
  for (const id of userIds) pushToUser(id, event, data);
}

export function getConnectedUserIds(): number[] {
  return Array.from(clients.keys());
}
