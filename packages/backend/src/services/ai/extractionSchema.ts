import type { ExtractionInput } from "./types.js";

import { buildEnovAItExtractionSystemPrompt, buildEnovAItExtractionUserPrompt } from "../../prompts/enovaitPrompts.js";

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
  return buildEnovAItExtractionSystemPrompt(input);
};

export const buildExtractionUserPrompt = (input: ExtractionInput): string => {
  return buildEnovAItExtractionUserPrompt(input);
};
