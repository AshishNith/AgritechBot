import type Anthropic from '@anthropic-ai/sdk';
import { cropCalendarTool } from './cropCalendar.tool';
import { weatherTool, type ChatToolDefinition } from './weather.tool';
import { productRecommendationTool } from './productRecommendation.tool';

// get_mandi_price is left out until a real price source (e.g. AGMARKNET) is connected:
// its stub answered "coming soon", which the AI could relay as fact.
const CHAT_TOOLS: ChatToolDefinition[] = [
  weatherTool,
  cropCalendarTool,
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
