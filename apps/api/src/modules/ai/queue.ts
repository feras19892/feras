type QueueTask<T> = (signal?: AbortSignal) => Promise<T>;

interface QueueItem<T> {
  task: QueueTask<T>;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
}

const MAX_CONCURRENT = 1;
const QUEUE_TIMEOUT_MS = 120_000;

let running = 0;
const queue: QueueItem<unknown>[] = [];

function processQueue() {
  while (running < MAX_CONCURRENT && queue.length > 0) {
    const item = queue.shift()!;
    running++;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), QUEUE_TIMEOUT_MS);
    Promise.race([
      item.task(controller.signal),
      new Promise<never>((_, reject) => {
        controller.signal.addEventListener('abort', () => {
          reject(new Error('AI request timed out in queue'));
        });
      }),
    ])
      .then(item.resolve)
      .catch(item.reject)
      .finally(() => {
        clearTimeout(timer);
        running--;
        processQueue();
      });
  }
}

export function enqueueAI<T>(task: QueueTask<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const item: QueueItem<T> = { task, resolve, reject };
    queue.push(item as QueueItem<unknown>);
    processQueue();
  });
}

export function getQueueLength(): number {
  return queue.length;
}

export function getRunningCount(): number {
  return running;
}
