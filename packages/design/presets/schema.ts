/**
 * TurboKit Design Preset System
 *
 * Composable, layered design system presets that can be:
 * - Extracted from existing projects via AI
 * - Applied at runtime via body classes
 * - Shared via Convex registry
 * - Composed by layering multiple presets
 */

// ============================================================================
// Core Preset Schema
// ============================================================================

export interface DesignPreset {
  /** Unique identifier (kebab-case) */
  id: string;

  /** Human-readable name */
  name: string;

  /** Description of the design system */
  description: string;

  /** Author name or organization */
  author: string;

  /** Tags for discovery (e.g., "brutalist", "minimal", "iOS", "monospace") */
  tags: string[];

  /** Semantic version */
  version: string;

  /** Composable design layers */
  layers: PresetLayers;

  /** Additional metadata */
  metadata: PresetMetadata;

  /** Preview configuration */
  preview?: PresetPreview;
}

// ============================================================================
// Preset Layers (Composable)
// ============================================================================

export interface PresetLayers {
  /** CSS variable tokens (colors, spacing, radius, etc.) */
  tokens?: TokenLayer;

  /** Layout patterns (sidebar, header, navigation) */
  layout?: LayoutLayer;

  /** Component variant configurations */
  components?: ComponentLayer;

  /** Animation definitions (keyframes, transitions) */
  animations?: AnimationLayer;

  /** Interaction states (hover, active, focus) */
  interactions?: InteractionLayer;
}

// ============================================================================
// Token Layer
// ============================================================================

export interface TokenLayer {
  /** Color tokens (oklch, rgb, hex) */
  colors: ColorTokens;

  /** Spacing scale */
  spacing: SpacingTokens;

  /** Border radius values */
  radius: RadiusTokens;

  /** Typography configuration */
  fonts: FontConfig;

  /** Shadow definitions */
  shadows: ShadowTokens;

  /** Z-index scale */
  zIndex?: Record<string, number>;

  /** Animation durations */
  durations?: Record<string, string>;

  /** Easing functions */
  easings?: Record<string, string>;
}

export interface ColorTokens {
  /** Semantic color mappings */
  semantic: {
    background: string;
    foreground: string;
    primary: string;
    'primary-foreground': string;
    secondary: string;
    'secondary-foreground': string;
    muted: string;
    'muted-foreground': string;
    accent: string;
    'accent-foreground': string;
    destructive: string;
    'destructive-foreground': string;
    border: string;
    input: string;
    ring: string;
    card: string;
    'card-foreground': string;
    popover: string;
    'popover-foreground': string;
  };

  /** Raw color palette (optional) */
  palette?: Record<string, string | Record<string, string>>;

  /** Sidebar-specific colors (optional) */
  sidebar?: {
    background?: string;
    foreground?: string;
    primary?: string;
    'primary-foreground'?: string;
    accent?: string;
    'accent-foreground'?: string;
    border?: string;
  };
}

export interface SpacingTokens {
  /** Base spacing unit (typically 0.25rem) */
  unit?: string;

  /** Spacing scale (0-96) */
  scale?: Record<string, string>;

  /** Character-based spacing (for monospace designs) */
  ch?: Record<string, string>;

  /** Line-height based spacing */
  line?: Record<string, string>;
}

export interface RadiusTokens {
  /** Default radius */
  DEFAULT: string;

  /** Named radius values */
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  '2xl'?: string;
  '3xl'?: string;
  full?: string;
  none?: string;
}

export interface FontConfig {
  /** Sans-serif font family */
  sans?: string;

  /** Serif font family */
  serif?: string;

  /** Monospace font family */
  mono?: string;

  /** Display font family */
  display?: string;

  /** Base font size */
  size?: string;

  /** Line height base */
  lineHeight?: string;

  /** Letter spacing */
  letterSpacing?: Record<string, string>;

  /** Font weights */
  weights?: Record<string, string | number>;

  /** Font loading (URLs or next/font config) */
  fontFaces?: FontFaceDefinition[];

  /** Switchable fonts (like sacred's 17 monospace fonts) */
  variants?: Record<string, FontVariant>;
}

export interface FontFaceDefinition {
  family: string;
  src: string | string[];
  weight?: string | number;
  style?: 'normal' | 'italic';
  display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
}

