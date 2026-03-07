# CHECKLIST.md — IdeaNodes Actionable Task List

This checklist is derived from PLAN.md. Work top-to-bottom within each phase. Check off items as they are completed and verified.

---

## Setup & Verify Local Run

- [ ] Clone repo and run `npm install` — confirm zero errors
- [ ] Create `.env.local` with `VITE_CONVEX_URL=<your-convex-url>` and `GEMINI_API_KEY=<your-key>`
- [ ] Run `npx convex dev` in one terminal — confirm Convex backend deploys
- [ ] Run `npm run dev` in a second terminal — confirm app loads on `localhost:5173`
- [ ] Sign up for a new account — confirm auth flow works
- [ ] Add a node manually — confirm it persists after page reload
- [ ] Click "Generate" — confirm AI generates a node and workflow completes
- [ ] Click "Remix" — confirm a new session is created with remixed nodes
- [ ] Click "Import" — confirm text is structured into nodes
- [ ] Export to JSON and Markdown — confirm downloads work

---

## Phase 1 — Critical Fixes & Foundations

### 1.1 Authorization — Fix BOLA/IDOR in Convex Mutations
- [ ] In `convex/nodes.ts`, `addNode`: fetch graph by `graphId`, assert `graph.userId === callerId`
- [ ] In `convex/nodes.ts`, `updateNode`: fetch node, fetch its parent graph, assert ownership
- [ ] In `convex/nodes.ts`, `deleteNode`: fetch node, fetch its parent graph, assert ownership
- [ ] Verify `deleteGraph` still has its existing auth guard (it does — confirm unchanged)
- [ ] Manually test: authenticated user cannot delete another user's node via direct mutation call
- [ ] Verify that `internalAddNode` and `internalAddNodes` are only callable internally (they are `internalMutation` — confirm)

### 1.2 Security — Remove `aistudiocdn.com` Importmap
- [ ] In `index.html`, remove the entire `<script type="importmap">` block
- [ ] Verify `npm run dev` still starts without the importmap
- [ ] Verify `npm run build` completes without errors
- [ ] Confirm `react`, `framer-motion`, `lucide-react`, `uuid` are resolved from `node_modules`
- [ ] Confirm `@google/genai` is NOT accessible in the browser bundle (it should only be in Convex backend)
- [ ] Load the built app in browser — confirm no CDN requests to `aistudiocdn.com` in Network tab

### 1.3 Build — Migrate Tailwind from CDN to Vite
- [ ] Remove `<script src="https://cdn.tailwindcss.com">` from `index.html`
- [ ] Remove the inline `tailwind.config = { ... }` script block from `index.html`
- [ ] Run `npm install -D tailwindcss @tailwindcss/vite` (or `tailwindcss postcss autoprefixer`)
- [ ] Create `tailwind.config.ts` with `content: ['./index.html', './**/*.{ts,tsx}']`
- [ ] Add Tailwind plugin to `vite.config.ts` (or configure PostCSS)
- [ ] Ensure `index.css` `@tailwind base/components/utilities` directives are processed by Vite
- [ ] Run `npm run build` — confirm CSS output is present and scoped
- [ ] Visually verify dark mode, fonts, animations, glass panels still render correctly

### 1.4 Tooling — Add ESLint + Prettier
- [ ] Run: `npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react-hooks eslint-plugin-react-refresh prettier eslint-config-prettier`
- [ ] Create `eslint.config.js` (flat config) with TypeScript + React rules
- [ ] Create `.prettierrc` (or add `prettier` key to `package.json`)
- [ ] Add `"lint": "eslint ."` to `package.json` scripts
- [ ] Add `"format": "prettier --write ."` to `package.json` scripts
- [ ] Run `npm run format` to auto-fix formatting across all files
- [ ] Run `npm run lint` — fix all remaining errors (focus: `as any`, unused vars)
- [ ] Confirm `npm run lint` exits 0

### 1.5 Tooling — Add TypeScript Type Check
- [ ] Add `"typecheck": "tsc --noEmit"` to `package.json` scripts
- [ ] Run `npm run typecheck` — note all errors
- [ ] Fix `as any` cast on `convexNodes` in `App.tsx:137` — add proper Convex type
- [ ] Fix `as any` casts on mutation IDs in `App.tsx:219,235` — use `Id<"nodes">` properly
- [ ] Fix any remaining type errors surfaced by the check
- [ ] Confirm `npm run typecheck` exits 0

---

## Phase 2 — Testing, Decomposition & CI

### 2.1 Testing — Set Up Test Runner
- [ ] Run: `npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/user-event`
- [ ] Create `vitest.config.ts` with `environment: 'jsdom'` and `setupFiles`
- [ ] Add `"test": "vitest run"` and `"test:watch": "vitest"` to `package.json` scripts
- [ ] Create a placeholder test file `__tests__/placeholder.test.ts` that passes
- [ ] Confirm `npm test` exits 0

### 2.2 Testing — Convex Function Tests
- [ ] Install `convex-test` (or set up Convex test helpers as per their docs)
- [ ] Write test: `listGraphs` returns empty array for unauthenticated caller
- [ ] Write test: `listGraphs` returns only the authed user's graphs (not another user's)
- [ ] Write test: `addNode` fails when caller does not own the graph (post Phase-1.1 fix)
- [ ] Write test: `updateNode` fails when caller does not own the node (post Phase-1.1 fix)
- [ ] Write test: `deleteNode` fails when caller does not own the node (post Phase-1.1 fix)
- [ ] Write test: `deleteGraph` cascade-deletes all child nodes
- [ ] Write test: `createWorkflow` → `updateWorkflowStatus("completed")` → `getWorkflow` returns correct status
- [ ] Confirm all Convex tests pass with `npm test`

