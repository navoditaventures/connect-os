"use client";

import { useState } from "react";
import { Contact, useContacts, DuplicateMatch } from "@/lib/hooks/useContacts";

interface ContactFormProps {
  contact?: Contact;
  onSubmit: (data: Partial<Contact>) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  showDuplicateWarning?: boolean;
  duplicates?: DuplicateMatch[];
}

export default function ContactForm({
  contact,
  onSubmit,
  onCancel,
  isSubmitting = false,
  showDuplicateWarning = false,
  duplicates = [],
}: ContactFormProps) {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const contactType = (formData.get("contact_type") as string) || "active";

    try {
      await onSubmit({
        contact_type: contactType as "historical" | "active",
        name: formData.get("name") as string,
        company: (formData.get("company") as string) || undefined,
        designation: (formData.get("designation") as string) || undefined,
        phone: (formData.get("phone") as string) || undefined,
        whatsapp: (formData.get("whatsapp") as string) || undefined,
        email: (formData.get("email") as string) || undefined,
        address: (formData.get("address") as string) || undefined,
        industry: (formData.get("industry") as string) || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save contact");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

      {showDuplicateWarning && duplicates.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="font-semibold text-yellow-900 mb-2">Existing Contact Found</p>
          {duplicates.map((dup, i) => (
            <div key={i} className="text-sm text-yellow-800">
              <p>
                <strong>{dup.existingContact.name}</strong> - {dup.existingContact.company}
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Match type: {dup.matchType} ({Math.round(dup.confidence * 100)}%)
              </p>
            </div>
          ))}
          <p className="text-xs text-yellow-700 mt-2">Continue to create new contact or edit existing one</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Full Name *</label>
          <input
            type="text"
            name="name"
            defaultValue={contact?.name || ""}
            required
            placeholder="John Doe"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Company</label>
          <input
            type="text"
            name="company"
            defaultValue={contact?.company || ""}
            placeholder="Company Name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Designation</label>
          <input
            type="text"
            name="designation"
            defaultValue={contact?.designation || ""}
            placeholder="CEO"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            type="tel"
            name="phone"
            defaultValue={contact?.phone || ""}
            placeholder="+91 98765 43210"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">WhatsApp</label>
          <input
            type="tel"
            name="whatsapp"
            defaultValue={contact?.whatsapp || ""}
            placeholder="+91 98765 43210"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            defaultValue={contact?.email || ""}
            placeholder="john@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Address</label>
          <input
            type="text"
            name="address"
            defaultValue={contact?.address || ""}
            placeholder="123 Main St, City"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Industry</label>
          <input
            type="text"
            name="industry"
            defaultValue={contact?.industry || ""}
            placeholder="Technology"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {!contact && (
          <div>
            <label className="block text-sm font-medium mb-1">Contact Type</label>
            <select
              name="contact_type"
              defaultValue="active"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="active">Active</option>
              <option value="historical">Historical</option>
            </select>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : contact ? "Update Contact" : "Create Contact"}
        </button>
      </div>
    </form>
  );
}
