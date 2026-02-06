import type React from "react";

import type { StarterLayout } from "./types";

type LayoutState = "loading" | "empty" | "error";

const LAYOUT_STATE_COPY: Record<
	LayoutState,
	{
		title: string;
		description: string;
	}
> = {
	loading: {
		title: "syncing starter seam",
		description:
			"waiting for data contract resolution from your integration layer.",
	},
	empty: {
		title: "no starter data connected",
		description:
			"attach a seam provider or wire Convex queries to render your project data.",
	},
	error: {
		title: "starter seam failed",
		description:
			"the seam returned an error. inspect integration and retry the request.",
	},
};

export function StarterLayoutState({
	layout,
	state,
	errorMessage,
}: {
	layout: StarterLayout;
	state: LayoutState;
	errorMessage?: string;
}): React.ReactElement {
	const copy = LAYOUT_STATE_COPY[state];

	return (
		<div className="flex h-full items-center justify-center bg-background p-5 md:p-6">
			<div className="w-full max-w-lg rounded-sm border border-border bg-background-secondary p-5">
				<p className="text-[11px] tracking-[0.08em] text-foreground-tertiary">
					{layout} starter
				</p>
				<h2 className="mt-2 text-sm font-medium text-foreground">
					{copy.title}
				</h2>
				<p className="mt-2 text-sm text-foreground-secondary">
					{copy.description}
				</p>
				{state === "loading" ? (
					<div className="mt-4 inline-flex items-center gap-2 text-xs text-foreground-tertiary">
						<span className="h-1.5 w-1.5 animate-pulse rounded-full bg-foreground-quaternary" />
						<span className="h-1.5 w-1.5 animate-pulse rounded-full bg-foreground-quaternary [animation-delay:120ms]" />
						<span className="h-1.5 w-1.5 animate-pulse rounded-full bg-foreground-quaternary [animation-delay:220ms]" />
						loading
					</div>
				) : null}
				{state === "error" && errorMessage ? (
					<p className="mt-4 rounded-sm border border-[color:var(--te-red)]/30 bg-[color:var(--te-red)]/10 px-3 py-2 text-xs text-[color:var(--te-red)]">
						{errorMessage}
					</p>
				) : null}
			</div>
		</div>
	);
}
