/**
 * React Hooks for Preset System
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { DesignPreset, PresetRegistry, ComposedPreset } from './schema';
import {
  loadPreset,
  loadAllPresets,
  loadActivePreset,
  applyPreset as applyPresetUtil,
  getActivePresetId,
  composePresets,
} from './utils';

// ============================================================================
// usePreset - Main preset management hook
// ============================================================================

export interface UsePresetReturn {
  /** Currently active preset ID */
  activePresetId: string | null;

  /** Currently active preset data */
  activePreset: DesignPreset | null;

  /** Loading state */
  loading: boolean;

  /** Error state */
  error: Error | null;

  /** Apply a preset by ID */
  applyPreset: (presetId: string) => Promise<void>;

  /** Refresh preset data */
  refresh: () => Promise<void>;
}

/**
 * Hook for managing the active design preset
 */
export function usePreset(): UsePresetReturn {
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<DesignPreset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadActive = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get active preset ID from body class or localStorage
      let presetId = getActivePresetId();
      if (!presetId) {
        try {
          presetId = localStorage.getItem('turbokit-active-preset');
        } catch {
          // Ignore
        }
      }

      if (!presetId) {
        // Default to koto
        presetId = 'koto';
      }

      const preset = await loadPreset(presetId);
      if (preset) {
        setActivePresetId(presetId);
        setActivePreset(preset);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load preset'));
    } finally {
      setLoading(false);
    }
  }, []);

  const applyPreset = useCallback(async (presetId: string) => {
    try {
      setLoading(true);
      setError(null);

      const preset = await loadPreset(presetId);
      if (!preset) {
        throw new Error(`Preset not found: ${presetId}`);
      }

      // Apply preset
      applyPresetUtil(presetId);
      setActivePresetId(presetId);
      setActivePreset(preset);

      // Persist to localStorage
      try {
        localStorage.setItem('turbokit-active-preset', presetId);
      } catch {
        // Ignore
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to apply preset'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActive();
  }, [loadActive]);

  return {
    activePresetId,
    activePreset,
    loading,
    error,
    applyPreset,
    refresh: loadActive,
  };
}

// ============================================================================
// usePresetRegistry - Registry management hook
// ============================================================================

export interface UsePresetRegistryReturn {
  /** Registry data */
  registry: PresetRegistry | null;

  /** Loading state */
  loading: boolean;

  /** Error state */
  error: Error | null;

  /** Reload registry */
  reload: () => Promise<void>;

  /** Get preset by ID */
  getPreset: (presetId: string) => Promise<DesignPreset | null>;
}

/**
 * Hook for accessing the preset registry
 */
export function usePresetRegistry(): UsePresetRegistryReturn {
  const [registry, setRegistry] = useState<PresetRegistry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await loadAllPresets();
      setRegistry(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load registry'));
    } finally {
      setLoading(false);
    }
  }, []);

  const getPreset = useCallback(async (presetId: string): Promise<DesignPreset | null> => {
    try {
      return await loadPreset(presetId);
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {
    registry,
    loading,
    error,
    reload: load,
    getPreset,
  };
}

// ============================================================================
// usePresetComposer - Preset composition hook
// ============================================================================

export interface UsePresetComposerReturn {
  /** Selected preset IDs for composition */
  selectedPresets: string[];

  /** Add a preset to the composition */
  addPreset: (presetId: string) => void;

  /** Remove a preset from the composition */
  removePreset: (presetId: string) => void;

  /** Reorder presets in the composition */
  reorderPresets: (fromIndex: number, toIndex: number) => void;

  /** Clear all selected presets */
  clear: () => void;

  /** Compose the selected presets into a single preset */
  compose: () => Promise<DesignPreset | null>;

  /** Preview the composed preset (apply temporarily) */
  preview: () => Promise<void>;
}

/**
 * Hook for composing multiple presets
 */
export function usePresetComposer(): UsePresetComposerReturn {
  const [selectedPresets, setSelectedPresets] = useState<string[]>([]);

  const addPreset = useCallback((presetId: string) => {
    setSelectedPresets(prev => {
      if (prev.includes(presetId)) return prev;
      return [...prev, presetId];
    });
  }, []);

  const removePreset = useCallback((presetId: string) => {
    setSelectedPresets(prev => prev.filter(id => id !== presetId));
  }, []);

  const reorderPresets = useCallback((fromIndex: number, toIndex: number) => {
    setSelectedPresets(prev => {
      const newOrder = [...prev];
      const [removed] = newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, removed);
      return newOrder;
    });
  }, []);

  const clear = useCallback(() => {
    setSelectedPresets([]);
  }, []);

  const compose = useCallback(async (): Promise<DesignPreset | null> => {
    if (selectedPresets.length === 0) return null;

    try {
      // Load all selected presets
      const presets = await Promise.all(
        selectedPresets.map(id => loadPreset(id))
      );

      // Filter out null values
      const validPresets = presets.filter((p): p is DesignPreset => p !== null);

      if (validPresets.length === 0) return null;

      // Compose presets (first is base, rest are layered on top)
      const [base, ...rest] = validPresets;
      return composePresets(base, ...rest);
    } catch {
      return null;
    }
  }, [selectedPresets]);

  const preview = useCallback(async () => {
    const composed = await compose();
    if (!composed) return;

    // Apply composed preset temporarily
    // This would need to be implemented with a temporary body class
    // For now, we'll just log it
    console.log('Preview composed preset:', composed);
  }, [compose]);

  return {
    selectedPresets,
    addPreset,
    removePreset,
    reorderPresets,
    clear,
    compose,
    preview,
  };
}
