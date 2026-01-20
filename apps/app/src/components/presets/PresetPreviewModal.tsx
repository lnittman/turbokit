/**
 * Preset Preview Modal
 *
 * Live preview of a design preset before applying
 */

"use client";

import { useState, useEffect } from "react";
import { Icon, IconNames } from "@repo/design/icons";
import { Button } from "@repo/design/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/design/components/ui/dialog";
import { Badge } from "@repo/design/components/ui/badge";
import type { DesignPreset } from "@repo/design/presets";
import { injectPresetCSS, removePresetCSS } from "@repo/design/presets";

export interface PresetPreviewModalProps {
  preset: DesignPreset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: () => void;
}

export function PresetPreviewModal({
  preset,
  open,
  onOpenChange,
  onApply,
}: PresetPreviewModalProps) {
  const [darkMode, setDarkMode] = useState(false);

  // Apply preview when modal opens
  useEffect(() => {
    if (open && preset) {
      // Create a temporary body class for preview
      const previewClass = `preset-${preset.id}-preview`;

      // Add preview class
      document.body.classList.add(previewClass);

      // Inject CSS temporarily
      injectPresetCSS(preset);

      return () => {
        // Cleanup when modal closes
        document.body.classList.remove(previewClass);
        removePresetCSS();
      };
    }
  }, [open, preset]);

  // Toggle dark mode class
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  if (!preset) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl">{preset.name}</DialogTitle>
              <DialogDescription className="mt-2">
                {preset.description}
              </DialogDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDarkMode(!darkMode)}
            >
              <Icon
                name={darkMode ? IconNames.Sun : IconNames.Moon}
                className="h-4 w-4"
              />
              {darkMode ? "Light" : "Dark"}
            </Button>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-2 mt-4">
            {preset.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
            <span>by {preset.author}</span>
            <span>•</span>
            <span>v{preset.version}</span>
          </div>
        </DialogHeader>

        {/* Preview Area */}
        <div className="flex-1 overflow-auto rounded-lg border-2 border-border bg-background p-6 space-y-4">
          <div className="space-y-4">
            {/* Sample UI Elements */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Preview</h3>
              <p className="text-sm text-muted-foreground">
                See how the preset looks with various UI elements
              </p>
            </div>

            {/* Sample Card */}
            <div className="bg-card text-card-foreground rounded-lg border border-border p-4 space-y-3">
              <h4 className="font-semibold">Sample Card</h4>
              <p className="text-sm text-muted-foreground">
                This is how cards will look with this preset applied.
              </p>

              {/* Sample Buttons */}
              <div className="flex gap-2 flex-wrap">
                <Button size="sm">Primary</Button>
                <Button size="sm" variant="secondary">
                  Secondary
                </Button>
                <Button size="sm" variant="outline">
                  Outline
                </Button>
                <Button size="sm" variant="ghost">
                  Ghost
                </Button>
              </div>

              {/* Sample Input */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Sample Input</label>
                <input
                  type="text"
                  placeholder="Enter text..."
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  readOnly
                />
              </div>

              {/* Sample Badges */}
              <div className="flex gap-2 flex-wrap">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </div>
            </div>

            {/* Color Preview */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Color Palette</h4>
              <div className="grid grid-cols-4 gap-2">
                <div className="space-y-1">
                  <div className="h-12 rounded bg-background border border-border" />
                  <p className="text-xs text-center text-muted-foreground">
                    Background
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="h-12 rounded bg-primary border border-border" />
                  <p className="text-xs text-center text-muted-foreground">
                    Primary
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="h-12 rounded bg-secondary border border-border" />
                  <p className="text-xs text-center text-muted-foreground">
                    Secondary
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="h-12 rounded bg-accent border border-border" />
                  <p className="text-xs text-center text-muted-foreground">
                    Accent
                  </p>
                </div>
              </div>
            </div>

            {/* Typography Preview */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Typography</h4>
              <div className="space-y-1">
                <h1 className="text-4xl font-bold">Heading 1</h1>
                <h2 className="text-3xl font-bold">Heading 2</h2>
                <h3 className="text-2xl font-semibold">Heading 3</h3>
                <p className="text-base">
                  Body text with <strong>bold</strong> and{" "}
                  <em>italic</em> variants.
                </p>
                <p className="text-sm text-muted-foreground">
                  Muted text for secondary information.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={onApply}>
            <Icon name={IconNames.Check} className="h-4 w-4" />
            Apply Preset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
