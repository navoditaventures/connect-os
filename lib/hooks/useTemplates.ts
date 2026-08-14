import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../auth-context";

export interface MessageTemplate {
  id: string;
  user_id: string;
  name: string;
  content: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

const DEFAULT_TEMPLATES = [
  {
    name: "General Introduction",
    content: `Hi {{first_name}},

Great meeting you at {{event_name}}.

I'm Vinay from Navodita. We help businesses with branding, creative design, websites and digital solutions.

Here's my digital profile and portfolio:

{{digital_profile_url}}

Would be great to stay connected.`,
    is_default: true,
  },
  {
    name: "Potential Client",
    content: `Hi {{first_name}},

It was great meeting you at {{event_name}}.

I enjoyed learning a little about {{company_name}}.

I'm sharing my digital profile and portfolio here so you can have a quick look at what we do at Navodita:

{{digital_profile_url}}

Would be happy to continue our conversation whenever convenient.`,
    is_default: true,
  },
  {
    name: "Referral Partner",
    content: `Hi {{first_name}},

Really enjoyed meeting you at {{event_name}}.

I thought it would be good for us to stay connected, especially since there could be opportunities where we can refer business to each other.

Here's my digital profile:

{{digital_profile_url}}

Looking forward to staying connected.`,
    is_default: true,
  },
];

export function useTemplates() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTemplates = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: err } = await supabase
        .from("message_templates")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (err) throw err;

      if (data && data.length === 0) {
        await initializeDefaultTemplates();
      } else {
        setTemplates(data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load templates");
    } finally {
      setIsLoading(false);
    }
  };

  const initializeDefaultTemplates = async () => {
    if (!user) return;

    try {
      const templateData = DEFAULT_TEMPLATES.map((t) => ({
        ...t,
        user_id: user.id,
      }));

      const { data, error: err } = await supabase
        .from("message_templates")
        .insert(templateData)
        .select();

      if (err) throw err;
      setTemplates(data || []);
    } catch (err) {
      console.error("Failed to initialize templates:", err);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [user]);

  const createTemplate = async (name: string, content: string) => {
    if (!user) throw new Error("User not authenticated");

    const { data, error: err } = await supabase
      .from("message_templates")
      .insert([{ user_id: user.id, name, content, is_default: false }])
      .select()
      .single();

    if (err) throw err;
    await loadTemplates();
    return data;
  };

  const updateTemplate = async (templateId: string, name: string, content: string) => {
    const { data, error: err } = await supabase
      .from("message_templates")
      .update({ name, content })
      .eq("id", templateId)
      .eq("user_id", user?.id)
      .select()
      .single();

    if (err) throw err;
    await loadTemplates();
    return data;
  };

  const deleteTemplate = async (templateId: string) => {
    const { error: err } = await supabase
      .from("message_templates")
      .delete()
      .eq("id", templateId)
      .eq("user_id", user?.id);

    if (err) throw err;
    await loadTemplates();
  };

  return {
    templates,
    isLoading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    refetch: loadTemplates,
  };
}
