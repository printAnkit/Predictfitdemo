import { Queue } from "bullmq";
import { redisConnection } from "./redis";

export type FlowJob =
  | {
      kind: "start";
      flowId: string;
      lifecycleEventId?: string;
      contactId?: string;
      triggerExecutionId?: string;
      initialContext: Record<string, unknown>;
    }
  | { kind: "resume"; runId: string }
  | { kind: "reply"; runId: string; branchKey: string; replyContext?: Record<string, unknown> }
  // A stage message (Stage Messages page) due now — see ./stage-messages.ts.
  | { kind: "stage-message"; sendId: string };

export const flowQueue = new Queue<FlowJob>("automation-flow", {
  connection: redisConnection,
});
