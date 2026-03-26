import OpenAI from "openai";

import { env } from "../../config.js";
import { AppError } from "../../lib/errors.js";
import {
  ExtractionResultSchema,
  type AIExtractionProvider,
  type ExtractionInput,
  type ExtractionResult
} from "./types.js";

const outputJsonSchema = {
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

export class OpenAIExtractionProvider implements AIExtractionProvider {
  private readonly client: OpenAI;

  constructor() {
    this.client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }

  public async extractStructuredData(input: ExtractionInput): Promise<ExtractionResult> {
    const systemPrompt = [
      "You are EnovAIt's enterprise data extraction engine.",
      "Convert conversational input into accurate structured JSON.",
      "Never hallucinate values. If unknown, keep field missing and ask a clarifying question.",
      `Module: ${input.moduleName} (${input.moduleCode}).`,
      `Template schema: ${JSON.stringify(input.templateSchema ?? {})}`,
      `Question flow: ${JSON.stringify(input.questionFlow ?? [])}`,
      "Return only schema-compliant JSON."
    ].join("\n");

    const historyText = input.history
      .slice(-12)
      .map((turn) => `${turn.role.toUpperCase()}: ${turn.content}`)
      .join("\n");

    try {
      const completion = await this.client.chat.completions.create({
        model: env.AI_MODEL,
        temperature: 0,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: ["Conversation context:", historyText || "(none)", "", "Latest user message:", input.message].join(
              "\n"
            )
          }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "enovait_extraction",
            schema: outputJsonSchema,
            strict: true
          }
        }
      });

      const raw = completion.choices[0]?.message?.content;
      if (!raw) {
        throw new AppError("AI returned empty response", 502, "AI_EMPTY_RESPONSE");
      }

      return ExtractionResultSchema.parse(JSON.parse(raw));
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("AI extraction failed", 502, "AI_EXTRACTION_FAILED", error);
    }
  }
}
