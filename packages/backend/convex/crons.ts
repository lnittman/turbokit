import { cronJobs } from "convex/server";

// Register scheduled jobs here. Only schedule internal functions.
// See AGENTS.md → "Cron Scheduling Example" for a full example.
// (Docs-only snippet; do not paste live without adapting.)

const crons = cronJobs();

export default crons;
