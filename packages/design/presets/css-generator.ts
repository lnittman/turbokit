/**
 * Preset CSS Generator
 *
 * Converts DesignPreset JSON into scoped CSS that can be injected into the DOM
 */

import type { DesignPreset } from './schema';

/**
 * Generate scoped CSS from a preset definition
 */
export function generatePresetCSS(preset: DesignPreset): string {
  const { id, layers } = preset;
  const selector = `body.preset-${id}`;

  let css = `/* Preset: ${preset.name} */\n`;
  css += `/* ${preset.description} */\n\n`;

  // Generate root CSS variables from tokens
  if (layers.tokens) {
    css += `${selector} {\n`;

    // Color tokens
    if (layers.tokens.colors?.semantic) {
      css += '  /* Semantic Colors */\n';
      Object.entries(layers.tokens.colors.semantic).forEach(([key, value]) => {
        const cssVar = `--${key.replace(/_/g, '-')}`;
        css += `  ${cssVar}: ${value};\n`;
      });
      css += '\n';
    }

    // Spacing tokens
    if (layers.tokens.spacing) {
      css += '  /* Spacing */\n';
      Object.entries(layers.tokens.spacing).forEach(([key, value]) => {
        const cssVar = key === 'DEFAULT' ? '--spacing' : `--spacing-${key}`;
        css += `  ${cssVar}: ${value};\n`;
      });
      css += '\n';
    }

    // Radius tokens
    if (layers.tokens.radius) {
      css += '  /* Border Radius */\n';
      Object.entries(layers.tokens.radius).forEach(([key, value]) => {
        const cssVar = key === 'DEFAULT' ? '--radius' : `--radius-${key}`;
        css += `  ${cssVar}: ${value};\n`;
      });
      css += '\n';
    }

    // Font tokens
    if (layers.tokens.fonts) {
      css += '  /* Fonts */\n';
      Object.entries(layers.tokens.fonts).forEach(([key, value]) => {
        if (!key.startsWith('mono-')) { // Skip font variants for now
          const cssVar = `--font-${key}`;
          css += `  ${cssVar}: ${value};\n`;
        }
      });
      css += '\n';
    }

    // Shadow tokens
    if (layers.tokens.shadows) {
      css += '  /* Shadows */\n';
      Object.entries(layers.tokens.shadows).forEach(([key, value]) => {
        const cssVar = key === 'DEFAULT' ? '--shadow' : `--shadow-${key}`;
        css += `  ${cssVar}: ${value};\n`;
      });
      css += '\n';
    }

    // Z-index tokens
    if (layers.tokens.zIndex) {
      css += '  /* Z-Index */\n';
      Object.entries(layers.tokens.zIndex).forEach(([key, value]) => {
        const cssVar = `--z-${key}`;
        css += `  ${cssVar}: ${value};\n`;
      });
      css += '\n';
    }

    // Duration tokens
    if (layers.tokens.durations) {
      css += '  /* Durations */\n';
      Object.entries(layers.tokens.durations).forEach(([key, value]) => {
        const cssVar = `--duration-${key}`;
        css += `  ${cssVar}: ${value};\n`;
      });
      css += '\n';
    }

    // Easing tokens
    if (layers.tokens.easings) {
      css += '  /* Easings */\n';
      Object.entries(layers.tokens.easings).forEach(([key, value]) => {
        const cssVar = key === 'DEFAULT' ? '--ease' : `--ease-${key}`;
        css += `  ${cssVar}: ${value};\n`;
      });
      css += '\n';
    }

    css += '}\n\n';
  }

  // Generate dark mode overrides if present
  if (preset.preview?.dark) {
    css += `${selector}.dark {\n`;
    css += `  /* Dark mode overrides would go here */\n`;
    css += '}\n\n';
  }

  // Generate keyframes from animations
  if (layers.animations?.keyframes) {
    Object.entries(layers.animations.keyframes).forEach(([name, frames]) => {
      css += `@keyframes preset-${id}-${name} {\n`;
      Object.entries(frames).forEach(([step, styles]) => {
        css += `  ${step} {\n`;
        Object.entries(styles).forEach(([prop, value]) => {
          const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
          css += `    ${cssProp}: ${value};\n`;
        });
        css += '  }\n';
      });
      css += '}\n\n';
    });
  }

  // Generate component style overrides
  if (layers.components) {
    // Button overrides
    if (layers.components.button) {
      const btn = layers.components.button;
      css += `${selector} .btn,\n${selector} button[class*="button"] {\n`;
      if (btn.base) css += `  ${btn.base.split(' ').map(c => `/* ${c} */`).join(' ')};\n`;
      css += '}\n\n';
    }

    // Card overrides
    if (layers.components.card) {
      const card = layers.components.card;
      css += `${selector} .card,\n${selector} [class*="card"] {\n`;
      if (card.base) css += `  ${card.base.split(' ').map(c => `/* ${c} */`).join(' ')};\n`;
      css += '}\n\n';
    }
  }

  return css;
}

/**
 * Generate CSS variables mapping for Tailwind
 */
export function generateCSSVariables(preset: DesignPreset): Record<string, string> {
  const vars: Record<string, string> = {};

  if (preset.layers.tokens?.colors?.semantic) {
    Object.entries(preset.layers.tokens.colors.semantic).forEach(([key, value]) => {
      vars[key] = value;
    });
  }

  return vars;
}

/**
 * Inject preset CSS into the document
 */
export function injectPresetCSS(preset: DesignPreset): void {
  // Remove existing preset styles
  const existingStyle = document.getElementById('turbokit-preset-styles');
  if (existingStyle) {
    existingStyle.remove();
  }

  // Generate and inject new CSS
  const css = generatePresetCSS(preset);
  const styleEl = document.createElement('style');
  styleEl.id = 'turbokit-preset-styles';
  styleEl.textContent = css;
  document.head.appendChild(styleEl);
}

/**
 * Remove all preset CSS from the document
 */
export function removePresetCSS(): void {
  const existingStyle = document.getElementById('turbokit-preset-styles');
  if (existingStyle) {
    existingStyle.remove();
  }
}
