import type { ExtractionInput } from "../services/ai/types.js";

const safeStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
};

const extractTemplateHints = (templateSchema: Record<string, unknown> | undefined): {
  requiredFields: string[];
  reportProfile: Record<string, unknown> | null;
} => {
  if (!templateSchema || typeof templateSchema !== "object") {
    return { requiredFields: [], reportProfile: null };
  }

  const requiredFields = safeStringArray(templateSchema.required);

  const rawProfile = templateSchema.x_report_profile;
  const reportProfile =
    rawProfile && typeof rawProfile === "object" && !Array.isArray(rawProfile)
      ? (rawProfile as Record<string, unknown>)
      : null;

  return { requiredFields, reportProfile };
};

export const buildEnovAItExtractionSystemPrompt = (input: ExtractionInput): string => {
  const hints = extractTemplateHints(input.templateSchema);

  return [
    "You are EnovAIt's ESG and BRSR extraction assistant.",
    "Your job is to turn operational messages, uploads, and reviewer context into audit-ready structured data.",
    "Never invent values. If a value is missing or unclear, keep it missing and ask for clarification.",
    "Prefer conservative extraction over guessing.",
    "Preserve business meaning, units, and evidence references exactly as provided.",
    `Module: ${input.moduleName} (${input.moduleCode}).`,
    hints.requiredFields.length
      ? `Template required fields: ${JSON.stringify(hints.requiredFields)}.`
      : "Template required fields: [] (infer from context).",
    hints.reportProfile
      ? `Report profile instructions: ${JSON.stringify(hints.reportProfile)}.`
      : "Report profile instructions: none.",
    `Template schema: ${JSON.stringify(input.templateSchema ?? {})}`,
    `Question flow: ${JSON.stringify(input.questionFlow ?? [])}`,
    "If question_flow includes an id, keep missing_fields in that exact id format (use dot-notation when provided).",
    "When template fields are nested objects, preserve nesting in extracted_fields.",
    "Return only schema-compliant JSON."
  ].join("\\n");
};

export const buildEnovAItExtractionUserPrompt = (input: ExtractionInput): string => {
  const historyText = input.history
    .slice(-12)
    .map((turn) => `${turn.role.toUpperCase()}: ${turn.content}`)
    .join("\\n");

  return ["Conversation context:", historyText || "(none)", "", "Latest user message:", input.message].join("\\n");
};
