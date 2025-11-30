import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  
  graphs: defineTable({
    userId: v.optional(v.id("users")),
    title: v.string(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  nodes: defineTable({
    graphId: v.id("graphs"),
    title: v.string(),
    content: v.string(),
    type: v.string(), // 'initial', 'expansion', 'blueprint', 'user'
    createdAt: v.number(),
    embedding: v.optional(v.array(v.float64())), // For future RAG
  }).index("by_graph", ["graphId"]),

  // Durable workflow state
  workflows: defineTable({
    graphId: v.optional(v.id("graphs")),
    type: v.string(), // 'generate_next', 'remix', 'import'
    status: v.string(), // 'pending', 'in_progress', 'completed', 'failed', 'cancelled'
    progress: v.optional(v.number()),
    error: v.optional(v.string()),
    result: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_graph", ["graphId"]),
});
