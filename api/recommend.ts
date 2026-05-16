import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { query } = req.body;
  if (!process.env.GEMINI_API_KEY) {
    console.warn("Gemini API Key is missing.");
    return res.status(500).json({ error: "I'm sorry, but the AI service is not configured with an API Key currently. Please contact the administrator." });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: `The user is asking: "${query}". \nRecommend 2-3 specific books that would answer their request. \nFor each book, give the Title, Author, and a 1-sentence reason why.`,
      config: {
        systemInstruction: `You are an expert librarian and book curator for a platform called Bookgram.\nKeep the tone helpful, encouraging, and intellectual.\nFormat the response in Markdown with bold titles.`,
      },
    });

    res.status(200).json({ text: response.text || "I couldn't find any recommendations right now." });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "I'm having trouble connecting to the library archives (AI Error). Please try again later." });
  }
}
