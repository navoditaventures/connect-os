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
  const lines = ocrText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

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

  // Email regex
  const emailRegex = /[\w\.-]+@[\w\.-]+\.\w+/;

  // Phone regex - international format
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+\d{1,3}\s?\d{6,14}/;

  // Common job titles
  const titleKeywords = [
    "director",
    "manager",
    "ceo",
    "cto",
    "cfo",
    "founder",
    "president",
    "vice",
    "head",
    "engineer",
    "developer",
    "designer",
    "consultant",
    "officer",
    "executive",
    "partner",
    "specialist",
    "lead",
    "sr.",
    "senior",
    "jr.",
    "junior",
    "analyst",
    "architect",
    "administrator",
  ];

  let foundName = false;
  let foundCompany = false;
  let foundTitle = false;

  for (const line of lines) {
    // Skip very short or very long lines
    if (line.length < 2 || line.length > 150) continue;

    // Check for email
    const emailMatch = line.match(emailRegex);
    if (emailMatch && !result.email) {
      result.email = emailMatch[0].toLowerCase();
      continue;
    }

    // Check for phone
    const phoneMatch = line.match(phoneRegex);
    if (phoneMatch && !result.phone) {
      result.phone = phoneMatch[0].trim();
      continue;
    }

    // Check for job title
    const isTitle = titleKeywords.some((keyword) =>
      line.toLowerCase().includes(keyword)
    );
    if (isTitle && !foundTitle) {
      result.designation = line;
      foundTitle = true;
      continue;
    }

    // First non-email, non-phone, non-title line is likely the name
    if (!foundName && !line.includes("@") && line.length < 60) {
      result.name = line;
      foundName = true;
      continue;
    }

    // Second line (after name) is likely company
    if (foundName && !foundCompany && line.length > 3 && line.length < 100) {
      result.company = line;
      foundCompany = true;
      continue;
    }

    // Check for address indicators
    if (
      !result.address &&
      (line.toLowerCase().includes("st.") ||
        line.toLowerCase().includes("street") ||
        line.toLowerCase().includes("rd.") ||
        line.toLowerCase().includes("road") ||
        line.toLowerCase().includes("ave") ||
        line.toLowerCase().includes("avenue") ||
        line.toLowerCase().includes("blvd") ||
        line.toLowerCase().includes("city") ||
        /\d{5}/.test(line))
    ) {
      result.address = line;
    }
  }

  // Calculate confidence based on extracted fields
  const fieldsFilled = [
    result.name,
    result.company,
    result.email,
    result.phone,
    result.designation,
  ].filter((f) => f).length;

  result.confidence = Math.min(
    1.0,
    0.3 + fieldsFilled * 0.15
  );

  return result;
}
