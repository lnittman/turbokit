/**
 * Seed Helper
 *
 * Public action to trigger seeding (for easy CLI access)
 */

import { action } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Run this to seed built-in presets:
 * npx convex run seed:run
 */
export const run = action({
  args: {},
  handler: async (ctx) => {
    console.log("🌱 Seeding built-in presets...");

    const result = await ctx.runMutation(
      internal.registry.seedBuiltinPresets
    );

    console.log("✅ Seed complete!");
    console.log(`  - Seeded: ${result.seeded} preset(s)`);
    console.log(`  - Skipped: ${result.skipped} existing preset(s)`);

    return result;
  },
});
