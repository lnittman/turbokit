import { cronJobs } from "convex/server";

// Register scheduled jobs here. Only schedule internal functions.
// Example:
// crons.interval("cleanup", { hours: 1 }, internal.crons.cleanupOldStuff, {});

const crons = cronJobs();

export default crons;

