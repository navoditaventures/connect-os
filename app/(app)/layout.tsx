"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Navigation from "@/components/navigation";
import SyncStatus from "@/components/sync-status";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin">
          <div className="h-8 w-8 border-4 border-gray-200 border-t-black rounded-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="flex-1 overflow-auto pb-20 md:pb-0">{children}</div>
      <SyncStatus />
      <Navigation />
    </div>
  );
}
