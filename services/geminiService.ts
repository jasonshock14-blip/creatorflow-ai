
import { GoogleGenAI, Type } from "@google/genai";
import { TranslationStyle, ViralIdea } from "../types";

/**
 * Validates the API key and returns a configured AI instance.
 */
const getAI = () => {
  // Check common process.env locations. 
  // Vite will replace these literals during the build process.
  const key = process.env.API_KEY || process.env.GEMINI_API_KEY;
  
  const isInvalid = !key || 
                    key === 'undefined' || 
                    key === 'null' || 
                    key === 'PLACEHOLDER_API_KEY' || 
                    key.trim().length < 5;

  if (isInvalid) {
    throw new Error(
      "API Key Missing. If you just added the GEMINI_API_KEY secret to GitHub, you MUST push a new commit or manually re-run the 'Deploy to GitHub Pages' action for the changes to take effect."
    );
  }
  
  return new GoogleGenAI({ apiKey: key });
};

export const transcribeOnly = async (
  fileData: string,
  mimeType: string,
  asSrt: boolean = false
): Promise<string> => {
  const ai = getAI();
  const prompt = asSrt 
    ? "Provide an extremely accurate, professional, word-for-word transcript of this media in SRT format including timestamps."
    : "Provide an extremely accurate, professional, word-for-word transcript of this media. Do not summarize or translate.";
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ inlineData: { mimeType, data: fileData } }, { text: prompt }] },
  });
  
  return response.text || "No transcript generated.";
};

const STORYTELLER_RULES = `Rewrite the content as an EXHAUSTIVE, LONG-FORM cinematic retelling. NO SUMMARIZATION. Retell every beat in detail.`;

export const translateMedia = async (
  fileData: string,
  mimeType: string,
  targetLanguage: string,
  style: TranslationStyle
): Promise<string> => {
  const ai = getAI();
  const stylePrompt = {
    [TranslationStyle.PURE]: `Translate into ${targetLanguage} accurately and completely. Do not summarize.`,
    [TranslationStyle.DEEP_INSIGHTS]: `Analyze subtext and lessons in ${targetLanguage}.`,
    [TranslationStyle.VIRAL_HOOKS]: `Generate viral video concepts in ${targetLanguage}.`,
    [TranslationStyle.RECAP]: `${STORYTELLER_RULES} Target language: ${targetLanguage}.`,
    [TranslationStyle.MUSIC_GUIDE]: `Analyze emotional arc for BGM.`
  }[style];

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: { parts: [{ inlineData: { mimeType, data: fileData } }, { text: stylePrompt || "" }] },
  });
  return response.text || "";
};

export const translateText = async (text: string, targetLanguage: string, style: TranslationStyle): Promise<string> => {
  const ai = getAI();
  const stylePrompt = {
    [TranslationStyle.PURE]: `Translate into ${targetLanguage} completely.`,
    [TranslationStyle.DEEP_INSIGHTS]: `Analyze subtext in ${targetLanguage}.`,
    [TranslationStyle.VIRAL_HOOKS]: `Generate concepts in ${targetLanguage}.`,
    [TranslationStyle.RECAP]: `${STORYTELLER_RULES} Target language: ${targetLanguage}.`,
    [TranslationStyle.MUSIC_GUIDE]: `Generate music JSON.`
  }[style];

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `${stylePrompt}\n\nTEXT:\n${text}`,
  });
  return response.text || "";
};

export const generateViralBundle = async (topic: string, targetLanguage: string): Promise<ViralIdea[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate 5 comprehensive long-form content strategies for: "${topic}" in ${targetLanguage}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            hook: { type: Type.STRING },
            roadmap: { type: Type.STRING },
            script: { type: Type.STRING },
            thumbPromptWithText: { type: Type.STRING },
            thumbPromptNoText: { type: Type.STRING },
            thumbnailText: { type: Type.STRING }
          },
          required: ["title", "hook", "roadmap", "script", "thumbPromptWithText", "thumbPromptNoText", "thumbnailText"]
        }
      }
    }
  });
  
  const text = response.text;
  try {
    return text ? JSON.parse(text) : [];
  } catch (e) {
    console.error("Failed to parse viral bundle JSON", e);
    return [];
  }
};

export const generateImage = async (prompt: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
  });
  
  const candidate = response.candidates && response.candidates[0];
  const parts = candidate?.content?.parts;
  
  if (!parts) return "";
  
  const part = parts.find(p => !!p.inlineData);
  return part?.inlineData?.data ? `data:image/png;base64,${part.inlineData.data}` : "";
};

export const translateSRT = async (
  srt: string, 
  lang: string, 
  onProgress?: (current: number, total: number) => void
): Promise<string> => {
  if (!srt) return "";
  const blocks = srt.split(/\r?\n\r?\n/).filter(block => block.trim().length > 0);
  const CHUNK_SIZE = 40;
  const chunks: string[][] = [];
  for (let i = 0; i < blocks.length; i += CHUNK_SIZE) chunks.push(blocks.slice(i, i + CHUNK_SIZE));

  const ai = getAI();
  let finalResult = "";

  for (let i = 0; i < chunks.length; i++) {
    if (onProgress) onProgress(i + 1, chunks.length);
    const chunkContent = chunks[i].join("\n\n");
    const prompt = `Translate this SRT subtitle segment into ${lang}. Keep timestamps identical. Return raw SRT only.\n\n${chunkContent}`;
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: [{ text: prompt }] },
        config: { temperature: 0 },
      });
      finalResult += (finalResult ? "\n\n" : "") + (response.text || "").trim();
    } catch (err: any) {
      console.error(`Error translating segment ${i + 1}`, err);
      throw new Error(`Failed at segment ${i + 1}: ${err.message || 'Unknown error'}`);
    }
  }
  return finalResult;
};
