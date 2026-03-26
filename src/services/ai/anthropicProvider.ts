import Anthropic from "@anthropic-ai/sdk";

import { env } from "../../config.js";
import { AppError } from "../../lib/errors.js";
import { withRetry } from "../../lib/retry.js";
import { buildExtractionSystemPrompt, buildExtractionUserPrompt } from "./extractionSchema.js";
import { parseJsonFromText } from "./jsonUtils.js";
import {
  type AIExtractionProvider,
  type ExtractionInput,
  type ExtractionResult,
  ExtractionResultSchema
} from "./types.js";

export class AnthropicExtractionProvider implements AIExtractionProvider {
  private readonly client: Anthropic;

  constructor() {
    this.client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  }

  public async extractStructuredData(input: ExtractionInput): Promise<ExtractionResult> {
    try {
      const response = await withRetry(
        () =>
          this.client.messages.create({
            model: env.ANTHROPIC_MODEL ?? env.AI_MODEL,
            max_tokens: 1200,
            temperature: 0,
            system: buildExtractionSystemPrompt(input),
            messages: [{ role: "user", content: buildExtractionUserPrompt(input) }]
          }),
        {
          attempts: env.AI_RETRY_ATTEMPTS,
          baseDelayMs: env.AI_RETRY_BASE_MS
        }
      );

      const text = response.content
        .filter((item) => item.type === "text")
        .map((item) => item.text)
        .join("\n")
        .trim();

      if (!text) {
        throw new AppError("Anthropic returned empty response", 502, "AI_EMPTY_RESPONSE");
      }

      const parsed = parseJsonFromText(text);
      return ExtractionResultSchema.parse(parsed);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Anthropic extraction failed", 502, "AI_EXTRACTION_FAILED", error);
    }
  }
}
