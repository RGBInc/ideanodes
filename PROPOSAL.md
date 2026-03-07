# PROPOSAL.md — IdeaNodes OEF Initialization

## 1. What Is This System?

**IdeaNodes** is a "Sequential Thinking Engine" — a progressive web app (PWA) that helps users build chains of connected ideas ("nodes") with AI assistance. Users start with a seed idea, then manually expand it or invoke Google Gemini to generate the next logical step in the chain. A "Remix" feature applies the abstract structure of one idea chain to an entirely new domain.

It is a single-page React application backed by Convex (serverless real-time BaaS) for persistence, authentication, and durable AI workflow execution.

---

## 2. Current State Assessment

### Stack
| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 6 |
| Styling | TailwindCSS via CDN (not bundled) |
| Animation | Framer Motion 11 |
| Icons | Lucide React |
| Audio | Native Web Audio API (custom `AudioService`) |
| PWA | vite-plugin-pwa |
| Backend | Convex (real-time DB, mutations, queries, actions) |
| Auth | Convex Auth + Password provider |
| AI | Google Gemini 2.5 Flash (`@google/genai`) |
| Routing | React Router DOM v7 |

### Entry Points
- `index.html` — HTML shell; loads Tailwind CDN, Google Fonts, an importmap, and `index.tsx`
- `index.tsx` — React root; wraps app in `ConvexAuthProvider`
- `App.tsx` — Monolithic main component (~645 lines); owns all session/node state and AI dispatch
- `convex/` — Backend functions deployed to Convex cloud

### Required Environment Variables
| Variable | Used By | Description |
|---|---|---|
| `VITE_CONVEX_URL` | Client (`index.tsx`) | Convex deployment URL |
| `GEMINI_API_KEY` | Convex backend (`ai.ts`) | Google Gemini API key |
| `CONVEX_SITE_URL` | Convex backend (`auth.config.ts`) | Auth provider domain |

### Local Run
```bash
npm install
# Create .env.local with VITE_CONVEX_URL and GEMINI_API_KEY
npm run dev        # Vite dev server (default port 5173)
npx convex dev     # Convex backend (must run in parallel)
```

### What Is Working
- Full CRUD for idea sessions (graphs) and nodes
- AI-driven node generation, session remixing, and text import via Gemini
- Durable workflow tracking (status persists in Convex DB)
- Guest mode (local state) for unauthenticated users
- Dark/light theme, audio feedback, graph and list views
- PWA manifest and service worker registration
- Export to JSON and Markdown
- Legal pages (Terms, Privacy)

---

## 3. Goals for Stabilization

1. **Secure the backend**: Add ownership authorization to all Convex mutations.
2. **Establish a test baseline**: Introduce a test runner and write smoke tests for critical Convex functions and core React components.
3. **Resolve the build system conflict**: Migrate Tailwind from CDN to a proper Vite/PostCSS integration; reconcile the importmap with the Vite bundler.
4. **Add a linter and formatter**: Introduce ESLint + Prettier to enforce code quality.
5. **Set up CI**: Add GitHub Actions for lint, type-check, and test on every push.
6. **Decompose `App.tsx`**: Extract state and logic into custom hooks and feature components.
7. **Add error boundaries**: Prevent unhandled React errors from crashing the full UI.

---

## 4. Key Risks

### Critical (Security)
- **BOLA/IDOR on mutations**: `addNode`, `updateNode`, and `deleteNode` in `convex/nodes.ts` perform no ownership check. Any authenticated user who discovers a node or graph ID can read, mutate, or delete it. `deleteGraph` is the only mutation with an auth guard.
- **Untrusted CDN importmap**: `index.html` loads `react`, `framer-motion`, `@google/genai`, `uuid`, and `lucide-react` from `aistudiocdn.com` — an unofficial CDN. A compromised or malicious CDN response could inject arbitrary code.

### High (Architecture / Reliability)
- **Dual dependency system**: The same packages exist in both the importmap (CDN) and `package.json` (local). Vite's build ignores the importmap and bundles local copies, but the browser importmap may still override at runtime in some modes — creating potential duplicate module instances and bundle bloat.
- **`App.tsx` monolith**: All app state (auth, sessions, nodes, AI workflows, UI modals, theme, audio) lives in one 645-line component. No custom hooks beyond `useWorkflow`. High cognitive load; difficult to test.
- **Workflow stop is UI-only**: The "Stop" button sets `loading = false` in local state but does NOT cancel the Convex scheduled action. The AI generation continues running and will still write its result to the database.
- **No error boundaries**: An unhandled JS error in any component renders a blank page with no recovery path.
- **Tailwind not in build pipeline**: `index.css` declares `@tailwind base/components/utilities` directives, but there is no Tailwind CLI or PostCSS plugin in `vite.config.ts`. The CDN script handles styling at runtime, but this means no dead-code elimination and a ~3MB CSS payload.

### Medium (Code Quality / Developer Experience)
- **No tests**: Zero application test files. No test runner (Vitest, Jest) configured in `package.json`.
- **No CI/CD**: No `.github/` directory. No automated lint, type-check, or test on push.
- **No linter/formatter**: No ESLint or Prettier in `devDependencies`. No config files.
- **`as any` casts**: `convexNodes` is typed `as any`, and mutation IDs are cast `as any` in `App.tsx:219,235`. Bypasses type safety.
- **Dead components**: `components/VoiceButton.tsx` and `components/SimpleHeader.tsx` are not imported anywhere in the app.
- **Hard session cap**: `listGraphs` uses `.take(10)` — users are silently limited to 10 sessions with no UI feedback.
- **Silent fallback URL**: `index.tsx` falls back to `"https://placeholder.convex.cloud"` if `VITE_CONVEX_URL` is unset, causing silent failures rather than a clear startup error.
- **No password policy**: Auth only requires email + password with no validation for minimum length or complexity.

### Low (Future Considerations)
- `nodes` schema stores `type` as `v.string()` rather than a typed union — no DB-level constraint against invalid types.
- `embedding` field is reserved for future RAG but unused and indexed for every node write.
- The graph view (`components/GraphView.tsx`) has not been audited for performance with large node counts.

---

## 5. Constraints

- The Convex backend is hosted externally (Convex cloud). The frontend is designed for Vercel deployment (`server.allowedHosts` in `vite.config.ts`).
- Google Gemini model is hardcoded to `gemini-2.5-flash`. Switching models requires a code change.
- The project uses React 19 (still relatively new); some third-party library compatibility may be unstable.
- No offline-first story yet despite being a PWA (service worker is registered but sync is Convex-dependent).

---

## 6. Success Criteria

- [ ] All Convex mutations enforce ownership authorization.
- [ ] Vite build produces a clean, tree-shaken bundle with no CDN importmap conflicts.
- [ ] ESLint and Prettier pass with zero errors on CI.
- [ ] TypeScript `tsc --noEmit` passes with zero errors.
- [ ] At least 1 integration test per Convex function and smoke tests for top-level React flows.
- [ ] GitHub Actions CI runs on every PR (lint + type-check + test).
- [ ] `App.tsx` broken into feature-scoped hooks and sub-components (< 200 lines per file).
- [ ] Error boundaries in place at route and critical section levels.
- [ ] No `as any` casts in application code.
- [ ] Dead components removed or wired up.

---

## Changelog

| Date | Change |
|---|---|
| 2026-03-07 | Initial OEF creation — full codebase audit |
