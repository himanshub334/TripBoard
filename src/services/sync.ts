import type { SyncOperation } from '../types/trip';
import { loadQueue, saveQueue } from './storage';

export async function enqueue(operation: SyncOperation) {
  const queue = await loadQueue();
  await saveQueue([...queue, operation]);
}

/**
 * Demo sync worker.
 * Replace the simulated delivery below with authenticated API requests,
 * retry/backoff, idempotency, and conflict resolution in production.
 */
export async function flushQueue(): Promise<number> {
  const queue = await loadQueue();
  if (!queue.length) return 0;

  await new Promise((resolve) => setTimeout(resolve, 250));
  await saveQueue([]);
  return queue.length;
}
