# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
## Critical Rules
- This is a VOICE-BASED app, not chat
- Do NOT convert it into a chat interface
- Do NOT rewrite the entire codebase
- Only modify necessary parts

## Product Direction
- Tinder-style swipe UI
- Real-time voice interview

## Development commands

- Install dependencies: `npm install`
- Run frontend + backend in dev: `npm run dev`
- Run only the Next.js app: `npm run dev:web`
- Run only the Express API: `npm run dev:server`
- Type-check frontend + backend: `npm run typecheck`
- Production build: `npm run build`
- Start built frontend + backend: `npm run start`

## Environment

Create a local `.env` based on `.env.example`.

Required values:
- `ANTHROPIC_API_KEY`
- `PORT` for the Express API (defaults to `8787`)
- `NEXT_PUBLIC_API_BASE_URL` for the frontend-to-backend API base URL

## Architecture overview

This is a single TypeScript codebase with two runtime surfaces:

- **Next.js App Router frontend** for the voice-first UI and swipe results experience
- **Express backend** for interview state, Claude calls, match generation, swipe feedback, and PDF export

The frontend and backend share domain types and scoring logic from `shared/`, so profile shapes and match results stay consistent across both sides.

## Request flow

### Voice interview flow

The main interaction starts in `components/voice/voice-call-screen.tsx`.

- The browser microphone uses the adapter in `lib/voice/speech-recognition.ts`
- Browser TTS uses `lib/voice/speech-synthesis-queue.ts`
- The UI sends spoken user turns to the backend through `lib/api.ts`
- After each backend response, the frontend speaks the counselor reply aloud, then resumes listening
- When the backend marks the interview complete, the UI navigates to `/results?sessionId=...`

This app is intentionally **voice-first**, not chat-first. The transcript preview in the interview UI is only a lightweight debug/status aid.

### Backend API flow

`server/index.ts` mounts three route groups:

- `/api/interview` — start interview, send user messages, fetch session state
- `/api/matches` — compute ranked matches and export PDF
- `/api/feedback` — record swipe feedback and rerank recommendations

Interview sessions are currently stored **in memory** via `server/services/interview-session.ts`. There is no database yet, so server restarts clear active sessions.

## Claude integration

The Claude integration lives in `server/services/claude.ts` and has two separate responsibilities:

1. **Interviewer generation** via `streamInterviewReply()`
   - Uses `claude-opus-4-6`
   - Streams the next counselor response
   - Prompt is tuned for one-question-at-a-time, natural counselor-style interviewing

2. **Structured extraction** via `extractProfile()`
   - Uses `client.messages.parse(...)`
   - Produces a structured profile and interview coverage map using the Zod schema from `shared/profile-schema.ts`
   - Falls back to existing in-memory session data if parsing is unavailable

If `ANTHROPIC_API_KEY` is missing, the backend falls back to a simple non-LLM interview path so the app can still run locally.

## Shared domain model

`shared/types.ts` defines the core app model:

- `InterviewSession` for transcript + profile + coverage + swipe history
- `StructuredProfile` for normalized student preferences
- `College` for normalized school data used by both UI and matcher
- `MatchResult` for ranked recommendation payloads returned to the frontend

`shared/profile-schema.ts` is the source of truth for structured extraction, and `shared/match-scoring.ts` contains the lower-level scoring helpers used by the matcher.

## Matching system

`server/services/matcher.ts` performs deterministic ranking.

It combines:
- academic fit
- cultural fit
- admissions fit
- financial fit
- geographic fit

The matcher returns both a final score and an explanation payload (`whyItFits`). Swipe feedback modifies recommendation weights incrementally rather than re-running the interview.

## College data

The initial dataset is local and lives in `data/colleges.seed.json`.

Access to that data is wrapped in `server/services/college-repository.ts`, so future work can replace or augment the seed file with a real API or sync pipeline without changing the rest of the app contract.

## Frontend structure

- `app/page.tsx` is the voice interview entry point
- `app/results/page.tsx` is the recommendation/swipe experience
- `components/voice/*` contains the call-style UI
- `components/swipe/*` contains the Tinder-style deck
- `components/college/*` contains detail, favorites, and compare panels

The results page depends on a `sessionId` query param and pulls matches from the Express API rather than computing them client-side.

## Current constraints

- Browser STT/TTS is used instead of premium speech services, so Chrome-like browsers work best
- Sessions are in-memory only
- There is currently **no test suite** and **no lint script** configured in `package.json`
- `npm run typecheck` and `npm run build` are the main verification commands before committing changes
