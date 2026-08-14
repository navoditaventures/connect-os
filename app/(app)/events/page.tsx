"use client";

import { useState } from "react";
import { useEvents } from "@/lib/hooks/useEvents";
import EventCreateDialog from "@/components/event-create-dialog";
import EventList from "@/components/event-list";
import Button from "@/components/button";

export default function Events() {
  const { events, isLoading } = useEvents();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

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
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: "var(--color-foreground)" }}>
              Events
            </h1>
            <p style={{ color: "var(--color-muted-foreground)", fontSize: "0.875rem" }}>
              {events.length} total event{events.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowCreateDialog(true)}
          >
            ➕ New Event
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <EventList events={events} isLoading={isLoading} />
      </div>

      <EventCreateDialog isOpen={showCreateDialog} onClose={() => setShowCreateDialog(false)} />
    </div>
  );
}
