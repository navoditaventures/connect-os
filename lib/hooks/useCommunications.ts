import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../auth-context";

export interface Communication {
  id: string;
  user_id: string;
  contact_id: string;
  interaction_id?: string;
  channel: "whatsapp" | "email" | "call" | "other";
  template_id?: string;
  status: "sent" | "pending" | "failed";
  sent_at?: string;
  created_at: string;
}

export function useCommunications(contactId?: string) {
  const { user } = useAuth();
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCommunications = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase.from("communications").select("*").eq("user_id", user.id);

      if (contactId) {
        query = query.eq("contact_id", contactId);
      }

      const { data, error: err } = await query.order("created_at", { ascending: false });

      if (err) throw err;
      setCommunications(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load communications");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCommunications();
  }, [user, contactId]);

  const createCommunication = async (
    communicationData: Omit<Communication, "id" | "user_id" | "created_at">
  ) => {
    if (!user) throw new Error("User not authenticated");

    const { data, error: err } = await supabase
      .from("communications")
      .insert([{ ...communicationData, user_id: user.id }])
      .select()
      .single();

    if (err) throw err;
    await loadCommunications();
    return data;
  };

  const updateCommunication = async (
    communicationId: string,
    updates: Partial<Communication>
  ) => {
    const { data, error: err } = await supabase
      .from("communications")
      .update(updates)
      .eq("id", communicationId)
      .eq("user_id", user?.id)
      .select()
      .single();

    if (err) throw err;
    await loadCommunications();
    return data;
  };

  return {
    communications,
    isLoading,
    error,
    createCommunication,
    updateCommunication,
    refetch: loadCommunications,
  };
}
