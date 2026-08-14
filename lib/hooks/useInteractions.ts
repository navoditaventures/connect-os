import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../auth-context";

export interface Interaction {
  id: string;
  user_id: string;
  contact_id: string;
  event_id?: string;
  interaction_type: string;
  relationship?: string;
  opportunity?: string;
  stage: "New" | "Contacted" | "Conversation" | "Opportunity" | "Client" | "Lost";
  notes?: string;
  follow_up_date?: string;
  follow_up_status: "pending" | "completed" | "not_required";
  created_at: string;
  updated_at: string;
}

export function useInteractions(contactId?: string) {
  const { user } = useAuth();
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInteractions = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase.from("interactions").select("*").eq("user_id", user.id);

      if (contactId) {
        query = query.eq("contact_id", contactId);
      }

      const { data, error: err } = await query.order("created_at", { ascending: false });

      if (err) throw err;
      setInteractions(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load interactions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInteractions();
  }, [user, contactId]);

  const createInteraction = async (
    interactionData: Omit<Interaction, "id" | "user_id" | "created_at" | "updated_at">
  ) => {
    if (!user) throw new Error("User not authenticated");

    const { data, error: err } = await supabase
      .from("interactions")
      .insert([{ ...interactionData, user_id: user.id }])
      .select()
      .single();

    if (err) throw err;
    await loadInteractions();
    return data;
  };

  const updateInteraction = async (interactionId: string, updates: Partial<Interaction>) => {
    const { data, error: err } = await supabase
      .from("interactions")
      .update(updates)
      .eq("id", interactionId)
      .eq("user_id", user?.id)
      .select()
      .single();

    if (err) throw err;
    await loadInteractions();
    return data;
  };

  const deleteInteraction = async (interactionId: string) => {
    const { error: err } = await supabase
      .from("interactions")
      .delete()
      .eq("id", interactionId)
      .eq("user_id", user?.id);

    if (err) throw err;
    await loadInteractions();
  };

  return {
    interactions,
    isLoading,
    error,
    createInteraction,
    updateInteraction,
    deleteInteraction,
    refetch: loadInteractions,
  };
}
