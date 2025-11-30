import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";

export const createWorkflow = internalMutation({
  args: {
    graphId: v.optional(v.id("graphs")),
    type: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("workflows", {
      graphId: args.graphId,
      type: args.type,
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const updateWorkflowStatus = internalMutation({
  args: {
    id: v.id("workflows"),
    status: v.string(),
    progress: v.optional(v.number()),
    error: v.optional(v.string()),
    result: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      progress: args.progress,
      error: args.error,
      result: args.result,
      updatedAt: Date.now(),
    });
  },
});

export const getWorkflow = query({
  args: { id: v.id("workflows") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
