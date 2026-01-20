/**
 * Preset Loader Setup
 *
 * Initializes the hybrid preset loader for the design system
 */

'use client';

import { useEffect } from 'react';
import { setPresetLoader } from '@repo/design/presets';
import { loadPresetHybrid } from '@/lib/preset-registry';

export function PresetLoaderSetup() {
  useEffect(() => {
    // Set up hybrid preset loader (local first, then registry)
    setPresetLoader(loadPresetHybrid);
  }, []);

  return null;
}