export interface FontVariant {
  family: string;
  classSelector: string; // e.g., "font-use-commit-mono"
  src?: string;
}

export interface ShadowTokens {
  /** Shadow definitions */
  sm?: string;
  DEFAULT?: string;
  md?: string;
  lg?: string;
  xl?: string;
  '2xl'?: string;
  inner?: string;
  none?: string;

  /** Custom shadows (e.g., inset borders, offset shadows) */
  custom?: Record<string, string>;
}

// ============================================================================
// Layout Layer
// ============================================================================

export interface LayoutLayer {
  /** Layout pattern type */
  type: LayoutType;

  /** Layout configuration */
  config: LayoutConfig;

  /** Component mapping (which components to use for layout) */
  components?: {
    sidebar?: string; // Path to sidebar component
    header?: string;  // Path to header component
    nav?: string;     // Path to nav component
  };
}

export type LayoutType =
  | 'sidebar-left'           // Fixed left sidebar (256px)
  | 'sidebar-collapsible'    // Collapsible sidebar (64px ↔ 256px)
  | 'sidebar-right'          // Fixed right sidebar
  | 'header-top'             // Top header, full width
  | 'header-center'          // Header with centered nav (radar style)
  | 'header-sticky'          // Sticky header on scroll
  | 'dashboard'              // Sidebar + header combo
  | 'minimal'                // No persistent nav
  | 'custom';                // Custom layout

export interface LayoutConfig {
  /** Sidebar configuration */
  sidebar?: {
    width?: string | { collapsed: string; expanded: string };
    position?: 'left' | 'right';
    collapsible?: boolean;
    overlay?: 'always' | 'mobile-only' | 'never';
    glassmorphism?: boolean;
  };

  /** Header configuration */
  header?: {
    height?: string;
    position?: 'fixed' | 'sticky' | 'relative';
    transparent?: boolean;
    blur?: boolean;
    centerNav?: boolean;
  };

  /** Mobile behavior */
  mobile?: {
    menuType?: 'drawer' | 'overlay' | 'bottom-sheet';
    breakpoint?: string;
  };

  /** Spacing */
  contentPadding?: string;
  contentMaxWidth?: string;
}

// ============================================================================
// Component Layer
// ============================================================================

export interface ComponentLayer {
  /** Button variant configurations */
  button?: ComponentVariants;

  /** Input variant configurations */
  input?: ComponentVariants;

  /** Card variant configurations */
  card?: ComponentVariants;

  /** Additional component variants */
  [componentName: string]: ComponentVariants | undefined;
}

export interface ComponentVariants {
  /** Default variant classes */
  base?: string;

  /** Named variants */
  variants?: Record<string, string>;

  /** Size variants */
  sizes?: Record<string, string>;

  /** CVA-style configuration */
  cva?: {
    base: string;
    variants: Record<string, Record<string, string>>;
    defaultVariants?: Record<string, string>;
  };
}

// ============================================================================
// Animation Layer
// ============================================================================

export interface AnimationLayer {
  /** Keyframe definitions */
  keyframes?: Record<string, KeyframeDefinition>;

  /** Animation utilities */
  animations?: Record<string, string>;

  /** Transition presets */
  transitions?: Record<string, TransitionDefinition>;

  /** Global animation settings */
  settings?: {
    reducedMotion?: boolean;
    defaultDuration?: string;
    defaultEasing?: string;
  };
}

export interface KeyframeDefinition {
  /** Keyframe steps */
  from?: Record<string, string>;
  to?: Record<string, string>;
  [percentage: string]: Record<string, string> | undefined;
}

export interface TransitionDefinition {
  property?: string;
  duration?: string;
  timingFunction?: string;
  delay?: string;
}

// ============================================================================
// Interaction Layer
// ============================================================================

export interface InteractionLayer {
  /** Hover state configuration */
  hover?: InteractionStates;

  /** Active/pressed state configuration */
  active?: InteractionStates;

  /** Focus state configuration */
  focus?: InteractionStates;

  /** Disabled state configuration */
  disabled?: InteractionStates;

  /** iOS-style tactile feedback */
  tactile?: {
    enabled: boolean;
    scale?: number; // e.g., 0.98
    duration?: string;
  };
}

export interface InteractionStates {
  /** Default hover/active/focus behavior */
  default?: string;

