/**
 * API Route: Delete Local Preset
 *
 * Deletes a preset from local .turbokit/presets/ directory
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function DELETE(request: NextRequest) {
  try {
    const { presetId } = await request.json();

    if (!presetId) {
      return NextResponse.json(
        { error: 'Missing presetId' },
        { status: 400 }
      );
    }

    // Delete preset file
    const presetPath = path.join(
      process.cwd(),
      'public',
      '.turbokit',
      'presets',
      `${presetId}.json`
    );

    await fs.unlink(presetPath);

    return NextResponse.json({ success: true, presetId });
  } catch (error) {
    console.error('Error deleting preset:', error);
    return NextResponse.json(
      { error: 'Failed to delete preset' },
      { status: 500 }
    );
  }
}
