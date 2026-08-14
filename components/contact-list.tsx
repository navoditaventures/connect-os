"use client";

import { Contact } from "@/lib/hooks/useContacts";
import Link from "next/link";

interface ContactListProps {
  contacts: Contact[];
  isLoading: boolean;
  onContactClick?: (contact: Contact) => void;
}

export default function ContactList({ contacts, isLoading, onContactClick }: ContactListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white rounded-lg p-4 border border-gray-200 animate-pulse h-16" />
        ))}
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">No contacts yet</p>
        <p className="text-sm text-gray-500">Start by scanning business cards or importing historical contacts</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {contacts.map((contact) => (
        <Link
          key={contact.id}
          href={`/contacts/${contact.id}`}
          className="block bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
          onClick={() => onContactClick?.(contact)}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="font-semibold">{contact.name}</p>
              {contact.company && <p className="text-sm text-gray-600">{contact.company}</p>}
              {contact.designation && <p className="text-xs text-gray-500">{contact.designation}</p>}
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
              {contact.contact_type === "historical" ? "Historical" : "Active"}
            </span>
          </div>
          {contact.email && <p className="text-xs text-gray-500 mt-2">📧 {contact.email}</p>}
        </Link>
      ))}
    </div>
  );
}
