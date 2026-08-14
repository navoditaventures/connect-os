"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { OfflineQueue, useConnectionStatus } from "@/lib/services/offline-queue";
import { syncOfflineQueue, getQueueStatus, retrySyncFailed, SyncResult } from "@/lib/services/sync-manager";

export default function SyncStatus() {
  const { user } = useAuth();
  const { isOnline } = useConnectionStatus();
  const [queueStatus, setQueueStatus] = useState({ total: 0, pending: 0, syncing: 0, failed: 0 });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  useEffect(() => {
    const updateStatus = () => {
      const status = getQueueStatus();
      setQueueStatus(status);
    };

    updateStatus();

    // Check for updates
    const interval = setInterval(updateStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOnline && queueStatus.pending > 0 && !isSyncing && user) {
      performSync();
    }
  }, [isOnline, queueStatus.pending, isSyncing, user]);

  const performSync = async () => {
    if (!user || isSyncing) return;

    setIsSyncing(true);
    setSyncMessage("Syncing...");

    try {
      const result = await syncOfflineQueue(user.id);

      if (result.success) {
        setSyncMessage(`✓ Synced ${result.synced} items`);
      } else {
        setSyncMessage(`✓ Synced ${result.synced}, failed: ${result.failed}`);
      }

      setTimeout(() => setSyncMessage(""), 3000);

      // Refresh status
      const status = getQueueStatus();
      setQueueStatus(status);
    } catch (error) {
      setSyncMessage("Sync error - will retry");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRetry = async () => {
    if (!user) return;
    setIsSyncing(true);
    setSyncMessage("Retrying failed items...");

    try {
      const result = await retrySyncFailed(user.id);
      setSyncMessage(`✓ Retry complete: ${result.synced} synced`);
      const status = getQueueStatus();
      setQueueStatus(status);
      setTimeout(() => setSyncMessage(""), 3000);
    } catch (error) {
      setSyncMessage("Retry failed");
    } finally {
      setIsSyncing(false);
    }
  };

  // Don't show if everything is synced and connection is good
  if (isOnline && queueStatus.total === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-24 md:bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!isOnline ? (
              <>
                <span className="text-lg">📡</span>
                <div>
                  <p className="font-medium text-sm">Offline Mode</p>
                  <p className="text-xs text-gray-600">
                    {queueStatus.pending} {queueStatus.pending === 1 ? "card" : "cards"} waiting to sync
                  </p>
                </div>
              </>
            ) : queueStatus.pending > 0 ? (
              <>
                <span className="text-lg animate-spin">⟳</span>
                <div>
                  <p className="font-medium text-sm">Syncing...</p>
                  <p className="text-xs text-gray-600">
                    {queueStatus.syncing} syncing, {queueStatus.pending} pending
                  </p>
                </div>
              </>
            ) : queueStatus.failed > 0 ? (
              <>
                <span className="text-lg">⚠️</span>
                <div>
                  <p className="font-medium text-sm">Sync Failed</p>
                  <p className="text-xs text-gray-600">
                    {queueStatus.failed} {queueStatus.failed === 1 ? "item" : "items"} failed
                  </p>
                </div>
              </>
            ) : (
              <>
                <span className="text-lg">✓</span>
                <div>
                  <p className="font-medium text-sm">All Synced</p>
                  <p className="text-xs text-gray-600">Your data is up to date</p>
                </div>
              </>
            )}
          </div>

          <div className="flex gap-2">
            {queueStatus.failed > 0 && !isSyncing && (
              <button
                onClick={handleRetry}
                className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
              >
                Retry
              </button>
            )}
            {syncMessage && (
              <span className="text-xs text-green-600 font-medium">{syncMessage}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
