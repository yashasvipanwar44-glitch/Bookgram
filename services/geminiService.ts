import { GoogleGenAI } from "@google/genai";

// Helper to ensure key is clean at runtime
const getCleanApiKey = () => {
  const key = process.env.API_KEY;
  if (!key) return '';
  // Remove any stray quotes or whitespace that might have survived
  return key.replace(/["']/g, "").trim();
};

export const getBookRecommendation = async (query: string): Promise<string> => {
  const apiKey = getCleanApiKey();

  // Check if the API key is configured
  if (!apiKey) {
    console.warn("Gemini API Key is missing. Ensure GEMINI_API_KEY is set in your environment variables.");
    return "I'm sorry, but the AI service is not configured with an API Key currently. Please contact the administrator to add the 'GEMINI_API_KEY' to the deployment settings.";
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });
  
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
        
        let errorMessage = "I'm having trouble connecting to the library archives.";
        let errorDetails = fallbackError.message || '';

        // Try to parse JSON error message if present (common with Google APIs)
        try {
            if (errorDetails.trim().startsWith('{')) {
                const parsed = JSON.parse(errorDetails);
                if (parsed.error && parsed.error.message) {
                    errorDetails = parsed.error.message;
                }
            }
        } catch (e) {
            // Failed to parse, use original message
        }
        
        // Provide user-friendly messages based on the specific error
        if (errorDetails.includes('API key not valid')) {
            errorMessage += " (Error: Invalid API Key. Please check for typos or extra spaces in your configuration.)";
        } else if (errorDetails.includes('403')) {
            errorMessage += " (Access Denied: The API key does not have permission for this model.)";
        } else if (errorDetails.includes('404')) {
            errorMessage += " (Model Unavailable: The AI service is temporarily offline.)";
        } else {
            errorMessage += ` (Details: ${errorDetails.substring(0, 100)}${errorDetails.length > 100 ? '...' : ''})`;
        }
        
        return errorMessage;
    }
  }
};