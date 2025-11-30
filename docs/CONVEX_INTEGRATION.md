# Convex Integration & Durable Workflows

IdeaNodes relies heavily on [Convex](https://convex.dev) not just as a database, but as a **Workflow Engine**. This ensures that long-running AI tasks (which can take 10-60 seconds) are robust, resilient, and don't block the UI.

## Schema Design (`convex/schema.ts`)

### `graphs`
The container for a thought session.
*   `_id`: Unique ID
*   `userId`: Owner
*   `title`: Session Name
*   `createdAt`: Timestamp

### `nodes`
The atomic unit of thought.
*   `graphId`: Parent session
*   `type`: 'initial' | 'user' | 'blueprint' | 'expansion'
*   `title`: Short header
*   `content`: Markdown body
*   `embedding`: (Planned) Vector for semantic search

### `workflows`
The state machine for AI operations.
*   `status`: 'pending' | 'in_progress' | 'completed' | 'failed'
*   `type`: 'generate_next' | 'remix'
*   `result`: JSON storage for the AI output before it's committed to nodes.

## The "Durable" Pattern
We avoid running AI directly in the frontend or in simple HTTP handlers that might timeout. We use a **Mutation -> Action -> Mutation** pattern.

### Step 1: Initiation (Mutation)
*   User clicks "Generate".
*   Frontend calls `api.ai.startGenerateNext`.
*   **Backend**: Creates a `workflow` record with status `pending`.
*   **Backend**: Schedules the *Action* using `ctx.scheduler.runAfter(0, ...)`.
*   **Return**: Returns the `workflowId` to the client immediately.

### Step 2: Execution (Action)
*   The scheduled Action (`internal.ai.generateNextNodeAction`) runs in the background on Convex infrastructure.
*   It updates status to `in_progress`.
*   It calls the Google Gemini API (which might take time).
*   If the API fails, it catches the error and updates status to `failed`.

### Step 3: Completion (Mutation)
*   Once AI returns, the Action calls an `internalMutation`.
*   This mutation writes the new `nodes` to the database transactionally.
*   It updates the `workflow` status to `completed`.

### Step 4: Client Reaction
*   The frontend `useWorkflow` hook observes the `workflow` record.
*   When status flips to `completed`, the UI shows a success notification (and plays a sound).
*   Because the `nodes` table was updated, the main list automatically refreshes with the new content.

## Why this matters?
1.  **No Timeouts**: Browser tabs can be closed; the server keeps working.
2.  **Idempotency**: We can retry failed actions without duplicating data.
3.  **Real-time Feedback**: Users see "Generating..." state that is truly synced with the server state.
