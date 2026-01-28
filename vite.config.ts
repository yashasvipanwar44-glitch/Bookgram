import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');

  // Retrieve the key from various possible sources
  const rawApiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || env.VITE_GOOGLE_AI_KEY || '';
  
  // Sanitize: Remove surrounding quotes and trim whitespace
  // This fixes issues where keys are entered as "AIza..." in environment variables
  const apiKey = rawApiKey.replace(/^['"]|['"]$/g, '').trim();

  return {
    plugins: [react()],
    define: {
      // Polyfill process.env.API_KEY for the GenAI SDK
      'process.env.API_KEY': JSON.stringify(apiKey)
    }
  }
})