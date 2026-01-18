
export enum AppTab {
  TRANSCRIBE = 'transcribe',
  TRANSLATE = 'translate',
  SRT_TRANSLATOR = 'srt_translator',
  HOOKS = 'hooks',
  ADMIN = 'admin'
}

export enum TranslationStyle {
  PURE = 'pure',
  DEEP_INSIGHTS = 'insights',
  VIRAL_HOOKS = 'viral',
  RECAP = 'recap',
  MUSIC_GUIDE = 'music'
}

export interface ViralIdea {
  title: string;
  hook: string;
  roadmap: string;
  script: string;
  thumbPromptWithText: string;
  thumbPromptNoText: string;
  thumbnailText: string;
}

export interface SRTBlock {
  id: string;
  timestamp: string;
  text: string;
}
