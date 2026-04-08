import OpenAI from "openai";

import { env } from "../../config.js";
import { AppError } from "../../lib/errors.js";
import { withRetry } from "../../lib/retry.js";
import {
  type AIExtractionProvider,
  type ExtractionInput,
  type ExtractionResult,
  ExtractionResultSchema
} from "./types.js";
import { buildExtractionSystemPrompt, buildExtractionUserPrompt, extractionOutputJsonSchema } from "./extractionSchema.js";

export class OpenAIExtractionProvider implements AIExtractionProvider {
  private readonly client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: env.OPENAI_API_KEY ?? "local-api-key",
      baseURL: env.OPENAI_BASE_URL
    });
  }

  public async extractStructuredData(input: ExtractionInput): Promise<ExtractionResult> {
    try {
      const completion = await withRetry(
        () =>
          this.client.chat.completions.create({
            model: env.OPENAI_MODEL ?? env.AI_MODEL,
            temperature: 0,
            messages: [
              { role: "system", content: buildExtractionSystemPrompt(input) },
              { role: "user", content: buildExtractionUserPrompt(input) }
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "enovait_extraction",
                schema: extractionOutputJsonSchema,
                strict: true
              }
            }
          }),
        {
          attempts: env.AI_RETRY_ATTEMPTS,
          baseDelayMs: env.AI_RETRY_BASE_MS
        }
      );

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
