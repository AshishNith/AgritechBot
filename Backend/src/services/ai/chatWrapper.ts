import { buildPrompt } from './promptEngine';
import { queryLLM } from './llmRouter';
import { retrieveContext } from './ragService';

export interface WrapperUserContext {
  name?: string;
  language?: string;
  crops?: string[];
  location?: {
    state?: string;
    district?: string;
    latitude?: number;
    longitude?: number;
  };
}

export interface ChatWrapperInput {
  userMessage: string;
  language: string;
  chatHistory?: Array<{ role: string; content: string }>;
  userContext?: WrapperUserContext;
}

export interface ChatWrapperResult {
  answer: string;
  model: string;
  ragContextUsed: boolean;
  memoryContextUsed: boolean;
  toolsUsed: string[];
}

function languageFallback(language: string): string {
  if (language === 'Hindi') {
    return 'माफ कीजिए, एआई सेवा अभी उपलब्ध नहीं है। सुरक्षित सुझाव: मिट्टी जांच के आधार पर संतुलित NPK दें, नाइट्रोजन को किस्तों में दें और नमी के अनुसार सिंचाई करें।';
  }
  if (language === 'Gujarati') {
    return 'માફ કરશો, AI સેવા અત્યારે ઉપલબ્ધ નથી. સુરક્ષિત સલાહ: માટી તપાસ પ્રમાણે સંતુલિત NPK આપો, નાઇટ્રોજન હપ્તામાં આપો અને ભેજ પ્રમાણે સિંચાઈ કરો.';
  }
  if (language === 'Punjabi') {
    return 'ਮਾਫ ਕਰਨਾ, AI ਸੇਵਾ ਇਸ ਵੇਲੇ ਉਪਲਬਧ ਨਹੀਂ ਹੈ। ਸੁਰੱਖਿਅਤ ਸਲਾਹ: ਮਿੱਟੀ ਟੈਸਟ ਅਨੁਸਾਰ ਸੰਤੁਲਿਤ NPK ਦਿਓ, ਨਾਈਟਰੋਜਨ ਕਿਸ਼ਤਾਂ ਵਿੱਚ ਦਿਓ ਅਤੇ ਨਮੀ ਦੇ ਅਧਾਰ ਤੇ ਸਿੰਚਾਈ ਕਰੋ।';
  }
  return 'AI service is temporarily unavailable. Safe advice: apply balanced NPK based on soil test, split nitrogen in stages, and irrigate by soil moisture and crop stage.';
}

function buildMemoryContext(userContext?: WrapperUserContext): string {
  if (!userContext) {
    return '';
  }

  const parts: string[] = [];

  if (userContext.name) {
    parts.push(`User name: ${userContext.name}`);
  }
  if (userContext.crops && userContext.crops.length > 0) {
    parts.push(`Primary crops: ${userContext.crops.join(', ')}`);
  }
  if (userContext.location?.district || userContext.location?.state) {
    parts.push(
      `Farm location: ${[userContext.location.district, userContext.location.state]
        .filter(Boolean)
        .join(', ')}`
    );
  }

  return parts.join('\n');
}

function shouldUseWeatherTool(query: string): boolean {
  return /weather|temperature|rain|forecast|humidity|वर्षा|मौसम|बारिश|ਹਵਾ|ਬਰਸਾਤ|હવામાન|વરસાદ/i.test(
    query
  );
}

async function runWeatherTool(userMessage: string, userContext?: WrapperUserContext): Promise<string> {
  if (!shouldUseWeatherTool(userMessage)) {
    return '';
  }

  const latitude = userContext?.location?.latitude;
  const longitude = userContext?.location?.longitude;

  if (latitude == null || longitude == null) {
    return 'Weather tool note: user location coordinates unavailable, skip weather API call.';
  }

  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`
    );
    const payload = (await response.json()) as {
      current?: {
        temperature_2m?: number;
        relative_humidity_2m?: number;
        wind_speed_10m?: number;
        weather_code?: number;
      };
    };

    if (!payload.current) {
      return '';
    }

    return [
      'Weather tool output:',
      `Temperature: ${payload.current.temperature_2m ?? 'N/A'} C`,
      `Humidity: ${payload.current.relative_humidity_2m ?? 'N/A'} %`,
      `Wind: ${payload.current.wind_speed_10m ?? 'N/A'} km/h`,
      `Weather code: ${payload.current.weather_code ?? 'N/A'}`,
    ].join('\n');
  } catch {
    return '';
  }
}

export async function runChatWrapper(input: ChatWrapperInput): Promise<ChatWrapperResult> {
  const memoryContext = buildMemoryContext(input.userContext);
  const ragContext = await retrieveContext(input.userMessage);
  const weatherContext = await runWeatherTool(input.userMessage, input.userContext);

  const knowledgeContext = [
    ragContext ? `Knowledge retrieval:\n${ragContext}` : '',
    memoryContext ? `User memory:\n${memoryContext}` : '',
    weatherContext,
  ]
    .filter(Boolean)
    .join('\n\n---\n\n');

  const promptMessages = buildPrompt({
    userMessage: input.userMessage,
    language: input.language,
    ragContext: knowledgeContext || undefined,
    chatHistory: input.chatHistory,
  });

  try {
    const llmResponse = await queryLLM(promptMessages);
    return {
      answer: llmResponse.content,
      model: llmResponse.model,
      ragContextUsed: Boolean(ragContext),
      memoryContextUsed: Boolean(memoryContext),
      toolsUsed: weatherContext ? ['weather'] : [],
    };
  } catch {
    return {
      answer: languageFallback(input.language),
      model: 'offline-fallback',
      ragContextUsed: Boolean(ragContext),
      memoryContextUsed: Boolean(memoryContext),
      toolsUsed: weatherContext ? ['weather'] : [],
    };
  }
}
