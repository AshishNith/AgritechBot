import { QueryType } from "../types";

const COMPLEX_KEYWORDS = [
  "schedule",
  "plan",
  "rotation",
  "soil test",
  "irrigation system",
  "compare",
  "strategy",
  "calculate",
  "per hectare",
  "per acre",
  "yojana",
  "subsidy",
  "insurance",
  "fasal bima",
  "krishi kendra",
  "explain",
  "difference between",
  "which is better",
  "suggest crop",
  "fertilizer schedule",
  "sowing time",
  "harvest time",
  "fasal calendar",
];

export function classifyQuery(message: string, hasImage: boolean): QueryType {
  if (hasImage) {
    return "image";
  }

  const normalizedMessage = message.toLowerCase();

  return COMPLEX_KEYWORDS.some((keyword) => normalizedMessage.includes(keyword))
    ? "complex"
    : "simple";
}
