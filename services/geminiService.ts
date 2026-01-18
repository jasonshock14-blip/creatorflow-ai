
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
  return response.text || "No response generated.";
};

const STORYTELLER_RULES = `Rewrite the content as an EXHAUSTIVE, LONG-FORM cinematic third-person "TELLING" voiceover script. 

1. NO SUMMARIZATION: This is the most important rule. You must NOT shorten the story. Retell every single beat, conversation, and event in detail. If the source is 10 minutes, the script should be long enough for 10-15 minutes of slow-paced, dramatic narration.
2. NARRATOR VOICE: You are a master storyteller relaying the events. Talk "about" the characters and their journey to the audience. 
3. EXTREME DETAIL: Expand on the environment, the atmosphere, the internal feelings, and the gravity of each moment. Describe things that aren't explicitly said to create "breathing room" for the voice actor.
4. NO LABELS: Do NOT use "Narrator:", "Host:", or character names as headers. Output only the narration text.
5. NO SOUND MARKUP: Do NOT use brackets like [Sound: ...] or (SFX: ...). Instead, use vivid adjectives and verbs to describe sounds within the story.
6. FORMAT: Use pure, flowing paragraphs. No bullet points, no technical instructions.
7. LENGTH: Aim for a very high word count to sustain 10+ minutes of video.`;

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
    [TranslationStyle.VIRAL_HOOKS]: `Generate 5 long-form (10+ min) video concepts in ${targetLanguage}. For each: 1. Catchy Title. 2. High-impact Thumbnail Text Idea. 3. 10-minute content breakdown strategy.`,
    [TranslationStyle.RECAP]: `${STORYTELLER_RULES} Target language: ${targetLanguage}.`,
    [TranslationStyle.MUSIC_GUIDE]: `Analyze emotional arc and generate MULTIPLE BGM track parameters in JSON.`
  }[style];

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: { parts: [{ inlineData: { mimeType, data: fileData } }, { text: stylePrompt || "" }] },
  });
  return response.text || "";
};

export const translateText = async (text: string, targetLanguage: string, style: TranslationStyle): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const stylePrompt = {
    [TranslationStyle.PURE]: `Translate into ${targetLanguage} completely. Do not summarize.`,
    [TranslationStyle.DEEP_INSIGHTS]: `Analyze subtext in ${targetLanguage}.`,
    [TranslationStyle.VIRAL_HOOKS]: `Generate 5 long-form (10+ min) video concepts in ${targetLanguage}. For each: 1. Catchy Title. 2. High-impact Thumbnail Text Idea. 3. 10-minute content breakdown strategy.`,
    [TranslationStyle.RECAP]: `${STORYTELLER_RULES} Target language: ${targetLanguage}.`,
    [TranslationStyle.MUSIC_GUIDE]: `Generate music JSON based on this text.`
  }[style];

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `${stylePrompt}\n\nTEXT:\n${text}`,
  });
  return response.text || "";
};

export const generateViralBundle = async (topic: string, targetLanguage: string): Promise<ViralIdea[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate 5 comprehensive long-form content strategies for: "${topic}" in ${targetLanguage}. 
    Each bundle must be optimized for a 10-minute+ video duration.
    Include:
    - title: A click-worthy video title.
    - hook: A 30-second high-retention opening hook script.
    - roadmap: A detailed 10-minute production breakdown (segments 0-2m, 2-5m, 5-8m, 8-10m+).
    - script: A 2-minute "Storyteller" style sample script snippet (no labels, no sound effects).
    - thumbPromptWithText: Image generation prompt including high-contrast text.
    - thumbPromptNoText: Image generation prompt for the background visual only.
    - thumbnailText: The specific short, punchy text that should appear ON the thumbnail.`,
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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
  });
  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  return part?.inlineData?.data ? `data:image/png;base64,${part.inlineData.data}` : "";
};

/**
 * Splits an SRT string into an array of subtitle blocks.
 */
const splitSRT = (srt: string): string[] => {
  return srt.split(/\r?\n\r?\n/).filter(block => block.trim().length > 0);
};

/**
 * Translates an SRT file by chunking it into smaller segments to avoid 500 errors and output limits.
 */
export const translateSRT = async (
  srt: string, 
  lang: string, 
  onProgress?: (current: number, total: number) => void
): Promise<string> => {
  const blocks = splitSRT(srt);
  const CHUNK_SIZE = 40; // Number of subtitle blocks per request
  const chunks: string[][] = [];

  for (let i = 0; i < blocks.length; i += CHUNK_SIZE) {
    chunks.push(blocks.slice(i, i + CHUNK_SIZE));
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  let finalResult = "";

  const properNounInstruction = lang.toLowerCase() === 'burmese' 
    ? "IMPORTANT: Do not translate proper nouns (e.g., character names like 'John', place names like 'New York', brand names). Keep them in their original script (e.g., English) within the Burmese translation."
    : "";

  for (let i = 0; i < chunks.length; i++) {
    if (onProgress) onProgress(i + 1, chunks.length);

    const chunkContent = chunks[i].join("\n\n");
    const prompt = `Translate this portion of an SRT subtitle file into ${lang}.

TECHNICAL CONSTRAINTS:
1. OUTPUT FORMAT: Return ONLY raw SRT text. No markdown (\`\`\`), no titles.
2. TIMESTAMPS: Keep them 100% identical.
3. FULL TRANSLATION: Translate every line in this segment word-for-word.
4. INTEGRITY: Do not skip sequences.
${properNounInstruction}

SEGMENT TO TRANSLATE:
${chunkContent}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ text: prompt }] },
      config: { temperature: 0 },
    });

    const translatedChunk = response.text || "";
    finalResult += (finalResult ? "\n\n" : "") + translatedChunk.trim();
  }

  return finalResult;
};
