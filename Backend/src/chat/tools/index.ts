import type Anthropic from '@anthropic-ai/sdk';
import { cropCalendarTool } from './cropCalendar.tool';
import { mandiPriceTool } from './mandiPrice.tool';
import { weatherTool, type ChatToolDefinition } from './weather.tool';
import { productRecommendationTool } from './productRecommendation.tool';

const CHAT_TOOLS: ChatToolDefinition[] = [
  weatherTool,
  cropCalendarTool,
  mandiPriceTool,
  productRecommendationTool,
];

const toolRegistry = new Map<string, ChatToolDefinition>(CHAT_TOOLS.map((tool) => [tool.name, tool]));

/** Claude tool definitions. Order is fixed so the prompt-cache prefix stays stable. */
export const TOOL_DEFINITIONS: Anthropic.Tool[] = CHAT_TOOLS.map((tool) => ({
  name: tool.name,
  description: tool.description,
  input_schema: {
    type: 'object',
    properties: tool.parameters.properties,
    required: tool.parameters.required ?? [],
  },
}));

export function getToolByName(name: string): ChatToolDefinition | undefined {
  return toolRegistry.get(name);
}

export async function executeTool(
  name: string,
  input: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const tool = getToolByName(name);
  if (!tool) {
    throw new Error(`Unknown tool: ${name}`);
  }

  return tool.execute(input);
}
