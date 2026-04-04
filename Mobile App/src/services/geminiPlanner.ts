import { GoogleGenerativeAI } from '@google/generative-ai';
import { CropTask, Language, AIInsight } from '../types/planner';

const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const hasValidKey = apiKey && !apiKey.includes('YOUR_API_KEY') && apiKey.length > 20;
const genAI = hasValidKey ? new GoogleGenerativeAI(apiKey) : null;

export async function generateCropSchedule(params: {
  cropName: string;
  fieldName: string;
  sowingDate: string;
  language: Language;
}): Promise<CropTask[]> {
  const { cropName, fieldName, sowingDate, language } = params;
  if (!genAI || !hasValidKey) {
    console.warn('Gemini API key missing or invalid. Returning demo schedule.');
    return getDemoSchedule(cropName, fieldName);
  }
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  const prompt = `
    You are an expert Indian agricultural advisor. Generate a detailed crop task schedule.
    Respond ONLY in valid JSON. No explanation. No markdown. Just the JSON array.
    Language for task titles and notes: ${language}
    Crop: ${cropName}
    Field: ${fieldName}
    Sowing date: ${sowingDate}
    Season: detect from sowing date (Kharif/Rabi/Zaid)
    
    Return a JSON array of tasks with this exact shape:
    [{
      "title": "...",
      "titleTranslations": { "hi": "...", "en": "...", "pa": "...", "gu": "..." },
      "category": "sowing|irrigation|fertilizer|pesticide|harvest|soil|other",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "notes": "brief agronomic reason in selected language",
      "isAISuggested": true
    }]
    Generate 8–12 tasks covering the full crop cycle from sowing to harvest.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean markdown if AI included it
    const jsonString = text.replace(/```json|```/g, '').trim();
    const tasks: any[] = JSON.parse(jsonString);
    
    return tasks.map((t, idx) => ({
      ...t,
      id: `ai-${Date.now()}-${idx}`,
      status: 'ai-suggested',
      progress: 0,
      cropName,
      fieldName,
    })) as CropTask[];
  } catch (error) {
    console.error('Error generating AI schedule:', error);
    throw error;
  }
}

export async function getAIDailyInsight(params: {
  crops: string[];
  language: Language;
  season: string;
}): Promise<AIInsight> {
  const { crops, language, season } = params;
  if (!genAI || !hasValidKey) {
    return {
      message: "Farmer Tip: Keep your soil moisture optimal during the " + season + " season for best crop yields.",
      chips: ["Check Soil", "Water Crops", "View Tasks"],
      generatedAt: new Date().toISOString()
    };
  }
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  const prompt = `
    You are an expert Indian agricultural advisor.
    Give a short (2-sentence maximum) agricultural tip for today for a farmer growing: ${crops.join(', ')}.
    Current Season: ${season}.
    Language: ${language}.
    Also provide 3 short "action chips" (e.g. "Check Soil", "Irrigate Now", "Spray urea").
    
    Return ONLY JSON: { "message": "...", "chips": ["...", "...", "..."], "generatedAt": "${new Date().toISOString()}" }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonString = text.replace(/```json|```/g, '').trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error fetching AI insight:', error);
    return {
      message: "Check your crops regularly for healthy growth and manage water levels based on soil moisture.",
      chips: ["Check Soil", "View Weather", "Task List"],
      generatedAt: new Date().toISOString()
    };
  }
}

function getDemoSchedule(crop: string, field: string): CropTask[] {
  return [
    {
      id: `demo-1`,
      title: "Soil Preparation",
      titleTranslations: { en: "Soil Preparation", hi: "मिट्टी की तैयारी", pa: "ਮਿੱਟੀ ਦੀ ਤਿਆਰੀ", gu: "જમીન તૈયાર કરવી" },
      category: "soil",
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 86400000 * 3).toISOString(),
      notes: "Demo: Ensure soil is well-ploughed and moist.",
      isAISuggested: true,
      status: 'ai-suggested',
      progress: 0,
      cropName: crop,
      fieldName: field
    },
    {
      id: `demo-2`,
      title: "Sowing",
      titleTranslations: { en: "Sowing", hi: "बुवाई", pa: "ਬਿਜਾਈ", gu: "વાવણી" },
      category: "sowing",
      startDate: new Date(Date.now() + 86400000 * 4).toISOString(),
      endDate: new Date(Date.now() + 86400000 * 5).toISOString(),
      notes: "Demo: Use high-quality seeds for better yield.",
      isAISuggested: true,
      status: 'ai-suggested',
      progress: 0,
      cropName: crop,
      fieldName: field
    }
  ];
}
