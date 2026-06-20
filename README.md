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

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create your local environment file:

```bash
cp .env.example .env.local
```

3. Add your OpenAI API key to `.env.local`:

```bash
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4.1-mini
```

4. Start the app locally:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000).

## OpenAI API key

The app supports two modes:

- `OpenAI mode`: used when `OPENAI_API_KEY` is present in `.env.local`
- `Mock mode`: used when no API key is configured

Your API key is only read on the server inside the Next.js API route. It is not exposed to the browser UI and should never be committed to Git.

### Important safety rules

- Put your real key in `.env.local`, not in source files.
- Never commit `.env.local` to GitHub.
- `.env.local` is already ignored by `.gitignore`.
- Commit `.env.example` instead so other users know which variables to supply.

If `OPENAI_API_KEY` is set but invalid, the app now shows an error instead of silently falling back to mock mode. That makes live demos easier to trust.

## Mock mode

Mock mode is the default local demo path. It creates deterministic, structured eval kits without making any external API calls, so the app remains demoable after a fresh install.

## Running from GitHub

After cloning the repository, a new user can run the app with their own key by following the same setup flow:

```bash
npm install
cp .env.example .env.local
```

Then they add their own `OPENAI_API_KEY` value in `.env.local` and run:

```bash
npm run dev
```

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
  prompt.ts
  schemas.ts
types/
  eval-kit.ts
```

## Future improvements

- richer OpenAI structured output handling
- per-section copy actions
- editable test case count and rubric strictness
- localStorage persistence
- stronger mobile optimization

## Notes

- The MVP is fully wired for local demo in mock mode.
- The OpenAI path is intentionally isolated in `lib/generator.ts` so it can be improved without touching the UI flow.
- API keys stay server-side and are not stored in the repository.
