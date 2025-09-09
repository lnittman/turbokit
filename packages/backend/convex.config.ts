import { defineApp } from "convex/server";
import agent from "@convex-dev/agent/convex.config";
import workflow from "@convex-dev/workflow/convex.config";
import rateLimiter from "@convex-dev/rate-limiter/convex.config";
import resend from "@convex-dev/resend/convex.config";
import migrations from "@convex-dev/migrations/convex.config";
import aggregate from "@convex-dev/aggregate/convex.config";
import actionRetrier from "@convex-dev/action-retrier/convex.config";
import crons from "@convex-dev/crons/convex.config";
import rag from "@convex-dev/rag/convex.config";
import presence from "@convex-dev/presence/convex.config";
import r2 from "@convex-dev/r2/convex.config";
import actionCache from "@convex-dev/action-cache/convex.config";
import streaming from "@convex-dev/persistent-text-streaming/convex.config";
import workpool from "@convex-dev/workpool/convex.config";
import autumn from "@useautumn/convex/convex.config";

const app = defineApp();

// Core functionality
app.use(agent);           // AI agents and chat
app.use(workflow);        // Durable workflows
app.use(rateLimiter);     // API rate limiting
app.use(actionRetrier);   // Resilient external API calls

// Infrastructure
app.use(migrations);      // Database migrations
app.use(crons);          // Scheduled jobs
app.use(aggregate);      // Analytics and counting
app.use(rag);           // Semantic search and RAG
app.use(streaming);     // Persistent text streaming
app.use(workpool);      // Workpool throttling

// Integrations
app.use(resend);         // Email sending
app.use(autumn);         // Subscription billing (Autumn)
app.use(r2);             // Cloudflare R2
app.use(actionCache);    // Action cache
app.use(presence);       // Presence

export default app;
