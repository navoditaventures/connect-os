"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useContacts } from "@/lib/hooks/useContacts";
import { useEvents } from "@/lib/hooks/useEvents";

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
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8 mt-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Welcome back!</h1>
          <p className="text-gray-600">{user?.email}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          Sign out
        </button>
      </div>

      <Link
        href="/scanner"
        className="block w-full bg-black text-white text-center py-8 px-6 rounded-lg font-bold text-xl mb-8 hover:bg-gray-800 transition-colors"
      >
        📸 SCAN BUSINESS CARD
      </Link>

      {activeEvent && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h2 className="font-semibold text-blue-900 mb-2">Active Event</h2>
          <p className="text-blue-800">
            <strong>{activeEvent.name}</strong> - {new Date(activeEvent.date).toLocaleDateString()}
          </p>
          <Link
            href={`/events/${activeEvent.id}`}
            className="text-blue-600 hover:underline text-sm mt-2 inline-block"
          >
            View event →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-2xl font-bold">{contactsLoading ? "-" : contacts.length}</div>
          <div className="text-sm text-gray-600">Total Contacts</div>
          <div className="text-xs text-gray-500 mt-2">
            {activeContactCount} active · {historicalContactCount} historical
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-2xl font-bold">{eventsLoading ? "-" : events.length}</div>
          <div className="text-sm text-gray-600">Events</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <Link href="/followups" className="block hover:bg-gray-50 p-2 -m-2 rounded">
            <div className="text-2xl font-bold">0</div>
            <div className="text-sm text-gray-600">Follow-ups</div>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <h2 className="text-lg font-semibold mb-4">Recent Contacts</h2>
          {contactsLoading ? (
            <p className="text-gray-600">Loading...</p>
          ) : recentContacts.length === 0 ? (
            <p className="text-gray-600 text-sm">No contacts yet</p>
          ) : (
            <div className="space-y-2">
              {recentContacts.map((contact) => (
                <Link
                  key={contact.id}
                  href={`/contacts/${contact.id}`}
                  className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  <p className="font-medium text-sm">{contact.name}</p>
                  {contact.company && <p className="text-xs text-gray-600">{contact.company}</p>}
                </Link>
              ))}
              <Link
                href="/contacts"
                className="text-sm text-gray-600 hover:text-gray-900 mt-2 inline-block"
              >
                View all contacts →
              </Link>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/events"
              className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <div className="font-semibold text-sm">📅 Manage Events</div>
              <div className="text-xs text-gray-600">Create or view events</div>
            </Link>
            <Link
              href="/contacts/new"
              className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <div className="font-semibold text-sm">👤 Add Contact</div>
              <div className="text-xs text-gray-600">Add a new contact manually</div>
            </Link>
            <Link
              href="/contacts"
              className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <div className="font-semibold text-sm">🔍 Search Contacts</div>
              <div className="text-xs text-gray-600">Find and manage your contacts</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
