import React from "react";
import { Contact } from "../hooks/useContacts";
import { Interaction } from "../hooks/useInteractions";

export interface QueuedItem {
  id: string;
  type: "contact" | "interaction";
  data: Partial<Contact> | Partial<Interaction>;
  timestamp: number;
  status: "pending" | "syncing" | "failed";
  errorMessage?: string;
}

const QUEUE_STORAGE_KEY = "connectos_offline_queue";
const MAX_RETRIES = 3;

export class OfflineQueue {
  static getQueue(): QueuedItem[] {
    if (typeof window === "undefined") return [];

    try {
      const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  static addToQueue(type: "contact" | "interaction", data: any): QueuedItem {
    const item: QueuedItem = {
      id: `${type}-${Date.now()}-${Math.random()}`,
      type,
      data,
      timestamp: Date.now(),
      status: "pending",
    };

    const queue = this.getQueue();
    queue.push(item);
    this.saveQueue(queue);

    return item;
  }

  static updateStatus(itemId: string, status: "pending" | "syncing" | "failed", error?: string) {
    const queue = this.getQueue();
    const item = queue.find((i) => i.id === itemId);

    if (item) {
      item.status = status;
      if (error) item.errorMessage = error;
      this.saveQueue(queue);
    }
  }

  static removeFromQueue(itemId: string) {
    const queue = this.getQueue();
    const filtered = queue.filter((i) => i.id !== itemId);
    this.saveQueue(filtered);
  }

  static clearQueue() {
    localStorage.removeItem(QUEUE_STORAGE_KEY);
  }

  static getPendingCount(): number {
    return this.getQueue().filter((i) => i.status === "pending").length;
  }

  static hasFailedItems(): boolean {
    return this.getQueue().some((i) => i.status === "failed");
  }

  private static saveQueue(queue: QueuedItem[]) {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error("Failed to save offline queue:", error);
    }
  }
}

export function useConnectionStatus() {
  if (typeof window === "undefined") {
    return { isOnline: true, isChecking: false };
  }

  const [isOnline, setIsOnline] = React.useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [isChecking, setIsChecking] = React.useState(false);

  React.useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setIsChecking(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isOnline, isChecking };
}