  /** Component-specific states */
  button?: string;
  link?: string;
  input?: string;
  card?: string;
  [component: string]: string | undefined;
}

// ============================================================================
// Metadata & Preview
// ============================================================================

export interface PresetMetadata {
  /** Source project URL (if extracted from existing project) */
  sourceUrl?: string;

  /** Git repository */
  repository?: string;

  /** License */
  license?: string;

  /** Creation timestamp */
  createdAt: string;

  /** Last update timestamp */
  updatedAt: string;

  /** Download count (for Convex registry) */
  downloads?: number;

  /** Rating (for Convex registry) */
  rating?: number;

  /** Is this preset public? */
  isPublic?: boolean;

  /** Dependencies (other presets this extends) */
  extends?: string[];

  /** Extracted from which project */
  extractedFrom?: {
    path: string;
    detectedBy: 'ai' | 'manual';
    detectionConfidence?: number;
  };
}

export interface PresetPreview {
  /** Screenshot URL */
  thumbnail?: string;

  /** Preview colors (for quick visual identification) */
  primaryColor?: string;
  backgroundColor?: string;

  /** Example components to show in preview */
  showcase?: string[]; // ['button', 'card', 'input']
}

// ============================================================================
// Preset Composition
// ============================================================================

/**
 * Composed preset - layers multiple presets together
 */
export interface ComposedPreset {
  id: string;
  name: string;
  description: string;

  /** Ordered list of preset IDs to layer (later presets override earlier) */
  layers: PresetLayerReference[];

  /** Override specific tokens without creating a full preset */
  overrides?: Partial<PresetLayers>;
}

export interface PresetLayerReference {
  /** Preset ID to include */
  presetId: string;

  /** Which layers to include from this preset */
  include?: (keyof PresetLayers)[];

  /** Which layers to exclude from this preset */
  exclude?: (keyof PresetLayers)[];

  /** Priority (higher = later in cascade) */
  priority?: number;
}

// ============================================================================
// Registry Configuration
// ============================================================================

export interface PresetRegistry {
  /** Registry version */
  version: string;

  /** Available presets */
  presets: Record<string, DesignPreset>;

  /** Composed presets */
  composed?: Record<string, ComposedPreset>;

  /** Active preset ID */
  active?: string;

  /** Synced with Convex? */
  syncEnabled?: boolean;

  /** Last sync timestamp */
  lastSync?: string;
}

// ============================================================================
// Active Preset Configuration
// ============================================================================

export interface ActivePresetConfig {
  /** Current preset ID or composed preset config */
  preset: string | ComposedPreset;

  /** Applied at timestamp */
  appliedAt: string;

  /** Applied by (user ID or 'system') */
  appliedBy?: string;

  /** Custom overrides */
  overrides?: Partial<PresetLayers>;
}

// ============================================================================
// Extraction Metadata (for AI extraction tool)
// ============================================================================

export interface ExtractionMetadata {
  /** Source project path */
  sourcePath: string;

  /** Files analyzed */
  filesAnalyzed: string[];

  /** Detected design system */
  detectedSystem?: 'tailwind-v3' | 'tailwind-v4' | 'css-modules' | 'styled-components' | 'css-in-js' | 'custom';

  /** Extraction timestamp */
  extractedAt: string;

  /** AI model used */
  extractedBy?: string;

  /** Confidence score (0-1) */
  confidence?: number;

  /** Warnings/notes from extraction */
  warnings?: string[];
}

// ============================================================================
// Type Guards
// ============================================================================

export function isDesignPreset(obj: unknown): obj is DesignPreset {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    'version' in obj &&
    'layers' in obj
  );
}

export function isComposedPreset(obj: unknown): obj is ComposedPreset {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    'layers' in obj &&
    Array.isArray((obj as ComposedPreset).layers)
  );
}

// ============================================================================
// Preset IDs (for type safety)
// ============================================================================

export const BUILT_IN_PRESETS = {
  SACRED: 'sacred',
  KUMORI: 'kumori',
  ARBOR: 'arbor',
  RADAR_LAYOUT: 'radar-layout',
  KOTO: 'koto',
} as const;

export type BuiltInPresetID = typeof BUILT_IN_PRESETS[keyof typeof BUILT_IN_PRESETS];
