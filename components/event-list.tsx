"use client";

import Link from "next/link";
import { Event } from "@/lib/hooks/useEvents";

interface EventListProps {
  events: Event[];
  isLoading: boolean;
  onEventClick?: (event: Event) => void;
}

export default function EventList({ events, isLoading, onEventClick }: EventListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg p-4 border border-gray-200 animate-pulse h-20" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">No events yet</p>
        <p className="text-sm text-gray-500">Create an event to start capturing contacts</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <button
          key={event.id}
          onClick={() => onEventClick?.(event)}
          className="w-full text-left bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold">{event.name}</h3>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                event.status === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {event.status === "active" ? "Active" : "Completed"}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            <p>📅 {new Date(event.date).toLocaleDateString()}</p>
            {event.location && <p>📍 {event.location}</p>}
            {event.contact_count !== undefined && (
              <p className="mt-2 font-medium">👥 {event.contact_count} contacts</p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
