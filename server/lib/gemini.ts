import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error(
    'GEMINI_API_KEY não foi definida no arquivo .env.'
  );
}

const ai = new GoogleGenAI({
  apiKey,
});

const GEMINI_MODEL = 'gemini-3.5-flash-lite';

export async function generateGeminiText(
  prompt: string
): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        temperature: 0,
      },
    });

    const text = response.text;

    if (!text || text.trim().length === 0) {
      throw new Error(
        'O Gemini não retornou uma resposta válida.'
      );
    }

    return text.trim();
  } catch (error) {
    console.error(
      'ERRO REAL DO GEMINI:',
      error
    );

    throw error;
  }
}