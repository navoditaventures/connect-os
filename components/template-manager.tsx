"use client";

import { useState } from "react";
import { MessageTemplate, useTemplates } from "@/lib/hooks/useTemplates";

export default function TemplateManager() {
  const { templates, createTemplate, updateTemplate, deleteTemplate, isLoading } = useTemplates();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", content: "" });
  const [isSaving, setIsSaving] = useState(false);

  const handleCreate = async () => {
    if (!formData.name || !formData.content) {
      alert("Please fill in all fields");
      return;
    }

    setIsSaving(true);
    try {
      await createTemplate(formData.name, formData.content);
      setFormData({ name: "", content: "" });
      setShowForm(false);
    } catch (error) {
      alert("Failed to create template");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingId || !formData.name || !formData.content) {
      alert("Please fill in all fields");
      return;
    }

    setIsSaving(true);
    try {
      await updateTemplate(editingId, formData.name, formData.content);
      setFormData({ name: "", content: "" });
      setEditingId(null);
      setShowForm(false);
    } catch (error) {
      alert("Failed to update template");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this template?")) return;

    try {
      await deleteTemplate(id);
    } catch (error) {
      alert("Failed to delete template");
    }
  };

  const handleEdit = (template: MessageTemplate) => {
    setEditingId(template.id);
    setFormData({ name: template.name, content: template.content });
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: "", content: "" });
    setShowForm(false);
  };

  if (isLoading) {
    return <p className="text-gray-600">Loading templates...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold">Message Templates</h2>
        {!showForm && (
          <button
            onClick={() => {
              setEditingId(null);
              setFormData({ name: "", content: "" });
              setShowForm(true);
            }}
            className="text-sm bg-black text-white px-3 py-1 rounded hover:bg-gray-800"
          >
            + New Template
          </button>
        )}
      </div>

      {showForm ? (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Template Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Post-Event Follow-up"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Message Template</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
              placeholder="Use variables like {{first_name}}, {{company_name}}, {{digital_profile_url}}"
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm font-mono"
            />
            <p className="text-xs text-gray-500 mt-2">
              Available variables: {`{{first_name}}, {{full_name}}, {{company_name}}, {{designation}}, {{event_name}}, {{event_date}}, {{industry}}, {{relationship}}, {{opportunity}}, {{notes}}, {{digital_profile_url}}`}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={editingId ? handleUpdate : handleCreate}
              disabled={isSaving}
              className="flex-1 px-3 py-2 bg-black text-white rounded-lg hover:bg-gray-800 text-sm font-medium disabled:opacity-50"
            >
              {isSaving ? "Saving..." : editingId ? "Update" : "Create"}
            </button>
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        {templates.length === 0 ? (
          <p className="text-gray-600 text-sm">No templates yet</p>
        ) : (
          templates.map((template) => (
            <div key={template.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium">{template.name}</p>
                  {template.is_default && (
                    <p className="text-xs text-gray-500 mt-1">Default template</p>
                  )}
                </div>
                {!template.is_default && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(template)}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{template.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
