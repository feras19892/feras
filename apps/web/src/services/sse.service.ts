import { ref } from 'vue';
import { useAuthStore } from '../modules/auth/stores/auth';

export interface SSEClientEvent {
  type: 'approval_created' | 'approval_escalated' | 'approval_resolved' | 'report_submitted' | 'report_resubmitted' | 'report_graded' | 'chat_flagged' | 'class_frozen' | 'class_unfrozen' | 'ping';
  payload: Record<string, unknown>;
  timestamp: string;
}

type EventHandler = (event: SSEClientEvent) => void;

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

let eventSource: EventSource | null = null;
const handlers = new Set<EventHandler>();
export const sseConnected = ref(false);
let reconnectAttempts = 0;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
const MAX_RECONNECT_ATTEMPTS = 10;

function connect() {
  const auth = useAuthStore();
  if (!auth.user) {
    if (reconnectTimer) clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(() => connect(), 2000);
    return;
  }

  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }

  try {
    const url = `${API_BASE}/api/sse/events`;
    eventSource = new EventSource(url, { withCredentials: true });

    eventSource.onopen = () => {
      sseConnected.value = true;
      reconnectAttempts = 0;
    };

    eventSource.onerror = () => {
      sseConnected.value = false;
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
      if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) return;
      const delay = Math.min(5000 * Math.pow(1.5, reconnectAttempts), 30000);
      reconnectAttempts++;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(() => connect(), delay);
    };

    const eventTypes: SSEClientEvent['type'][] = [
      'approval_created', 'approval_escalated', 'approval_resolved',
      'report_submitted', 'report_resubmitted', 'report_graded',
      'chat_flagged', 'class_frozen', 'class_unfrozen', 'ping',
    ];

    for (const type of eventTypes) {
      eventSource.addEventListener(type, (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          const event: SSEClientEvent = {
            type,
            payload: data.payload || data,
            timestamp: data.timestamp || new Date().toISOString(),
          };
          handlers.forEach(h => h(event));
        } catch { /* ignore parse errors */ }
      });
    }
  } catch { /* ignore connection errors */ }
}

export function useSSE() {
  function connectSSE() {
    if (!sseConnected.value && !eventSource) connect();
  }

  function disconnectSSE() {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
      sseConnected.value = false;
    }
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    reconnectAttempts = 0;
  }

  function onEvent(handler: EventHandler): () => void {
    handlers.add(handler);
    return () => handlers.delete(handler);
  }

  return { connectSSE, disconnectSSE, onEvent, isConnected: () => sseConnected.value };
}
