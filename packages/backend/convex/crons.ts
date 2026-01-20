import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

// Register scheduled jobs here. Only schedule internal functions.
const crons = cronJobs();

// Analytics: Aggregate daily stats at midnight UTC
// Uncomment and implement the aggregation function in app/analytics/internal.ts
// crons.daily(
//   "aggregate-daily-analytics",
//   { hourUTC: 0, minuteUTC: 0 },
//   internal.app.analytics.internal.aggregateDaily
// );

// Maintenance: Clean expired cache entries every 6 hours
// Uncomment and implement the cleanup function in lib/cache-cleanup.ts
// crons.interval(
//   "cleanup-expired-cache",
//   { hours: 6 },
//   internal.lib.cacheCleanup.cleanExpired
// );

// Example: Cleanup old activities (30+ days old)
// crons.daily(
//   "cleanup-old-activities",
//   { hourUTC: 2, minuteUTC: 0 },
//   internal.app.users.internal.cleanupOldActivities,
//   { daysOld: 30 }
// );

// Example: Send weekly digest emails
// crons.weekly(
//   "send-weekly-digest",
//   { dayOfWeek: "monday", hourUTC: 9, minuteUTC: 0 },
//   internal.app.emails.internal.sendWeeklyDigest
// );

export default crons;
