import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AGRI_SYSTEM_PROMPT } from '../prompts/agriPrompt';
import { PromptTemplate } from "@langchain/core/prompts";

export async function askLLM(question: string, context: string, cropData: string, language: string, modelType: 'gemini' = 'gemini', conversationHistory: string = ''): Promise<string> {

    const llm = new ChatGoogleGenerativeAI({
        model: "gemini-2.5-flash",
        temperature: 0.3,
        apiKey: process.env.GEMINI_API_KEY
    });

    const promptTemplate = PromptTemplate.fromTemplate(AGRI_SYSTEM_PROMPT);

    const formattedPrompt = await promptTemplate.format({
        language: language,
        context: context,
        cropData: cropData,
        conversationHistory: conversationHistory || 'No previous conversation.',
        question: question
    });

    try {
        const response = await llm.invoke(formattedPrompt);
        return response.content as string;
    } catch (error) {
        console.error("LLM Error:", error);
        throw new Error("Failed to generate response from LLM");
    }
}
