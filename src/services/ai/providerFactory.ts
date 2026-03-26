import { env } from "../../config.js";
import { AppError } from "../../lib/errors.js";
import { AnthropicExtractionProvider } from "./anthropicProvider.js";
import { OpenAIExtractionProvider } from "./openaiProvider.js";
import { OpenRouterExtractionProvider } from "./openrouterProvider.js";
import type { AIExtractionProvider } from "./types.js";

class UnsupportedProvider implements AIExtractionProvider {
  private readonly providerName: string;

  constructor(providerName: string) {
    this.providerName = providerName;
  }

  public async extractStructuredData(): Promise<never> {
    throw new AppError(
      `${this.providerName} provider is not implemented yet. Use openai, anthropic, or openrouter.`,
      501,
      "AI_PROVIDER_NOT_IMPLEMENTED"
    );
  }
}

export const createAIProvider = (): AIExtractionProvider => {
  if (env.AI_PROVIDER === "openai") {
    return new OpenAIExtractionProvider();
  }

  if (env.AI_PROVIDER === "anthropic") {
    return new AnthropicExtractionProvider();
  }

  if (env.AI_PROVIDER === "openrouter") {
    return new OpenRouterExtractionProvider();
  }

  return new UnsupportedProvider(env.AI_PROVIDER);
};
