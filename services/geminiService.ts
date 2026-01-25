import { GoogleGenAI } from "@google/genai";

// NOTE: In a real app, this should be in an environment variable. 
// However, per instructions, we assume process.env.API_KEY is available.
// Since we are running in a frontend environment for this generation, 
// we will rely on the user understanding to put the key in .env or similar.
// For this demo code to work without an env setup in the preview, we handle the case gracefully.

const apiKey = process.env.API_KEY || ''; 

let ai: GoogleGenAI | null = null;

if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
}

export const getBookRecommendation = async (query: string): Promise<string> => {
  if (!ai) {
    return "I'm sorry, but the AI service is not configured with an API Key currently.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Using the recommended fast model
      contents: `You are an expert librarian and book curator for a platform called Bookgram. 
      The user is asking: "${query}". 
      Recommend 2-3 specific books that would answer their request. 
      For each book, give the Title, Author, and a 1-sentence reason why. 
      Keep the tone helpful, encouraging, and intellectual. 
      Format the response in Markdown with bold titles.`,
    });

    return response.text || "I couldn't find any recommendations right now.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to the library archives (AI Error). Please try again later.";
  }
};
