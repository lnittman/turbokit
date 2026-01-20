/**
 * TurboKit Design Preset System
 *
 * Composable, layered design presets for rapid UI customization
 */

// Export schema types
export type {
  DesignPreset,
  ComposedPreset,
  PresetLayers,
  TokenLayer,
  LayoutLayer,
  ComponentLayer,
  AnimationLayer,
  InteractionLayer,
  ColorTokens,
  SpacingTokens,
  RadiusTokens,
  FontConfig,
  ShadowTokens,
  LayoutType,
  LayoutConfig,
  ComponentVariants,
  KeyframeDefinition,
  TransitionDefinition,
  InteractionStates,
  PresetMetadata,
  PresetPreview,
  PresetLayerReference,
  PresetRegistry,
  ActivePresetConfig,
  ExtractionMetadata,
  BuiltInPresetID,
} from './schema';

export { BUILT_IN_PRESETS, isDesignPreset, isComposedPreset } from './schema';

// Export utilities
export {
  presetUtils,
  loadPreset,
  loadAllPresets,
  loadActivePreset,
  composePresets,
  applyPreset,
  getActivePresetId,
  initializePresetSystem,
  generatePresetCSS,
  generateCSSVariables,
  validatePreset,
} from './utils';

// Export React hooks
export { usePreset, usePresetComposer, usePresetRegistry } from './hooks';

// Export CSS generation utilities
export {
  generatePresetCSS as generatePresetCSSFromJSON,
  generateCSSVariables as generateCSSVariablesFromJSON,
  injectPresetCSS,
  removePresetCSS,
} from './css-generator';

// Export Provider
export { PresetProvider, usePresetContext, setPresetLoader } from './PresetProvider';
export type { PresetProviderProps } from './PresetProvider';
