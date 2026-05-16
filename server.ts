import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Route for Gemini
  app.post('/api/recommend', async (req, res) => {
    const { query } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      console.warn("Gemini API Key is missing.");
      return res.status(500).json({ error: "I'm sorry, but the AI service is not configured with an API Key currently. Please contact the administrator." });
    }

    try {
      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview', 
        contents: `The user is asking: "${query}". \nRecommend 2-3 specific books that would answer their request. \nFor each book, give the Title, Author, and a 1-sentence reason why.`,
        config: {
          systemInstruction: `You are an expert librarian and book curator for a platform called Bookgram.\nKeep the tone helpful, encouraging, and intellectual.\nFormat the response in Markdown with bold titles.`,
        },
      });

      res.json({ text: response.text || "I couldn't find any recommendations right now." });
    } catch (error) {
      console.error("Gemini API Error:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: `I'm having trouble connecting to the library archives (AI Error). Details: ${errorMessage}. Please try again later.` });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
