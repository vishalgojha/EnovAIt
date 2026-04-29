import { GoogleGenAI } from "@google/genai";

import { env } from "../../config.js";
import { AppError } from "../../lib/errors.js";
import type { AIExtractionProvider, ExtractionInput, ExtractionResult } from "./types.js";

export class GeminiExtractionProvider implements AIExtractionProvider {
  private readonly client: GoogleGenAI;

  constructor() {
    if (!env.GEMINI_API_KEY) {
      throw new AppError("GEMINI_API_KEY is required when AI_PROVIDER=gemini", 500, "GEMINI_API_KEY_MISSING");
    }

    this.client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  }

  public async extractStructuredData(input: ExtractionInput): Promise<ExtractionResult> {
    const model = env.GEMINI_MODEL ?? env.AI_MODEL ?? "gemini-2.0-flash";

    const systemMsg = `You are an ESG data extraction assistant for module "${input.moduleName}" (${input.moduleCode}). 
Extract structured data from the user's message and return a JSON object matching the expected schema.
If you cannot extract all fields, set is_complete to false and list missing fields.`;

    try {
      const result = await this.client.models.generateContent({
        model,
        contents: [
          ...input.history.map((h) => ({
            role: h.role === "assistant" ? "model" : "user",
            parts: [{ text: h.content }],
          })),
          { role: "user", parts: [{ text: input.message }] },
        ],
        config: {
          systemInstruction: systemMsg,
          temperature: 0.1,
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
        },
      });

      const text = result.text ?? "{}";

      try {
        const parsed = JSON.parse(text) as Record<string, unknown>;
        return {
          intent: (parsed.intent as string) || "extract",
          record_type: (parsed.record_type as string) || input.moduleCode,
          title: (parsed.title as string) || `Record from ${input.moduleName}`,
          extracted_fields: (parsed.extracted_fields as Record<string, unknown>) || {},
          missing_fields: (parsed.missing_fields as string[]) || [],
          completeness_score: (parsed.completeness_score as number) ?? 0.5,
          confidence: (parsed.confidence as number) ?? 0.7,
          is_complete: (parsed.is_complete as boolean) ?? false,
          assistant_response: (parsed.assistant_response as string) || text,
          clarifying_question: parsed.clarifying_question as string | undefined,
          workflow_hints: parsed.workflow_hints as ExtractionResult["workflow_hints"],
        };
      } catch {
        return {
          intent: "extract",
          record_type: input.moduleCode,
          title: `Record from ${input.moduleName}`,
          extracted_fields: { raw: text },
          missing_fields: [],
          completeness_score: 0,
          confidence: 0.5,
          is_complete: false,
          assistant_response: text,
        };
      }
    } catch (error) {
      throw new AppError(
        `Gemini API error: ${error instanceof Error ? error.message : String(error)}`,
        500,
        "GEMINI_API_ERROR"
      );
    }
  }
}
