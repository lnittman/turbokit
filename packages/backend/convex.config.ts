import { defineApp } from "convex/server";
import agent from "@convex-dev/agent/convex.config";
import workflow from "@convex-dev/workflow/convex.config";
import rateLimiter from "@convex-dev/rate-limiter/convex.config";
import resend from "@convex-dev/resend/convex.config";

const app = defineApp();
app.use(agent);
app.use(workflow);
app.use(rateLimiter);
app.use(resend);

export default app;