
import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize lazily to avoid immediate crash if key is missing
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function moderateContent(content: string): Promise<{ isSafe: boolean; reason?: string }> {
  // 1. Fallback: If no API key, bypass moderation (allow post)
  if (!ai || !apiKey) {
    console.warn("⚠️ Gemini API Key missing - Moderation skipped.");
    return { isSafe: true };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: `"${content}"` }]
        }
      ],
      config: {
        systemInstruction: `You are a campus moderator. If this text contains real names, bullying, or hate speech, reply with "BLOCK". Otherwise, reply "PASS".`,
        temperature: 0.1,
      },
    });

    const result = response.text?.trim().toUpperCase() || 'PASS';

    if (result.includes('BLOCK')) {
      return {
        isSafe: false,
        reason: "Community Guidelines: Post contains prohibited content (bullying, hate speech, or real names)."
      };
    }

    return { isSafe: true };
  } catch (error) {
    console.warn("⚠️ Moderation API error - Failing open (allowing post):", error);
    // 2. Fallback: On API error (quota, network, etc), allow post
    return { isSafe: true };
  }
}
