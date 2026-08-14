"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useContacts } from "@/lib/hooks/useContacts";
import ContactList from "@/components/contact-list";

export default function Contacts() {
  const { contacts, isLoading, searchContacts } = useContacts();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredContacts, setFilteredContacts] = useState(contacts);
  const [filterType, setFilterType] = useState<"all" | "active" | "historical">("all");

  useEffect(() => {
    let results = contacts;

    if (filterType !== "all") {
      results = results.filter((c) => c.contact_type === filterType);
    }

    if (searchQuery.trim()) {
      results = results.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.phone?.includes(searchQuery)
      );
    }

    setFilteredContacts(results);
  }, [contacts, searchQuery, filterType]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6 mt-6">
        <h1 className="text-3xl font-bold">Contacts</h1>
        <Link
          href="/contacts/new"
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 text-sm font-medium"
        >
          + Add Contact
        </Link>
      </div>

      <div className="space-y-4 mb-6">
        <input
          type="text"
          placeholder="Search by name, company, email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
        />

        <div className="flex gap-2">
          {(["all", "active", "historical"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filterType === type
                  ? "bg-black text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {type === "all"
                ? "All"
                : type === "active"
                  ? `Active (${contacts.filter((c) => c.contact_type === "active").length})`
                  : `Historical (${contacts.filter((c) => c.contact_type === "historical").length})`}
            </button>
          ))}
        </div>
      </div>

      {searchQuery && (
        <p className="text-sm text-gray-600 mb-4">
          Found {filteredContacts.length} of {contacts.length} contacts
        </p>
      )}

      <ContactList contacts={filteredContacts} isLoading={isLoading} />
    </div>
  );
}
