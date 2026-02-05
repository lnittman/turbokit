import { redirect } from "next/navigation";

/**
 * Fallback for /create on hard refresh.
 * Redirects to home — create is overlay-only via (.)create intercept.
 */
export default function CreatePage() {
  redirect("/");
}
