/**
 * Lightweight language detector for Indian languages.
 * Uses Unicode script ranges to detect Devanagari, Gurmukhi, Gujarati, etc.
 */

interface LanguageDetectionResult {
  language: string;
  confidence: number;
}

const SCRIPT_RANGES: Record<string, RegExp> = {
  Hindi: /[\u0900-\u097F]/,
  Punjabi: /[\u0A00-\u0A7F]/,
  Gujarati: /[\u0A80-\u0AFF]/,
  Bengali: /[\u0980-\u09FF]/,
  Tamil: /[\u0B80-\u0BFF]/,
  Telugu: /[\u0C00-\u0C7F]/,
  Kannada: /[\u0C80-\u0CFF]/,
  Malayalam: /[\u0D00-\u0D7F]/,
  Marathi: /[\u0900-\u097F]/, // Same script as Hindi (Devanagari)
};

export function detectLanguage(text: string): LanguageDetectionResult {
  if (!text || text.trim().length === 0) {
    return { language: 'English', confidence: 0 };
  }

  const cleanText = text.replace(/\s+/g, '');
  let maxScore = 0;
  let detectedLanguage = 'English';

  for (const [language, regex] of Object.entries(SCRIPT_RANGES)) {
    const matches = cleanText.match(new RegExp(regex.source, 'g'));
    const score = matches ? matches.length / cleanText.length : 0;

    if (score > maxScore) {
      maxScore = score;
      detectedLanguage = language;
    }
  }

  // If less than 10% non-Latin characters, treat as English
  if (maxScore < 0.1) {
    return { language: 'English', confidence: 0.9 };
  }

  return { language: detectedLanguage, confidence: maxScore };
}

export function getLanguageCode(language: string): string {
  const codes: Record<string, string> = {
    Hindi: 'hi-IN',
    English: 'en-IN',
    Punjabi: 'pa-IN',
    Gujarati: 'gu-IN',
    Bengali: 'bn-IN',
    Tamil: 'ta-IN',
    Telugu: 'te-IN',
    Kannada: 'kn-IN',
    Malayalam: 'ml-IN',
    Marathi: 'mr-IN',
  };
  return codes[language] || 'en-IN';
}
