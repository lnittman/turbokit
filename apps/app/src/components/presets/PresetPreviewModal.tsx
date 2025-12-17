/**
 * Preset Preview Modal
 *
 * Live preview of a design preset before applying
 */

"use client";

import { Badge } from "@spots/design/components/ui/badge";
import { Button } from "@spots/design/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@spots/design/components/ui/dialog";
import { Icon, IconNames } from "@spots/design/icons";
import type { DesignPreset } from "@spots/design/presets";
import { injectPresetCSS, removePresetCSS } from "@spots/design/presets";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

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
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="flex max-h-[80vh] max-w-4xl flex-col overflow-hidden">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl">{preset.name}</DialogTitle>
              <DialogDescription className="mt-2">
                {preset.description}
              </DialogDescription>
            </div>
            <Button
              onClick={() => setDarkMode(!darkMode)}
              size="sm"
              variant="outline"
            >
              {darkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              {darkMode ? "Light" : "Dark"}
            </Button>
          </div>

          {/* Metadata */}
          <div className="mt-4 flex flex-wrap gap-2">
            {preset.tags.map((tag) => (
              <Badge className="text-xs" key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="mt-2 flex items-center gap-4 text-muted-foreground text-sm">
            <span>by {preset.author}</span>
            <span>•</span>
            <span>v{preset.version}</span>
          </div>
        </DialogHeader>

        {/* Preview Area */}
        <div className="flex-1 space-y-4 overflow-auto rounded-lg border-2 border-border bg-background p-6">
          <div className="space-y-4">
            {/* Sample UI Elements */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Preview</h3>
              <p className="text-muted-foreground text-sm">
                See how the preset looks with various UI elements
              </p>
            </div>

            {/* Sample Card */}
            <div className="space-y-3 rounded-lg border border-border bg-card p-4 text-card-foreground">
              <h4 className="font-semibold">Sample Card</h4>
              <p className="text-muted-foreground text-sm">
                This is how cards will look with this preset applied.
              </p>

              {/* Sample Buttons */}
              <div className="flex flex-wrap gap-2">
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
                <label className="font-medium text-sm">Sample Input</label>
                <input
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  placeholder="Enter text..."
                  readOnly
                  type="text"
                />
              </div>

              {/* Sample Badges */}
              <div className="flex flex-wrap gap-2">
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
                  <div className="h-12 rounded border border-border bg-background" />
                  <p className="text-center text-muted-foreground text-xs">
                    Background
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="h-12 rounded border border-border bg-primary" />
                  <p className="text-center text-muted-foreground text-xs">
                    Primary
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="h-12 rounded border border-border bg-secondary" />
                  <p className="text-center text-muted-foreground text-xs">
                    Secondary
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="h-12 rounded border border-border bg-accent" />
                  <p className="text-center text-muted-foreground text-xs">
                    Accent
                  </p>
                </div>
              </div>
            </div>

            {/* Typography Preview */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Typography</h4>
              <div className="space-y-1">
                <h1 className="font-bold text-4xl">Heading 1</h1>
                <h2 className="font-bold text-3xl">Heading 2</h2>
                <h3 className="font-semibold text-2xl">Heading 3</h3>
                <p className="text-base">
                  Body text with <strong>bold</strong> and <em>italic</em>{" "}
                  variants.
                </p>
                <p className="text-muted-foreground text-sm">
                  Muted text for secondary information.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Cancel
          </Button>
          <Button onClick={onApply}>
            <Icon className="h-4 w-4" name={IconNames.Check} />
            Apply Preset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
