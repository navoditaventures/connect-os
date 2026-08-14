import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../auth-context";

export interface Event {
  id: string;
  user_id: string;
  name: string;
  date: string;
  location?: string;
  description?: string;
  status: "active" | "completed";
  contact_count?: number;
  created_at: string;
  updated_at: string;
}

export function useEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: err } = await supabase
        .from("events")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (err) throw err;
      setEvents(data || []);

      const active = data?.find((e) => e.status === "active");
      setActiveEvent(active || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [user]);

  const createEvent = async (eventData: Omit<Event, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (!user) throw new Error("User not authenticated");

    const { data, error: err } = await supabase
      .from("events")
      .insert([{ ...eventData, user_id: user.id }])
      .select()
      .single();

    if (err) throw err;
    await loadEvents();
    return data;
  };

  const startEvent = async (eventId: string) => {
    const { error: err } = await supabase
      .from("events")
      .update({ status: "active" })
      .eq("id", eventId)
      .eq("user_id", user?.id);

    if (err) throw err;
    await loadEvents();
  };

  const endEvent = async (eventId: string) => {
    const { error: err } = await supabase
      .from("events")
      .update({ status: "completed" })
      .eq("id", eventId)
      .eq("user_id", user?.id);

    if (err) throw err;
    await loadEvents();
  };

  const deleteEvent = async (eventId: string) => {
    const { error: err } = await supabase
      .from("events")
      .delete()
      .eq("id", eventId)
      .eq("user_id", user?.id);

    if (err) throw err;
    await loadEvents();
  };

  return {
    events,
    activeEvent,
    isLoading,
    error,
    createEvent,
    startEvent,
    endEvent,
    deleteEvent,
    refetch: loadEvents,
  };
}
