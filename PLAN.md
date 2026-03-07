# PLAN.md — IdeaNodes Stabilization Roadmap

## Overview

A phased "Now / Next / Later" plan to bring IdeaNodes from its current brownfield state to a secure, well-tested, maintainable production codebase. Each phase builds on the previous and includes measurable checkpoints.

---

## Phase 1 — NOW: Fix Critical Issues & Establish Foundations
**Goal**: Eliminate security vulnerabilities and establish the minimum developer workflow tooling.
**Milestone**: The codebase is safe to open-source and safe to accept user data. A developer can clone it and immediately get lint + type feedback.

### 1.1 Security — Fix Authorization Gaps (CRITICAL)
- Add `getAuthUserId` ownership checks to `convex/nodes.ts`:
  - `addNode`: verify caller owns `graphId`
  - `updateNode`: verify caller owns the node's parent graph
  - `deleteNode`: verify caller owns the node's parent graph
- Add test cases that assert unauthorized mutations are rejected.

**Checkpoint**: No mutation in `convex/nodes.ts` can be invoked on data the caller does not own.

### 1.2 Security — Resolve Importmap CDN Risk
- Audit and remove the `aistudiocdn.com` importmap from `index.html`.
- Ensure all imports resolve through Vite + local `node_modules` only.
- Remove duplicate package listings (packages already in `package.json` should NOT also be in the importmap).

**Checkpoint**: `npm run build` produces a self-contained bundle with no runtime CDN dependency for app code. `@google/genai` must NOT be reachable in browser context.

### 1.3 Build Tooling — Fix Tailwind Integration
- Remove the `<script src="https://cdn.tailwindcss.com">` CDN tag from `index.html`.
- Install `tailwindcss` and `@tailwindcss/vite` (or `autoprefixer` + PostCSS) as dev dependencies.
- Configure Vite or PostCSS to process `index.css` Tailwind directives.
- Add a `tailwind.config.ts` with content paths covering `index.html`, `index.tsx`, `App.tsx`, `components/**`, etc.
- Verify dark mode and custom theme extensions still work.

**Checkpoint**: `npm run build` outputs a CSS file with only the used utility classes (no full Tailwind payload).

### 1.4 Developer Tooling — Add Linter & Formatter
- Install `eslint`, `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`, `eslint-plugin-react-hooks`, `prettier`, `eslint-config-prettier`.
- Add `eslint.config.js` (flat config) and `.prettierrc`.
- Run `eslint --fix` and `prettier --write` across the codebase.
- Add `"lint": "eslint ."` and `"format": "prettier --write ."` scripts to `package.json`.

**Checkpoint**: `npm run lint` exits 0. `npm run format --check` exits 0.

### 1.5 Developer Tooling — Add Type Check Script
- Add `"typecheck": "tsc --noEmit"` to `package.json` scripts.
- Resolve all existing TypeScript errors (focus on `as any` casts in `App.tsx`).

**Checkpoint**: `npm run typecheck` exits 0.

---

## Phase 2 — NEXT: Testing, Decomposition & CI
**Goal**: Establish test coverage for all critical paths and break up the monolithic `App.tsx`. Ship a CI pipeline.
**Milestone**: Every PR is automatically validated. A new contributor can understand and modify the app without reading all 645 lines of `App.tsx`.

### 2.1 Testing — Add Test Runner
- Install `vitest`, `@vitest/ui`, `@testing-library/react`, `@testing-library/user-event`, `jsdom`.
- Add `"test": "vitest run"` and `"test:watch": "vitest"` scripts.
- Configure `vitest.config.ts` with jsdom environment.

**Checkpoint**: `npm test` runs and exits 0 (with placeholder test).

### 2.2 Testing — Convex Function Tests
- Write unit tests for Convex query/mutation logic using `convex-test` or mocked ctx:
  - `listGraphs` returns only the authed user's graphs.
  - `addNode` / `updateNode` / `deleteNode` reject unauthorized callers (post Phase-1 fix).
  - `createGraph` + `deleteGraph` cascade deletes nodes.
  - `getWorkflow` returns correct status fields.

**Checkpoint**: All Convex function tests pass. Auth guard tests explicitly assert rejection.

