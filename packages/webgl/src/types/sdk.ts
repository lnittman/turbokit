export interface UnicornInteractivity {
	mouse?: {
		disableMobile?: boolean;
		disabled?: boolean;
	};
}

export interface UnicornAddSceneOptions {
	elementId: string;
	// Perf
	fps?: number;
	scale?: number;
	dpi?: number;
	lazyLoad?: boolean;
	// Accessibility
	altText?: string;
	ariaLabel?: string;
	// Source (one of)
	filePath?: string;
	projectId?: string;
	// Behavior
	production?: boolean;
	fixed?: boolean;
	interactivity?: UnicornInteractivity;
}

export interface UnicornSceneInstance {
	destroy(): void;
	resize?(): void;
	paused?: boolean;
	element?: HTMLElement;
	contains?(element: HTMLElement | null): boolean;
}

export interface UnicornSDK {
	addScene(options: UnicornAddSceneOptions): Promise<UnicornSceneInstance>;
	destroy?(): void;
}
