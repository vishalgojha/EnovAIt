export const parseJsonFromText = (raw: string): unknown | null => {
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
        return null;
      }
    }
    return null;
  }
};
