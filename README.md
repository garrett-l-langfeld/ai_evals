# AI Eval Starter Kit

A lightweight Next.js app that turns a plain-English AI workflow description into a starter evaluation package.

It generates:

- workflow summary
- success criteria
- failure modes
- starter test cases
- grader rubric
- eval dataset JSON schema
- JSON and Markdown exports

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Zod
- Vercel AI SDK provider layer

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create your local environment file:

```bash
cp .env.example .env.local
```

3. Choose the generation engine in `.env.local`.

Example using an OpenAI-compatible provider such as OpenRouter:

```bash
GENERATION_PROVIDER=openai-compatible
GENERATION_MODEL=meta-llama/llama-3.3-8b-instruct:free
```

Then add credentials for the provider you want to use.

For OpenAI:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

For xAI:

```bash
XAI_API_KEY=your_xai_api_key_here
```

For an OpenAI-compatible provider such as OpenRouter:

```bash
COMPATIBLE_API_KEY=your_provider_key_here
COMPATIBLE_BASE_URL=https://openrouter.ai/api/v1
COMPATIBLE_PROVIDER_NAME=OpenRouter
COMPATIBLE_SUPPORTS_STRUCTURED_OUTPUTS=false
NEXT_PUBLIC_COMPATIBLE_MODEL=meta-llama/llama-3.3-8b-instruct:free
```

4. Start the app locally:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000).

## Provider support

The app supports four generation modes:

- `Mock`: deterministic local demo, no API key needed
- `OpenAI`: uses `OPENAI_API_KEY`
- `xAI`: uses `XAI_API_KEY`
- `OpenAI-compatible`: uses `COMPATIBLE_API_KEY` plus `COMPATIBLE_BASE_URL`

The app reads the active provider and model from `.env.local`. Secrets stay server-side in the Next.js API route and are never exposed in client-side code.

### Important safety rules

- Put real keys in `.env.local`, not in source files.
- Never commit `.env.local` to GitHub.
- `.env.local` is already ignored by `.gitignore`.
- Commit `.env.example` instead so other users know which variables to supply.

If the configured provider is missing a required key or base URL, the app shows a configuration error instead of silently switching engines.

## OpenAI-compatible providers

The `OpenAI-compatible` option is intentionally generic. It can be used with services such as OpenRouter or any other provider that exposes an OpenAI-style chat completions API.

If you want to target a free OpenRouter model, set:

```bash
GENERATION_PROVIDER=openai-compatible
GENERATION_MODEL=meta-llama/llama-3.3-8b-instruct:free
```

If your compatible provider supports structured outputs reliably, set:

```bash
COMPATIBLE_SUPPORTS_STRUCTURED_OUTPUTS=true
```

For OpenRouter free models, `false` is usually the safer default. Leave it `false` and the app will use a more general JSON-generation path through the SDK.

## Running from GitHub

After cloning the repository, another user can run the app with their own provider key by following the same setup flow:

```bash
npm install
cp .env.example .env.local
```

Then they add their own provider credentials in `.env.local` and run:

```bash
npm run dev
```

## Testing

For static verification:

```bash
npm run typecheck
npm run build
```

For a quick demo:

1. Open the app.
2. Set `GENERATION_PROVIDER=mock` for a quota-free local demo, or configure a real provider in `.env.local`.
3. Load one of the built-in examples.
4. Click `Generate Eval Kit`.

## Project structure

```txt
app/
  api/generate/route.ts
  globals.css
  layout.tsx
  page.tsx
components/
  ExampleButtons.tsx
  ResultsPanel.tsx
  SectionCard.tsx
  WorkflowForm.tsx
lib/
  examples.ts
  export.ts
  generator.ts
  markdown.ts
  mock-generator.ts
  model-providers.ts
  prompt.ts
  schemas.ts
types/
  eval-kit.ts
```

## Future improvements

- show configured provider availability in the UI
- per-section copy actions
- editable test case count and rubric strictness
- localStorage persistence
- stronger mobile optimization

## Notes

- The generator runs through the Vercel AI SDK provider layer, so new providers can be added without rewriting the app flow.
- Mock mode remains available for fast demos and quota-free local testing.
- API keys stay server-side and are not stored in the repository.
