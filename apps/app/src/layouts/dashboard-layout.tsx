import type React from "react";

import { useDashboardStarterSeam } from "./seams";
import { StarterLayoutState } from "./starter-layout-state";

export function DashboardLayout(): React.ReactElement {
	const seam = useDashboardStarterSeam();

	if (seam.status === "loading") {
		return <StarterLayoutState layout="dashboard" state="loading" />;
	}

	if (seam.status === "error") {
		return (
			<StarterLayoutState
				layout="dashboard"
				state="error"
				errorMessage={seam.errorMessage}
			/>
		);
	}

	const { metrics, activityBars, recentItems } = seam.data;
	const hasData =
		metrics.length > 0 || activityBars.length > 0 || recentItems.length > 0;

	if (!hasData) {
		return <StarterLayoutState layout="dashboard" state="empty" />;
	}

	return (
		<div className="h-full overflow-auto bg-background p-5 md:p-6">
			<div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
				<section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
					{metrics.map((metric) => (
						<article
							key={metric.label}
							className="rounded-sm border border-border bg-background-secondary p-4"
						>
							<p className="text-[11px] tracking-[0.06em] text-foreground-tertiary">
								{metric.label}
							</p>
							<p className="mt-2 text-2xl font-light text-foreground">
								{metric.value}
							</p>
							<p className="mt-1 text-xs" style={{ color: metric.tone }}>
								{metric.delta}
							</p>
						</article>
					))}
				</section>

				<section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
					<article className="rounded-sm border border-border bg-background-secondary p-4">
						<div className="mb-4 flex items-center justify-between">
							<h2 className="text-sm font-medium text-foreground">
								activity overview
							</h2>
							<span className="inline-flex items-center gap-2 text-xs text-foreground-tertiary">
								<span
									className="h-2 w-2 rounded-full"
									style={{ backgroundColor: "var(--te-green)" }}
								/>
								realtime sync live
							</span>
						</div>
						<div className="flex h-44 items-end gap-2 rounded-sm border border-border bg-background p-3">
							{activityBars.map((bar, index) => (
								<div key={bar.id} className="flex flex-1 flex-col justify-end">
									<div
										className="rounded-[1px]"
										style={{
											height: `${bar.value}%`,
											background:
												bar.tone ||
												(index > activityBars.length - 4
													? "var(--te-orange)"
													: "var(--foreground-quaternary)"),
										}}
									/>
								</div>
							))}
						</div>
					</article>

					<article className="rounded-sm border border-border bg-background-secondary p-4">
						<h2 className="mb-4 text-sm font-medium text-foreground">
							recent work
						</h2>
						<div className="space-y-2">
							{recentItems.map((item) => (
								<div
									key={item.id}
									className="rounded-sm border border-border bg-background p-3"
								>
									<div className="flex items-center justify-between gap-3">
										<p className="truncate text-sm text-foreground">
											{item.title}
										</p>
										<span className="text-[11px]" style={{ color: item.tone }}>
											{item.status}
										</span>
									</div>
									<p className="mt-1 text-xs text-foreground-tertiary">
										{item.meta}
									</p>
								</div>
							))}
						</div>
					</article>
				</section>
			</div>
		</div>
	);
}
