import { GoogleGenAI } from "@google/genai";

export const getBookRecommendation = async (query: string): Promise<string> => {
  // Check if the API key is configured
  if (!process.env.API_KEY) {
    console.warn("Gemini API Key is missing. Ensure GEMINI_API_KEY is set in your environment variables.");
    return "I'm sorry, but the AI service is not configured with an API Key currently. Please contact the administrator to add the 'GEMINI_API_KEY' to the deployment settings.";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `The user is asking: "${query}". 
      Recommend 2-3 specific books that would answer their request. 
      For each book, give the Title, Author, and a 1-sentence reason why.`;

  const config = {
    systemInstruction: `You are an expert librarian and book curator for a platform called Bookgram.
        Keep the tone helpful, encouraging, and intellectual.
        Format the response in Markdown with bold titles.`,
  };

  try {
    // Attempt 1: Recommended Gemini 3 Flash Preview
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: prompt,
      config: config,
    });
    return response.text || "I couldn't find any recommendations right now.";

  } catch (error: any) {
    console.warn("Primary model (gemini-3-flash-preview) failed:", error);

    try {
        // Attempt 2: Fallback to Gemini 2.0 Flash Exp (often widely available)
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: prompt,
            config: config,
        });
        return response.text || "I couldn't find any recommendations right now.";

    } catch (fallbackError: any) {
        console.error("Gemini API Error (Fallback):", fallbackError);
        
        // Extract a user-friendly error message
        let errorMessage = "I'm having trouble connecting to the library archives.";
        
        if (fallbackError.message) {
             if (fallbackError.message.includes('403')) {
                errorMessage += " (Access Denied: Please check if your API Key supports this model)";
             } else if (fallbackError.message.includes('404')) {
                errorMessage += " (Model Not Found: The AI model is currently unavailable)";
             } else {
                errorMessage += ` (Error: ${fallbackError.message})`;
             }
        }
        
        return errorMessage;
    }
  }
};