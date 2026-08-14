"use client";

import { useState } from "react";
import { useInteractions, Interaction } from "@/lib/hooks/useInteractions";
import {
  RELATIONSHIP_CATEGORIES,
  OPPORTUNITY_CATEGORIES,
  RELATIONSHIP_STAGES,
  FOLLOW_UP_STATUSES,
} from "@/lib/constants";

interface InteractionEditorProps {
  interaction: Interaction | null;
  contactId: string;
  onSave: () => void;
  onCancel: () => void;
}

export default function InteractionEditor({
  interaction,
  contactId,
  onSave,
  onCancel,
}: InteractionEditorProps) {
  const { createInteraction, updateInteraction } = useInteractions();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    relationship: interaction?.relationship || "Business Connection",
    opportunity: interaction?.opportunity || "Other",
    stage: interaction?.stage || "New",
    notes: interaction?.notes || "",
    follow_up_date: interaction?.follow_up_date || "",
    follow_up_status: interaction?.follow_up_status || "pending",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (interaction) {
        await updateInteraction(interaction.id, formData);
      } else {
        await createInteraction({
          contact_id: contactId,
          interaction_type: "met",
          event_id: formData.event_id,
          relationship: formData.relationship,
          opportunity: formData.opportunity,
          stage: (formData.stage || "New") as "New" | "Contacted" | "Conversation" | "Opportunity" | "Client" | "Lost",
          notes: formData.notes,
          follow_up_date: formData.follow_up_date,
          follow_up_status: (formData.follow_up_status || "pending") as "pending" | "completed" | "not_required",
        });
      }
      onSave();
    } catch (error) {
      console.error("Failed to save interaction:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="font-semibold mb-4">
        {interaction ? "Edit Interaction" : "Add Interaction"}
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Relationship *</label>
          <select
            value={formData.relationship}
            onChange={(e) => setFormData((prev) => ({ ...prev, relationship: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
          >
            {RELATIONSHIP_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Opportunity</label>
          <select
            value={formData.opportunity}
            onChange={(e) => setFormData((prev) => ({ ...prev, opportunity: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
          >
            {OPPORTUNITY_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Stage</label>
          <select
            value={formData.stage}
            onChange={(e) => setFormData((prev) => ({ ...prev, stage: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
          >
            {RELATIONSHIP_STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Follow-up Date</label>
          <input
            type="date"
            value={formData.follow_up_date}
            onChange={(e) => setFormData((prev) => ({ ...prev, follow_up_date: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
          />
        </div>
      </div>

      {formData.follow_up_date && (
        <div>
          <label className="block text-sm font-medium mb-1">Follow-up Status</label>
          <select
            value={formData.follow_up_status}
            onChange={(e) => setFormData((prev) => ({ ...prev, follow_up_status: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
          >
            {FOLLOW_UP_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status === "pending" ? "Pending" : status === "completed" ? "Completed" : "Not Required"}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
          placeholder="Any additional notes..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 font-medium text-sm"
        >
          {isLoading ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
