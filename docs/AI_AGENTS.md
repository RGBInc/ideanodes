# AI & Agents Documentation

IdeaNodes is an AI-native application. The AI is not an add-on; it is the engine of the application. We currently use Google's **Gemini 2.5 Flash** model for its balance of speed, cost, and reasoning capability.

## Current Capabilities

### 1. Sequential Generation (`generateNextNodeAction`)
*   **Goal**: Predict the logical next step in a thought process.
*   **Context**: It reads the entire conversation history (Linear Nodes).
*   **Logic**:
    *   If context is *Problem Definition* -> Propose *Solution*.
    *   If context is *Solution* -> Propose *Implementation*.
    *   If context is *Implementation* -> Propose *Critique/Summary*.

### 2. Lateral Remixing (`remixBlueprintAction`)
This is the flagship feature.
*   **Goal**: Transfer abstract structure to a new domain.
*   **Mechanism**:
    1.  Analyze the "Source of Truth" (User's current session).
    2.  Extract the *Abstract Blueprint* (e.g., "Problem -> bottleneck identification -> bypass strategy").
    3.  Apply this blueprint to the `newTopic`.
*   **Prompt Engineering**: We use a "Role-Playing" prompt (`Expert Solutions Architect`) to enforce structured output.

### 3. Structure Import (`structureImportAction`)
*   **Goal**: Convert unstructured text (dumps, articles) into a clean Node graph.
*   **Logic**: Splits text by logical breakpoints (headers, major ideas) and formats them into nodes.

## Future Agentic Architecture (The "Convex Agent")

We plan to move from simple "Call/Response" actions to autonomous **Convex Agents**.

### The Agent Loop
Instead of a linear `Action`, an Agent will be a durable object in the database that runs a loop:
1.  **Observe**: Read current Node state.
2.  **Think**: Consult LLM for next action.
3.  **Act**:
    *   *Tool Use*: Search web, query database, modify nodes.
    *   *Response*: Add a new node.
4.  **Sleep/Wait**: Pause until user interaction or timer.

### Specific Agent Roles (Planned)
1.  **The Critic**: Runs in background, adding "Comment" nodes with devil's advocate arguments.
2.  **The Researcher**: Automatically finds web sources to back up claims in User nodes.
3.  **The Synthesizer**: Merges multiple branches of thought into a summary node.

## Technical Implementation of Agents

We will implement autonomous agents using the standard **Convex Agent Component** (`@convex-dev/agent`). This component provides a robust, durable foundation for building agents that can persist state, manage conversation history, and execute long-running workflows without timeouts.

### Why `convex-agent`?
*   **Durable Execution**: The agent runs within Convex's backend environment, ensuring that long LLM calls or complex multi-step reasoning chains complete reliably, even if the client disconnects.
*   **Memory & History**: It automatically manages conversation threads (`threads` table), handling the context window and persistence of messages between the user and the agent.
*   **Tool Use**: It has native support for defining "Tools" (Convex functions) that the LLM can call to interact with our database (e.g., `readNodes`, `createNode`, `searchWeb`).
*   **Separation of Concerns**: Agent logic is decoupled from the UI, allowing for background processing (e.g., a "Critic" agent that reviews nodes asynchronously).

### Implementation Plan

1.  **Installation**:
    ```bash
    npm install @convex-dev/agent
    ```

2.  **Configuration (`convex/convex.config.ts`)**:
    ```typescript
    import { defineApp } from "convex/server";
    import agent from "@convex-dev/agent/convex.config";

    const app = defineApp();
    app.use(agent);
    export default app;
    ```

3.  **Defining the Agent (`convex/agent.ts`)**:
    We will define specialized agents with specific "Instructions" and "Tools".

    ```typescript
    import { components } from "./_generated/api";
    import { Agent } from "@convex-dev/agent";
    import { google } from "@ai-sdk/google"; // Using Gemini via Vercel AI SDK
    import { v } from "convex/values";

    // Define tools the agent can use
    const tools = {
      createNode: {
        description: "Create a new thought node in the graph",
        parameters: v.object({ title: v.string(), content: v.string() }),
        handler: async (ctx, args) => { ... }
      },
      readGraph: { ... }
    };

    // Instantiate the Agent
    export const researcherAgent = new Agent(components.agent, {
      name: "Deep Researcher",
      languageModel: google("gemini-1.5-pro"),
      instructions: "You are a rigorous academic researcher. Your goal is to validate claims...",
      tools: tools,
    });
    ```

4.  **Running the Agent**:
    Instead of a custom `while` loop, we interact with the agent via `Actions`.

    ```typescript
    export const askResearcher = action({
      args: { prompt: v.string(), graphId: v.id("graphs") },
      handler: async (ctx, args) => {
        // 1. Create or fetch a conversation thread for this graph
        const threadId = await ctx.runMutation(api.agents.getThread, { graphId: args.graphId });
        
        // 2. Send the prompt to the agent
        const response = await researcherAgent.run(ctx, { 
          threadId, 
          input: args.prompt 
        });

        return response;
      }
    });
    ```

This architecture allows us to have multiple specialized agents (Critic, Researcher, Synthesizer) that all share the same robust infrastructure for state and execution.
