import { GoogleGenAI } from "@google/genai";

import { env } from "../../config.js";
import { AppError } from "../../lib/errors.js";
import type { AIExtractionProvider, ExtractionInput, ExtractionResult } from "./types.js";
import { buildExtractionSystemPrompt, buildExtractionUserPrompt } from "./extractionSchema.js";
import type { McpToolDefinition } from "../mcp/supabaseClient.js";

export class GeminiExtractionProvider implements AIExtractionProvider {
  private readonly client: GoogleGenAI;
  private readonly model: string;

  constructor() {
    if (!env.GEMINI_API_KEY) {
      throw new AppError("GEMINI_API_KEY is required when AI_PROVIDER=gemini", 500, "GEMINI_API_KEY_MISSING");
    }

    this.client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    this.model = env.GEMINI_MODEL ?? env.AI_MODEL ?? "gemini-2.5-flash";
  }

  public async extractStructuredData(input: ExtractionInput): Promise<ExtractionResult> {
    const systemMsg = buildExtractionSystemPrompt(input);
    const userMsg = buildExtractionUserPrompt(input);

    try {
      const result = await this.client.models.generateContent({
        model: this.model,
        contents: [
          ...input.history.map((h) => ({
            role: h.role === "assistant" ? "model" as const : "user" as const,
            parts: [{ text: h.content }]
          })),
          { role: "user", parts: [{ text: userMsg }] }
        ],
        config: {
          systemInstruction: systemMsg,
          temperature: 0.1,
          maxOutputTokens: 4096,
          responseMimeType: "application/json"
        }
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
          workflow_hints: parsed.workflow_hints as ExtractionResult["workflow_hints"]
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
          assistant_response: text
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

  public async chatWithTools(
    messages: Array<{ role: string; content: string }>,
    tools: Array<McpToolDefinition>,
    temperature = 0.3,
    maxTokens = 4096
  ): Promise<{
    content: string | null;
    toolCalls: Array<{ name: string; arguments: Record<string, unknown> }>;
  }> {
    const functionDeclarations = tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema
    }));

    const chat = this.client.chats.create({
      model: this.model,
      config: {
        temperature,
        maxOutputTokens: maxTokens,
        tools: functionDeclarations.length > 0 ? [{ functionDeclarations }] : undefined
      }
    });

    const history = messages.map((m) => ({
      role: m.role === "assistant" ? "model" as const : "user" as const,
      parts: [{ text: m.content }]
    }));

    const result = await chat.sendMessage({
      message: history[history.length - 1]?.parts[0]?.text || ""
    });

    const functionCalls = result.functionCalls || [];
    const toolCalls = functionCalls.map((call) => ({
      name: call.name!,
      arguments: call.args as Record<string, unknown>
    }));

    return {
      content: result.text || null,
      toolCalls
    };
  }
}
