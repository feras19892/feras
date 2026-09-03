import { EventEmitter } from 'events';

export interface SSEEvent {
  type: 'approval_created' | 'approval_escalated' | 'approval_resolved' | 'report_submitted' | 'report_resubmitted' | 'report_graded' | 'chat_flagged' | 'class_frozen' | 'class_unfrozen' | 'class_created';
  payload: Record<string, unknown>;
  targetUserId?: number;
  targetRole?: string;
  schoolId?: number;
  timestamp: string;
}

class SSEEventBus extends EventEmitter {
  private static instance: SSEEventBus;

  static getInstance(): SSEEventBus {
    if (!SSEEventBus.instance) {
      SSEEventBus.instance = new SSEEventBus();
      SSEEventBus.instance.setMaxListeners(100);
    }
    return SSEEventBus.instance;
  }

  broadcast(event: SSEEvent) {
    this.emit('event', event);
    if (event.targetUserId) {
      this.emit(`user:${event.targetUserId}`, event);
    }
    if (event.targetRole) {
      this.emit(`role:${event.targetRole}`, event);
    }
    this.emit(`type:${event.type}`, event);
  }

  onEvent(listener: (event: SSEEvent) => void) {
    this.on('event', listener);
    return () => this.off('event', listener);
  }

  onUserEvent(userId: number, listener: (event: SSEEvent) => void) {
    this.on(`user:${userId}`, listener);
    return () => this.off(`user:${userId}`, listener);
  }

  onRoleEvent(role: string, listener: (event: SSEEvent) => void) {
    this.on(`role:${role}`, listener);
    return () => this.off(`role:${role}`, listener);
  }
}

export const eventBus = SSEEventBus.getInstance();

export function broadcastEvent(event: Omit<SSEEvent, 'timestamp'>) {
  const schoolId = event.schoolId ?? (event.payload?.schoolId as number | undefined) ?? undefined;
  eventBus.broadcast({ ...event, schoolId, timestamp: new Date().toISOString() });
}
