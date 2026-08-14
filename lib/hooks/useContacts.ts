import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../auth-context";

export interface Contact {
  id: string;
  user_id: string;
  contact_type: "historical" | "active";
  name: string;
  company?: string;
  designation?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  industry?: string;
  created_at: string;
  updated_at: string;
}

export interface DuplicateMatch {
  existingContact: Contact;
  matchType: "phone" | "email" | "name_company" | "fuzzy";
  confidence: number;
}

export function useContacts(filters?: { eventId?: string; contactType?: "historical" | "active" }) {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadContacts = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase.from("contacts").select("*").eq("user_id", user.id);

      if (filters?.contactType) {
        query = query.eq("contact_type", filters.contactType);
      }

      const { data, error: err } = await query.order("created_at", { ascending: false });

      if (err) throw err;
      setContacts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load contacts");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, [user, filters?.contactType]);

  const checkForDuplicates = async (contact: Partial<Contact>): Promise<DuplicateMatch[]> => {
    if (!user) throw new Error("User not authenticated");

    const matches: DuplicateMatch[] = [];

    // Check exact phone match
    if (contact.phone) {
      const normalized = normalizePhone(contact.phone);
      const { data } = await supabase
        .from("contacts")
        .select("*")
        .eq("user_id", user.id)
        .filter("phone", "ilike", `%${normalized}%`);

      if (data && data.length > 0) {
        matches.push({
          existingContact: data[0],
          matchType: "phone",
          confidence: 0.99,
        });
      }
    }

    // Check exact email match
    if (contact.email && matches.length === 0) {
      const normalized = normalizeEmail(contact.email);
      const { data } = await supabase
        .from("contacts")
        .select("*")
        .eq("user_id", user.id)
        .eq("email", normalized);

      if (data && data.length > 0) {
        matches.push({
          existingContact: data[0],
          matchType: "email",
          confidence: 0.98,
        });
      }
    }

    // Check name + company match
    if (contact.name && contact.company && matches.length === 0) {
      const { data } = await supabase
        .from("contacts")
        .select("*")
        .eq("user_id", user.id)
        .ilike("name", `%${contact.name}%`)
        .ilike("company", `%${contact.company}%`);

      if (data && data.length > 0) {
        matches.push({
          existingContact: data[0],
          matchType: "name_company",
          confidence: 0.85,
        });
      }
    }

    return matches;
  };

  const createContact = async (contactData: Omit<Contact, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (!user) throw new Error("User not authenticated");

    const { data, error: err } = await supabase
      .from("contacts")
      .insert([{ ...contactData, user_id: user.id }])
      .select()
      .single();

    if (err) throw err;
    await loadContacts();
    return data;
  };

  const updateContact = async (contactId: string, updates: Partial<Contact>) => {
    const { data, error: err } = await supabase
      .from("contacts")
      .update(updates)
      .eq("id", contactId)
      .eq("user_id", user?.id)
      .select()
      .single();

    if (err) throw err;
    await loadContacts();
    return data;
  };

  const deleteContact = async (contactId: string) => {
    const { error: err } = await supabase
      .from("contacts")
      .delete()
      .eq("id", contactId)
      .eq("user_id", user?.id);

    if (err) throw err;
    await loadContacts();
  };

  const searchContacts = async (query: string) => {
    if (!user) throw new Error("User not authenticated");

    const { data, error: err } = await supabase
      .from("contacts")
      .select("*")
      .eq("user_id", user.id)
      .or(
        `name.ilike.%${query}%,company.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%,industry.ilike.%${query}%`
      );

    if (err) throw err;
    return data || [];
  };

  return {
    contacts,
    isLoading,
    error,
    createContact,
    updateContact,
    deleteContact,
    checkForDuplicates,
    searchContacts,
    refetch: loadContacts,
  };
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "").slice(-10);
}

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}
