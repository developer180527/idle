import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || ''; 
// Note: In a real production app, ensure API_KEY is set in environment or provided securely.
// Since we cannot prompt user, we rely on the injected env var.

const ai = new GoogleGenAI({ apiKey });

export const askGemini = async (
  prompt: string,
  contextCode: string,
  modelName: string = 'gemini-3-flash-preview'
): Promise<string> => {
  try {
    if (!apiKey) {
      return "Error: API Key is missing. Please ensure process.env.API_KEY is configured.";
    }

    const systemPrompt = `You are an expert Python tutor and coding assistant embedded in a web-based IDE. 
    The user is likely a student or experimenter.
    Your goal is to be helpful, concise, and educational.
    When providing code fixes, explain *why* it was broken.
    
    Current Code Context:
    \`\`\`python
    ${contextCode}
    \`\`\`
    `;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error connecting to the AI service.";
  }
};