import OpenAI from "openai";

import { env } from "../../config.js";
import { AppError } from "../../lib/errors.js";
import type { AIExtractionProvider, ExtractionInput, ExtractionResult } from "./types.js";

export class GroqExtractionProvider implements AIExtractionProvider {
  private readonly client: OpenAI;

  constructor() {
    if (!env.GROQ_API_KEY) {
      throw new AppError("GROQ_API_KEY is required when AI_PROVIDER=groq", 500, "GROQ_API_KEY_MISSING");
    }

    this.client = new OpenAI({
      apiKey: env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });
  }

  public async extractStructuredData(input: ExtractionInput): Promise<ExtractionResult> {
    const model = env.GROQ_MODEL ?? env.AI_MODEL ?? "qwen-2.5-32b";

    const systemMsg = `You are an ESG data extraction assistant for module "${input.moduleName}" (${input.moduleCode}). 
Extract structured data from the user's message and return a JSON object matching the expected schema.
If you cannot extract all fields, set is_complete to false and list missing fields.`;

    const response = await this.client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemMsg },
        ...input.history.map((h) => ({ role: h.role as "user" | "assistant" | "system", content: h.content })),
        { role: "user", content: input.message },
      ],
      temperature: 0.1,
      max_tokens: 4096,
      response_format: { type: "json_object" },
    });

    const text = response.choices[0]?.message?.content ?? "{}";

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
  }
}
