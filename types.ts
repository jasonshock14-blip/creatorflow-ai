
export enum AppTab {
  TRANSCRIBE = 'transcribe',
  TRANSLATE = 'translate',
  SRT_TRANSLATOR = 'srt_translator',
  HOOKS = 'hooks',
  ACCOUNT = 'account'
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

export interface User {
  username: string;
  passwordHash: string;
  deviceIds: string[];
}

export interface AuthSession {
  username: string;
  deviceId: string;
}
