import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

export function useWorkflow(workflowId: Id<"workflows"> | null) {
  return useQuery(api.workflows.getWorkflow, workflowId ? { id: workflowId } : "skip");
}
