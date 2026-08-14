import { NextRequest, NextResponse } from "next/server";

interface ExtractRequest {
  ocrText: string;
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
    console.log("OCR extraction API called");
    const body = await request.json() as ExtractRequest;
    console.log("OCR text received, length:", body.ocrText?.length || 0);

    if (!body.ocrText) {
      console.error("No OCR text provided");
      return NextResponse.json(
        { error: "OCR text required" },
        { status: 400 }
      );
    }

    // Parse the extracted OCR text
    const extracted = parseBusinessCardText(body.ocrText);
    return NextResponse.json(extracted);
  } catch (error) {
    console.error("OCR extraction error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to extract contact: ${errorMessage}` },
      { status: 500 }
    );
  }
}

function parseBusinessCardText(ocrText: string): ExtractedContact {
  console.log("Parsing OCR text, length:", ocrText.length);

  const lines = ocrText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  console.log("Total lines:", lines.length);
  console.log("Lines:", lines.slice(0, 10));

  const result: ExtractedContact = {
    name: "",
    company: "",
    designation: "",
    phone: "",
    email: "",
    address: "",
    industry: "",
    confidence: 0.5,
  };

  // Regex patterns
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const phoneRegex = /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}|\+[0-9]{1,3}\s?[0-9]{6,14}/g;
  const zipCodeRegex = /\b\d{5}(?:-\d{4})?\b/;

  // Extract all emails
  const emails = ocrText.match(emailRegex) || [];
  if (emails.length > 0) {
    result.email = emails[0].toLowerCase();
  }

  // Extract all phone numbers
  const phones = ocrText.match(phoneRegex) || [];
  if (phones.length > 0) {
    result.phone = phones[0].trim();
  }

  // Job title keywords
  const titleKeywords = [
    "president", "ceo", "cto", "cfo", "vp", "vice president",
    "director", "manager", "lead", "head", "chief",
    "engineer", "developer", "architect", "designer",
    "consultant", "specialist", "analyst", "officer",
    "founder", "partner", "executive", "senior", "junior"
  ];

  // Find designation (job title)
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (titleKeywords.some(kw => lowerLine.includes(kw)) && line.length < 100) {
      result.designation = line;
      console.log("Found designation:", line);
      break;
    }
  }

  // Extract name and company from first few lines
  let lineIndex = 0;

  // Skip lines that are just email/phone/website
  while (lineIndex < lines.length) {
    const line = lines[lineIndex];
    if (line.includes("@") || line.match(phoneRegex) || line.includes("http") || line.includes("www.")) {
      lineIndex++;
      continue;
    }
    break;
  }

  // First valid line is usually the name (2-4 words, reasonable length)
  if (lineIndex < lines.length && !result.name) {
    const potentialName = lines[lineIndex];
    const wordCount = potentialName.split(/\s+/).length;
    if (wordCount >= 2 && wordCount <= 5 && potentialName.length < 80 && potentialName.length > 3) {
      result.name = potentialName;
      console.log("Found name:", potentialName);
      lineIndex++;
    }
  }

  // Next line after name is usually company
  while (lineIndex < lines.length && !result.company) {
    const line = lines[lineIndex];

    // Skip designation and contact info lines
    if (result.designation && line === result.designation) {
      lineIndex++;
      continue;
    }
    if (line.includes("@") || line.match(phoneRegex) || line.includes("http")) {
      lineIndex++;
      continue;
    }

    // If it's a reasonable company name length
    if (line.length > 2 && line.length < 150) {
      result.company = line;
      console.log("Found company:", line);
      break;
    }
    lineIndex++;
  }

  // Look for address (contains digits, streets, cities)
  for (const line of lines) {
    if (zipCodeRegex.test(line) ||
        (line.toLowerCase().match(/st\.?|street|rd\.?|road|ave\.?|avenue|blvd\.?|boulevard|dr\.?|drive|ln\.?|lane|ct\.?|court/i) &&
         line.length > 5)) {
      result.address = line;
      console.log("Found address:", line);
      break;
    }
  }

  // Calculate confidence
  const fieldsFilled = [
    result.name,
    result.company,
    result.email,
    result.phone,
    result.designation,
  ].filter((f) => f && f.length > 0).length;

  result.confidence = Math.min(1.0, 0.4 + fieldsFilled * 0.12);

  console.log("Extracted contact:", result);
  return result;
}
