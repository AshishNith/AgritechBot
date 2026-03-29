import { Content, GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import { SYSTEM_PROMPT } from '../data/systemPrompt';

const gemini = new GoogleGenerativeAI(env.GEMINI_API_KEY);

function fallbackSummary(contents: Content[]): string {
  const joined = contents
    .map((content) =>
      content.parts
        .map((part) => ('text' in part && typeof part.text === 'string' ? part.text : ''))
        .join(' ')
    )
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  return joined.length > 400 ? `${joined.slice(0, 400)}...` : joined || 'Previous conversation covered crop issues and advice.';
}

export async function summarizeConversationHistory(contents: Content[]): Promise<string> {
  if (!contents.length) {
    return '';
  }

  try {
    const model = gemini.getGenerativeModel({
      model: env.GEMINI_MODEL,
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        maxOutputTokens: 256,
      },
    });

    const result = await model.generateContent({
      contents: [
        ...contents,
        {
          role: 'user',
          parts: [
            {
              text: 'Summarize this conversation so far in 3-5 sentences, capturing the key problems discussed and advice given. Be factual and brief.',
            },
          ],
        },
      ],
    });

    const text = result.response.text().trim();
    return text || fallbackSummary(contents);
  } catch (error) {
    logger.warn({ err: error }, 'Conversation summarization failed; using fallback summary');
    return fallbackSummary(contents);
  }
}
