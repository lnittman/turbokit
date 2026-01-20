/**
 * TurboKit Preset Registry Integration
 *
 * Hybrid preset loading:
 * 1. Check local saved presets first (.turbokit/presets/)
 * 2. Fall back to global registry
 * 3. Allow saving registry presets locally
 */

import { registryClient } from './registry-client';
import { registryApi } from './registry-api';
import type { DesignPreset } from '@repo/design/presets';

/**
 * Load a preset from local storage or registry
 */
export async function loadPresetHybrid(presetId: string): Promise<DesignPreset | null> {
  // Try local file first
  try {
    const response = await fetch(`/.turbokit/presets/${presetId}.json`);
    if (response.ok) {
      const data = await response.json();
      // Local files store the preset directly
      return data as DesignPreset;
    }
  } catch {
    // Fall through to registry
  }

  // Fall back to registry
  try {
    const registryData = await registryClient.query(registryApi.queries.getPreset, { presetId });
    if (registryData && registryData.preset) {
      // Registry wraps preset in a metadata object
      // Extract just the preset data
      return registryData.preset as DesignPreset;
    }
  } catch (error) {
    console.error('Error loading preset from registry:', error);
    return null;
  }

  return null;
}

/**
 * Save a preset to local disk
 */
export async function savePresetLocally(presetId: string, preset: DesignPreset): Promise<void> {
  try {
    const response = await fetch('/api/presets/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        presetId,
        preset,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save preset');
    }
  } catch (error) {
    console.error('Error saving preset:', error);
    throw error;
  }
}

/**
 * Check if a preset is saved locally
 */
export async function isPresetSavedLocally(presetId: string): Promise<boolean> {
  try {
    const response = await fetch(`/.turbokit/presets/${presetId}.json`, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Delete a locally saved preset
 */
export async function deleteLocalPreset(presetId: string): Promise<void> {
  try {
    const response = await fetch('/api/presets/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ presetId }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete preset');
    }
  } catch (error) {
    console.error('Error deleting preset:', error);
    throw error;
  }
}
