/**
 * TurboKit Registry HTTP API
 *
 * Public HTTP endpoints for fetching presets
 */

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";

const http = httpRouter();

/**
 * GET /api/presets
 *
 * Fetch all public presets from the registry
 */
http.route({
  path: "/api/presets",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const filterParam = url.searchParams.get("filter");
    const filter = (filterParam as "all" | "builtin" | "verified") || "all";

    const presets = await ctx.runQuery(internal.registry.listPresets, {
      filter,
    });

    return new Response(JSON.stringify(presets), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // CORS for all TurboKit apps
        "Cache-Control": "public, max-age=300", // Cache for 5 minutes
      },
    });
  }),
});

/**
 * GET /api/presets/:id
 *
 * Fetch a single preset by ID
 */
http.route({
  path: "/api/presets/{id}",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const presetId = url.pathname.split("/").pop();

    if (!presetId) {
      return new Response("Preset ID required", { status: 400 });
    }

    const preset = await ctx.runQuery(internal.registry.getPreset, {
      presetId,
    });

    if (!preset) {
      return new Response("Preset not found", { status: 404 });
    }

    // Track download
    await ctx.runMutation(internal.registry.trackDownload, {
      presetId,
      userAgent: request.headers.get("User-Agent") || undefined,
    });

    return new Response(JSON.stringify(preset), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  }),
});

/**
 * GET /api/stats
 *
 * Get registry statistics
 */
http.route({
  path: "/api/stats",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const stats = await ctx.runQuery(internal.registry.getStats);

    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=60", // Cache for 1 minute
      },
    });
  }),
});

/**
 * OPTIONS (CORS preflight)
 */
http.route({
  path: "/api/presets",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }),
});

export default http;
