import type React from "react";

import {
	STARTER_LAYOUT_LABELS,
	STARTER_LAYOUTS,
	type StarterLayout,
} from "@/layouts/types";

interface LayoutSwitcherProps {
	value: StarterLayout;
	onChange: (layout: StarterLayout) => void;
}

export function LayoutSwitcher({
	value,
	onChange,
}: LayoutSwitcherProps): React.ReactElement {
	return (
		<div className="flex flex-wrap gap-2">
			{STARTER_LAYOUTS.map((layout) => {
				const active = layout === value;

				return (
					<button
						type="button"
						key={layout}
						onClick={() => onChange(layout)}
						className="rounded-full border px-3 py-1 text-xs transition-colors"
						style={
							active
								? {
										borderColor: "var(--user-accent)",
										color: "var(--foreground)",
										backgroundColor: "var(--background-secondary)",
									}
								: {
										borderColor: "var(--border)",
										color: "var(--foreground-tertiary)",
									}
						}
					>
						{STARTER_LAYOUT_LABELS[layout]}
					</button>
				);
			})}
		</div>
	);
}
