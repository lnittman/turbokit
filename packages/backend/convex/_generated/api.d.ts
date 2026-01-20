/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as agents_actions from "../agents/actions.js";
import type * as agents_definitions_assistant from "../agents/definitions/assistant.js";
import type * as agents_definitions_code_generator from "../agents/definitions/code-generator.js";
import type * as app_billing_actions from "../app/billing/actions.js";
import type * as app_billing_autumn from "../app/billing/autumn.js";
import type * as app_billing_queries from "../app/billing/queries.js";
import type * as app_emails_actions from "../app/emails/actions.js";
import type * as app_emails_internal from "../app/emails/internal.js";
import type * as app_emails_password_reset from "../app/emails/password-reset.js";
import type * as app_emails_resend from "../app/emails/resend.js";
import type * as app_emails_welcome from "../app/emails/welcome.js";
import type * as app_images_actions from "../app/images/actions.js";
import type * as app_images_internal from "../app/images/internal.js";
import type * as app_images_mutations from "../app/images/mutations.js";
import type * as app_images_queries from "../app/images/queries.js";
import type * as app_models_actions from "../app/models/actions.js";
import type * as app_models_internal from "../app/models/internal.js";
import type * as app_models_queries from "../app/models/queries.js";
import type * as app_notifications_internal from "../app/notifications/internal.js";
import type * as app_notifications_mutations from "../app/notifications/mutations.js";
import type * as app_notifications_queries from "../app/notifications/queries.js";
import type * as app_presence_mutations from "../app/presence/mutations.js";
import type * as app_presence_presence from "../app/presence/presence.js";
import type * as app_presence_queries from "../app/presence/queries.js";
import type * as app_presets_actions from "../app/presets/actions.js";
import type * as app_presets_index from "../app/presets/index.js";
import type * as app_presets_mutations from "../app/presets/mutations.js";
import type * as app_presets_queries from "../app/presets/queries.js";
import type * as app_presets_seed from "../app/presets/seed.js";
import type * as app_projects_internal from "../app/projects/internal.js";
import type * as app_uploads_actions from "../app/uploads/actions.js";
import type * as app_uploads_api from "../app/uploads/api.js";
import type * as app_uploads_r2 from "../app/uploads/r2.js";
import type * as app_users_internal from "../app/users/internal.js";
import type * as app_users_mutations from "../app/users/mutations.js";
import type * as app_users_queries from "../app/users/queries.js";
import type * as crons from "../crons.js";
import type * as http_webhooks_clerk from "../http/webhooks/clerk.js";
import type * as http_webhooks from "../http/webhooks.js";
import type * as http from "../http.js";
import type * as lib_actionCache from "../lib/actionCache.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_models from "../lib/models.js";
import type * as lib_push from "../lib/push.js";
import type * as lib_rag from "../lib/rag.js";
import type * as lib_rateLimiter from "../lib/rateLimiter.js";
import type * as lib_workpool from "../lib/workpool.js";
import type * as providers_fal from "../providers/fal.js";
import type * as providers_openai from "../providers/openai.js";
import type * as providers_openrouter from "../providers/openrouter.js";
import type * as users_internal from "../users/internal.js";
import type * as workflows_data_processing from "../workflows/data-processing.js";
import type * as workflows_manager from "../workflows/manager.js";
import type * as workflows_user_onboarding from "../workflows/user-onboarding.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "agents/actions": typeof agents_actions;
  "agents/definitions/assistant": typeof agents_definitions_assistant;
  "agents/definitions/code-generator": typeof agents_definitions_code_generator;
  "app/billing/actions": typeof app_billing_actions;
  "app/billing/autumn": typeof app_billing_autumn;
  "app/billing/queries": typeof app_billing_queries;
  "app/emails/actions": typeof app_emails_actions;
  "app/emails/internal": typeof app_emails_internal;
  "app/emails/password-reset": typeof app_emails_password_reset;
  "app/emails/resend": typeof app_emails_resend;
  "app/emails/welcome": typeof app_emails_welcome;
  "app/images/actions": typeof app_images_actions;
  "app/images/internal": typeof app_images_internal;
  "app/images/mutations": typeof app_images_mutations;
  "app/images/queries": typeof app_images_queries;
  "app/models/actions": typeof app_models_actions;
  "app/models/internal": typeof app_models_internal;
  "app/models/queries": typeof app_models_queries;
  "app/notifications/internal": typeof app_notifications_internal;
  "app/notifications/mutations": typeof app_notifications_mutations;
  "app/notifications/queries": typeof app_notifications_queries;
  "app/presence/mutations": typeof app_presence_mutations;
  "app/presence/presence": typeof app_presence_presence;
  "app/presence/queries": typeof app_presence_queries;
  "app/presets/actions": typeof app_presets_actions;
  "app/presets/index": typeof app_presets_index;
  "app/presets/mutations": typeof app_presets_mutations;
  "app/presets/queries": typeof app_presets_queries;
  "app/presets/seed": typeof app_presets_seed;
  "app/projects/internal": typeof app_projects_internal;
  "app/uploads/actions": typeof app_uploads_actions;
  "app/uploads/api": typeof app_uploads_api;
  "app/uploads/r2": typeof app_uploads_r2;
  "app/users/internal": typeof app_users_internal;
  "app/users/mutations": typeof app_users_mutations;
  "app/users/queries": typeof app_users_queries;
  crons: typeof crons;
  "http/webhooks/clerk": typeof http_webhooks_clerk;
  "http/webhooks": typeof http_webhooks;
  http: typeof http;
  "lib/actionCache": typeof lib_actionCache;
  "lib/auth": typeof lib_auth;
  "lib/models": typeof lib_models;
  "lib/push": typeof lib_push;
  "lib/rag": typeof lib_rag;
  "lib/rateLimiter": typeof lib_rateLimiter;
  "lib/workpool": typeof lib_workpool;
  "providers/fal": typeof providers_fal;
  "providers/openai": typeof providers_openai;
  "providers/openrouter": typeof providers_openrouter;
  "users/internal": typeof users_internal;
  "workflows/data-processing": typeof workflows_data_processing;
  "workflows/manager": typeof workflows_manager;
  "workflows/user-onboarding": typeof workflows_user_onboarding;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
