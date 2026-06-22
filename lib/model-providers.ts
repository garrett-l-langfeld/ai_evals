import type { GenerationProvider } from "@/types/eval-kit";

export const providerOptions: Array<{
  value: GenerationProvider;
  label: string;
  description: string;
  defaultModel: string;
}> = [
  {
    value: "mock",
    label: "Mock",
    description: "Deterministic local demo with no external API call.",
    defaultModel: "deterministic-template"
  },
  {
    value: "openai",
    label: "OpenAI",
    description: "Use an OpenAI API key and model slug such as gpt-4.1-mini.",
    defaultModel: "gpt-4.1-mini"
  },
  {
    value: "xai",
    label: "xAI",
    description: "Use an xAI key and a Grok model such as grok-4-fast-reasoning.",
    defaultModel: "grok-4-fast-reasoning"
  },
  {
    value: "anthropic",
    label: "Anthropic",
    description: "Use an Anthropic API key and a Claude model such as claude-3-7-sonnet-latest.",
    defaultModel: "claude-3-7-sonnet-latest"
  },
  {
    value: "gemini",
    label: "Gemini",
    description: "Use a Google AI Studio key and a Gemini model such as gemini-2.5-flash.",
    defaultModel: "gemini-2.5-flash"
  },
  {
    value: "openai-compatible",
    label: "OpenAI-Compatible",
    description: "Use any OpenAI-compatible base URL such as OpenRouter or another gateway.",
    defaultModel: "openai/gpt-4.1-mini"
  }
];

export function isGenerationProvider(value: string): value is GenerationProvider {
  return providerOptions.some((option) => option.value === value);
}

export function getDefaultModel(provider: GenerationProvider): string {
  if (provider === "openai-compatible") {
    return process.env.NEXT_PUBLIC_COMPATIBLE_MODEL?.trim() || "openai/gpt-4.1-mini";
  }

  return providerOptions.find((option) => option.value === provider)?.defaultModel || "deterministic-template";
}

export function getProviderLabel(provider: GenerationProvider): string {
  return providerOptions.find((option) => option.value === provider)?.label || provider;
}

export function resolveConfiguredGeneration(): { provider: GenerationProvider; model: string } {
  const configuredProvider = process.env.GENERATION_PROVIDER?.trim();

  if (configuredProvider) {
    if (!isGenerationProvider(configuredProvider)) {
      throw new Error(
        `Invalid GENERATION_PROVIDER "${configuredProvider}" in .env.local. Use mock, openai, xai, anthropic, gemini, or openai-compatible.`
      );
    }

    if (configuredProvider === "mock") {
      return {
        provider: "mock",
        model: "deterministic-template"
      };
    }

    const configuredModel =
      process.env.GENERATION_MODEL?.trim() ||
      (configuredProvider === "openai" ? process.env.OPENAI_MODEL?.trim() : "") ||
      (configuredProvider === "xai" ? process.env.XAI_MODEL?.trim() : "") ||
      (configuredProvider === "anthropic" ? process.env.ANTHROPIC_MODEL?.trim() : "") ||
      (configuredProvider === "gemini" ? process.env.GEMINI_MODEL?.trim() : "") ||
      (configuredProvider === "openai-compatible"
        ? process.env.COMPATIBLE_MODEL?.trim() || process.env.NEXT_PUBLIC_COMPATIBLE_MODEL?.trim()
        : "") ||
      getDefaultModel(configuredProvider);

    return {
      provider: configuredProvider,
      model: configuredModel
    };
  }

  if (process.env.COMPATIBLE_API_KEY?.trim() && process.env.COMPATIBLE_BASE_URL?.trim()) {
    return {
      provider: "openai-compatible",
      model:
        process.env.GENERATION_MODEL?.trim() ||
        process.env.COMPATIBLE_MODEL?.trim() ||
        process.env.NEXT_PUBLIC_COMPATIBLE_MODEL?.trim() ||
        "openai/gpt-4.1-mini"
    };
  }

  if (process.env.OPENAI_API_KEY?.trim()) {
    return {
      provider: "openai",
      model: process.env.GENERATION_MODEL?.trim() || process.env.OPENAI_MODEL?.trim() || "gpt-4.1-mini"
    };
  }

  if (process.env.XAI_API_KEY?.trim()) {
    return {
      provider: "xai",
      model: process.env.GENERATION_MODEL?.trim() || process.env.XAI_MODEL?.trim() || "grok-4-fast-reasoning"
    };
  }

  if (process.env.ANTHROPIC_API_KEY?.trim()) {
    return {
      provider: "anthropic",
      model:
        process.env.GENERATION_MODEL?.trim() || process.env.ANTHROPIC_MODEL?.trim() || "claude-3-7-sonnet-latest"
    };
  }

  if (process.env.GEMINI_API_KEY?.trim()) {
    return {
      provider: "gemini",
      model: process.env.GENERATION_MODEL?.trim() || process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash"
    };
  }

  return {
    provider: "mock",
    model: "deterministic-template"
  };
}
