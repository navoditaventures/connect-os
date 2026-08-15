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
  console.log("\n========== OCR TEXT RECEIVED ==========");
  console.log("Raw OCR text:\n", ocrText);

  const lines = ocrText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  console.log("\nLines extracted:");
  lines.forEach((line, i) => console.log(`  ${i}: "${line}"`));

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

  // Regex patterns - more robust
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const phoneRegex = /(\+\d{1,3}\s?)?\d{7,14}|(\+\d{1,3}[-.\s]?)?\(?\d{3,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{4}/g;
  const zipCodeRegex = /\b\d{5,6}\b/;
  const commonTaglines = ["trusted heritage", "smart future", "tagline", "slogan", "motto"];

  // Step 1: Extract emails (most reliable)
  const emails = ocrText.match(emailRegex) || [];
  if (emails.length > 0) {
    result.email = emails[0].toLowerCase();
    console.log("✓ Email:", result.email);
  }

  // Step 2: Extract phone (look for patterns)
  const phones = ocrText.match(phoneRegex) || [];
  if (phones.length > 0) {
    result.phone = phones[0].trim();
    console.log("✓ Phone:", result.phone);
  }

  // Step 3: Find designation (job title keywords)
  const titleKeywords = [
    "president", "ceo", "cto", "cfo", "vp", "vice president",
    "director", "manager", "lead", "head", "chief", "officer",
    "engineer", "developer", "architect", "designer",
    "consultant", "specialist", "analyst",
    "founder", "partner", "executive", "senior", "junior",
    "associate", "coordinator", "supervisor", "assistant"
  ];

  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    const hasTitle = titleKeywords.some(kw => lowerLine.includes(kw));
    const isShort = line.length < 100;
    const isNotCompany = !lowerLine.includes("ltd") && !lowerLine.includes("inc") && !lowerLine.includes("llc");

    if (hasTitle && isShort && isNotCompany) {
      result.designation = line;
      console.log("✓ Designation:", line);
      break;
    }
  }

  // Step 4: Find address (zip code or address keywords)
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    const hasZip = zipCodeRegex.test(line);
    const hasAddressKeywords = /street|road|avenue|boulevard|drive|lane|court|floor|block|main|st\.|rd\.|ave\.|blvd\.|dr\.|ln\.|bangalore|koramangala|delhi|mumbai|chennai/i.test(line);
    const hasNumber = /\d{2,}/.test(line);

    if ((hasZip || (hasAddressKeywords && hasNumber)) && line.length > 10) {
      result.address = line;
      console.log("✓ Address:", line);
      break;
    }
  }

  // Step 5: Extract company and name (trickier)
  // Strategy:
  // - Company is usually short (1-3 words), contains Ltd/Inc/Bank/Ltd, or is at top
  // - Name is 2-4 words, comes before designation
  // - Skip taglines

  const nameAndCompanyLines = lines.filter(line => {
    const lowerLine = line.toLowerCase();
    // Skip contact info, addresses, designations, taglines
    if (line.includes("@") || line.match(phoneRegex) || line.includes("http") ||
        line.includes("www") || lowerLine.includes("fax") || lowerLine.includes("website")) {
      return false;
    }
    if (commonTaglines.some(tag => lowerLine.includes(tag))) {
      return false;
    }
    if (result.designation && line === result.designation) {
      return false;
    }
    if (result.address && line === result.address) {
      return false;
    }
    return true;
  });

  console.log("\nName/Company candidate lines:", nameAndCompanyLines);

  // Find company first (usually contains Ltd, Inc, Bank, Corp, or is the brand)
  for (const line of nameAndCompanyLines) {
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes("ltd") || lowerLine.includes("inc") || lowerLine.includes("bank") ||
        lowerLine.includes("corp") || lowerLine.includes("pvt") || lowerLine.includes("limited")) {
      result.company = line;
      console.log("✓ Company (branded):", line);
      break;
    }
  }

  // Find name: 2-5 words, reasonable length, not company
  if (!result.name && nameAndCompanyLines.length > 0) {
    for (const line of nameAndCompanyLines) {
      if (line === result.company) continue;

      const wordCount = line.split(/\s+/).length;
      const isReasonableLength = line.length > 3 && line.length < 80;
      const hasOnlyLettersAndSpaces = /^[a-zA-Z\s.'-]+$/.test(line);

      if (wordCount >= 2 && wordCount <= 5 && isReasonableLength && hasOnlyLettersAndSpaces) {
        result.name = line;
        console.log("✓ Name:", line);
        break;
      }
    }
  }

  // Fallback: if company not found, use first brand-like line
  if (!result.company && nameAndCompanyLines.length > 0) {
    for (const line of nameAndCompanyLines) {
      if (line === result.name) continue;
      if (line.length < 150 && line.length > 2) {
        result.company = line;
        console.log("✓ Company (fallback):", line);
        break;
      }
    }
  }

  // Fallback: if name not found, find a 2-3 word line
  if (!result.name && nameAndCompanyLines.length > 0) {
    for (const line of nameAndCompanyLines) {
      const wordCount = line.split(/\s+/).length;
      if (wordCount === 2 || wordCount === 3) {
        result.name = line;
        console.log("✓ Name (fallback):", line);
        break;
      }
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

  result.confidence = Math.min(1.0, 0.4 + fieldsFilled * 0.15);

  console.log("\n========== FINAL RESULT ==========");
  console.log(result);
  console.log("Confidence:", Math.round(result.confidence * 100) + "%");

  return result;
}
