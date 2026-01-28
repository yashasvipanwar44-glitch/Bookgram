import { GoogleGenAI } from "@google/genai";

export const getBookRecommendation = async (query: string): Promise<string> => {
  // Check if the API key is configured
  if (!process.env.API_KEY) {
    console.warn("Gemini API Key is missing. Ensure GEMINI_API_KEY is set in your environment variables.");
    return "I'm sorry, but the AI service is not configured with an API Key currently. Please contact the administrator to add the 'GEMINI_API_KEY' to the deployment settings.";
  }

  try {
    // Initialize the client inside the function to ensure the key is present
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Using 'gemini-3-flash-preview' for basic text tasks as per guidelines
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: `The user is asking: "${query}". 
      Recommend 2-3 specific books that would answer their request. 
      For each book, give the Title, Author, and a 1-sentence reason why.`,
      config: {
        systemInstruction: `You are an expert librarian and book curator for a platform called Bookgram.
        Keep the tone helpful, encouraging, and intellectual.
        Format the response in Markdown with bold titles.`,
      },
    });

    return response.text || "I couldn't find any recommendations right now.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to the library archives (AI Error). Please try again later.";
  }
};