"use client";

import { useState } from "react";
import { useExport } from "@/lib/hooks/useExport";

export default function ExportManager() {
  const { exportToCSV, exportToJSON } = useExport();
  const [isExporting, setIsExporting] = useState(false);
  const [message, setMessage] = useState("");

  const handleExport = async (format: "csv" | "json") => {
    setIsExporting(true);
    setMessage("");

    try {
      if (format === "csv") {
        await exportToCSV();
      } else {
        await exportToJSON();
      }
      setMessage(`✓ Successfully exported as ${format.toUpperCase()}`);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(`Failed to export: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="font-semibold">Export Data</h2>
      <p className="text-sm text-gray-600">
        Download all your contacts, events, and interactions as a backup or for analysis.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          onClick={() => handleExport("csv")}
          disabled={isExporting}
          className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 font-medium text-sm"
        >
          📊 Export as CSV
        </button>
        <button
          onClick={() => handleExport("json")}
          disabled={isExporting}
          className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 font-medium text-sm"
        >
          📄 Export as JSON
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> This creates a local backup. No data is uploaded to external services.
        </p>
      </div>

      {message && (
        <p className={`text-sm font-medium ${message.includes("✓") ? "text-green-600" : "text-red-600"}`}>
          {message}
        </p>
      )}

      <details className="border border-gray-200 rounded-lg p-3">
        <summary className="cursor-pointer font-medium text-sm">What's included?</summary>
        <div className="mt-3 space-y-2 text-xs text-gray-600">
          <p>
            <strong>Contacts:</strong> All contact information (name, company, phone, email, etc.)
          </p>
          <p>
            <strong>Events:</strong> Event details and dates
          </p>
          <p>
            <strong>Interactions:</strong> Relationship history, follow-ups, communication log
          </p>
          <p className="pt-2 border-t border-gray-200">
            <strong>Not included:</strong> Photos, message templates, user settings
          </p>
        </div>
      </details>
    </div>
  );
}
