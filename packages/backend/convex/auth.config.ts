/**
 * Auth Configuration for Clerk x Convex Integration
 *
 * This file configures how Convex validates JWT tokens from Clerk.
 * It's required for proper authentication between the frontend (Clerk)
 * and backend (Convex).
 */

export default {
	providers: [
		{
			// The domain must match your Clerk instance domain
			// For development, this is typically something like:
			// https://your-app.clerk.accounts.dev
			// For production: https://clerk.your-domain.com
			domain:
				process.env.CLERK_JWT_ISSUER_DOMAIN ??
				"https://your-app.clerk.accounts.dev",

			// The application ID is used to validate the token audience
			// This should typically be "convex" unless you have a specific requirement
			applicationID: "convex",
		},
	],
};
