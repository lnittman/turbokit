/**
 * Preset Utilities
 *
 * Functions for loading, applying, composing, and validating design presets.
 */

import type {
  DesignPreset,
  ComposedPreset,
  PresetLayers,
  TokenLayer,
  ActivePresetConfig,
  PresetRegistry,
} from './schema';

// ============================================================================
// Preset Loading
// ============================================================================

/**
 * Load a preset from the registry by ID
 */
export async function loadPreset(presetId: string): Promise<DesignPreset | null> {
  try {
    const response = await fetch(`/.turbokit/presets/${presetId}.json`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Load all available presets from the registry
 */
export async function loadAllPresets(): Promise<PresetRegistry> {
  try {
    const response = await fetch('/.turbokit/config.json');
    if (!response.ok) {
      return {
        version: '1.0.0',
        presets: {},
      };
    }
    return await response.json();
  } catch {
    return {
      version: '1.0.0',
      presets: {},
    };
  }
}

/**
 * Load the currently active preset configuration
 */
export async function loadActivePreset(): Promise<ActivePresetConfig | null> {
  try {
    const response = await fetch('/.turbokit/active-preset.json');
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

// ============================================================================
// Preset Composition
// ============================================================================

/**
 * Compose multiple presets into a single preset
 * Later presets override earlier ones
 */
export function composePresets(
  basePreset: DesignPreset,
  ...additionalPresets: DesignPreset[]
): DesignPreset {
  const composed: DesignPreset = JSON.parse(JSON.stringify(basePreset));

  for (const preset of additionalPresets) {
    // Merge tokens
    if (preset.layers.tokens) {
      composed.layers.tokens = mergeTokenLayers(
        composed.layers.tokens || {},
        preset.layers.tokens
      );
    }

    // Override layout (last one wins)
    if (preset.layers.layout) {
      composed.layers.layout = preset.layers.layout;
    }

    // Merge components
    if (preset.layers.components) {
      composed.layers.components = {
        ...composed.layers.components,
        ...preset.layers.components,
      };
    }

    // Merge animations
    if (preset.layers.animations) {
      composed.layers.animations = {
        keyframes: {
          ...composed.layers.animations?.keyframes,
          ...preset.layers.animations.keyframes,
        },
        animations: {
          ...composed.layers.animations?.animations,
          ...preset.layers.animations.animations,
        },
        transitions: {
          ...composed.layers.animations?.transitions,
          ...preset.layers.animations.transitions,
        },
        settings: preset.layers.animations.settings || composed.layers.animations?.settings,
      };
    }

    // Merge interactions
    if (preset.layers.interactions) {
      composed.layers.interactions = {
        ...composed.layers.interactions,
        ...preset.layers.interactions,
      };
    }
  }

  // Update metadata
  composed.id = `composed-${Date.now()}`;
  composed.name = `Composed: ${[basePreset, ...additionalPresets].map(p => p.name).join(' + ')}`;
  composed.description = 'Composed preset from multiple sources';
  composed.metadata = {
    ...composed.metadata,
    updatedAt: new Date().toISOString(),
    extends: [basePreset.id, ...additionalPresets.map(p => p.id)],
  };

  return composed;
}

/**
 * Merge two token layers with deep merge for nested objects
 */
function mergeTokenLayers(base: TokenLayer, override: TokenLayer): TokenLayer {
  return {
    colors: {
      semantic: {
        ...base.colors.semantic,
        ...override.colors.semantic,
      },
      palette: {
        ...base.colors.palette,
        ...override.colors.palette,
      },
      sidebar: {
        ...base.colors.sidebar,
        ...override.colors.sidebar,
      },
    },
    spacing: {
      ...base.spacing,
      ...override.spacing,
    },
    radius: {
      ...base.radius,
      ...override.radius,
    },
    fonts: {
      ...base.fonts,
      ...override.fonts,
      fontFaces: [
        ...(base.fonts.fontFaces || []),
        ...(override.fonts.fontFaces || []),
      ],
      variants: {
        ...base.fonts.variants,
        ...override.fonts.variants,
      },
    },
    shadows: {
      ...base.shadows,
      ...override.shadows,
      custom: {
        ...base.shadows.custom,
        ...override.shadows.custom,
      },
    },
    zIndex: {
      ...base.zIndex,
      ...override.zIndex,
    },
    durations: {
      ...base.durations,
      ...override.durations,
    },
    easings: {
      ...base.easings,
      ...override.easings,
    },
  };
}

// ============================================================================
// Preset Application
// ============================================================================

/**
 * Apply a preset by updating the body className
 */
export function applyPreset(presetId: string): void {
  // Remove all existing preset classes
  const currentClasses = document.body.className.split(' ');
  const filteredClasses = currentClasses.filter(c => !c.startsWith('preset-'));

  // Add new preset class
  document.body.className = [...filteredClasses, `preset-${presetId}`].join(' ');

  // Store in localStorage for persistence
  try {
    localStorage.setItem('turbokit-active-preset', presetId);
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Get the currently active preset ID from body className
 */
export function getActivePresetId(): string | null {
  const presetClass = document.body.className
    .split(' ')
    .find(c => c.startsWith('preset-'));

  return presetClass ? presetClass.replace('preset-', '') : null;
}

/**
 * Initialize preset system on page load
 */
export function initializePresetSystem(): void {
  // Check localStorage for saved preset
  try {
    const savedPreset = localStorage.getItem('turbokit-active-preset');
    if (savedPreset) {
      applyPreset(savedPreset);
    }
  } catch {
    // Ignore localStorage errors
  }
}

// ============================================================================
// CSS Generation
// ============================================================================

/**
 * Generate CSS custom properties from token layer
 */
export function generateCSSVariables(tokens: TokenLayer): string {
  const lines: string[] = [];

  // Colors
  Object.entries(tokens.colors.semantic).forEach(([key, value]) => {
    lines.push(`  --${key}: ${value};`);
  });

  // Spacing
  if (tokens.spacing.scale) {
    Object.entries(tokens.spacing.scale).forEach(([key, value]) => {
      lines.push(`  --spacing-${key}: ${value};`);
    });
  }

  // Radius
  Object.entries(tokens.radius).forEach(([key, value]) => {
    const varName = key === 'DEFAULT' ? '--radius' : `--radius-${key}`;
    lines.push(`  ${varName}: ${value};`);
  });

  // Fonts
  if (tokens.fonts.sans) lines.push(`  --font-sans: ${tokens.fonts.sans};`);
  if (tokens.fonts.serif) lines.push(`  --font-serif: ${tokens.fonts.serif};`);
  if (tokens.fonts.mono) lines.push(`  --font-mono: ${tokens.fonts.mono};`);
  if (tokens.fonts.display) lines.push(`  --font-display: ${tokens.fonts.display};`);
  if (tokens.fonts.size) lines.push(`  --font-size: ${tokens.fonts.size};`);
  if (tokens.fonts.lineHeight) lines.push(`  --line-height: ${tokens.fonts.lineHeight};`);

  // Shadows
  Object.entries(tokens.shadows).forEach(([key, value]) => {
    if (key !== 'custom') {
      const varName = key === 'DEFAULT' ? '--shadow' : `--shadow-${key}`;
      lines.push(`  ${varName}: ${value};`);
    }
  });

  if (tokens.shadows.custom) {
    Object.entries(tokens.shadows.custom).forEach(([key, value]) => {
      lines.push(`  --shadow-${key}: ${value};`);
    });
  }

  // Z-index
  if (tokens.zIndex) {
    Object.entries(tokens.zIndex).forEach(([key, value]) => {
      lines.push(`  --z-${key}: ${value};`);
    });
  }

  // Durations
  if (tokens.durations) {
    Object.entries(tokens.durations).forEach(([key, value]) => {
      lines.push(`  --duration-${key}: ${value};`);
    });
  }

  // Easings
  if (tokens.easings) {
    Object.entries(tokens.easings).forEach(([key, value]) => {
      lines.push(`  --ease-${key}: ${value};`);
    });
  }

  return lines.join('\n');
}

/**
 * Generate scoped CSS for a preset
 */
export function generatePresetCSS(preset: DesignPreset): string {
  const lines: string[] = [];

  lines.push(`/* Preset: ${preset.name} */`);
  lines.push(`/* ${preset.description} */`);
  lines.push(`body.preset-${preset.id} {`);

  if (preset.layers.tokens) {
    lines.push(generateCSSVariables(preset.layers.tokens));
  }

  lines.push('}');

  // Generate font faces if present
  if (preset.layers.tokens?.fonts.fontFaces) {
    lines.push('');
    preset.layers.tokens.fonts.fontFaces.forEach(fontFace => {
      lines.push(`@font-face {`);
      lines.push(`  font-family: '${fontFace.family}';`);
      if (Array.isArray(fontFace.src)) {
        lines.push(`  src: ${fontFace.src.join(', ')};`);
      } else {
        lines.push(`  src: ${fontFace.src};`);
      }
      if (fontFace.weight) lines.push(`  font-weight: ${fontFace.weight};`);
      if (fontFace.style) lines.push(`  font-style: ${fontFace.style};`);
      if (fontFace.display) lines.push(`  font-display: ${fontFace.display};`);
      lines.push(`}`);
    });
  }

  // Generate font variant classes if present
  if (preset.layers.tokens?.fonts.variants) {
    lines.push('');
    Object.entries(preset.layers.tokens.fonts.variants).forEach(([key, variant]) => {
      lines.push(`body.${variant.classSelector} {`);
      lines.push(`  --font-family-mono: '${variant.family}', monospace;`);
      lines.push(`}`);
    });
  }

  // Generate animation keyframes if present
  if (preset.layers.animations?.keyframes) {
    lines.push('');
    Object.entries(preset.layers.animations.keyframes).forEach(([name, keyframe]) => {
      lines.push(`@keyframes ${name} {`);
      Object.entries(keyframe).forEach(([step, styles]) => {
        if (styles) {
          lines.push(`  ${step} {`);
          Object.entries(styles).forEach(([prop, value]) => {
            lines.push(`    ${prop}: ${value};`);
          });
          lines.push(`  }`);
        }
      });
      lines.push(`}`);
    });
  }

  return lines.join('\n');
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validate a preset schema
 */
export function validatePreset(preset: unknown): preset is DesignPreset {
  if (typeof preset !== 'object' || preset === null) return false;

  const p = preset as Record<string, unknown>;

  return (
    typeof p.id === 'string' &&
    typeof p.name === 'string' &&
    typeof p.version === 'string' &&
    typeof p.description === 'string' &&
    typeof p.author === 'string' &&
    Array.isArray(p.tags) &&
    typeof p.layers === 'object' &&
    p.layers !== null &&
    typeof p.metadata === 'object' &&
    p.metadata !== null
  );
}

// ============================================================================
// Export Utilities
// ============================================================================

export const presetUtils = {
  load: loadPreset,
  loadAll: loadAllPresets,
  loadActive: loadActivePreset,
  compose: composePresets,
  apply: applyPreset,
  getActive: getActivePresetId,
  initialize: initializePresetSystem,
  generateCSS: generatePresetCSS,
  generateVariables: generateCSSVariables,
  validate: validatePreset,
};
