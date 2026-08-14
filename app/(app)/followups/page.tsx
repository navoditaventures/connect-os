"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { useInteractions } from "@/lib/hooks/useInteractions";

interface FollowUpItem {
  id: string;
  contact_id: string;
  contact_name: string;
  contact_company?: string;
  follow_up_date: string;
  follow_up_status: string;
  relationship: string;
  opportunity?: string;
  stage: string;
  notes?: string;
}

export default function Followups() {
  const { user } = useAuth();
  const { updateInteraction } = useInteractions();
  const [followUps, setFollowUps] = useState<FollowUpItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "completed" | "all">("pending");

  useEffect(() => {
    const loadFollowUps = async () => {
      if (!user) return;
      setIsLoading(true);

      try {
        const { data, error: err } = await supabase
          .from("interactions")
          .select(
            `
            id,
            contact_id,
            follow_up_date,
            follow_up_status,
            relationship,
            opportunity,
            stage,
            notes,
            contacts!inner(id, name, company)
          `
          )
          .eq("user_id", user.id)
          .not("follow_up_date", "is", null)
          .order("follow_up_date", { ascending: true });

        if (err) throw err;

        const formatted = (data || [])
          .map((item: any) => ({
            id: item.id,
            contact_id: item.contact_id,
            contact_name: item.contacts.name,
            contact_company: item.contacts.company,
            follow_up_date: item.follow_up_date,
            follow_up_status: item.follow_up_status,
            relationship: item.relationship,
            opportunity: item.opportunity,
            stage: item.stage,
            notes: item.notes,
          }))
          .filter((item) => {
            if (filter === "pending") return item.follow_up_status === "pending";
            if (filter === "completed") return item.follow_up_status === "completed";
            return true;
          });

        setFollowUps(formatted);
      } catch (error) {
        console.error("Error loading follow-ups:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFollowUps();
  }, [user, filter]);

  const handleMarkComplete = async (interactionId: string) => {
    try {
      await updateInteraction(interactionId, { follow_up_status: "completed" });
      setFollowUps((prev) =>
        prev.map((item) =>
          item.id === interactionId ? { ...item, follow_up_status: "completed" } : item
        )
      );
    } catch (error) {
      console.error("Failed to update follow-up:", error);
    }
  };

  const handleMarkPending = async (interactionId: string) => {
    try {
      await updateInteraction(interactionId, { follow_up_status: "pending" });
      setFollowUps((prev) =>
        prev.map((item) =>
          item.id === interactionId ? { ...item, follow_up_status: "pending" } : item
        )
      );
    } catch (error) {
      console.error("Failed to update follow-up:", error);
    }
  };

  const pendingCount = followUps.filter((f) => f.follow_up_status === "pending").length;
  const completedCount = followUps.filter((f) => f.follow_up_status === "completed").length;
  const overdueCount = followUps.filter(
    (f) => f.follow_up_status === "pending" && new Date(f.follow_up_date) < new Date()
  ).length;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 mt-6">Follow-ups</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{pendingCount}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
          <div className="text-sm text-gray-600">Overdue</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{completedCount}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {(["pending", "completed", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              filter === f
                ? "bg-black text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {f === "pending"
              ? "Pending"
              : f === "completed"
                ? "Completed"
                : "All"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg p-4 border border-gray-200 animate-pulse h-24" />
          ))}
        </div>
      ) : followUps.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">
            {filter === "pending"
              ? "No pending follow-ups"
              : filter === "completed"
                ? "No completed follow-ups"
                : "No follow-ups scheduled"}
          </p>
          <Link href="/contacts" className="text-blue-600 hover:underline">
            Manage contacts →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {followUps.map((followUp) => {
            const isOverdue =
              followUp.follow_up_status === "pending" &&
              new Date(followUp.follow_up_date) < new Date();

            return (
              <Link
                key={followUp.id}
                href={`/contacts/${followUp.contact_id}`}
                className={`block p-4 border rounded-lg transition-all ${
                  isOverdue
                    ? "bg-red-50 border-red-300 hover:border-red-400"
                    : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold">{followUp.contact_name}</p>
                    {followUp.contact_company && (
                      <p className="text-sm text-gray-600">{followUp.contact_company}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {followUp.follow_up_status === "pending" ? (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleMarkComplete(followUp.id);
                        }}
                        className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 font-medium"
                      >
                        Mark Done
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleMarkPending(followUp.id);
                        }}
                        className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 font-medium"
                      >
                        Reopen
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Follow-up Date</p>
                    <p className="font-medium">
                      {new Date(followUp.follow_up_date).toLocaleDateString()}
                      {isOverdue && <span className="text-red-600 font-bold"> (overdue)</span>}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Relationship</p>
                    <p className="font-medium">{followUp.relationship}</p>
                  </div>
                </div>

                {followUp.opportunity && (
                  <div className="text-xs mb-2">
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      {followUp.opportunity}
                    </span>
                  </div>
                )}

                {followUp.notes && (
                  <p className="text-xs text-gray-600 italic">"{followUp.notes}"</p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
