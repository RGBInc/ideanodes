# Extension Guide

So you want to extend IdeaNodes? Here is how to add functionality without breaking the core "Sequential Thinking" flow.

## 1. Adding a New Node Type
Nodes are currently defined in `types.ts` and `schema.ts`.
1.  **Update Schema**: Add the type string to `convex/schema.ts` (e.g., `'image'` or `'code'`).
2.  **Update UI**: Modify `components/NodeCard.tsx` to render the new content type.
    *   *Example*: If adding a `'code'` node, add a condition to render a Syntax Highlighter instead of a Markdown parser.
3.  **Update AI**: Modify `convex/ai.ts` prompts to teach the AI when to generate this new node type.

## 2. Adding a New AI Workflow
1.  **Define the Mutation**: Create `startMyNewAction` in `convex/ai.ts`.
2.  **Define the Action**: Create the logic that calls the LLM.
3.  **Handle State**: Ensure you create a `workflow` entry so the UI can track progress.
4.  **Frontend Hook**: Use the `useWorkflow` hook to listen for completion.

## 3. Theming & Styling
*   We use **Tailwind CSS**.
*   **Dark Mode**: Use the `dark:` modifier. The app is Dark Mode by default in spirit, but supports Light mode.
*   **Colors**: We use `zinc` for neutrals and semantic colors (Indigo for AI, Rose for Delete, Green for Success). Stick to this palette.

## 4. Best Practices
*   **Do not block the UI**: Never `await` a long process in a React event handler. Always offload to a Convex Action.
*   **Optimistic Updates**: For small changes (renaming, local edits), update the UI immediately while the server processes.
*   **Mobile First**: Always test layout on mobile. The `NodeCard` is complex; ensure buttons don't overlap text (see `NodeCard.tsx` history).

## 5. Development Environment
*   `npm run dev`: Starts Vite + Convex.
*   `npx convex dev`: Runs the backend in watch mode.
*   **Env Vars**: Ensure `GEMINI_API_KEY` is set in your Convex Dashboard.
