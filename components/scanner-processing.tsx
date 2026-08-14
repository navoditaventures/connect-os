"use client";

import { useState, useEffect } from "react";
import { extractTextFromImage, parseBusinessCardText } from "@/lib/services/ocr";
import axios from "axios";

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

type ProcessingStep = "ocr" | "structure" | "duplicate" | "complete";

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
        setProgress(0);

        const result = await extractTextFromImage(imageBlob);
        if (result.error) {
          throw new Error(result.error);
        }

        setOcrText(result.text);
        setProgress(40);
        setStep("structure");

        const response = await axios.post("/api/extract-contact", {
          ocrText: result.text,
        });

        setExtracted(response.data);
        setProgress(80);
        setStep("duplicate");

        setTimeout(() => {
          setProgress(100);
          setStep("complete");
          onComplete({
            ocrText: result.text,
            extracted: response.data,
          });
        }, 500);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Processing failed";
        setError(message);
        onError(message);
      }
    };

    process();
  }, [imageBlob, onComplete, onError]);

  const steps = [
    { id: "ocr", label: "Reading card...", icon: "👁️" },
    { id: "structure", label: "Extracting information...", icon: "🔍" },
    { id: "duplicate", label: "Checking duplicates...", icon: "✓" },
  ];

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <p className="font-semibold mb-2">Processing Failed</p>
          <p className="text-sm mb-4">{error}</p>
          <p className="text-xs text-red-700 mb-4">The card image might be unclear. Try again with better lighting.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800">
            Retry
          </button>
          <button
            onClick={onCancel}
            className="flex-1 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {steps.map((s, index) => {
        const isActive = s.id === step;
        const isDone = step === "complete" || steps.findIndex((st) => st.id === step) > index;

        return (
          <div key={s.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${
                  isDone
                    ? "bg-green-100 text-green-700"
                    : isActive
                      ? "bg-blue-100 text-blue-700 animate-pulse"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {isDone ? "✓" : s.icon}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-1 h-8 mt-2 ${isDone ? "bg-green-200" : isActive ? "bg-blue-200" : "bg-gray-200"}`} />
              )}
            </div>
            <div className="pt-3">
              <p className={`font-medium ${isActive ? "text-black" : isDone ? "text-green-700" : "text-gray-500"}`}>
                {s.label}
              </p>
              {isActive && step === "ocr" && ocrText && (
                <p className="text-xs text-gray-600 mt-2 line-clamp-2">{ocrText}</p>
              )}
            </div>
          </div>
        );
      })}

      {step === "complete" && extracted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-900 font-semibold mb-3">✓ Card processed successfully</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {extracted.name && (
              <div>
                <p className="text-xs text-green-700">Name</p>
                <p className="font-medium text-green-900">{extracted.name}</p>
              </div>
            )}
            {extracted.company && (
              <div>
                <p className="text-xs text-green-700">Company</p>
                <p className="font-medium text-green-900">{extracted.company}</p>
              </div>
            )}
            {extracted.email && (
              <div>
                <p className="text-xs text-green-700">Email</p>
                <p className="font-medium text-green-900">{extracted.email}</p>
              </div>
            )}
            {extracted.phone && (
              <div>
                <p className="text-xs text-green-700">Phone</p>
                <p className="font-medium text-green-900">{extracted.phone}</p>
              </div>
            )}
          </div>
          <p className="text-xs text-green-700 mt-3">
            Confidence: {Math.round(extracted.confidence * 100)}%
          </p>
        </div>
      )}

      <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-black transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