### 2.3 Testing — React Component Smoke Tests
- Write smoke tests for:
  - `Auth.tsx`: renders sign-in form, switches to sign-up, shows error state.
  - `NodeCard.tsx`: renders title and content, fires onDelete/onUpdate.
  - `RemixModal.tsx`, `ImportModal.tsx`: open/close, submit with valid input.
  - `App.tsx` (guest mode): renders initial node, add node, delete node.

**Checkpoint**: Component test suite passes; coverage report shows > 50% statement coverage on components.

### 2.4 Refactor — Decompose `App.tsx`
- Extract the following into dedicated custom hooks:
  - `useSessionManager` — graph CRUD, active session selection
  - `useNodeManager` — node CRUD, local vs. Convex path switching
  - `useAIWorkflow` — AI action dispatch, workflow polling, stop handler
  - `useTheme` — theme toggle, side-effects
- Extract the header into a standalone `components/Header.tsx` component.
- Extract the floating action bar into `components/ActionBar.tsx`.
- Target: no file in `components/` or `hooks/` exceeds 200 lines; `App.tsx` reduced to < 150 lines (wiring only).

**Checkpoint**: `App.tsx` < 150 lines. All existing functionality works. Tests still pass.

### 2.5 Reliability — Add Error Boundaries
- Install or implement a lightweight `ErrorBoundary` component.
- Wrap the `<MainApp>` route with a top-level `ErrorBoundary`.
- Add a targeted boundary around the `GraphView` component.
- Display a user-friendly "Something went wrong" fallback UI.

**Checkpoint**: Deliberately throwing in a child component shows fallback UI instead of blank page.

### 2.6 CI — GitHub Actions
- Add `.github/workflows/ci.yml` running on `push` and `pull_request` to `main`:
  - `npm ci`
  - `npm run typecheck`
  - `npm run lint`
  - `npm test`
- (Optional) Add `npm run build` as a final CI step.

**Checkpoint**: CI pipeline passes green on a clean branch. PRs show CI status.

---

## Phase 3 — LATER: Polish, Performance & Features
**Goal**: Production hardening, UX improvements, and infrastructure for future features.
**Milestone**: IdeaNodes is ready for public launch with confidence in reliability and scalability.

### 3.1 UX — Fix Workflow Cancellation
- Implement a `cancelWorkflow` mutation in `convex/workflows.ts` that sets status to `cancelled`.
- In `convex/ai.ts` actions, check for `cancelled` status at the start and before writing results.
- Wire the "Stop" button in `App.tsx` to call `cancelWorkflow` before clearing UI state.

### 3.2 Code Quality — Remove Dead Code
- Delete or wire up `components/VoiceButton.tsx` and `components/SimpleHeader.tsx`.
- Remove unused `NodeActionType` enum from `types.ts` if confirmed unused.
- Remove `embedding` field from `nodes` schema if RAG is not planned for Phase 1/2.

### 3.3 UX — Session Limit Feedback
- Raise or paginate the `.take(10)` cap in `listGraphs`, or display a clear message to the user when the limit is reached.

### 3.4 Build — Progressive Enhancement
- Ensure the service worker offline strategy caches the app shell for offline viewing.
- Add a splash screen or skeleton loader for initial Convex connection.

### 3.5 Security — Password Policy
- Add minimum length (≥ 8 chars) and basic complexity validation in `Auth.tsx`.
- Consider adding rate limiting on the Convex auth `signIn` endpoint.

### 3.6 Schema — Type Safety
- Change `nodes.type` from `v.string()` to `v.union(v.literal("initial"), v.literal("expansion"), v.literal("blueprint"), v.literal("user"))` for DB-level enforcement.
- Align `IdeaNode` TypeScript type with the schema union.

### 3.7 Observability
- Add structured error logging for Convex action failures (currently only `console.error`).
- Consider integrating Sentry or LogFlare for frontend error tracking.

---

## Dependency Map

```
Phase 1.2 (importmap fix) ──> must complete before Phase 1.3 (Tailwind)
Phase 1.1 (auth fix) ──────> must complete before Phase 2.2 (auth tests)
Phase 1.4 + 1.5 ──────────> prerequisites for Phase 2.6 (CI)
Phase 2.1 (test runner) ───> prerequisite for Phase 2.2 + 2.3
Phase 2.4 (decompose App) ─> prerequisite for Phase 2.3 (component tests are easier after)
```

---

## Changelog

| Date | Change |
|---|---|
| 2026-03-07 | Initial OEF creation — full phased plan |
