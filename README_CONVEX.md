# Convex Integration Guide

This project has been upgraded to use **Convex** as the backend agentic engine.

## Setup Instructions

1.  **Initialize Convex**
    Run the following command to set up your Convex project and generate the API code:
    ```bash
    npx convex dev
    ```
    This will prompt you to log in and create a project. It will also generate the `convex/_generated` folder which is required for the app to run.

2.  **Configure Environment Variables**
    In your Convex Dashboard (Settings > Environment Variables), add the following:
    
    - `GEMINI_API_KEY`: Your Google Gemini API Key.
    - `AUTH_GITHUB_ID` & `AUTH_GITHUB_SECRET`: For GitHub OAuth (optional for dev, required for prod).
    - `AUTH_GOOGLE_ID` & `AUTH_GOOGLE_SECRET`: For Google OAuth (optional for dev, required for prod).

3.  **Run the App**
    ```bash
    npm run dev
    ```

## Architecture

- **Backend**: Convex (`convex/`)
  - `schema.ts`: Database schema (Nodes, Graphs, Workflows, Users).
  - `ai.ts`: Agentic actions that call Gemini and orchestrate workflows.
  - `nodes.ts`: CRUD for the thought graph.
  - `workflows.ts`: State management for durable AI tasks.
  - `auth.ts`: Authentication configuration.

- **Frontend**: React + Vite
  - `App.tsx`: Main UI, now using `useQuery` for real-time data and `useMutation` for actions.
  - `components/Auth.tsx`: Login modal.
  - `hooks/useWorkflow.ts`: Hook to track long-running AI tasks.

## Features

- **Real-time Sync**: Thoughts are synced across devices instantly.
- **Durable AI Workflows**: Generation runs on the server; if you close the tab, the agent finishes the job and the result appears when you return.
- **Authentication**: Secure user sessions with GitHub/Google.
- **Agentic Engine**: The `convex/ai.ts` module acts as a sequential thinking engine, preserving context and ensuring logical flow.
