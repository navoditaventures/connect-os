import { NextRequest, NextResponse } from "next/server";
import { Anthropic } from "@anthropic-ai/sdk";

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

const client = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    const { ocrText, imageUrl } = (await request.json()) as ExtractRequest;

    if (!ocrText && !imageUrl) {
      return NextResponse.json(
        { error: "OCR text or image URL required" },
        { status: 400 }
      );
    }

    const extracted = await extractContactWithAI(ocrText, imageUrl);

    return NextResponse.json(extracted);
  } catch (error) {
    console.error("Contact extraction error:", error);
    return NextResponse.json(
      { error: "Failed to extract contact information" },
      { status: 500 }
    );
  }
}

async function extractContactWithAI(
  ocrText: string,
  imageUrl?: string
): Promise<ExtractedContact> {
  const prompt = `You are an expert at extracting contact information from business cards.

  Extract the following information from the provided text and return ONLY valid data:
  - name: Full name of the person
  - company: Company/organization name
  - designation: Job title/position
  - phone: Phone number (include country code if present)
  - email: Email address
  - address: Physical address
  - industry: Industry/sector (inferred from company or designation)

  IMPORTANT RULES:
  1. Only extract information that is clearly present - don't infer or guess
  2. Clean up formatting (remove extra spaces, standardize phone numbers)
  3. Phone numbers should include country code and be formatted consistently
  4. Email should be lowercase
  5. Name should be the person's full name (first + last), not company name
  6. Return ONLY valid, non-empty data
  7. Be strict about data accuracy - if unsure, omit the field

  OCR Text:
  ${ocrText}

  Return a JSON object with these exact fields (use null for missing data):
  {
    "name": "full name or null",
    "company": "company name or null",
    "designation": "job title or null",
    "phone": "phone number or null",
    "email": "email or null",
    "address": "address or null",
    "industry": "industry or null",
    "confidence": 0.0 to 1.0
  }

  RESPOND WITH ONLY THE JSON OBJECT, NO OTHER TEXT.`;

  try {
    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const responseText =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Parse the JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate and sanitize the response
    const extracted: ExtractedContact = {
      name: validateString(parsed.name),
      company: validateString(parsed.company),
      designation: validateString(parsed.designation),
      phone: validatePhone(parsed.phone),
      email: validateEmail(parsed.email),
      address: validateString(parsed.address),
      industry: validateString(parsed.industry),
      confidence: Math.min(
        1.0,
        Math.max(0.0, parseFloat(parsed.confidence) || 0.7)
      ),
    };

    // Boost confidence if we have multiple fields
    const filledFields = Object.values(extracted).filter(
      (v) => v && v !== 0.7
    ).length;
    if (filledFields >= 5) {
      extracted.confidence = Math.min(1.0, extracted.confidence + 0.2);
    }

    return extracted;
  } catch (error) {
    console.error("AI extraction error:", error);
    // Fallback to regex extraction if AI fails
    return structureContactDataFallback(ocrText);
  }
}

function validateString(value: any): string {
  if (!value || typeof value !== "string") return "";
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : "";
}

function validateEmail(value: any): string {
  if (!value || typeof value !== "string") return "";
  const trimmed = value.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed) ? trimmed : "";
}

function validatePhone(value: any): string {
  if (!value || typeof value !== "string") return "";
  const trimmed = value.trim();
  // Remove common formatting, keep only digits and +
  const cleaned = trimmed.replace(/[\s\-()]/g, "");
  // Valid if starts with + or has at least 10 digits
  if (cleaned.startsWith("+") && cleaned.length >= 11) return trimmed;
  if (/^\d{10,}$/.test(cleaned)) return trimmed;
  return "";
}

// Fallback basic extraction if AI fails
function structureContactDataFallback(text: string): ExtractedContact {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  const result: ExtractedContact = {
    name: "",
    company: "",
    designation: "",
    phone: "",
    email: "",
    address: "",
    industry: "",
    confidence: 0.4,
  };

  const emailRegex = /[\w\.-]+@[\w\.-]+\.\w+/;
  const phoneRegex = /(\+?[\d\s\-()]{10,})/;

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
      result.phone = phoneMatch[0].trim();
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
      "executive",
      "partner",
      "specialist",
    ];
    const isTitleLine = titleKeywords.some((keyword) =>
      line.toLowerCase().includes(keyword)
    );

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
  }

  return result;
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
