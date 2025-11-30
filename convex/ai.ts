import { v } from "convex/values";
import { action, mutation } from "./_generated/server";
import { internal as internalApi } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { GoogleGenAI, Type } from "@google/genai";

const internal = internalApi as any;

const MODEL_NAME = 'gemini-2.5-flash';

function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenAI({ apiKey });
}

export const startGenerateTitle = mutation({
  args: {
    graphId: v.id("graphs"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.scheduler.runAfter(0, internal.ai.generateTitleAction, args);
  },
});

export const generateTitleAction = action({
  args: {
    graphId: v.id("graphs"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const ai = getAI();
      const prompt = `
        Generate a short, catchy, 3-5 word title for a thought session that starts with this idea:
        "${args.content}"
        
        Return JSON with "title" field.
      `;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING }
            },
            required: ["title"]
          }
        }
      });

      const text = response.text;
      if (!text) return;
      const result = JSON.parse(text);
      
      await ctx.runMutation(internal.nodes.updateGraphTitle, {
        graphId: args.graphId,
        title: result.title,
      });
    } catch (err) {
      console.error("Failed to generate title", err);
    }
  },
});

export const startGenerateNodeTitle = mutation({
  args: {
    nodeId: v.id("nodes"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.scheduler.runAfter(0, internal.ai.generateNodeTitleAction, args);
  },
});

export const generateNodeTitleAction = action({
  args: {
    nodeId: v.id("nodes"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const ai = getAI();
      const prompt = `
        Generate a concise, 2-4 word title for this concept node:
        "${args.content}"
        
        Return JSON with "title" field.
      `;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING }
            },
            required: ["title"]
          }
        }
      });

      const text = response.text;
      if (!text) return;
      const result = JSON.parse(text);
      
      await ctx.runMutation(internal.nodes.updateNode, {
        id: args.nodeId,
        title: result.title,
      });
    } catch (err) {
      console.error("Failed to generate node title", err);
    }
  },
});

export const startGenerateNextNode = mutation({
  args: {
    graphId: v.id("graphs"),
    nodes: v.array(v.object({ title: v.string(), content: v.string() })),
  },
  handler: async (ctx, args): Promise<Id<"workflows">> => {
    const workflowId = await ctx.runMutation(internal.workflows.createWorkflow, {
      graphId: args.graphId,
      type: "generate_next",
    });
    
    // Schedule the action
    await ctx.scheduler.runAfter(0, internal.ai.generateNextNodeAction, {
      workflowId,
      graphId: args.graphId,
      nodes: args.nodes,
    });

    return workflowId;
  },
});

export const generateNextNodeAction = action({
  args: {
    workflowId: v.id("workflows"),
    graphId: v.id("graphs"),
    nodes: v.array(v.object({ title: v.string(), content: v.string() })),
  },
  handler: async (ctx, args) => {
    try {
      await ctx.runMutation(internal.workflows.updateWorkflowStatus, {
        id: args.workflowId,
        status: "in_progress",
      });

      const ai = getAI();
      const historyText = args.nodes.map((node, index) => 
        `Node ${index + 1} (${node.title}):\n${node.content}\n---`
      ).join('\n');

      const prompt = `
        You are a sequential thinking engine called "Ideanodes". 
        Analyze the following progression of ideas (Nodes). 
        Your task is to generate the LOGICAL NEXT NODE in this sequence.
        
        If the previous nodes are defining a problem, propose a solution.
        If they are a solution, propose a technical implementation.
        If they are an implementation, propose a blueprint or summary.
        
        Current Idea Sequence:
        ${historyText}
    
        Generate the Title and Content for the next node.
        Return JSON format.
      `;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              content: { type: Type.STRING }
            },
            required: ["title", "content"]
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error("No response from AI");
      
      const result = JSON.parse(text);

      // Save the node
      await ctx.runMutation(internal.nodes.internalAddNode, {
        graphId: args.graphId,
        title: result.title,
        content: result.content,
        type: 'expansion',
      });

      await ctx.runMutation(internal.workflows.updateWorkflowStatus, {
        id: args.workflowId,
        status: "completed",
        result: result,
      });

    } catch (error: any) {
      console.error("Gemini Error:", error);
      await ctx.runMutation(internal.workflows.updateWorkflowStatus, {
        id: args.workflowId,
        status: "failed",
        error: error.message || "Unknown error",
      });
    }
  },
});

