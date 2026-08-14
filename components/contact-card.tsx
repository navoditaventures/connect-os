"use client";

import { Contact } from "@/lib/hooks/useContacts";
import Link from "next/link";

interface ContactCardProps {
  contact: Contact;
  onDelete?: () => void;
}

export default function ContactCard({ contact, onDelete }: ContactCardProps) {
  return (
    <Link href={`/contacts/${contact.id}`}>
      <div
        className="p-6 rounded-lg border transition-all duration-200 cursor-pointer hover:scale-102"
        style={{
          background: "var(--color-card)",
          borderColor: "var(--color-border)",
          borderLeft: `3px solid var(--color-${contact.contact_type === "active" ? "primary" : "muted"})`
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--color-primary)";
          e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--color-border)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-lg" style={{ color: "var(--color-foreground)" }}>
              {contact.name}
            </h3>
            {contact.company && (
              <p style={{ color: "var(--color-muted-foreground)", fontSize: "0.875rem" }}>
                {contact.company}
              </p>
            )}
          </div>
          <span
            className="px-2 py-1 rounded text-xs font-medium"
            style={{
              background:
                contact.contact_type === "active"
                  ? "rgba(37, 99, 235, 0.1)"
                  : "rgba(71, 85, 105, 0.1)",
              color:
                contact.contact_type === "active"
                  ? "var(--color-primary)"
                  : "var(--color-muted-foreground)"
            }}
          >
            {contact.contact_type === "active" ? "Active" : "Historical"}
          </span>
        </div>
        <div className="space-y-1 text-sm" style={{ color: "var(--color-muted-foreground)" }}>
          {contact.designation && <p>{contact.designation}</p>}
          {contact.email && <p>{contact.email}</p>}
          {contact.phone && <p>{contact.phone}</p>}
        </div>
      </div>
    </Link>
  );
}
