# HSOS — Hygenie Sales Operating System

Real-time AI sales coaching platform by [Hygenie.ai](https://hygenie.ai).

## Products

- **Symptom Engine** (`/`) — Diagnostic tool for sales teams
- **Copilot** (`/call`) — Real-time AI coaching during live sales calls

## Tech Stack

Next.js 16 · React 19 · TypeScript · Supabase · Deepgram · OpenAI · Zustand · Tailwind CSS · Vercel

## Required Environment Variables

Set these in Vercel (Settings → Environment Variables):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DEEPGRAM_API_KEY=
OPENAI_API_KEY=
```

## Development

```bash
pnpm install
pnpm dev
```
 