### 2.3 Testing — React Component Smoke Tests
- [ ] Write test: `Auth.tsx` renders sign-in form by default
- [ ] Write test: `Auth.tsx` switches to sign-up when link clicked
- [ ] Write test: `Auth.tsx` displays error message on failed submit
- [ ] Write test: `NodeCard.tsx` renders `node.title` and `node.content`
- [ ] Write test: `NodeCard.tsx` calls `onDelete` when delete button is activated
- [ ] Write test: `RemixModal.tsx` shows when `isOpen=true`, hides when `isOpen=false`
- [ ] Write test: `ImportModal.tsx` calls `onImport` with textarea content on submit
- [ ] Write test: `App.tsx` (guest mode, no Convex) renders initial node on mount
- [ ] Confirm all component tests pass with `npm test`

### 2.4 Refactor — Decompose App.tsx
- [ ] Extract `useSessionManager` hook — owns: `graphs`, `activeGraphId`, `createGraph`, `deleteGraph`, `updateGraphTitle`, session menu state
- [ ] Extract `useNodeManager` hook — owns: node CRUD, local vs. Convex routing, `localNodes` state
- [ ] Extract `useAIWorkflow` hook — owns: `workflowId`, workflow polling, `loading`, `error`, `handleStop`, all `startGenerate*` calls
- [ ] Extract `useTheme` hook — owns: `theme` state and `document.documentElement` side-effect
- [ ] Extract `components/Header.tsx` — the full `<header>` block including session switcher and toolbar
- [ ] Extract `components/ActionBar.tsx` — the fixed floating bottom bar
- [ ] Verify `App.tsx` is now < 150 lines (wiring only)
- [ ] Run all existing tests — confirm they still pass
- [ ] Smoke test the app manually — all features still work

### 2.5 Reliability — Add Error Boundaries
- [ ] Create `components/ErrorBoundary.tsx` (class component with `componentDidCatch`)
- [ ] Wrap `<MainApp />` in a top-level `<ErrorBoundary>` in `App.tsx`
- [ ] Wrap `<GraphView />` in its own `<ErrorBoundary>` where it is rendered
- [ ] Test: deliberately throw in a child component → confirm fallback UI appears, not blank page

### 2.6 CI — GitHub Actions
- [ ] Create `.github/workflows/ci.yml`
- [ ] Add job: `npm ci`
- [ ] Add job: `npm run typecheck`
- [ ] Add job: `npm run lint`
- [ ] Add job: `npm test`
- [ ] (Optional) Add job: `npm run build`
- [ ] Push to GitHub — confirm CI passes green on a clean branch
- [ ] Open a test PR — confirm CI status appears and blocks merge on failure

---

## Phase 3 — Polish & Production Hardening

### 3.1 Workflow Cancellation
- [ ] Add `cancelWorkflow` public mutation to `convex/workflows.ts`
- [ ] In each `*Action` in `convex/ai.ts`, check if `workflow.status === 'cancelled'` at start and after AI response — skip write if cancelled
- [ ] Wire "Stop" button to call `cancelWorkflow(workflowId)` before clearing UI state
- [ ] Test: click Stop mid-generation — confirm no new node is added

### 3.2 Remove Dead Code
- [ ] Confirm `components/VoiceButton.tsx` is not imported anywhere (Grep confirms)
- [ ] Delete `components/VoiceButton.tsx` (or wire it up if voice input is planned)
- [ ] Confirm `components/SimpleHeader.tsx` is not imported anywhere
- [ ] Delete `components/SimpleHeader.tsx` (or document it as a planned replacement)
- [ ] Confirm `NodeActionType` enum in `types.ts` is unused — remove if so
- [ ] Run lint + typecheck after removal to confirm no regressions

### 3.3 Session Limit UX
- [ ] In `listGraphs`, replace `.take(10)` with pagination or a higher limit
- [ ] OR add UI logic: if `graphs.length >= 10`, show a warning before `handleCreateSession`

### 3.4 Schema — Type Safety for `nodes.type`
- [ ] Change `convex/schema.ts` `nodes.type` from `v.string()` to `v.union(v.literal("initial"), v.literal("expansion"), v.literal("blueprint"), v.literal("user"))`
- [ ] Update `IdeaNode` type in `types.ts` to match (already done — verify alignment)
- [ ] Run `npx convex dev` — confirm schema migration succeeds

### 3.5 Security — Auth Hardening
- [ ] Add minimum password length validation (>= 8 chars) in `Auth.tsx` before submit
- [ ] Research Convex Auth rate limiting options — document findings in a comment or issue

### 3.6 Observability
- [ ] Replace `console.error` in all Convex actions with structured logging or a monitoring hook
- [ ] Consider adding `VITE_SENTRY_DSN` or similar for frontend error tracking
- [ ] Add a startup assertion in `index.tsx`: throw a clear error if `VITE_CONVEX_URL` is the placeholder value

### 3.7 Documentation
- [ ] Update `README.md`: add full setup instructions including Convex deployment steps
- [ ] Document required env vars in a `.env.example` file
- [ ] Add a brief `CONTRIBUTING.md` covering lint, test, and PR workflow

---

## Final Verification

- [ ] `npm run typecheck` exits 0
- [ ] `npm run lint` exits 0
- [ ] `npm test` exits 0 with > 50% statement coverage
- [ ] `npm run build` exits 0 with no CDN dependencies in output
- [ ] CI pipeline passes on GitHub
- [ ] Authorization: confirm no mutation can be called on unowned data
- [ ] Manual smoke test of all user-facing features in production build

---

## Changelog

| Date | Change |
|---|---|
| 2026-03-07 | Initial OEF creation — full checklist derived from PLAN.md |
