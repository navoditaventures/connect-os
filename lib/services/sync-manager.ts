import { OfflineQueue, QueuedItem } from "./offline-queue";
import { supabase } from "../supabase";

export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  errors: Array<{ itemId: string; error: string }>;
}

export async function syncOfflineQueue(userId: string): Promise<SyncResult> {
  const queue = OfflineQueue.getQueue();
  const pending = queue.filter((item) => item.status === "pending");

  if (pending.length === 0) {
    return { success: true, synced: 0, failed: 0, errors: [] };
  }

  const result: SyncResult = {
    success: true,
    synced: 0,
    failed: 0,
    errors: [],
  };

  for (const item of pending) {
    try {
      OfflineQueue.updateStatus(item.id, "syncing");

      if (item.type === "contact") {
        const { error } = await supabase
          .from("contacts")
          .insert([{ ...item.data, user_id: userId }]);

        if (error) throw error;
      } else if (item.type === "interaction") {
        const { error } = await supabase
          .from("interactions")
          .insert([{ ...item.data, user_id: userId }]);

        if (error) throw error;
      }

      OfflineQueue.removeFromQueue(item.id);
      result.synced++;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Sync failed";
      OfflineQueue.updateStatus(item.id, "failed", errorMessage);
      result.failed++;
      result.errors.push({ itemId: item.id, error: errorMessage });
      result.success = false;
    }
  }

  return result;
}

export async function retrySyncFailed(userId: string): Promise<SyncResult> {
  const queue = OfflineQueue.getQueue();
  const failed = queue.filter((item) => item.status === "failed");

  // Reset failed items to pending for retry
  for (const item of failed) {
    OfflineQueue.updateStatus(item.id, "pending");
  }

  // Run sync again
  return syncOfflineQueue(userId);
}

export function getQueueStatus() {
  const queue = OfflineQueue.getQueue();

  return {
    total: queue.length,
    pending: queue.filter((i) => i.status === "pending").length,
    syncing: queue.filter((i) => i.status === "syncing").length,
    failed: queue.filter((i) => i.status === "failed").length,
    queue,
  };
}
