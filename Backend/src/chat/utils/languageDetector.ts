const HINDI_PATTERN = /[\u0900-\u097F]/;

export type ChatLanguage = 'hi' | 'en';

export function detectChatLanguage(text?: string | null): ChatLanguage {
  if (!text) {
    return 'en';
  }

  return HINDI_PATTERN.test(text) ? 'hi' : 'en';
}

export function toUserLanguage(chatLanguage: ChatLanguage): 'Hindi' | 'English' {
  return chatLanguage === 'hi' ? 'Hindi' : 'English';
}
