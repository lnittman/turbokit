import type React from "react";

const METRICS = [
	{
		label: "active projects",
		value: "12",
		delta: "+3 today",
		tone: "var(--te-green)",
	},
	{ label: "messages", value: "3,842", delta: "+11%", tone: "var(--te-blue)" },
	{ label: "alerts", value: "2", delta: "review now", tone: "var(--te-red)" },
	{
		label: "deploy status",
		value: "healthy",
		delta: "all systems",
		tone: "var(--te-green)",
	},
];

const ACTIVITY_BARS = [
	{ id: "bar-01", value: 42 },
	{ id: "bar-02", value: 58 },
	{ id: "bar-03", value: 49 },
	{ id: "bar-04", value: 61 },
	{ id: "bar-05", value: 55 },
	{ id: "bar-06", value: 73 },
	{ id: "bar-07", value: 67 },
	{ id: "bar-08", value: 79 },
	{ id: "bar-09", value: 71 },
	{ id: "bar-10", value: 64 },
	{ id: "bar-11", value: 69 },
	{ id: "bar-12", value: 81 },
];

const RECENT = [
	{
		title: "workspace shell polish",
		meta: "updated 3m ago",
		status: "live",
		tone: "var(--te-green)",
	},
	{
		title: "billing webhook retry",
		meta: "updated 18m ago",
		status: "warning",
		tone: "var(--te-yellow)",
	},
	{
		title: "permissions audit",
		meta: "updated 1h ago",
		status: "needs review",
		tone: "var(--te-red)",
	},
	{
		title: "docs starter refresh",
		meta: "updated 2h ago",
		status: "ready",
		tone: "var(--te-blue)",
	},
];

export function DashboardLayout(): React.ReactElement {
	return (
		<div className="h-full overflow-auto bg-background p-5 md:p-6">
			<div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
				<section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
					{METRICS.map((metric) => (
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
							{ACTIVITY_BARS.map((bar, index) => (
								<div key={bar.id} className="flex flex-1 flex-col justify-end">
									<div
										className="rounded-[1px]"
										style={{
											height: `${bar.value}%`,
											background:
												index > ACTIVITY_BARS.length - 4
													? "var(--te-orange)"
													: "var(--foreground-quaternary)",
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
							{RECENT.map((item) => (
								<div
									key={item.title}
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
