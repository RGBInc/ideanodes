# Architecture & Technology Stack

## Tech Stack
IdeaNodes is built on a modern, edge-ready stack designed for performance, real-time syncing, and durable AI execution.

### Frontend (Client)
*   **Framework**: [React 19](https://react.dev/) (via Vite)
*   **Language**: TypeScript
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Utility-first, Dark mode native)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Animations**: [Framer Motion](https://www.framer.com/motion/) (Fluid transitions, list reordering)
*   **PWA**: `vite-plugin-pwa` (Offline capabilities, installable on mobile)
*   **Audio**: Native Web Audio API (Custom service in `services/audioService.ts`)

### Backend & Database (Serverless)
*   **Platform**: [Convex](https://convex.dev/)
*   **Database**: Convex Database (Real-time, reactive)
*   **Functions**:
    *   `query`: Real-time data subscription.
    *   `mutation`: ACID-compliant data writes.
    *   `action`: Third-party API calls (AI generation).
*   **Auth**: Convex Auth (with bespoke integration or Clerk/Auth0 support via Convex).

### AI Engine
*   **Provider**: Google Generative AI (Gemini 2.5 Flash/Pro)
*   **Integration**:
    *   **Current**: Direct API calls via Convex Actions.
    *   **Planned**: `@convex-dev/agent` component for durable, stateful agent execution.

## System Design

### 1. Reactive Data Loop
The app does not use traditional REST endpoints. Instead, it uses Convex's **Reactive Subscriptions**.
*   The frontend subscribes to `api.nodes.getNodes`.
*   When the backend data changes (e.g., AI finishes writing), the frontend *automatically* re-renders.
*   No `useEffect` polling or manual state management (Redux/Zustand) is needed for server state.

### 2. Project Structure
```
ideanodes/
├── components/         # UI Components (NodeCard, Modals, etc.)
├── convex/            # Backend Code
│   ├── ai.ts          # AI Actions & Prompts
│   ├── nodes.ts       # CRUD for Nodes/Graphs
│   ├── workflows.ts   # Durable Workflow Logic
│   └── schema.ts      # Database Schema
├── docs/              # Documentation
├── hooks/             # Custom React Hooks
├── services/          # Browser Services (Audio)
└── ...config files
```

### 3. State Management
*   **Server State**: Managed by `useQuery` (Convex).
*   **Local State**: React `useState` for UI interactions (modals, inputs).
*   **Hybrid**: "Optimistic Updates" are handled implicitly by the speed of Convex, or explicitly where needed.
