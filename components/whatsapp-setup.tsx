"use client";

import { useState, useEffect } from "react";
import { Contact, useContacts } from "@/lib/hooks/useContacts";
import { MessageTemplate, useTemplates } from "@/lib/hooks/useTemplates";
import { useInteractions } from "@/lib/hooks/useInteractions";

interface WhatsAppSetupProps {
  eventId?: string;
  onSelectContacts: (contacts: Contact[]) => void;
  onSelectTemplate: (template: MessageTemplate) => void;
  onCancel: () => void;
}

export default function WhatsAppSetup({
  eventId,
  onSelectContacts,
  onSelectTemplate,
  onCancel,
}: WhatsAppSetupProps) {
  const { contacts } = useContacts();
  const { templates, isLoading: templatesLoading } = useTemplates();
  const { interactions } = useInteractions();

  const [step, setStep] = useState<"select-contacts" | "select-template">("select-contacts");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);

  const [filterCategory, setFilterCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const eventContacts = eventId
    ? interactions
        .filter((i) => i.event_id === eventId)
        .map((i) => contacts.find((c) => c.id === i.contact_id))
        .filter(Boolean) as Contact[]
    : contacts;

  const filteredContacts = eventContacts.filter((contact) => {
    if (!contact.whatsapp && !contact.phone) return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !contact.name.toLowerCase().includes(query) &&
        !contact.company?.toLowerCase().includes(query)
      ) {
        return false;
      }
    }

    if (filterCategory) {
      const interaction = interactions.find((i) => i.contact_id === contact.id);
      if (interaction?.relationship !== filterCategory) return false;
    }

    return true;
  });

  const handleToggleContact = (contactId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredContacts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredContacts.map((c) => c.id)));
    }
  };

  const handleNext = () => {
    const selected = filteredContacts.filter((c) => selectedIds.has(c.id));
    onSelectContacts(selected);
    setStep("select-template");
  };

  const handleSelectTemplate = (template: MessageTemplate) => {
    setSelectedTemplate(template);
    onSelectTemplate(template);
  };

  if (step === "select-contacts") {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Select Contacts</h2>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Search by name or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />

          <div>
            <label className="block text-sm font-medium mb-2">Filter by Relationship (optional)</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">All relationships</option>
              <option value="Potential Client">Potential Client</option>
              <option value="Existing Client">Existing Client</option>
              <option value="Referral Partner">Referral Partner</option>
              <option value="Strategic Partner">Strategic Partner</option>
              <option value="Business Connection">Business Connection</option>
            </select>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <p className="font-medium">
              {selectedIds.size} of {filteredContacts.length} selected
            </p>
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {selectedIds.size === filteredContacts.length ? "Deselect All" : "Select All"}
            </button>
          </div>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredContacts.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No contacts found</p>
          ) : (
            filteredContacts.map((contact) => {
              const hasPhone = contact.whatsapp || contact.phone;
              return (
                <label
                  key={contact.id}
                  className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(contact.id)}
                    onChange={() => handleToggleContact(contact.id)}
                    disabled={!hasPhone}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{contact.name}</p>
                    {contact.company && <p className="text-xs text-gray-600">{contact.company}</p>}
                    {!hasPhone && (
                      <p className="text-xs text-red-600 mt-1">No phone/WhatsApp number</p>
                    )}
                  </div>
                </label>
              );
            })
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleNext}
            disabled={selectedIds.size === 0}
            className="flex-1 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next: Choose Template ({selectedIds.size})
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => setStep("select-contacts")}
        className="text-gray-600 hover:text-gray-900 text-sm font-medium"
      >
        ← Back to contacts
      </button>

      <h2 className="text-xl font-bold">Choose Message Template</h2>

      {templatesLoading ? (
        <p className="text-gray-600">Loading templates...</p>
      ) : templates.length === 0 ? (
        <p className="text-gray-600">No templates available</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleSelectTemplate(template)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                selectedTemplate?.id === template.id
                  ? "border-black bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <p className="font-semibold">{template.name}</p>
                {template.is_default && (
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">Default</span>
                )}
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{template.content}</p>
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => setStep("select-contacts")}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
        >
          Back
        </button>
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
