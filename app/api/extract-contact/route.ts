import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

interface ExtractRequest {
  ocrText: string;
  imageUrl?: string;
}

interface ExtractedContact {
  name: string;
  company?: string;
  designation?: string;
  phone?: string;
  email?: string;
  address?: string;
  industry?: string;
  confidence: number;
}

export async function POST(request: NextRequest) {
  try {
    const { ocrText } = (await request.json()) as ExtractRequest;

    if (!ocrText) {
      return NextResponse.json({ error: "No OCR text provided" }, { status: 400 });
    }

    const extracted = structureContactData(ocrText);

    return NextResponse.json(extracted);
  } catch (error) {
    console.error("Contact extraction error:", error);
    return NextResponse.json(
      { error: "Failed to extract contact information" },
      { status: 500 }
    );
  }
}

function structureContactData(text: string): ExtractedContact {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  const result: ExtractedContact = {
    name: "",
    company: "",
    designation: "",
    phone: "",
    email: "",
    address: "",
    industry: "",
    confidence: 0.6,
  };

  const emailRegex = /[\w\.-]+@[\w\.-]+\.\w+/;
  const phoneRegex = /(\+?[\d\s\-()]{10,}|\d{10,})/;

  let foundName = false;
  let foundCompany = false;

  for (const line of lines) {
    const emailMatch = line.match(emailRegex);
    if (emailMatch && !result.email) {
      result.email = emailMatch[0];
      continue;
    }

    const phoneMatch = line.match(phoneRegex);
    if (phoneMatch && !result.phone) {
      result.phone = phoneMatch[0];
      continue;
    }

    const titleKeywords = [
      "director",
      "manager",
      "ceo",
      "cto",
      "founder",
      "president",
      "vice",
      "head",
      "engineer",
      "developer",
      "consultant",
      "officer",
    ];
    const isTitleLine = titleKeywords.some((keyword) => line.toLowerCase().includes(keyword));

    if (isTitleLine && !result.designation) {
      result.designation = line;
      continue;
    }

    if (!foundName && line.length > 2 && line.length < 50 && !line.includes("@")) {
      result.name = line;
      foundName = true;
      continue;
    }

    if (foundName && !foundCompany && line.length > 3 && line.length < 100) {
      result.company = line;
      foundCompany = true;
      continue;
    }

    if (!result.address && (line.toLowerCase().includes("street") ||
        line.toLowerCase().includes("road") ||
        line.toLowerCase().includes("avenue") ||
        line.toLowerCase().includes("city"))) {
      result.address = line;
    }
  }

  result.confidence = Math.min(0.95, 0.5 + (Object.values(result).filter((v) => v).length * 0.1));

  return result;
}
