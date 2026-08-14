"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useContacts } from "@/lib/hooks/useContacts";
import { useEvents } from "@/lib/hooks/useEvents";
import DashboardHeader from "@/components/dashboard-header";
import StatCard from "@/components/stat-card";
import ActionButton from "@/components/action-button";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { contacts, isLoading: contactsLoading } = useContacts();
  const { events, activeEvent, isLoading: eventsLoading } = useEvents();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const recentContacts = contacts.slice(0, 5);
  const activeContactCount = contacts.filter((c) => c.contact_type === "active").length;
  const historicalContactCount = contacts.filter((c) => c.contact_type === "historical").length;

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
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: "var(--color-foreground)" }}>
              ConnectOS
            </h1>
            <p style={{ color: "var(--color-muted-foreground)", fontSize: "0.875rem" }}>
              {user?.email}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              background: "var(--color-muted)",
              color: "var(--color-muted-foreground)",
              border: "1px solid var(--color-border)",
              outlineColor: "var(--color-ring)"
            }}
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* CTA Section */}
        <div className="mb-12">
          <Link
            href="/scanner"
            className="w-full block py-6 px-6 rounded-lg font-bold text-xl transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 flex items-center justify-center gap-3"
            style={{
              background: "var(--color-primary)",
              color: "var(--color-on-primary)",
              outlineColor: "var(--color-ring)"
            }}
          >
            <span className="text-2xl">📸</span>
            SCAN BUSINESS CARD
          </Link>
        </div>

        {/* Active Event Alert */}
        {activeEvent && (
          <div
            className="mb-12 p-6 rounded-lg border"
            style={{
              background: "var(--color-card)",
              borderColor: "var(--color-accent)",
              borderLeft: `4px solid var(--color-accent)`
            }}
          >
            <h2 className="font-semibold mb-2 flex items-center gap-2">
              <span>📅</span>
              <span style={{ color: "var(--color-accent)" }}>Active Event</span>
            </h2>
            <p style={{ color: "var(--color-foreground)", marginBottom: "0.5rem" }}>
              <strong>{activeEvent.name}</strong> · {new Date(activeEvent.date).toLocaleDateString()}
            </p>
            <Link
              href={`/events/${activeEvent.id}`}
              className="inline-block text-sm font-medium transition-all hover:gap-1"
              style={{ color: "var(--color-primary)" }}
            >
              View event →
            </Link>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard
            label="Total Contacts"
            value={contactsLoading ? "-" : contacts.length}
            icon="👥"
            trend={{ direction: "up", percentage: 12 }}
          />
          <StatCard
            label="Events"
            value={eventsLoading ? "-" : events.length}
            icon="📅"
          />
          <Link href="/followups" className="no-underline">
            <StatCard
              label="Follow-ups Pending"
              value="0"
              icon="✅"
            />
          </Link>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Recent Contacts */}
          <div className="lg:col-span-2">
            <h2
              className="text-2xl font-bold mb-6"
              style={{ color: "var(--color-foreground)" }}
            >
              Recent Contacts
            </h2>
            {contactsLoading ? (
              <p style={{ color: "var(--color-muted-foreground)" }}>Loading...</p>
            ) : recentContacts.length === 0 ? (
              <div
                className="p-8 rounded-lg text-center border"
                style={{
                  background: "var(--color-muted)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-muted-foreground)"
                }}
              >
                <p>No contacts yet. Scan a business card to get started!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentContacts.map((contact) => (
                  <Link
                    key={contact.id}
                    href={`/contacts/${contact.id}`}
                    className="block p-4 rounded-lg border transition-all duration-200 hover:scale-102"
                    style={{
                      background: "var(--color-card)",
                      borderColor: "var(--color-border)",
                      borderLeft: `3px solid var(--color-primary)`
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--color-primary)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--color-border)";
                    }}
                  >
                    <p className="font-semibold" style={{ color: "var(--color-foreground)" }}>
                      {contact.name}
                    </p>
                    {contact.company && (
                      <p style={{ color: "var(--color-muted-foreground)", fontSize: "0.875rem" }}>
                        {contact.company}
                      </p>
                    )}
                  </Link>
                ))}
                <Link
                  href="/contacts"
                  className="inline-block text-sm font-medium mt-4 transition-all"
                  style={{ color: "var(--color-primary)" }}
                >
                  View all contacts →
                </Link>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div>
            <h2
              className="text-2xl font-bold mb-6"
              style={{ color: "var(--color-foreground)" }}
            >
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Link href="/events">
                <ActionButton
                  icon="📅"
                  label="Manage Events"
                  description="Create or view events"
                  onClick={() => {}}
                />
              </Link>
              <Link href="/contacts/new">
                <ActionButton
                  icon="👤"
                  label="Add Contact"
                  description="Add a new contact manually"
                  onClick={() => {}}
                />
              </Link>
              <Link href="/contacts">
                <ActionButton
                  icon="🔍"
                  label="Search Contacts"
                  description="Find and manage your contacts"
                  onClick={() => {}}
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
