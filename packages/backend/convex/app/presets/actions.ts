/**
 * Preset Actions
 *
 * Actions for preset management (external operations)
 */

import { action } from "../../_generated/server";
import { internal } from "../../_generated/api";

/**
 * Seed built-in presets
 *
 * This action triggers the internal seeding mutation to populate
 * the database with TurboKit's default presets
 */
export const seedBuiltinPresets = action({
  args: {},
  handler: async (ctx) => {
    // Call the internal mutation to perform the seeding
    const result = await ctx.runMutation(internal.app.presets.seed.seedBuiltinPresets);

    return result;
  },
});
