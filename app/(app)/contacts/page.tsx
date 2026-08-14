"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useContacts } from "@/lib/hooks/useContacts";
import ContactCard from "@/components/contact-card";
import Button from "@/components/button";
import FormInput from "@/components/form-input";

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

  const activeCount = contacts.filter((c) => c.contact_type === "active").length;
  const historicalCount = contacts.filter((c) => c.contact_type === "historical").length;

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-background)" }}
    >
      {/* Header */}
      <div
        className="border-b"
        style={{
          borderColor: "var(--color-border)",
          background: "var(--color-card)"
        }}
      >
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: "var(--color-foreground)" }}>
              Contacts
            </h1>
            <p style={{ color: "var(--color-muted-foreground)", fontSize: "0.875rem" }}>
              {contacts.length} total contact{contacts.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link href="/contacts/new">
            <Button variant="primary" size="md">
              ➕ Add Contact
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          <div>
            <FormInput
              placeholder="Search by name, company, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-3 flex-wrap">
            {(["all", "active", "historical"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  background:
                    filterType === type ? "var(--color-primary)" : "var(--color-muted)",
                  color:
                    filterType === type
                      ? "var(--color-on-primary)"
                      : "var(--color-muted-foreground)",
                  outlineColor: "var(--color-ring)",
                  border: `1px solid ${
                    filterType === type ? "var(--color-primary)" : "var(--color-border)"
                  }`
                }}
              >
                {type === "all"
                  ? `All (${contacts.length})`
                  : type === "active"
                    ? `Active (${activeCount})`
                    : `Historical (${historicalCount})`}
              </button>
            ))}
          </div>
        </div>

        {/* Results Info */}
        {searchQuery && (
          <p className="text-sm mb-6" style={{ color: "var(--color-muted-foreground)" }}>
            Found {filteredContacts.length} of {contacts.length} contact{filteredContacts.length !== 1 ? "s" : ""}
          </p>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-12">
            <div
              className="inline-block h-8 w-8 border-4 border-transparent rounded-full animate-spin"
              style={{
                borderTopColor: "var(--color-primary)",
                borderRightColor: "var(--color-accent)"
              }}
            />
          </div>
        ) : filteredContacts.length === 0 ? (
          <div
            className="p-12 rounded-lg text-center border"
            style={{
              background: "var(--color-muted)",
              borderColor: "var(--color-border)",
              color: "var(--color-muted-foreground)"
            }}
          >
            <p className="text-lg font-medium mb-2">No contacts found</p>
            <p className="text-sm">
              {searchQuery
                ? "Try a different search term"
                : "Scan a business card or add a contact manually"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContacts.map((contact) => (
              <ContactCard key={contact.id} contact={contact} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
