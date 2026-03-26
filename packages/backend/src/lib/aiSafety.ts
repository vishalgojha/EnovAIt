const promptInjectionSignals = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /developer\s+message/i,
  /system\s+prompt/i,
  /override\s+policy/i,
  /jailbreak/i,
  /tool\s+call/i,
  /<\/?system>/i,
  /<\/?assistant>/i
];

export const isHighRiskPromptInjection = (input: string): boolean => {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return false;
  }

  let matches = 0;
  for (const pattern of promptInjectionSignals) {
    if (pattern.test(trimmed)) {
      matches += 1;
    }
  }

  return matches >= 2;
};