export const startRemixBlueprint = mutation({
  args: {
    graphId: v.id("graphs"),
    nodes: v.array(v.object({ title: v.string(), content: v.string() })),
    newTopic: v.string(),
  },
  handler: async (ctx, args): Promise<Id<"workflows">> => {
    const workflowId = await ctx.runMutation(internal.workflows.createWorkflow, {
      graphId: args.graphId,
      type: "remix_blueprint",
    });

    await ctx.scheduler.runAfter(0, internal.ai.remixBlueprintAction, {
      workflowId,
      graphId: args.graphId,
      nodes: args.nodes,
      newTopic: args.newTopic,
    });

    return workflowId;
  },
});

export const remixBlueprintAction = action({
  args: {
    workflowId: v.id("workflows"),
    graphId: v.id("graphs"),
    nodes: v.array(v.object({ title: v.string(), content: v.string() })),
    newTopic: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      await ctx.runMutation(internal.workflows.updateWorkflowStatus, {
        id: args.workflowId,
        status: "in_progress",
      });

      const ai = getAI();
      if (args.nodes.length === 0) return;
      
      const anchorNode = args.nodes[0];
      const structureText = args.nodes.map((node, index) => 
        `Original Node ${index + 1} Title: "${node.title}"\nContent:\n${node.content}\n---`
      ).join('\n');

      const prompt = `
        You are an Expert Solutions Architect and Lateral Thinker.
        Your goal is to "Remix" a thought sequence to a new domain.
        
        CORE TECHNOLOGY / METHODOLOGY (Source of Truth):
        "${anchorNode.content.substring(0, 800)}..."
        
        EXISTING BLUEPRINT SEQUENCE:
        ${structureText}
    
        TARGET NEW USE CASE: "${args.newTopic}"
    
        TASK:
        Rewrite the ENTIRE sequence (including the first node) to apply the Core Technology/Methodology to the TARGET NEW USE CASE.
        
        CRITICAL RULES:
        1. PRESERVE TECH, ADAPT CONTEXT.
        2. ADAPT EVERYTHING.
        3. MAINTAIN STRUCTURE & DEPTH.
        4. CLEAN & MIRRORED TITLES.
        5. OUTPUT FORMAT: Return JSON array of nodes (Title + Content).
      `;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                content: { type: Type.STRING }
              },
              required: ["title", "content"]
            }
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error("No response from AI");
      
      const result = JSON.parse(text);

      // Add all nodes
      await ctx.runMutation(internal.nodes.internalAddNodes, {
        nodes: result.map((n: any, i: number) => ({
          graphId: args.graphId,
          title: n.title,
          content: n.content,
          type: i === 0 ? 'initial' : 'blueprint',
        })),
      });

      await ctx.runMutation(internal.workflows.updateWorkflowStatus, {
        id: args.workflowId,
        status: "completed",
        result: result,
      });

    } catch (error: any) {
      console.error("Remix Error:", error);
      await ctx.runMutation(internal.workflows.updateWorkflowStatus, {
        id: args.workflowId,
        status: "failed",
        error: error.message || "Unknown error",
      });
    }
  },
});

export const startStructureImport = mutation({
  args: {
    graphId: v.id("graphs"),
    text: v.string(),
  },
  handler: async (ctx, args): Promise<Id<"workflows">> => {
    const workflowId = await ctx.runMutation(internal.workflows.createWorkflow, {
      graphId: args.graphId,
      type: "structure_import",
    });

    await ctx.scheduler.runAfter(0, internal.ai.structureImportAction, {
      workflowId,
      graphId: args.graphId,
      text: args.text,
    });

    return workflowId;
  },
});

export const structureImportAction = action({
  args: {
    workflowId: v.id("workflows"),
    graphId: v.id("graphs"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      await ctx.runMutation(internal.workflows.updateWorkflowStatus, {
        id: args.workflowId,
        status: "in_progress",
      });

      const ai = getAI();
      const prompt = `
        You are a dumb Text Splitter/Formatter.
        INPUT TEXT:
        """
        ${args.text.substring(0, 30000)}
        """
        TASK:
        Break this text into separate JSON objects (Nodes).
        Return JSON format containing an array of nodes (Title + Content).
      `;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                content: { type: Type.STRING }
              },
              required: ["title", "content"]
            }
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error("No response from AI");

      const result = JSON.parse(text);

      await ctx.runMutation(internal.nodes.internalAddNodes, {
        nodes: result.map((n: any, i: number) => ({
          graphId: args.graphId,
          title: n.title,
          content: n.content,
          type: i === 0 ? 'initial' : 'user',
        })),
      });

      await ctx.runMutation(internal.workflows.updateWorkflowStatus, {
        id: args.workflowId,
        status: "completed",
        result: result,
      });

    } catch (error: any) {
      console.error("Import Error:", error);
      await ctx.runMutation(internal.workflows.updateWorkflowStatus, {
        id: args.workflowId,
        status: "failed",
        error: error.message || "Unknown error",
      });
    }
  },
});
