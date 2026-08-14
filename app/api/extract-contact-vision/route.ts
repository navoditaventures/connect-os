import { NextRequest, NextResponse } from "next/server";
import { Anthropic } from "@anthropic-ai/sdk";

interface ExtractRequest {
  imageBase64: string;
  mimeType: string;
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
  rawText?: string;
}

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, mimeType } = (await request.json()) as ExtractRequest;

    if (!imageBase64) {
      return NextResponse.json(
        { error: "Image data required" },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      console.error("ANTHROPIC_API_KEY not configured");
      return NextResponse.json(
        { error: "API not configured - contact administrator" },
        { status: 500 }
      );
    }

    const extracted = await extractContactFromImage(imageBase64, mimeType);
    return NextResponse.json(extracted);
  } catch (error) {
    console.error("Vision extraction error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error details:", errorMessage);
    return NextResponse.json(
      { error: `Failed to extract contact: ${errorMessage}` },
      { status: 500 }
    );
  }
}

async function extractContactFromImage(
  imageBase64: string,
  mimeType: string
): Promise<ExtractedContact> {
  const systemPrompt = `You are an expert at reading and extracting information from business cards.

Your task is to analyze a business card image and extract the following information with maximum accuracy:
- name: The person's full name (FIRST + LAST NAME, not company name)
- company: The company/organization name
- designation: The person's job title/position
- phone: Phone number (include country code if visible)
- email: Email address
- address: Physical address (if visible on the card)
- industry: Industry/sector (infer from company description or designation)
- confidence: Your confidence score from 0 to 1 (1.0 = certain, 0.5 = unsure)

CRITICAL RULES:
1. Only extract information that is CLEARLY VISIBLE on the card
2. Do NOT guess or infer information that isn't there
3. The person's NAME is the individual's name, NOT the company name
4. Clean up formatting: remove extra spaces, normalize phone numbers
5. Phone numbers should include the country code
6. Email should be lowercase
7. Be very strict - accuracy is more important than completeness
8. If information is unclear or ambiguous, set lower confidence
9. Return ONLY valid, clearly present data
10. Use high confidence (0.8+) only when data is crystal clear

Return your response as a JSON object with these exact fields (use empty string for missing data):
{
  "name": "person's full name or empty string",
  "company": "company name or empty string",
  "designation": "job title or empty string",
  "phone": "phone number or empty string",
  "email": "email or empty string",
  "address": "address or empty string",
  "industry": "industry or empty string",
  "confidence": 0.0 to 1.0,
  "rawText": "any additional notes about the card"
}

RESPOND WITH ONLY THE JSON OBJECT, NO OTHER TEXT.`;

  try {
    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 800,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: 'Please analyze this business card image and extract all contact information. Be thorough and accurate.',
            },
          ],
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
        Math.max(0.0, parseFloat(parsed.confidence) || 0.5)
      ),
      rawText: validateString(parsed.rawText),
    };

    // Boost confidence if we have the essential fields
    const essentialFields = [extracted.name, extracted.company, extracted.email, extracted.phone];
    const filledEssential = essentialFields.filter((v) => v).length;

    if (filledEssential >= 3) {
      extracted.confidence = Math.min(1.0, extracted.confidence + 0.15);
    }

    return extracted;
  } catch (error) {
    console.error("Claude vision API error:", error);
    throw new Error("Failed to analyze business card image");
  }
}

function validateString(value: any): string {
  if (!value || typeof value !== "string") return "";
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.toLowerCase() !== "empty string" ? trimmed : "";
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
  // Remove common formatting, keep only digits, +, spaces, dashes, parentheses
  const cleaned = trimmed.replace(/[\s().-]/g, "");
  // Valid if starts with + and has at least 11 characters, or has at least 10 digits
  if (cleaned.startsWith("+") && cleaned.length >= 11) return trimmed;
  if (/^\d{10,}$/.test(cleaned)) return trimmed;
  return "";
}
