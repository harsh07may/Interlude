# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Repository Overview

Interlude is a React + TypeScript journal digitizer. It lets a user upload or capture a handwritten journal page, sends the file to OCR, parses the result into dated timestamped entries, and displays/copies the cleaned text.

## Tech Stack

- React 19
- TypeScript 6
- Vite 8
- Vitest with jsdom
- ESLint with typescript-eslint, react-hooks, and react-refresh
- pnpm

## Common Commands

```bash
pnpm install
pnpm run dev
pnpm run lint
pnpm run build
pnpm run test
pnpm run preview
```

## Project Structure

```text
src/
├── App.tsx
├── App.css
├── main.tsx
├── components/
│   ├── Dashboard.tsx
│   ├── DigitizeModal.tsx
│   ├── ResultsDisplay.tsx
│   ├── SettingsModal.tsx
│   └── UploadArea.tsx
├── hooks/
│   └── useOCRConfig.ts
├── lib/
│   ├── backendOcr.ts
│   ├── geminiOcr.ts
│   ├── ocrParser.ts
│   └── utils.ts
└── types/
    └── index.ts
```

## Architecture Notes

- Gemini OCR is the default path. The default model is defined in `src/lib/geminiOcr.ts`.
- A custom backend OCR endpoint remains available through Settings.
- OCR settings are stored in localStorage by `useOCRConfig`.
- `ocrParser.ts` accepts both `HH:MM - text` and timestamp-on-one-line OCR output.
- Shared upload validation lives in `src/lib/utils.ts`.
