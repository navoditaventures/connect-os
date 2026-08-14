"use client";

import { useState } from "react";
import Link from "next/link";
import { Contact } from "@/lib/hooks/useContacts";
import { MessageTemplate } from "@/lib/hooks/useTemplates";
import { useEvents } from "@/lib/hooks/useEvents";
import { useInteractions } from "@/lib/hooks/useInteractions";
import WhatsAppSetup from "@/components/whatsapp-setup";
import WhatsAppPreview from "@/components/whatsapp-preview";
import { useCommunications } from "@/lib/hooks/useCommunications";

type WhatsAppStep = "select" | "preview" | "complete";

export default function WhatsApp() {
  const { events } = useEvents();
  const { interactions } = useInteractions();
  const { createCommunication } = useCommunications();

  const [step, setStep] = useState<WhatsAppStep>("select");
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [sentCount, setSentCount] = useState(0);
  const [digitalProfileUrl, setDigitalProfileUrl] = useState("");

  const handleSelectContacts = (contacts: Contact[]) => {
    setSelectedContacts(contacts);
  };

  const handleSelectTemplate = (template: MessageTemplate) => {
    setSelectedTemplate(template);
  };

  const handleStartPreview = () => {
    if (!digitalProfileUrl) {
      alert("Please set your digital profile URL in Settings first");
      return;
    }
    setStep("preview");
  };

  const handleSentMessage = async (contactId: string) => {
    try {
      const interaction = interactions.find((i) => i.contact_id === contactId);

      await createCommunication({
        contact_id: contactId,
        interaction_id: interaction?.id,
        channel: "whatsapp",
        template_id: selectedTemplate?.id,
        status: "sent",
        sent_at: new Date().toISOString(),
      });

      setSentCount((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to log communication:", error);
    }
  };

  const handleComplete = () => {
    setStep("complete");
    setSelectedContacts([]);
    setSelectedTemplate(null);
  };

  if (step === "select") {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 mt-6">WhatsApp Outreach</h1>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> This will open WhatsApp for each contact. You'll tap send manually
            to stay in control of your account.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select Event (optional)</label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">All contacts</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name} ({new Date(event.date).toLocaleDateString()})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to message all contacts or pick an event to message only those contacts
            </p>
          </div>

          <button
            onClick={() => handleStartPreview(selectedEventId)}
            className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:bg-green-700"
          >
            💬 Start WhatsApp Campaign
          </button>

          <Link
            href="/settings?tab=profile"
            className="block text-center text-blue-600 hover:text-blue-700 text-sm font-medium py-2"
          >
            ⚙️ Set Digital Profile URL in Settings
          </Link>
        </div>

        <div className="mt-12">
          <h2 className="text-lg font-semibold mb-4">How It Works</h2>
          <ol className="space-y-3 text-sm text-gray-700">
            <li className="flex gap-3">
              <span className="font-bold text-blue-600 flex-shrink-0">1.</span>
              <span>Select contacts to message (with or without event filter)</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600 flex-shrink-0">2.</span>
              <span>Choose a message template</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600 flex-shrink-0">3.</span>
              <span>Preview personalized message for each contact</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600 flex-shrink-0">4.</span>
              <span>Click "Open WhatsApp & Send" (opens WhatsApp in new tab)</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600 flex-shrink-0">5.</span>
              <span>Review message and tap Send in WhatsApp</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600 flex-shrink-0">6.</span>
              <span>Return here and move to next contact</span>
            </li>
          </ol>
        </div>
      </div>
    );
  }

  if (step === "preview") {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="mt-6 mb-6">
          <button
            onClick={() => setStep("select")}
            className="text-gray-600 hover:text-gray-900 text-sm font-medium"
          >
            ← Back
          </button>
        </div>

        <WhatsAppSetup
          eventId={selectedEventId}
          onSelectContacts={handleSelectContacts}
          onSelectTemplate={handleSelectTemplate}
          onCancel={() => {
            setStep("select");
            setSelectedContacts([]);
            setSelectedTemplate(null);
          }}
        />

        {selectedContacts.length > 0 && selectedTemplate && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <WhatsAppPreview
              contacts={selectedContacts}
              template={selectedTemplate}
              interactions={interactions}
              events={events}
              digitalProfileUrl={digitalProfileUrl}
              onSendStart={handleStartPreview}
              onCancel={() => {
                setStep("select");
                setSelectedContacts([]);
                setSelectedTemplate(null);
              }}
            />
          </div>
        )}
      </div>
    );
  }

  if (step === "complete") {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="mt-12 text-center">
          <div className="text-6xl mb-4">✓</div>
          <h2 className="text-3xl font-bold mb-2">Campaign Complete!</h2>
          <p className="text-gray-600 mb-8">
            {sentCount} messages sent. Communications logged for follow-up tracking.
          </p>

          <div className="space-y-3">
            <Link
              href="/followups"
              className="block bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800"
            >
              📋 View Follow-ups
            </Link>
            <Link
              href="/contacts"
              className="block bg-gray-100 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-200"
            >
              👥 View Contacts
            </Link>
            <button
              onClick={() => {
                setStep("select");
                setSelectedContacts([]);
                setSelectedTemplate(null);
                setSentCount(0);
              }}
              className="block w-full text-gray-600 hover:text-gray-900 py-3 font-medium"
            >
              Start Another Campaign
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
