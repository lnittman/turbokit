import { defineApp } from "convex/server";

// Convex Components (installed via app.use)
import agent from "@convex-dev/agent/convex.config";
import workflow from "@convex-dev/workflow/convex.config";
import crons from "@convex-dev/crons/convex.config";
import rateLimiter from "@convex-dev/rate-limiter/convex.config";
import migrations from "@convex-dev/migrations/convex.config";
import resend from "@convex-dev/resend/convex.config";
import rag from "@convex-dev/rag/convex.config";
import presence from "@convex-dev/presence/convex.config";
import r2 from "@convex-dev/r2/convex.config";
import actionCache from "@convex-dev/action-cache/convex.config";
import streaming from "@convex-dev/persistent-text-streaming/convex.config";
import workpool from "@convex-dev/workpool/convex.config";
import autumn from "@useautumn/convex/convex.config";

const app: any = defineApp();

// Core runtime
app.use(workflow);
app.use(crons);
app.use(rateLimiter);
app.use(migrations);

// AI + data
app.use(agent);
app.use(rag);
app.use(streaming);
app.use(workpool);

// Integrations
app.use(resend);
app.use(autumn);
app.use(r2);
app.use(actionCache);

// Realtime user presence
app.use(presence);

export default app;
