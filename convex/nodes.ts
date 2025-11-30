import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listGraphs = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("graphs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(10);
  },
});

export const createGraph = mutation({
  args: { title: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const graphId = await ctx.db.insert("graphs", {
      userId: userId ?? undefined,
      title: args.title ?? "Untitled Idea",
      createdAt: Date.now(),
    });
    return graphId;
  },
});

export const updateGraphTitle = mutation({
  args: { graphId: v.id("graphs"), title: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.graphId, { title: args.title });
  },
});

export const getGraph = query({
  args: { graphId: v.id("graphs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.graphId);
  },
});

export const getNodes = query({
  args: { graphId: v.id("graphs") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("nodes")
      .withIndex("by_graph", (q) => q.eq("graphId", args.graphId))
      .collect();
  },
});

export const addNode = mutation({
  args: {
    graphId: v.id("graphs"),
    title: v.string(),
    content: v.string(),
    type: v.string(),
  },
  handler: async (ctx, args) => {
    const nodeId = await ctx.db.insert("nodes", {
      graphId: args.graphId,
      title: args.title,
      content: args.content,
      type: args.type,
      createdAt: Date.now(),
    });
    return nodeId;
  },
});

export const internalAddNode = internalMutation({
  args: {
    graphId: v.id("graphs"),
    title: v.string(),
    content: v.string(),
    type: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("nodes", {
      graphId: args.graphId,
      title: args.title,
      content: args.content,
      type: args.type,
      createdAt: Date.now(),
    });
  },
});

export const internalAddNodes = internalMutation({
  args: {
    nodes: v.array(v.object({
      graphId: v.id("graphs"),
      title: v.string(),
      content: v.string(),
      type: v.string(),
    }))
  },
  handler: async (ctx, args) => {
    const ids = [];
    for (const node of args.nodes) {
      const id = await ctx.db.insert("nodes", {
        ...node,
        createdAt: Date.now(),
      });
      ids.push(id);
    }
    return ids;
  },
});

export const updateNode = mutation({
  args: {
    id: v.id("nodes"),
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      title: args.title,
      content: args.content,
    });
  },
});

export const deleteNode = mutation({
  args: { id: v.id("nodes") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const deleteGraph = mutation({
  args: { graphId: v.id("graphs") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const graph = await ctx.db.get(args.graphId);
    
    if (!graph) return;
    if (graph.userId && graph.userId !== userId) {
       throw new Error("Unauthorized");
    }

    // Delete all nodes in the graph
    const nodes = await ctx.db
      .query("nodes")
      .withIndex("by_graph", (q) => q.eq("graphId", args.graphId))
      .collect();
      
    for (const node of nodes) {
      await ctx.db.delete(node._id);
    }

    await ctx.db.delete(args.graphId);
  },
});
