import Tesseract from "tesseract.js";

export interface OCRResult {
  text: string;
  confidence: number;
  error?: string;
}

let ocrWorker: Tesseract.Worker | null = null;

async function initializeWorker() {
  if (!ocrWorker) {
    ocrWorker = await Tesseract.createWorker("eng");
    await ocrWorker.load();
  }
  return ocrWorker;
}

export async function extractTextFromImage(imageUrl: string | Blob): Promise<OCRResult> {
  try {
    const worker = await initializeWorker();

    const result = await worker.recognize(imageUrl);

    return {
      text: result.data.text,
      confidence: result.data.confidence / 100,
    };
  } catch (error) {
    return {
      text: "",
      confidence: 0,
      error: error instanceof Error ? error.message : "OCR failed",
    };
  }
}

export async function terminateWorker() {
  if (ocrWorker) {
    await ocrWorker.terminate();
    ocrWorker = null;
  }
}

export function parseBusinessCardText(text: string) {
  const lines = text.split("\n").filter((line) => line.trim());

  const extracted = {
    name: "",
    company: "",
    designation: "",
    phone: "",
    email: "",
    address: "",
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.includes("@")) {
      extracted.email = extracted.email || trimmed;
    }

    if (/\+?[\d\s\-()]{10,}/.test(trimmed) && !extracted.phone) {
      extracted.phone = trimmed;
    }

    if (trimmed.includes("CEO") || trimmed.includes("Director") || trimmed.includes("Manager")) {
      extracted.designation = trimmed;
    }

    if (extracted.name === "") {
      extracted.name = trimmed;
    }
  }

  return extracted;
}
