"use client";

import { useState } from "react";
import { Contact } from "@/lib/hooks/useContacts";
import { MessageTemplate } from "@/lib/hooks/useTemplates";
import { Interaction } from "@/lib/hooks/useInteractions";
import { Event } from "@/lib/hooks/useEvents";
import { personalizeMessage, generateWhatsAppLink, formatPhoneForWhatsApp } from "@/lib/services/message";

interface WhatsAppPreviewProps {
  contacts: Contact[];
  template: MessageTemplate;
  interactions: Interaction[];
  events: Event[];
  digitalProfileUrl: string;
  onSendStart: () => void;
  onCancel: () => void;
}

export default function WhatsAppPreview({
  contacts,
  template,
  interactions,
  events,
  digitalProfileUrl,
  onSendStart,
  onCancel,
}: WhatsAppPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [editedMessage, setEditedMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const currentContact = contacts[currentIndex];
  const currentInteraction = interactions.find((i) => i.contact_id === currentContact.id);
  const currentEvent = currentInteraction?.event_id
    ? events.find((e) => e.id === currentInteraction.event_id)
    : undefined;

  const { text: personalizedText } = personalizeMessage(template.content, {
    contact: currentContact,
    interaction: currentInteraction,
    event: currentEvent,
    digitalProfileUrl,
  });

  const messageToSend = editedMessage || personalizedText;
  const phoneNumber = currentContact.whatsapp || currentContact.phone || "";
  const whatsappLink = generateWhatsAppLink(phoneNumber, messageToSend);

  const handleNext = () => {
    if (currentIndex < contacts.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setEditedMessage("");
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setEditedMessage("");
    }
  };

  const handleOpenWhatsApp = () => {
    window.open(whatsappLink, "_blank");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">
          Message Preview ({currentIndex + 1} of {contacts.length})
        </h2>
        <span className="text-sm text-gray-600">{template.name}</span>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="font-medium mb-1">📱 Sending to:</p>
        <p className="text-sm font-semibold">{currentContact.name}</p>
        {currentContact.company && <p className="text-sm text-gray-600">{currentContact.company}</p>}
        <p className="text-xs text-gray-600 mt-1">Phone: {phoneNumber}</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Message (edit if needed)</label>
        <textarea
          value={messageToSend}
          onChange={(e) => setEditedMessage(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black font-sm"
          rows={10}
        />
        <p className="text-xs text-gray-500 mt-2">
          Message length: {messageToSend.length} characters
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
        >
          ← Previous
        </button>

        <button
          onClick={handleOpenWhatsApp}
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center justify-center gap-2"
        >
          💬 Open WhatsApp & Send
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex === contacts.length - 1}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
        >
          Next →
        </button>
      </div>

      {currentIndex === contacts.length - 1 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">
            ✓ This is the last contact. After sending, you can return to track communications.
          </p>
        </div>
      )}

      <button
        onClick={onCancel}
        className="w-full px-4 py-2 text-gray-600 hover:text-gray-900 font-medium text-sm"
      >
        Cancel
      </button>
    </div>
  );
}
