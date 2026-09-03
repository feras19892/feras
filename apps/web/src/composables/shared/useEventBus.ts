import mitt from 'mitt'

export type AppEvents = {
  'report:graded': { reportId: number; studentId: number }
  'report:submitted': { reportId: number; classId: string }
  'user:banned': { userId: number }
  'user:unbanned': { userId: number }
  'class:created': { classId: string }
  'class:updated': { classId: string }
  'class:frozen': { classId: string }
  'notification:new': { id: number; type: string; title: string; message?: string; class_id?: string }
  'cache:invalidate': { pattern: string }
  'admin:view-user': { userId: number }
  'admin:switch-tab': { tabId: string }
  'admin:action': { id: string; tabId: string }
  'school:switch-tab': { tabId: string }
  'teacher:switch-tab': { tabId: string }
  'student:switch-tab': { tabId: string }
  'api:request-start': void
  'api:request-end': void
  'quiz:force-start': { quizId: number; title: string; classId: string }
  'quiz:force-dismiss': void
  'chat:unread-updated': void
  'dashboard:refresh': void
}

export const eventBus = mitt<AppEvents>()

export function useEventBus() {
  return { eventBus }
}

/** Register a listener and return an unsubscribe function (mitt's on() returns void). */
export function subscribeEvent<K extends keyof AppEvents>(
  event: K,
  handler: (payload: AppEvents[K]) => void,
): () => void {
  eventBus.on(event, handler);
  return () => eventBus.off(event, handler);
}
