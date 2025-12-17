import { keys as analytics } from "@spots/analytics/keys";
import { keys as auth } from "@spots/auth/keys";
import { keys as core } from "@spots/next-config/keys";
import { createEnv } from "@t3-oss/env-nextjs";

export const env = createEnv({
  extends: [analytics(), auth(), core()],
  server: {},
  client: {},
  runtimeEnv: {},
});
