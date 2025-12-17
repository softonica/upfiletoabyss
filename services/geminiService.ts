import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const extractLinksFromText = async (text: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Extract all direct file URLs or video URLs from the following text. 
      Ignore standard text, navigation links, or junk. 
      Only return valid URLs that look like downloadable files or video streams.
      Input text:
      ${text}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            urls: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of valid extracted URLs"
            }
          }
        }
      }
    });

    const jsonStr = response.text;
    if (!jsonStr) return [];
    
    const parsed = JSON.parse(jsonStr);
    return parsed.urls || [];
  } catch (error) {
    console.error("Gemini extraction failed", error);
    return [];
  }
};