import { defineApp } from "convex/server";
import agent from "@convex-dev/agent/convex.config";
import workflow from "@convex-dev/workflow/convex.config";
import rateLimiter from "@convex-dev/rate-limiter/convex.config";
import resend from "@convex-dev/resend/convex.config";
import polar from "@convex-dev/polar/convex.config";
import migrations from "@convex-dev/migrations/convex.config";
import aggregate from "@convex-dev/aggregate/convex.config";
import actionRetrier from "@convex-dev/action-retrier/convex.config";
import crons from "@convex-dev/crons/convex.config";
import rag from "@convex-dev/rag/convex.config";

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

// Integrations
app.use(resend);         // Email sending
app.use(polar);          // Subscription billing

export default app;
