/**
 * Preset Provider
 *
 * Manages active preset state and CSS injection
 */

'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { DesignPreset } from './schema';
import { loadPreset as loadPresetLocal, getActivePresetId } from './utils';
import { injectPresetCSS, removePresetCSS } from './css-generator';

// Allow injecting a custom preset loader (for registry integration)
let customPresetLoader: ((presetId: string) => Promise<DesignPreset | null>) | null = null;

export function setPresetLoader(loader: (presetId: string) => Promise<DesignPreset | null>) {
  customPresetLoader = loader;
}

async function loadPreset(presetId: string): Promise<DesignPreset | null> {
  if (customPresetLoader) {
    return customPresetLoader(presetId);
  }
  return loadPresetLocal(presetId);
}

interface PresetContextValue {
  activePreset: DesignPreset | null;
  activePresetId: string | null;
  loading: boolean;
  error: Error | null;
  applyPreset: (presetId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const PresetContext = createContext<PresetContextValue | undefined>(undefined);

export interface PresetProviderProps {
  children: ReactNode;
  defaultPreset?: string;
}

export function PresetProvider({ children, defaultPreset = 'koto' }: PresetProviderProps) {
  const [activePreset, setActivePreset] = useState<DesignPreset | null>(null);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadAndApplyPreset = useCallback(async (presetId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Load preset data
      const preset = await loadPreset(presetId);
      if (!preset) {
        throw new Error(`Preset not found: ${presetId}`);
      }

      // Apply body class
      const body = document.body;

      // Remove existing preset classes
      body.className = body.className
        .split(' ')
        .filter(c => !c.startsWith('preset-'))
        .join(' ');

      // Add new preset class
      body.classList.add(`preset-${presetId}`);

      // Inject CSS
      injectPresetCSS(preset);

      // Update state
      setActivePreset(preset);
      setActivePresetId(presetId);

      // Persist to localStorage
      try {
        localStorage.setItem('turbokit-active-preset', presetId);
      } catch {
        // Ignore localStorage errors
      }

      return preset;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load preset');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load initial preset on mount
  useEffect(() => {
    async function loadInitial() {
      try {
        // Try to get from localStorage first
        let presetId: string | null = null;
        try {
          presetId = localStorage.getItem('turbokit-active-preset');
        } catch {
          // Ignore
        }

        // Fall back to body class
        if (!presetId) {
          presetId = getActivePresetId();
        }

        // Fall back to default
        if (!presetId) {
          presetId = defaultPreset;
        }

        await loadAndApplyPreset(presetId);
      } catch (err) {
        console.error('Failed to load initial preset:', err);
        // Try to load default preset as fallback
        if (defaultPreset) {
          try {
            await loadAndApplyPreset(defaultPreset);
          } catch {
            // Give up
          }
        }
      }
    }

    loadInitial();
  }, [defaultPreset, loadAndApplyPreset]);

  const applyPreset = useCallback(async (presetId: string) => {
    await loadAndApplyPreset(presetId);
  }, [loadAndApplyPreset]);

  const refresh = useCallback(async () => {
    if (activePresetId) {
      await loadAndApplyPreset(activePresetId);
    }
  }, [activePresetId, loadAndApplyPreset]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      removePresetCSS();
    };
  }, []);

  const value: PresetContextValue = {
    activePreset,
    activePresetId,
    loading,
    error,
    applyPreset,
    refresh,
  };

  return <PresetContext.Provider value={value}>{children}</PresetContext.Provider>;
}

export function usePresetContext() {
  const context = useContext(PresetContext);
  if (!context) {
    throw new Error('usePresetContext must be used within PresetProvider');
  }
  return context;
}
