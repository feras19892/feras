import { sendPendingNotifications } from './queue.js';

export async function runSubscriptionScheduler() {
  await sendPendingNotifications();
}
