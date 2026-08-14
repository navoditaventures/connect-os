"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState({
    totalContacts: 0,
    eventsAttended: 0,
    pendingFollowups: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!user) return;

      try {
        const [contacts, events, interactions] = await Promise.all([
          supabase.from("contacts").select("id", { count: "exact" }).eq("user_id", user.id),
          supabase.from("events").select("id", { count: "exact" }).eq("user_id", user.id),
          supabase
            .from("interactions")
            .select("id", { count: "exact" })
            .eq("user_id", user.id)
            .eq("follow_up_status", "pending"),
        ]);

        setStats({
          totalContacts: contacts.count || 0,
          eventsAttended: events.count || 0,
          pendingFollowups: interactions.count || 0,
        });
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8 mt-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Welcome back!</h1>
          <p className="text-gray-600">{user?.email}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          Sign out
        </button>
      </div>

      <Link
        href="/scanner"
        className="block w-full bg-black text-white text-center py-8 px-6 rounded-lg font-bold text-xl mb-8 hover:bg-gray-800 transition-colors"
      >
        📸 SCAN BUSINESS CARD
      </Link>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-2xl font-bold">{isLoading ? "-" : stats.totalContacts}</div>
          <div className="text-sm text-gray-600">Contacts</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-2xl font-bold">{isLoading ? "-" : stats.eventsAttended}</div>
          <div className="text-sm text-gray-600">Events</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-2xl font-bold">{isLoading ? "-" : stats.pendingFollowups}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <Link
          href="/events/new"
          className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <div className="font-semibold">Start New Event</div>
          <div className="text-sm text-gray-600">Begin capturing contacts at an event</div>
        </Link>
        <Link
          href="/import"
          className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <div className="font-semibold">Import Historical Cards</div>
          <div className="text-sm text-gray-600">Digitize your existing business card collection</div>
        </Link>
      </div>
    </div>
  );
}
