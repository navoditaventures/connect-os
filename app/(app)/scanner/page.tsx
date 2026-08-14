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
      <div
        className="min-h-screen"
        style={{ background: "var(--color-background)" }}
      >
        <div className="max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--color-foreground)" }}>
            Scan Business Card
          </h1>
          <p style={{ color: "var(--color-muted-foreground)", marginBottom: "2rem" }}>
            Capture and organize networking contacts
          </p>

          {/* Event Status */}
          {activeEvent ? (
            <div
              className="p-6 rounded-lg border-l-4 mb-8"
              style={{
                background: "var(--color-card)",
                borderColor: "var(--color-accent)"
              }}
            >
              <p style={{ color: "var(--color-foreground)" }}>
                <strong>📅 Active Event: {activeEvent.name}</strong>
              </p>
              <p style={{ color: "var(--color-muted-foreground)", fontSize: "0.875rem", marginTop: "0.5rem" }}>
                Scanned cards will be linked to this event
              </p>
            </div>
          ) : (
            <div
              className="p-6 rounded-lg border-l-4 mb-8"
              style={{
                background: "var(--color-muted)",
                borderColor: "var(--color-primary)"
              }}
            >
              <p style={{ color: "var(--color-foreground)" }}>
                <strong>No active event</strong>
              </p>
              <p style={{ color: "var(--color-muted-foreground)", fontSize: "0.875rem", marginTop: "0.5rem" }}>
                Create or start an event to organize scans
              </p>
            </div>
          )}

          {/* Event Selector */}
          {!activeEvent && events.length > 0 && (
            <div className="mb-8">
              <label className="block text-sm font-medium mb-3" style={{ color: "var(--color-foreground)" }}>
                Link to event (optional)
              </label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border transition-all focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  background: "var(--color-input-bg)",
                  borderColor: "var(--color-input-border)",
                  color: "var(--color-input-foreground)",
                  outlineColor: "var(--color-ring)"
                }}
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

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => setStep("camera")}
              className="w-full py-4 px-6 rounded-lg font-bold text-lg transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 flex items-center justify-center gap-2"
              style={{
                background: "var(--color-primary)",
                color: "var(--color-on-primary)",
                outlineColor: "var(--color-ring)"
              }}
            >
              <span>📸</span>
              START SCANNING
            </button>

            <Link
              href="/contacts/new"
              className="block text-center py-3 px-6 rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                background: "var(--color-muted)",
                color: "var(--color-muted-foreground)",
                border: "1px solid var(--color-border)",
                outlineColor: "var(--color-ring)"
              }}
            >
              Or add contact manually
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (step === "camera" && !imageBlob) {
    return (
      <div
        className="min-h-screen"
        style={{ background: "var(--color-background)" }}
      >
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold" style={{ color: "var(--color-foreground)" }}>
              Position Card
            </h2>
            <button
              onClick={() => setStep("mode-select")}
              className="text-2xl transition-transform hover:scale-110 active:scale-95"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              ✕
            </button>
          </div>

          <CameraCapture
            onCapture={handleCaptureComplete}
            onError={(err) => alert(`Camera error: ${err}`)}
          />

          <p className="text-sm mt-4" style={{ color: "var(--color-muted-foreground)" }}>
            Position the entire business card within the frame for best results.
          </p>
        </div>
      </div>
    );
  }

  if (step === "processing") {
    return (
      <div
        className="min-h-screen"
        style={{ background: "var(--color-background)" }}
      >
        <div className="max-w-2xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold mb-8" style={{ color: "var(--color-foreground)" }}>
            Processing Card
          </h2>

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
      </div>
    );
  }

  if (step === "review" && extractedData) {
    return (
      <div
        className="min-h-screen"
        style={{ background: "var(--color-background)" }}
      >
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="mb-6">
            <button
              onClick={() => setStep("processing")}
              className="text-lg font-medium transition-all hover:gap-1 flex items-center gap-1"
              style={{ color: "var(--color-primary)" }}
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
      </div>
    );
  }

  if (step === "complete") {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--color-background)" }}
      >
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <div className="text-6xl mb-6">✅</div>
          <h2 className="text-3xl font-bold mb-3" style={{ color: "var(--color-foreground)" }}>
            Contact Saved!
          </h2>
          <p className="text-lg mb-12" style={{ color: "var(--color-muted-foreground)" }}>
            {successCount > 1 ? `${successCount} contacts scanned` : "Ready to scan more cards"}
          </p>

          <div className="space-y-3">
            <button
              onClick={handleNewCard}
              className="w-full py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              style={{
                background: "var(--color-primary)",
                color: "var(--color-on-primary)"
              }}
            >
              <span>📸</span>
              Scan Another Card
            </button>
            <Link
              href="/contacts"
              className="block py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: "var(--color-muted)",
                color: "var(--color-muted-foreground)",
                border: "1px solid var(--color-border)"
              }}
            >
              View All Contacts
            </Link>
            <Link
              href="/dashboard"
              className="block py-3 font-medium transition-all hover:underline"
              style={{ color: "var(--color-primary)" }}
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
