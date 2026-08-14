"use client";

import { useRef, useEffect, useState } from "react";

interface CameraCaptureProps {
  onCapture: (blob: Blob) => void;
  onError?: (error: string) => void;
}

export default function CameraCapture({ onCapture, onError }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    initCamera();
  }, []);

  const initCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsReady(true);
        };
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to access camera";
      setError(message);
      onError?.(message);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const context = canvasRef.current.getContext("2d");
    if (!context) return;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;

    context.drawImage(videoRef.current, 0, 0);

    canvasRef.current.toBlob((blob) => {
      if (blob) {
        onCapture(blob);
      }
    }, "image/jpeg", 0.95);
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        <p className="font-semibold mb-2">Camera Access Required</p>
        <p className="text-sm mb-4">{error}</p>
        <p className="text-xs text-red-700">
          Please grant camera permission in your browser settings and reload the page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
        <video
          ref={videoRef}
          playsInline
          className="w-full h-full object-cover"
          style={{ transform: isMobile ? "scaleX(-1)" : "none" }}
        />

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 border-4 border-yellow-400 border-opacity-50 m-8 rounded-lg">
            <div className="absolute top-2 left-2 w-6 h-6 border-t-4 border-l-4 border-yellow-400"></div>
            <div className="absolute top-2 right-2 w-6 h-6 border-t-4 border-r-4 border-yellow-400"></div>
            <div className="absolute bottom-2 left-2 w-6 h-6 border-b-4 border-l-4 border-yellow-400"></div>
            <div className="absolute bottom-2 right-2 w-6 h-6 border-b-4 border-r-4 border-yellow-400"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white text-sm font-semibold text-center bg-black bg-opacity-50 px-4 py-2 rounded-lg">
              Position card within frame
            </p>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {isReady && (
        <div className="flex gap-3">
          <button
            onClick={capturePhoto}
            className="flex-1 bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 text-lg"
          >
            📸 Capture Card
          </button>
          <button
            onClick={stopCamera}
            className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
        </div>
      )}

      {!isReady && !error && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin">
            <div className="h-8 w-8 border-4 border-gray-200 border-t-black rounded-full" />
          </div>
          <p className="text-gray-600 mt-4">Initializing camera...</p>
        </div>
      )}
    </div>
  );
}
