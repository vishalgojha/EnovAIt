import { env } from "../../config.js";
import { AppError } from "../../lib/errors.js";
import { OpenAIExtractionProvider } from "./openaiProvider.js";
import type { AIExtractionProvider } from "./types.js";

class UnsupportedProvider implements AIExtractionProvider {
  private readonly providerName: string;

  constructor(providerName: string) {
    this.providerName = providerName;
  }

  public async extractStructuredData(): Promise<never> {
    throw new AppError(
      `${this.providerName} provider is not implemented yet. Switch AI_PROVIDER=openai or add provider adapter.`,
      501,
      "AI_PROVIDER_NOT_IMPLEMENTED"
    );
  }
}

export const createAIProvider = (): AIExtractionProvider => {
  if (env.AI_PROVIDER === "openai") {
    return new OpenAIExtractionProvider();
  }
  return new UnsupportedProvider(env.AI_PROVIDER);
};
