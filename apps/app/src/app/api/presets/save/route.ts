/**
 * API Route: Save Preset to Disk
 *
 * Saves a preset from the registry to local .turbokit/presets/ directory
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { presetId, preset } = await request.json();

    if (!presetId || !preset) {
      return NextResponse.json(
        { error: 'Missing presetId or preset data' },
        { status: 400 }
      );
    }

    // Ensure .turbokit/presets directory exists
    const presetsDir = path.join(process.cwd(), 'public', '.turbokit', 'presets');
    await fs.mkdir(presetsDir, { recursive: true });

    // Write preset file
    const presetPath = path.join(presetsDir, `${presetId}.json`);
    await fs.writeFile(presetPath, JSON.stringify(preset, null, 2), 'utf-8');

    return NextResponse.json({ success: true, presetId });
  } catch (error) {
    console.error('Error saving preset:', error);
    return NextResponse.json(
      { error: 'Failed to save preset' },
      { status: 500 }
    );
  }
}
