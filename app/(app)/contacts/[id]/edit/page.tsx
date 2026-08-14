"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { useContacts, Contact } from "@/lib/hooks/useContacts";
import ContactForm from "@/components/contact-form";

export default function EditContact({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const { updateContact } = useContacts();

  const [contact, setContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadContact = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("id", params.id)
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Failed to load contact:", error);
        router.back();
        return;
      }

      setContact(data);
      setIsLoading(false);
    };

    loadContact();
  }, [params.id, user, router]);

  const handleSubmit = async (data: Partial<Contact>) => {
    setIsSubmitting(true);

    try {
      await updateContact(params.id, data);
      router.push(`/contacts/${params.id}`);
    } catch (err) {
      console.error("Failed to update contact:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4 mt-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/2" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="max-w-2xl mx-auto p-4 mt-6 text-center">
        <p className="text-gray-600">Contact not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 mt-6">Edit Contact</h1>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <ContactForm
          contact={contact}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
