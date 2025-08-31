/**
 * Dev-friendly stub: returns and updates in-memory preferences for local dev
 * without requiring backend packages or authentication.
 */
const defaults = {
  ui: { showTimestamps: true, compactMode: false },
  notifications: { email: false, push: false },
  features: { beta: false },
};

let current = { ...defaults };

export async function GET() {
  return Response.json(current, { status: 200 });
}

export async function PATCH(request: Request) {
  try {
    const update = await request.json().catch(() => ({}));
    current = { ...current, ...update };
    return Response.json(current, { status: 200 });
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}
