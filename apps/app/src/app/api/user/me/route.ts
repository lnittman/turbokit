/**
 * Dev-friendly stub: returns a mock user profile when auth/backend
 * are not configured. This keeps local builds and dev server working.
 */
export async function GET() {
  const user = {
    id: 'dev-user',
    email: 'dev@example.com',
    name: 'Developer',
  };
  return Response.json(user, { status: 200 });
}
