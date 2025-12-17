/**
 * TurboKit Design Preset System
 *
 * Composable, layered design presets for rapid UI customization
 */

// Export CSS generation utilities
export {
  generateCSSVariables as generateCSSVariablesFromJSON,
  generatePresetCSS as generatePresetCSSFromJSON,
  injectPresetCSS,
  removePresetCSS,
} from "./css-generator";
// Export React hooks
export { usePreset, usePresetComposer, usePresetRegistry } from "./hooks";
export type { PresetProviderProps } from "./PresetProvider";
// Export Provider
export {
  PresetProvider,
  setPresetLoader,
  usePresetContext,
} from "./PresetProvider";
// Export schema types
export type {
  ActivePresetConfig,
  AnimationLayer,
  BuiltInPresetID,
  ColorTokens,
  ComponentLayer,
  ComponentVariants,
  ComposedPreset,
  DesignPreset,
  ExtractionMetadata,
  FontConfig,
  InteractionLayer,
  InteractionStates,
  KeyframeDefinition,
  LayoutConfig,
  LayoutLayer,
  LayoutType,
  PresetLayerReference,
  PresetLayers,
  PresetMetadata,
  PresetPreview,
  PresetRegistry,
  RadiusTokens,
  ShadowTokens,
  SpacingTokens,
  TokenLayer,
  TransitionDefinition,
} from "./schema";
export { BUILT_IN_PRESETS, isComposedPreset, isDesignPreset } from "./schema";
// Export utilities
export {
  applyPreset,
  composePresets,
  generateCSSVariables,
  generatePresetCSS,
  getActivePresetId,
  initializePresetSystem,
  loadActivePreset,
  loadAllPresets,
  loadPreset,
  presetUtils,
  validatePreset,
} from "./utils";
