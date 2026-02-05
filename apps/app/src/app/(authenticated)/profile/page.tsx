import { redirect } from "next/navigation";

/**
 * Fallback for /profile on hard refresh.
 * Redirects to home — profile is overlay-only via (.)profile intercept.
 */
export default function ProfilePage() {
  redirect("/");
}
