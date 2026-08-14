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
    <div
      className="min-h-screen"
      style={{ background: "var(--color-background)" }}
    >
      {/* Header */}
      <div
        className="border-b"
        style={{
          borderColor: "var(--color-border)",
          background: "var(--color-card)"
        }}
      >
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold" style={{ color: "var(--color-foreground)" }}>
            Follow-ups
          </h1>
          <p style={{ color: "var(--color-muted-foreground)", fontSize: "0.875rem" }}>
            Manage and track follow-up communications
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div
            className="card p-6 rounded-lg border"
            style={{
              background: "var(--color-card)",
              borderColor: "var(--color-border)"
            }}
          >
            <div
              className="text-3xl font-bold mb-2"
              style={{ color: "var(--color-primary)" }}
            >
              {pendingCount}
            </div>
            <div style={{ color: "var(--color-muted-foreground)", fontSize: "0.875rem" }}>
              Pending
            </div>
          </div>
          <div
            className="card p-6 rounded-lg border"
            style={{
              background: "var(--color-card)",
              borderColor: "var(--color-border)"
            }}
          >
            <div
              className="text-3xl font-bold mb-2"
              style={{ color: "var(--color-destructive)" }}
            >
              {overdueCount}
            </div>
            <div style={{ color: "var(--color-muted-foreground)", fontSize: "0.875rem" }}>
              Overdue
            </div>
          </div>
          <div
            className="card p-6 rounded-lg border"
            style={{
              background: "var(--color-card)",
              borderColor: "var(--color-border)"
            }}
          >
            <div
              className="text-3xl font-bold mb-2"
              style={{ color: "var(--color-success)" }}
            >
              {completedCount}
            </div>
            <div style={{ color: "var(--color-muted-foreground)", fontSize: "0.875rem" }}>
              Completed
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-3 mb-8 flex-wrap">
          {(["pending", "completed", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background:
                  filter === f ? "var(--color-primary)" : "var(--color-muted)",
                color:
                  filter === f
                    ? "var(--color-on-primary)"
                    : "var(--color-muted-foreground)",
                border: `1px solid ${
                  filter === f ? "var(--color-primary)" : "var(--color-border)"
                }`
              }}
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
              <div
                key={i}
                className="rounded-lg p-6 border animate-pulse h-24"
                style={{
                  background: "var(--color-card)",
                  borderColor: "var(--color-border)"
                }}
              />
            ))}
          </div>
        ) : followUps.length === 0 ? (
          <div className="text-center py-12">
            <p
              className="mb-4"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              {filter === "pending"
                ? "No pending follow-ups"
                : filter === "completed"
                  ? "No completed follow-ups"
                  : "No follow-ups scheduled"}
            </p>
            <Link
              href="/contacts"
              className="inline-block font-medium transition-all hover:gap-1 flex items-center gap-1"
              style={{ color: "var(--color-primary)" }}
            >
              Manage contacts →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {followUps.map((followUp) => {
              const isOverdue =
                followUp.follow_up_status === "pending" &&
                new Date(followUp.follow_up_date) < new Date();

              return (
                <Link
                  key={followUp.id}
                  href={`/contacts/${followUp.contact_id}`}
                  className="block p-6 rounded-lg border transition-all duration-200 hover:scale-102"
                  style={{
                    background: isOverdue ? "rgba(220, 38, 38, 0.05)" : "var(--color-card)",
                    borderColor: isOverdue
                      ? "var(--color-destructive)"
                      : "var(--color-border)",
                    borderLeft: isOverdue
                      ? "4px solid var(--color-destructive)"
                      : "4px solid var(--color-primary)"
                  }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p
                        className="font-semibold"
                        style={{ color: "var(--color-foreground)" }}
                      >
                        {followUp.contact_name}
                      </p>
                      {followUp.contact_company && (
                        <p
                          style={{
                            fontSize: "0.875rem",
                            color: "var(--color-muted-foreground)"
                          }}
                        >
                          {followUp.contact_company}
                        </p>
                      )}
                    </div>
                    <div>
                      {followUp.follow_up_status === "pending" ? (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleMarkComplete(followUp.id);
                          }}
                          className="text-xs px-3 py-1.5 rounded font-medium transition-all hover:scale-105 active:scale-95"
                          style={{
                            background: "rgba(16, 185, 129, 0.1)",
                            color: "#10B981"
                          }}
                        >
                          Mark Done
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleMarkPending(followUp.id);
                          }}
                          className="text-xs px-3 py-1.5 rounded font-medium transition-all hover:scale-105 active:scale-95"
                          style={{
                            background: "var(--color-muted)",
                            color: "var(--color-muted-foreground)",
                            border: "1px solid var(--color-border)"
                          }}
                        >
                          Reopen
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--color-muted-foreground)",
                          marginBottom: "0.25rem"
                        }}
                      >
                        Follow-up Date
                      </p>
                      <p
                        className="font-medium"
                        style={{ color: "var(--color-foreground)" }}
                      >
                        {new Date(followUp.follow_up_date).toLocaleDateString()}
                        {isOverdue && (
                          <span
                            style={{
                              color: "var(--color-destructive)",
                              fontWeight: "bold",
                              marginLeft: "0.5rem"
                            }}
                          >
                            (overdue)
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--color-muted-foreground)",
                          marginBottom: "0.25rem"
                        }}
                      >
                        Relationship
                      </p>
                      <p
                        className="font-medium"
                        style={{ color: "var(--color-foreground)" }}
                      >
                        {followUp.relationship}
                      </p>
                    </div>
                  </div>

                  {followUp.opportunity && (
                    <div className="mb-3">
                      <span
                        className="inline-block px-2 py-1 rounded text-xs font-medium"
                        style={{
                          background: "rgba(37, 99, 235, 0.1)",
                          color: "var(--color-primary)"
                        }}
                      >
                        {followUp.opportunity}
                      </span>
                    </div>
                  )}

                  {followUp.notes && (
                    <p
                      className="text-xs italic"
                      style={{ color: "var(--color-muted-foreground)" }}
                    >
                      "{followUp.notes}"
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
