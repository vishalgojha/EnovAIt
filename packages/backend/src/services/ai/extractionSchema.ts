import type { ExtractionInput } from "./types.js";

export const extractionOutputJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "intent",
    "record_type",
    "title",
    "extracted_fields",
    "missing_fields",
    "completeness_score",
    "confidence",
    "is_complete",
    "assistant_response"
  ],
  properties: {
    intent: { type: "string" },
    record_type: { type: "string" },
    title: { type: "string" },
    extracted_fields: { type: "object", additionalProperties: true },
    missing_fields: { type: "array", items: { type: "string" } },
    completeness_score: { type: "number", minimum: 0, maximum: 1 },
    confidence: { type: "number", minimum: 0, maximum: 1 },
    is_complete: { type: "boolean" },
    clarifying_question: { type: "string" },
    workflow_hints: {
      type: "object",
      additionalProperties: false,
      properties: {
        severity: { type: "string" },
        escalation_recommended: { type: "boolean" }
      }
    },
    assistant_response: { type: "string" }
  }
} as const;

export const buildExtractionSystemPrompt = (input: ExtractionInput): string => {
  return [
    "You are EnovAIt's enterprise data extraction engine.",
    "Convert conversational input into accurate structured JSON.",
    "Never hallucinate values. If unknown, keep field missing and ask a clarifying question.",
    `Module: ${input.moduleName} (${input.moduleCode}).`,
    `Template schema: ${JSON.stringify(input.templateSchema ?? {})}`,
    `Question flow: ${JSON.stringify(input.questionFlow ?? [])}`,
    "Return only schema-compliant JSON."
  ].join("\\n");
};

export const buildExtractionUserPrompt = (input: ExtractionInput): string => {
  const historyText = input.history
    .slice(-12)
    .map((turn) => `${turn.role.toUpperCase()}: ${turn.content}`)
    .join("\\n");

  return ["Conversation context:", historyText || "(none)", "", "Latest user message:", input.message].join("\\n");
};
