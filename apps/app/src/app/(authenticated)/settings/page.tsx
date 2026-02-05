import { redirect } from "next/navigation";

/**
 * Fallback for /settings on hard refresh.
 * Redirects to home — settings is overlay-only via (.)settings intercept.
 */
export default function SettingsPage() {
  redirect("/");
}
