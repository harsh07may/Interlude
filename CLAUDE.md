# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install          # install dependencies
pnpm run dev          # start dev server (http://localhost:5173)
pnpm run build        # tsc -b && vite build
pnpm run lint         # eslint
pnpm run test         # vitest run (single pass)
pnpm run test:watch   # vitest in watch mode
```

Run a single test file:
```bash
pnpm run test -- src/test/ocrParser.test.ts
```

## Architecture

**Stack:** React 19 + Vite + TypeScript, deployed as a static site to GitHub Pages at `/Interlude/`.

**Routing:** `HashRouter` (not `BrowserRouter`) — required for GitHub Pages because there is no server-side rewrite. Two routes: `/` (Dashboard) and `/library` (LibraryPage). Route constants live in `src/constants/index.ts`.

**State:** No external state manager. Two custom hooks own all state:
- `useOCRConfig` — loads/saves `OCRConfig` to `localStorage`. The Gemini API key is kept in `sessionStorage` only (cleared on tab close) and is never written to `localStorage`.
- `useScannedPages` — loads/saves `ScannedPage[]` to `localStorage`, sorted newest-first.

Both hooks are instantiated once at the `App` level and passed down as props.

**OCR pipeline:** `DigitizeModal` drives the scan flow (`upload → results | error`). On file selection it calls one of two strategies:
- `src/lib/geminiOcr.ts` — direct browser fetch to the Gemini REST API (`generativelanguage.googleapis.com`). Sends the image as base64 inline data.
- `src/lib/backendOcr.ts` — multipart POST to a configurable backend URL.

Both strategies return `OCRExtraction` by running the raw LLM/backend text through `src/lib/ocrParser.ts`.

**Parser format:** `ocrParser.ts` expects lines in the form `HH:MM - text` (or `HH:MM – text` with an em-dash, or `HH:MM | - text`). A date header (`9th June`, `Monday, 3rd`) on the first line is extracted separately. Continuation lines (no timestamp) are appended to the previous entry.

**Key types** (`src/types/index.ts`): `OCRConfig`, `OCRExtraction`, `JournalEntry`, `ScannedPage`, `OCRError`, `BackendOCRResponse`.

**Vite base path:** `base: '/Interlude/'` in `vite.config.ts` — required for GitHub Pages asset paths.
