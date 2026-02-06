import type React from "react";

import { AuthenticatedShell } from "./authenticated-shell";

// Authenticated routes depend on Clerk (client-side auth provider) so they
// cannot be statically prerendered at build time.
export const dynamic = "force-dynamic";

export default function AuthenticatedLayout({
	children,
	overlay,
}: {
	children: React.ReactNode;
	overlay: React.ReactNode;
}): React.ReactElement {
	return <AuthenticatedShell overlay={overlay}>{children}</AuthenticatedShell>;
}
