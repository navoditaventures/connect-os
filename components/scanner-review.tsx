"use client";

import { useState, useEffect } from "react";
import { DuplicateMatch, useContacts } from "@/lib/hooks/useContacts";

interface ScannerReviewProps {
  extracted: {
    name: string;
    company?: string;
    designation?: string;
    phone?: string;
    email?: string;
    address?: string;
    industry?: string;
    confidence: number;
  };
  ocrText: string;
  eventId?: string;
  onSave: (contactData: any) => Promise<void>;
  onCancel: () => void;
  onDuplicateFound?: (duplicates: DuplicateMatch[], contact: any) => void;
}

export default function ScannerReview({
  extracted,
  ocrText,
  eventId,
  onSave,
  onCancel,
  onDuplicateFound,
}: ScannerReviewProps) {
  const { checkForDuplicates } = useContacts();
  const [editData, setEditData] = useState(extracted);
  const [duplicates, setDuplicates] = useState<DuplicateMatch[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [confirmOverride, setConfirmOverride] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const checkDuplicates = async () => {
      const matches = await checkForDuplicates({
        name: editData.name,
        phone: editData.phone,
        email: editData.email,
        company: editData.company,
      });

      if (matches.length > 0) {
        setDuplicates(matches);
        setShowDuplicateWarning(true);
        onDuplicateFound?.(matches, editData);
      }
    };

    if (editData.name) {
      checkDuplicates();
    }
  }, [editData.name, checkForDuplicates, onDuplicateFound]);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      await onSave({
        ...editData,
        notes: notes || undefined,
        contact_type: "active",
      });
    } catch (error) {
      console.error("Failed to save contact:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setEditData((prev: any) => ({
      ...prev,
      [field]: value || undefined,
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4">Review Contact Information</h2>
        <p className="text-sm text-gray-600 mb-4">Confidence: {Math.round(extracted.confidence * 100)}%</p>
      </div>

      {showDuplicateWarning && duplicates.length > 0 && !confirmOverride && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
          <p className="font-semibold text-amber-900 mb-2">⚠️ Similar Contact Found</p>
          {duplicates.map((dup, i) => (
            <div key={i} className="text-sm text-amber-800 mb-2">
              <p>
                <strong>{dup.existingContact.name}</strong> at {dup.existingContact.company}
              </p>
              <p className="text-xs text-amber-700">
                Match: {dup.matchType} ({Math.round(dup.confidence * 100)}%)
              </p>
            </div>
          ))}
          <p className="text-xs text-amber-700 mt-3 mb-3">
            This might be the same person. You can still create a new contact or edit to match existing one.
          </p>
          <button
            onClick={() => setConfirmOverride(true)}
            className="text-amber-700 hover:text-amber-900 font-medium text-sm underline"
          >
            Continue anyway →
          </button>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name *</label>
          <input
            type="text"
            value={editData.name || ""}
            onChange={(e) => handleFieldChange("name", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Company</label>
            <input
              type="text"
              value={editData.company || ""}
              onChange={(e) => handleFieldChange("company", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Designation</label>
            <input
              type="text"
              value={editData.designation || ""}
              onChange={(e) => handleFieldChange("designation", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={editData.email || ""}
              onChange={(e) => handleFieldChange("email", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              type="tel"
              value={editData.phone || ""}
              onChange={(e) => handleFieldChange("phone", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Address</label>
          <input
            type="text"
            value={editData.address || ""}
            onChange={(e) => handleFieldChange("address", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Industry</label>
          <input
            type="text"
            value={editData.industry || ""}
            onChange={(e) => handleFieldChange("industry", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional information about this contact..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </div>

      <details className="border border-gray-200 rounded-lg p-3">
        <summary className="cursor-pointer font-medium text-sm">Show OCR text</summary>
        <pre className="text-xs text-gray-600 mt-3 bg-gray-50 p-3 rounded overflow-auto max-h-40">
          {ocrText}
        </pre>
      </details>

      <div className="flex gap-3 pt-4">
        <button
          onClick={onCancel}
          className="flex-1 border border-gray-300 rounded-lg py-3 hover:bg-gray-50 font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving || !editData.name}
          className="flex-1 bg-black text-white rounded-lg py-3 hover:bg-gray-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : "✓ Save Contact"}
        </button>
      </div>
    </div>
  );
}
