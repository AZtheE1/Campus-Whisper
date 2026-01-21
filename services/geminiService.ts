
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function moderateContent(content: string): Promise<{ isSafe: boolean; reason?: string }> {
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
    console.error("Moderation error:", error);
    // Fail safe: in case of API error, allow but log.
    return { isSafe: true };
  }
}
