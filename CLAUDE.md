# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a minimal React + TypeScript + Vite starter template designed for rapid prototyping and learning. It includes hot module replacement (HMR) support and ESLint configuration with React-specific rules.

**Tech Stack:**
- **React 19** — UI framework
- **TypeScript ~6.0** — Type safety and development experience
- **Vite 8** — Lightning-fast build tool with HMR
- **ESLint** with typescript-eslint, react-hooks, and react-refresh plugins
- **pnpm** — Package manager

## Common Commands

### Development
```bash
pnpm install          # Install dependencies
pnpm run dev          # Start dev server (http://localhost:5173)
pnpm run build        # Compile TypeScript and bundle with Vite
pnpm run lint         # Run ESLint on all files
pnpm run preview      # Preview production build locally
```

## Project Structure

```
src/
├── App.tsx          # Root component with counter example
├── main.tsx         # React DOM entry point
├── index.css        # Global styles
├── App.css          # App component styles
└── assets/          # Images and SVGs (react.svg, vite.svg, hero.png)

public/              # Static assets served at /
```

## Architecture Notes

**Minimal Setup:** This is a basic starter — there are no utility functions, no component library, and no complex state management. Components are simple functional components using React hooks.

**Styling:** Plain CSS files (App.css, index.css). No CSS-in-JS or preprocessor configured. Add Tailwind, Styled Components, or other solutions as needed.

**TypeScript Configuration:**
- Target: ES2023
- JSX: react-jsx (automatic JSX transform)
- Strict linting enabled (noUnusedLocals, noUnusedParameters)
- Module resolution: bundler mode for Vite compatibility

**ESLint:**
- Flat config format (`eslint.config.js`)
- Enforces React Hooks rules (e.g., dependency arrays)
- Checks React Refresh compatibility for fast refresh

## Development Workflow

1. `pnpm install` to set up dependencies
2. `pnpm run dev` to start the dev server
3. Edit files in `src/` — Vite will hot reload automatically
4. Run `pnpm run lint` before committing to catch issues
5. `pnpm run build` to create production bundle in `dist/`

## Notes for Future Development

- **React Compiler:** Not enabled by default due to performance impact. Enable it in `vite.config.ts` if needed — see the README for instructions.
- **Type-Aware ESLint:** The current config uses recommended rules. For production apps, consider upgrading to `recommendedTypeChecked` or `strictTypeChecked` in `eslint.config.js` and configuring `parserOptions.project`.
- **Path Aliases:** No path aliases configured. Add them to `vite.config.ts` and `tsconfig.app.json` if the project grows.
