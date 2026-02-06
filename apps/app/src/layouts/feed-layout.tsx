"use client";

import type React from "react";
import { useMemo, useState } from "react";

import { type FeedType, useFeedStarterSeam } from "./seams";
import { StarterLayoutState } from "./starter-layout-state";

export function FeedLayout(): React.ReactElement {
	const seam = useFeedStarterSeam();
	const [activeFilter, setActiveFilter] = useState<FeedType>("all");
	const { events, filters, canLoadMore } = seam.data;
	const filteredEvents = useMemo(() => {
		if (activeFilter === "all") return events;
		return events.filter((event) => event.type === activeFilter);
	}, [activeFilter, events]);

	if (seam.status === "loading") {
		return <StarterLayoutState layout="feed" state="loading" />;
	}

	if (seam.status === "error") {
		return (
			<StarterLayoutState
				layout="feed"
				state="error"
				errorMessage={seam.errorMessage}
			/>
		);
	}

	if (events.length === 0) {
		return <StarterLayoutState layout="feed" state="empty" />;
	}

	return (
		<div className="h-full overflow-auto bg-background p-5 md:p-6">
			<div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
				<header className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-border bg-background-secondary p-3">
					<div>
						<h2 className="text-sm font-medium text-foreground">live feed</h2>
						<p className="text-xs text-foreground-tertiary">
							realtime stream with filter + infinite-scroll pattern
						</p>
					</div>
					<span className="inline-flex items-center gap-2 text-xs text-foreground-tertiary">
						<span
							className="h-2 w-2 rounded-full"
							style={{ backgroundColor: "var(--te-green)" }}
						/>
						streaming updates
					</span>
				</header>

				<div className="flex flex-wrap gap-2">
					{filters.map((filter) => (
						<button
							type="button"
							key={filter}
							className="rounded-full border border-border px-3 py-1 text-xs text-foreground-tertiary transition-colors"
							onClick={() => setActiveFilter(filter)}
							style={
								activeFilter === filter
									? {
											borderColor: "var(--user-accent)",
											color: "var(--foreground)",
											backgroundColor: "var(--background-secondary)",
										}
									: undefined
							}
						>
							{filter}
						</button>
					))}
				</div>

				<section className="space-y-2">
					{filteredEvents.map((event) => (
						<article
							key={event.id}
							className="rounded-sm border border-border bg-background-secondary p-4"
						>
							<div className="mb-2 flex items-center justify-between gap-4">
								<h3 className="text-sm text-foreground">{event.title}</h3>
								<span className="text-xs text-foreground-tertiary">
									{event.time}
								</span>
							</div>
							<p className="text-sm text-foreground-secondary">
								{event.summary}
							</p>
							<div className="mt-3 inline-flex items-center gap-2 text-xs">
								<span
									className="h-2 w-2 rounded-full"
									style={{ backgroundColor: event.tone }}
								/>
								<span style={{ color: event.tone }}>{event.type}</span>
							</div>
						</article>
					))}
				</section>

				<button
					type="button"
					disabled={!canLoadMore}
					className="mt-1 rounded-sm border border-dashed border-border bg-background-secondary px-4 py-2 text-xs text-foreground-tertiary"
				>
					{canLoadMore ? "load more events" : "no more events"}
				</button>
			</div>
		</div>
	);
}
