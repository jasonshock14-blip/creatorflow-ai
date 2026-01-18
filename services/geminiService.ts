
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { TranslationStyle, ViralIdea } from "../types";

const getApiKey = () => {
  try {
    return (process as any).env.API_KEY || '';
  } catch (e) {
    return '';
  }
};

export const transcribeOnly = async (
  fileData: string,
  mimeType: string,
  asSrt: boolean = false
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const prompt = asSrt 
    ? "Provide an extremely accurate, professional, word-for-word transcript of this media in SRT format including timestamps."
    : "Provide an extremely accurate, professional, word-for-word transcript of this media. Do not summarize or translate.";
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ inlineData: { mimeType, data: fileData } }, { text: prompt }] },
  });
  return response.text || "No response generated.";
};

const STORYTELLER_RULES = `Rewrite the content as an EXHAUSTIVE, LONG-FORM cinematic third-person "TELLING" voiceover script. 

1. NO SUMMARIZATION: Retell every single beat in detail.
2. NARRATOR VOICE: Cinematic storytelling style.
3. EXTREME DETAIL: Atmosphere, atmosphere, and feeling.
4. NO LABELS: Narrator text only.
5. NO SOUND MARKUP: Use vivid verbs instead.`;

export const translateMedia = async (
  fileData: string,
  mimeType: string,
  targetLanguage: string,
  style: TranslationStyle
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const stylePrompt = {
    [TranslationStyle.PURE]: `Translate into ${targetLanguage} accurately.`,
    [TranslationStyle.DEEP_INSIGHTS]: `Analyze subtext in ${targetLanguage}.`,
    [TranslationStyle.VIRAL_HOOKS]: `Generate 5 viral concepts in ${targetLanguage}.`,
    [TranslationStyle.RECAP]: `${STORYTELLER_RULES} Language: ${targetLanguage}.`,
    [TranslationStyle.MUSIC_GUIDE]: `Music analysis JSON.`
  }[style];

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: { parts: [{ inlineData: { mimeType, data: fileData } }, { text: stylePrompt || "" }] },
  });
  return response.text || "";
};

export const translateText = async (text: string, targetLanguage: string, style: TranslationStyle): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const stylePrompt = {
    [TranslationStyle.PURE]: `Translate into ${targetLanguage}.`,
    [TranslationStyle.DEEP_INSIGHTS]: `Analyze subtext in ${targetLanguage}.`,
    [TranslationStyle.VIRAL_HOOKS]: `Generate viral hooks in ${targetLanguage}.`,
    [TranslationStyle.RECAP]: `${STORYTELLER_RULES} Language: ${targetLanguage}.`,
    [TranslationStyle.MUSIC_GUIDE]: `Music JSON.`
  }[style];

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `${stylePrompt}\n\nTEXT:\n${text}`,
  });
  return response.text || "";
};

export const generateViralBundle = async (topic: string, targetLanguage: string): Promise<ViralIdea[]> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate 5 strategies for: "${topic}" in ${targetLanguage}.`,
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
  return response.text ? JSON.parse(response.text) : [];
};

export const generateImage = async (prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
  });
  
  const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  return part?.inlineData?.data ? `data:image/png;base64,${part.inlineData.data}` : "";
};

export const translateSRT = async (
  srt: string, 
  lang: string, 
  onProgress?: (current: number, total: number) => void
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const blocks = srt.split(/\r?\n\r?\n/).filter(b => b.trim().length > 0);
  const CHUNK_SIZE = 30;
  let finalResult = "";

  for (let i = 0; i < blocks.length; i += CHUNK_SIZE) {
    if (onProgress) onProgress(Math.floor(i / CHUNK_SIZE) + 1, Math.ceil(blocks.length / CHUNK_SIZE));
    const chunk = blocks.slice(i, i + CHUNK_SIZE).join("\n\n");
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Translate this SRT to ${lang}. Return RAW SRT ONLY:\n\n${chunk}`,
      config: { temperature: 0 }
    });
    finalResult += (finalResult ? "\n\n" : "") + (response.text || "").trim();
  }
  return finalResult;
};
