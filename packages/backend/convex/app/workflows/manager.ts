import { WorkflowManager } from "@convex-dev/workflow";
import { components } from "../../_generated/api";

// Create a shared workflow manager instance
export const workflow = new WorkflowManager(components.workflow);
