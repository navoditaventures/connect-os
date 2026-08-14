"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEvents } from "@/lib/hooks/useEvents";
import { useContacts } from "@/lib/hooks/useContacts";
import { useInteractions } from "@/lib/hooks/useInteractions";
import CameraCapture from "@/components/camera-capture";
import ScannerProcessing from "@/components/scanner-processing";
import ScannerReview from "@/components/scanner-review";

type ScannerStep = "mode-select" | "camera" | "processing" | "review" | "complete";

export default function Scanner() {
  const router = useRouter();
  const { activeEvent, events } = useEvents();
  const { createContact } = useContacts();
  const { createInteraction } = useInteractions();

  const [step, setStep] = useState<ScannerStep>("mode-select");
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [selectedEventId, setSelectedEventId] = useState(activeEvent?.id || "");
  const [successCount, setSuccessCount] = useState(0);

  const handleCaptureComplete = (blob: Blob) => {
    setImageBlob(blob);
    setStep("processing");
  };

  const handleProcessingComplete = (data: any) => {
    setExtractedData(data);
    setStep("review");
  };

  const handleContactSave = async (contactData: any) => {
    try {
      const newContact = await createContact({
        contact_type: "active",
        name: contactData.name,
        company: contactData.company,
        designation: contactData.designation,
        phone: contactData.phone,
        email: contactData.email,
        address: contactData.address,
        industry: contactData.industry,
      });

      await createInteraction({
        contact_id: newContact.id,
        event_id: selectedEventId || undefined,
        interaction_type: "met",
        relationship: contactData.relationship || "Business Connection",
        opportunity: contactData.opportunity || "Other",
        stage: contactData.stage || "New",
        notes: contactData.notes,
        follow_up_date: contactData.followUpDate || undefined,
        follow_up_status: "pending",
      });

      setSuccessCount((prev) => prev + 1);
      setStep("complete");
    } catch (error) {
      console.error("Failed to save contact:", error);
      alert("Failed to save contact. Please try again.");
    }
  };

  const handleReset = () => {
    setImageBlob(null);
    setExtractedData(null);
    setStep("camera");
  };

  const handleNewCard = () => {
    setImageBlob(null);
    setExtractedData(null);
    setStep("camera");
  };

  if (step === "mode-select") {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-3xl font-bold mt-6 mb-8">Scan Business Card</h1>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900">
              {activeEvent ? (
                <>
                  <strong>Active Event:</strong> {activeEvent.name}
                  <br />
                  <span className="text-xs">Scanned cards will be linked to this event</span>
                </>
              ) : (
                <>
                  <strong>No active event</strong>
                  <br />
                  <span className="text-xs">Create or start an event to organize scans</span>
                </>
              )}
            </p>
          </div>

          {!activeEvent && events.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Link to event (optional)</label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">No event</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name} ({new Date(event.date).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={() => setStep("camera")}
            className="w-full bg-black text-white py-4 px-6 rounded-lg font-bold text-lg hover:bg-gray-800"
          >
            📸 START SCANNING
          </button>

          <Link
            href="/contacts/new"
            className="block text-center bg-gray-100 text-gray-900 py-3 px-6 rounded-lg font-medium hover:bg-gray-200"
          >
            Or add contact manually
          </Link>
        </div>
      </div>
    );
  }

  if (step === "camera" && !imageBlob) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6 mt-6">
          <h2 className="text-2xl font-bold">Position Card</h2>
          <button
            onClick={() => setStep("mode-select")}
            className="text-gray-600 hover:text-gray-900 text-2xl"
          >
            ✕
          </button>
        </div>

        <CameraCapture
          onCapture={handleCaptureComplete}
          onError={(err) => alert(`Camera error: ${err}`)}
        />

        <p className="text-sm text-gray-600 mt-4">
          Position the entire business card within the yellow frame for best results.
        </p>
      </div>
    );
  }

  if (step === "processing") {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-8 mt-6">Processing Card</h2>

        {imageBlob && (
          <ScannerProcessing
            imageBlob={imageBlob}
            onComplete={handleProcessingComplete}
            onError={(err) => {
              alert(`Processing error: ${err}`);
              handleReset();
            }}
            onCancel={() => handleReset()}
          />
        )}
      </div>
    );
  }

  if (step === "review" && extractedData) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="mt-6 mb-6">
          <button
            onClick={() => setStep("processing")}
            className="text-gray-600 hover:text-gray-900 text-lg"
          >
            ← Back
          </button>
        </div>

        <ScannerReview
          extracted={extractedData.extracted}
          ocrText={extractedData.ocrText}
          eventId={selectedEventId}
          onSave={handleContactSave}
          onCancel={() => handleReset()}
        />
      </div>
    );
  }

  if (step === "complete") {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="mt-12 text-center">
          <div className="text-6xl mb-4">✓</div>
          <h2 className="text-3xl font-bold mb-2">Contact Saved!</h2>
          <p className="text-gray-600 mb-8">
            {successCount > 1 ? `${successCount} contacts scanned` : "Ready to scan more cards"}
          </p>

          <div className="space-y-3">
            <button
              onClick={handleNewCard}
              className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800"
            >
              📸 Scan Another Card
            </button>
            <Link
              href="/contacts"
              className="block bg-gray-100 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-200"
            >
              View All Contacts
            </Link>
            <Link
              href="/dashboard"
              className="block text-gray-600 hover:text-gray-900 py-3 font-medium"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
