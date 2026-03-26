import { z } from "zod";

export const ConversationTurnSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1)
});

export const ExtractionResultSchema = z.object({
  intent: z.string().min(1),
  record_type: z.string().min(1),
  title: z.string().min(1),
  extracted_fields: z.record(z.string(), z.unknown()),
  missing_fields: z.array(z.string()).default([]),
  completeness_score: z.number().min(0).max(1),
  confidence: z.number().min(0).max(1),
  is_complete: z.boolean(),
  clarifying_question: z.string().optional(),
  workflow_hints: z
    .object({
      severity: z.string().optional(),
      escalation_recommended: z.boolean().optional()
    })
    .optional(),
  assistant_response: z.string().min(1)
});

export type ConversationTurn = z.infer<typeof ConversationTurnSchema>;
export type ExtractionResult = z.infer<typeof ExtractionResultSchema>;

export interface ExtractionInput {
  moduleCode: string;
  moduleName: string;
  templateSchema?: Record<string, unknown>;
  questionFlow?: Array<Record<string, unknown>>;
  message: string;
  history: ConversationTurn[];
}

export interface AIExtractionProvider {
  extractStructuredData(input: ExtractionInput): Promise<ExtractionResult>;
}
