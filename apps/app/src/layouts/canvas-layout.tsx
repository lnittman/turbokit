"use client";

import type React from "react";
import { useState } from "react";

const NODES = [
	{ id: "n1", title: "landing flow", x: 10, y: 16, tone: "var(--te-blue)" },
	{ id: "n2", title: "auth overlay", x: 48, y: 30, tone: "var(--te-green)" },
	{ id: "n3", title: "settings graph", x: 72, y: 62, tone: "var(--te-orange)" },
];

export function CanvasLayout(): React.ReactElement {
	const [zoom, setZoom] = useState(100);

	return (
		<div className="flex h-full flex-col bg-background p-5 md:p-6">
			<div className="mx-auto flex h-full w-full max-w-7xl min-h-0 flex-col gap-4">
				<header className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-border bg-background-secondary p-3">
					<div>
						<h2 className="text-sm font-medium text-foreground">
							canvas starter
						</h2>
						<p className="text-xs text-foreground-tertiary">
							infinite-surface scaffold with zoom and minimap hooks
						</p>
					</div>
					<div className="inline-flex items-center gap-2">
						<button
							type="button"
							className="rounded-sm border border-border px-2 py-1 text-xs text-foreground-tertiary"
							onClick={() => setZoom((current) => Math.max(50, current - 10))}
						>
							-
						</button>
						<span className="w-12 text-center text-xs text-foreground">
							{zoom}%
						</span>
						<button
							type="button"
							className="rounded-sm border border-border px-2 py-1 text-xs text-foreground-tertiary"
							onClick={() => setZoom((current) => Math.min(200, current + 10))}
						>
							+
						</button>
					</div>
				</header>

				<section className="relative min-h-0 flex-1 overflow-hidden rounded-sm border border-border bg-background-secondary">
					<div
						className="absolute inset-0"
						style={{
							backgroundImage:
								"linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
							backgroundSize: "24px 24px",
							transform: `scale(${zoom / 100})`,
							transformOrigin: "top left",
						}}
					>
						{NODES.map((node) => (
							<article
								key={node.id}
								className="absolute w-40 rounded-sm border border-border bg-background p-3"
								style={{ left: `${node.x}%`, top: `${node.y}%` }}
							>
								<p className="text-sm text-foreground">{node.title}</p>
								<p className="mt-1 text-xs" style={{ color: node.tone }}>
									connected
								</p>
							</article>
						))}
					</div>

					<aside className="absolute bottom-3 right-3 w-28 rounded-sm border border-border bg-background p-2">
						<p className="text-[11px] text-foreground-tertiary">minimap</p>
						<div className="mt-2 h-16 rounded-sm border border-border bg-background-secondary" />
					</aside>
				</section>
			</div>
		</div>
	);
}
