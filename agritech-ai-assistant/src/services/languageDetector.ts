export function detectLanguage(text: string): string {
    // Basic heuristic to detect language from script if not provided
    // In production, we could use LangDetect or Sarvam/OpenAI
    const punjabiCharRegex = /[\u0A00-\u0A7F]/;
    const gujaratiCharRegex = /[\u0A80-\u0AFF]/;
    const hindiCharRegex = /[\u0900-\u097F]/;

    if (punjabiCharRegex.test(text)) return 'Punjabi';
    if (gujaratiCharRegex.test(text)) return 'Gujarati';
    if (hindiCharRegex.test(text)) return 'Hindi';

    // If written in Roman script (e.g., Hinglish, Roman Punjabi)
    // For MVP we default to Hindi or assume language check by LLM wrapper.
    if (text.toLowerCase().includes("mere") || text.toLowerCase().includes("keede") || text.toLowerCase().includes("de")) {
        return 'Punjabi'; // simplistic check for "mere tamatar de..."
    }

    return 'Hindi';
}
