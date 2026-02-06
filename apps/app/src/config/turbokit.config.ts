import { STARTER_LAYOUTS, type StarterLayout } from "@/layouts/types";

export const turbokitConfig = {
	layout: {
		default: "dashboard" as StarterLayout,
		options: STARTER_LAYOUTS,
		showSwitcher: true,
	},
} as const;
