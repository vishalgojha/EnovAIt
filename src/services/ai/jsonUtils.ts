import { AppError } from "../../lib/errors.js";

export const parseJsonFromText = (raw: string): unknown => {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fenced?.[1]?.trim() ?? trimmed;

  try {
    return JSON.parse(candidate);
  } catch {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start >= 0 && end > start) {
      const subset = candidate.slice(start, end + 1);
      try {
        return JSON.parse(subset);
      } catch {
        throw new AppError("AI returned invalid JSON", 502, "AI_INVALID_JSON", { raw: candidate });
      }
    }
    throw new AppError("AI returned invalid JSON", 502, "AI_INVALID_JSON", { raw: candidate });
  }
};
