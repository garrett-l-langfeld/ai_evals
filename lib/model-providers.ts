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
    value: "openai-compatible",
    label: "OpenAI-Compatible",
    description: "Use any OpenAI-compatible base URL such as OpenRouter or another gateway.",
    defaultModel: "openai/gpt-4.1-mini"
  }
];

export function getDefaultModel(provider: GenerationProvider): string {
  if (provider === "openai-compatible") {
    return process.env.NEXT_PUBLIC_COMPATIBLE_MODEL?.trim() || "openai/gpt-4.1-mini";
  }

  return providerOptions.find((option) => option.value === provider)?.defaultModel || "deterministic-template";
}

export function getProviderLabel(provider: GenerationProvider): string {
  return providerOptions.find((option) => option.value === provider)?.label || provider;
}
