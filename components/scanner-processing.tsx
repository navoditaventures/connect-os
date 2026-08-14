"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Tesseract from "tesseract.js";

interface ScannerProcessingProps {
  imageBlob: Blob;
  onComplete: (data: {
    ocrText: string;
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
  }) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

type ProcessingStep = "ocr" | "parsing" | "complete";

export default function ScannerProcessing({
  imageBlob,
  onComplete,
  onError,
  onCancel,
}: ScannerProcessingProps) {
  const [step, setStep] = useState<ProcessingStep>("ocr");
  const [ocrText, setOcrText] = useState("");
  const [extracted, setExtracted] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const process = async () => {
      try {
        setProgress(10);

        // Step 1: OCR using Tesseract.js (client-side, completely free)
        console.log("Starting Tesseract OCR...");
        const ocrResult = await Tesseract.recognize(imageBlob, "eng", {
          logger: (m) => {
            console.log("OCR progress:", m.progress);
            setProgress(Math.min(50, 10 + m.progress * 40));
          },
        });

        const extractedText = ocrResult.data.text;
        setOcrText(extractedText);
        setProgress(60);

        console.log("OCR complete. Text length:", extractedText.length);

        // Step 2: Parse extracted text
        setStep("parsing");
        setProgress(70);

        const response = await axios.post("/api/extract-ocr", {
          ocrText: extractedText,
        });

        setExtracted(response.data);
        setProgress(90);

        setTimeout(() => {
          setProgress(100);
          setStep("complete");
          onComplete({
            ocrText: extractedText,
            extracted: response.data,
          });
        }, 500);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Processing failed";
        console.error("Processing error:", message);
        setError(message);
        onError(message);
      }
    };

    process();
  }, [imageBlob, onComplete, onError]);

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64.split(",")[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  if (error) {
    return (
      <div
        className="space-y-4 p-6 rounded-lg border"
        style={{
          background: "rgba(220, 38, 38, 0.05)",
          borderColor: "var(--color-destructive)",
        }}
      >
        <div>
          <p className="font-semibold mb-2" style={{ color: "var(--color-destructive)" }}>
            ⚠️ Processing Failed
          </p>
          <p className="text-sm mb-4" style={{ color: "var(--color-destructive)" }}>
            {error}
          </p>
          <p
            className="text-xs mb-4"
            style={{ color: "var(--color-destructive)" }}
          >
            Tips:
            <br />• Ensure the entire business card is visible and in focus
            <br />• Use good lighting (avoid shadows/glare)
            <br />• Card should be straight, not tilted
            <br />• Background should contrast with the card
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-lg font-semibold transition-all"
            style={{
              background: "var(--color-primary)",
              color: "var(--color-on-primary)",
            }}
          >
            Try Again
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-lg font-semibold border transition-all"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-muted-foreground)",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Processing Step */}
      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all animate-pulse"
            style={{
              background:
                step === "complete"
                  ? "rgba(16, 185, 129, 0.1)"
                  : "rgba(37, 99, 235, 0.1)",
              color:
                step === "complete"
                  ? "var(--color-success)"
                  : "var(--color-primary)",
            }}
          >
            {step === "complete" ? "✓" : "🤖"}
          </div>
        </div>
        <div className="pt-3">
          <p
            className="font-medium"
            style={{
              color:
                step === "complete"
                  ? "var(--color-success)"
                  : "var(--color-foreground)",
            }}
          >
            {step === "complete"
              ? "Card analyzed successfully!"
              : "Analyzing business card with AI..."}
          </p>
          <p
            className="text-xs mt-2"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            {step === "analyzing"
              ? "Reading all details from the card image"
              : "Ready for review"}
          </p>
        </div>
      </div>

      {/* Extracted Data Summary */}
      {step === "complete" && extracted && (
        <div
          className="rounded-lg p-6 border"
          style={{
            background: "rgba(16, 185, 129, 0.05)",
            borderColor: "var(--color-success)",
          }}
        >
          <p className="font-semibold mb-4" style={{ color: "var(--color-success)" }}>
            ✓ Extracted Information
          </p>

          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            {extracted.name && (
              <div>
                <p
                  className="text-xs font-medium"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  👤 Name
                </p>
                <p
                  className="font-semibold mt-1"
                  style={{ color: "var(--color-foreground)" }}
                >
                  {extracted.name}
                </p>
              </div>
            )}
            {extracted.company && (
              <div>
                <p
                  className="text-xs font-medium"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  🏢 Company
                </p>
                <p
                  className="font-semibold mt-1"
                  style={{ color: "var(--color-foreground)" }}
                >
                  {extracted.company}
                </p>
              </div>
            )}
            {extracted.email && (
              <div>
                <p
                  className="text-xs font-medium"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  📧 Email
                </p>
                <p
                  className="font-semibold mt-1 break-all"
                  style={{ color: "var(--color-foreground)" }}
                >
                  {extracted.email}
                </p>
              </div>
            )}
            {extracted.phone && (
              <div>
                <p
                  className="text-xs font-medium"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  📱 Phone
                </p>
                <p
                  className="font-semibold mt-1"
                  style={{ color: "var(--color-foreground)" }}
                >
                  {extracted.phone}
                </p>
              </div>
            )}
            {extracted.designation && (
              <div>
                <p
                  className="text-xs font-medium"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  💼 Designation
                </p>
                <p
                  className="font-semibold mt-1"
                  style={{ color: "var(--color-foreground)" }}
                >
                  {extracted.designation}
                </p>
              </div>
            )}
            {extracted.address && (
              <div>
                <p
                  className="text-xs font-medium"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  📍 Address
                </p>
                <p
                  className="font-semibold mt-1"
                  style={{ color: "var(--color-foreground)" }}
                >
                  {extracted.address}
                </p>
              </div>
            )}
          </div>

          <div
            className="text-xs font-medium pt-3 border-t"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-muted-foreground)",
            }}
          >
            Confidence Score: <strong>{Math.round(extracted.confidence * 100)}%</strong>
            {extracted.confidence >= 0.8 && (
              <span style={{ color: "var(--color-success)" }}> ✓ High accuracy</span>
            )}
            {extracted.confidence < 0.8 && extracted.confidence >= 0.5 && (
              <span style={{ color: "var(--color-warning)" }}>
                ⚠ Review before saving
              </span>
            )}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div
        className="w-full h-2 rounded-full overflow-hidden"
        style={{ background: "var(--color-muted)" }}
      >
        <div
          className="h-full transition-all duration-300"
          style={{
            background:
              step === "complete"
                ? "var(--color-success)"
                : "var(--color-primary)",
            width: `${progress}%`,
          }}
        />
      </div>
    </div>
  );
}
