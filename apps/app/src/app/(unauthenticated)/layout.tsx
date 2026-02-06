import type React from "react";

export default function UnauthenticatedLayout({
	children,
}: {
	children: React.ReactNode;
}): React.ReactElement {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center">
			{children}
		</div>
	);
}
