"use client";

import { useState } from "react";
import { useEvents } from "@/lib/hooks/useEvents";
import EventCreateDialog from "@/components/event-create-dialog";
import EventList from "@/components/event-list";

export default function Events() {
  const { events, isLoading } = useEvents();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6 mt-6">
        <h1 className="text-3xl font-bold">Events</h1>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 text-sm font-medium"
        >
          + New Event
        </button>
      </div>

      <EventList events={events} isLoading={isLoading} />

      <EventCreateDialog isOpen={showCreateDialog} onClose={() => setShowCreateDialog(false)} />
    </div>
  );
}
