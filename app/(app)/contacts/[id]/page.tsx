"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { useInteractions } from "@/lib/hooks/useInteractions";
import { Contact } from "@/lib/hooks/useContacts";
import InteractionEditor from "@/components/interaction-editor";
import Link from "next/link";

export default function ContactDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const { interactions, isLoading: interactionsLoading, refetch } = useInteractions(params.id);

  const [contact, setContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showInteractionEditor, setShowInteractionEditor] = useState(false);

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

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this contact?")) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("contacts")
        .delete()
        .eq("id", params.id)
        .eq("user_id", user?.id);

      if (error) throw error;
      router.push("/contacts");
    } catch (err) {
      console.error("Failed to delete contact:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4 mt-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/2" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="max-w-2xl mx-auto p-4 mt-6 text-center">
        <p className="text-gray-600">Contact not found</p>
        <Link href="/contacts" className="text-blue-600 hover:underline mt-4 inline-block">
          Back to contacts
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-start mt-6 mb-6">
        <div>
          <h1 className="text-3xl font-bold">{contact.name}</h1>
          {contact.company && <p className="text-gray-600">{contact.company}</p>}
          {contact.designation && <p className="text-sm text-gray-500">{contact.designation}</p>}
        </div>
        <div className="flex gap-2">
          <Link
            href={`/contacts/${params.id}/edit`}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold mb-4">Contact Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contact.email && (
            <div>
              <p className="text-xs text-gray-500 uppercase">Email</p>
              <p className="font-medium">{contact.email}</p>
            </div>
          )}
          {contact.phone && (
            <div>
              <p className="text-xs text-gray-500 uppercase">Phone</p>
              <p className="font-medium">{contact.phone}</p>
            </div>
          )}
          {contact.whatsapp && (
            <div>
              <p className="text-xs text-gray-500 uppercase">WhatsApp</p>
              <p className="font-medium">{contact.whatsapp}</p>
            </div>
          )}
          {contact.address && (
            <div>
              <p className="text-xs text-gray-500 uppercase">Address</p>
              <p className="font-medium">{contact.address}</p>
            </div>
          )}
          {contact.industry && (
            <div>
              <p className="text-xs text-gray-500 uppercase">Industry</p>
              <p className="font-medium">{contact.industry}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-500 uppercase">Type</p>
            <p className="font-medium capitalize">{contact.contact_type}</p>
          </div>
        </div>
      </div>

      {showInteractionEditor ? (
        <div className="mb-6">
          <InteractionEditor
            interaction={null}
            contactId={params.id}
            onSave={() => {
              setShowInteractionEditor(false);
              refetch();
            }}
            onCancel={() => setShowInteractionEditor(false)}
          />
        </div>
      ) : null}

      {!showInteractionEditor && interactions.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold mb-4">Current Relationship</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {interactions[0].relationship && (
              <div>
                <p className="text-xs text-gray-500 uppercase">Relationship</p>
                <p className="font-medium">{interactions[0].relationship}</p>
              </div>
            )}
            {interactions[0].opportunity && (
              <div>
                <p className="text-xs text-gray-500 uppercase">Opportunity</p>
                <p className="font-medium">{interactions[0].opportunity}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-500 uppercase">Stage</p>
              <p className="font-medium">{interactions[0].stage}</p>
            </div>
            {interactions[0].follow_up_date && (
              <div>
                <p className="text-xs text-gray-500 uppercase">Follow-up Date</p>
                <p className="font-medium">
                  {new Date(interactions[0].follow_up_date).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowInteractionEditor(true)}
            className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Edit relationship →
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold">Interaction History</h2>
          {!showInteractionEditor && (
            <button
              onClick={() => setShowInteractionEditor(true)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              + Add
            </button>
          )}
        </div>
        {interactionsLoading ? (
          <p className="text-gray-600">Loading interactions...</p>
        ) : interactions.length === 0 ? (
          <p className="text-gray-600">No interactions yet</p>
        ) : (
          <div className="space-y-4">
            {interactions.map((interaction) => (
              <div key={interaction.id} className="border-l-4 border-blue-200 pl-4 py-2">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <p className="font-medium text-sm">{interaction.relationship || "Interaction"}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(interaction.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    {interaction.stage}
                  </span>
                </div>
                {interaction.opportunity && (
                  <p className="text-xs text-gray-600 mb-1">
                    💼 <strong>{interaction.opportunity}</strong>
                  </p>
                )}
                {interaction.notes && (
                  <p className="text-sm text-gray-600 italic">"{interaction.notes}"</p>
                )}
                {interaction.follow_up_date && (
                  <p className="text-xs text-gray-500 mt-2">
                    📅 Follow-up: {new Date(interaction.follow_up_date).toLocaleDateString()}
                    {interaction.follow_up_status && (
                      <span className="ml-2 font-medium">
                        ({interaction.follow_up_status === "pending" ? "⏳ Pending" : "✓ Completed"})
                      </span>
                    )}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
