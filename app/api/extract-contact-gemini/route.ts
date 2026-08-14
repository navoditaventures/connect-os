import { NextRequest, NextResponse } from "next/server";

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

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, mimeType } = (await request.json()) as ExtractRequest;

    if (!imageBase64) {
      return NextResponse.json(
        { error: "Image data required" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY not configured");
      return NextResponse.json(
        { error: "API not configured - contact administrator" },
        { status: 500 }
      );
    }

    const extracted = await extractContactWithGemini(imageBase64, mimeType);
    return NextResponse.json(extracted);
  } catch (error) {
    console.error("Gemini extraction error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error details:", errorMessage);
    return NextResponse.json(
      { error: `Failed to extract contact: ${errorMessage}` },
      { status: 500 }
    );
  }
}

async function extractContactWithGemini(
  imageBase64: string,
  mimeType: string
): Promise<ExtractedContact> {
  console.log("Starting Gemini extraction...");
  console.log("API Key present:", !!process.env.GEMINI_API_KEY);
  console.log("Image Base64 length:", imageBase64.length);
  console.log("MIME type:", mimeType);

  const prompt = `You are an expert at reading and extracting information from business cards.

Analyze this business card image and extract the following information with maximum accuracy:
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
8. If information is unclear, set lower confidence
9. Return ONLY valid, clearly present data

Return ONLY a JSON object (no markdown, no code blocks, just raw JSON):
{
  "name": "person's full name or empty string",
  "company": "company name or empty string",
  "designation": "job title or empty string",
  "phone": "phone number or empty string",
  "email": "email or empty string",
  "address": "address or empty string",
  "industry": "industry or empty string",
  "confidence": 0.75,
  "rawText": "any notes"
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro-vision:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: imageBase64,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            maxOutputTokens: 800,
            temperature: 0.1, // Low temperature for accuracy
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error response:", errorText);
      console.error("Response status:", response.status);
      console.error("Response headers:", Object.fromEntries(response.headers));

      let errorMessage = response.statusText;
      try {
        const error = JSON.parse(errorText);
        errorMessage = error.error?.message || error.error?.details?.[0]?.errorMessage || errorText;
      } catch (e) {
        errorMessage = errorText;
      }

      throw new Error(`Gemini API error (${response.status}): ${errorMessage}`);
    }

    const data = await response.json();
    console.log("Gemini response received");
    console.log("Response data:", JSON.stringify(data).substring(0, 500));

    if (!data.candidates || !data.candidates[0]?.content?.parts[0]?.text) {
      console.error("Invalid response structure:", data);
      throw new Error("No response from Gemini API");
    }

    const responseText = data.candidates[0].content.parts[0].text;
    console.log("Extracted text:", responseText.substring(0, 200));

    // Parse the JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Response text:", responseText);
      throw new Error("No JSON found in Gemini response");
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

    // Boost confidence if we have essential fields
    const essentialFields = [
      extracted.name,
      extracted.company,
      extracted.email,
      extracted.phone,
    ];
    const filledEssential = essentialFields.filter((v) => v).length;

    if (filledEssential >= 3) {
      extracted.confidence = Math.min(1.0, extracted.confidence + 0.15);
    }

    return extracted;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
  }
}

function validateString(value: any): string {
  if (!value || typeof value !== "string") return "";
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.toLowerCase() !== "empty string"
    ? trimmed
    : "";
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
  const cleaned = trimmed.replace(/[\s().-]/g, "");
  if (cleaned.startsWith("+") && cleaned.length >= 11) return trimmed;
  if (/^\d{10,}$/.test(cleaned)) return trimmed;
  return "";
}
