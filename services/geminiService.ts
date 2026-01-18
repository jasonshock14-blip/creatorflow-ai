
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { TranslationStyle, ViralIdea } from "../types";

export const transcribeOnly = async (
  fileData: string,
  mimeType: string,
  asSrt: boolean = false
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = asSrt 
    ? "Provide an extremely accurate, professional, word-for-word transcript of this media in SRT format including timestamps."
    : "Provide an extremely accurate, professional, word-for-word transcript of this media. Do not summarize or translate.";
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ inlineData: { mimeType, data: fileData } }, { text: prompt }] },
  });
  return response?.text || "No response generated.";
};

const STORYTELLER_RULES = `Rewrite the content as an EXHAUSTIVE, LONG-FORM cinematic retelling. NO SUMMARIZATION. Retell every beat in detail.`;

export const translateMedia = async (
  fileData: string,
  mimeType: string,
  targetLanguage: string,
  style: TranslationStyle
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
  return response?.text || "";
};

export const translateText = async (text: string, targetLanguage: string, style: TranslationStyle): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
  return response?.text || "";
};

export const generateViralBundle = async (topic: string, targetLanguage: string): Promise<ViralIdea[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
  return response?.text ? JSON.parse(response.text) : [];
};

export const generateImage = async (prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
  });
  const part = response?.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  return part?.inlineData?.data ? `data:image/png;base64,${part.inlineData.data}` : "";
};

export const translateSRT = async (
  srt: string, 
  lang: string, 
  onProgress?: (current: number, total: number) => void
): Promise<string> => {
  const blocks = srt.split(/\r?\n\r?\n/).filter(block => block.trim().length > 0);
  const CHUNK_SIZE = 40;
  const chunks: string[][] = [];
  for (let i = 0; i < blocks.length; i += CHUNK_SIZE) chunks.push(blocks.slice(i, i + CHUNK_SIZE));

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  let finalResult = "";

  for (let i = 0; i < chunks.length; i++) {
    if (onProgress) onProgress(i + 1, chunks.length);
    const chunkContent = chunks[i].join("\n\n");
    const prompt = `Translate this SRT subtitle segment into ${lang}. Keep timestamps identical. Return raw SRT only.\n\n${chunkContent}`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ text: prompt }] },
      config: { temperature: 0 },
    });
    finalResult += (finalResult ? "\n\n" : "") + (response?.text || "").trim();
  }
  return finalResult;
};
