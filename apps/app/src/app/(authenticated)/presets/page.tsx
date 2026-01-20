/**
 * User-Facing Preset Gallery
 *
 * Browse and apply design presets - Linear-style list view
 */

"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { Icon, IconNames } from "@repo/design/icons";
import { Button } from "@repo/design/components/ui/button";
import { Input } from "@repo/design/components/ui/input";
import { Badge } from "@repo/design/components/ui/badge";
import { useToast } from "@repo/design/hooks/use-toast";
import { usePresetContext } from "@repo/design/presets";
import type { DesignPreset } from "@repo/design/presets";
import { PresetPreviewModal } from "@/components/presets/PresetPreviewModal";
import { registryClient } from "@/lib/registry-client";
import { registryApi } from "@/lib/registry-api";
import { ConvexProvider } from "convex/react";
import {
  savePresetLocally,
  isPresetSavedLocally,
  deleteLocalPreset,
  loadPresetHybrid,
} from "@/lib/preset-registry";

function PresetsGalleryContent() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const { activePresetId, applyPreset: contextApplyPreset, loading: contextLoading } = usePresetContext();
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [previewPreset, setPreviewPreset] = useState<DesignPreset | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [savedLocally, setSavedLocally] = useState<Set<string>>(new Set());
  const [savingPreset, setSavingPreset] = useState<string | null>(null);

  // Load presets from global registry
  const registryPresets = useQuery(registryApi.queries.listPresets, {
    filter: "all",
  });

  // Check which presets are saved locally
  useEffect(() => {
    async function checkLocalPresets() {
      if (!registryPresets) return;

      const saved = new Set<string>();
      await Promise.all(
        registryPresets.map(async (preset) => {
          const isSaved = await isPresetSavedLocally(preset.presetId);
          if (isSaved) {
            saved.add(preset.presetId);
          }
        })
      );
      setSavedLocally(saved);
    }

    checkLocalPresets();
  }, [registryPresets]);

  const handleApplyPreset = async (presetId: string) => {
    try {
      await contextApplyPreset(presetId);

      toast({
        title: "Preset applied",
        description: `Successfully applied "${presetId}" preset`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to apply preset",
        variant: "destructive",
      });
    }
  };

  const handlePreviewPreset = async (presetId: string) => {
    try {
      const preset = await loadPresetHybrid(presetId);
      if (preset) {
        setPreviewPreset(preset);
        setPreviewOpen(true);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load preset for preview",
        variant: "destructive",
      });
    }
  };

  const handleApplyFromPreview = async () => {
    if (previewPreset) {
      await handleApplyPreset(previewPreset.id);
      setPreviewOpen(false);
      setPreviewPreset(null);
    }
  };

  const handleSaveLocally = async (presetId: string) => {
    try {
      setSavingPreset(presetId);

      const presetData = registryPresets?.find(p => p.presetId === presetId);
      if (!presetData || !presetData.preset) {
        throw new Error('Preset not found');
      }

      await savePresetLocally(presetId, presetData.preset);
      setSavedLocally(prev => new Set(prev).add(presetId));

      toast({
        title: "Saved locally",
        description: `"${presetData.name}" has been saved to your local presets`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save preset",
        variant: "destructive",
      });
    } finally {
      setSavingPreset(null);
    }
  };

  const handleDeleteLocal = async (presetId: string) => {
    try {
      await deleteLocalPreset(presetId);
      setSavedLocally(prev => {
        const newSet = new Set(prev);
        newSet.delete(presetId);
        return newSet;
      });

      toast({
        title: "Removed",
        description: "Preset removed from local storage",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete preset",
        variant: "destructive",
      });
    }
  };

  // Filter presets based on search
  const filteredPresets = registryPresets?.filter((preset) => {
    const query = searchQuery.toLowerCase();
    return (
      preset.name.toLowerCase().includes(query) ||
      preset.description.toLowerCase().includes(query) ||
      preset.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }) || [];

  // Get selected preset details
  const selected = selectedPreset
    ? registryPresets?.find(p => p.presetId === selectedPreset)
    : null;

  if (!registryPresets || contextLoading) {
    return (
      <div className="flex h-screen">
        <div className="w-full animate-pulse p-8">
          <div className="h-8 bg-muted rounded w-1/4 mb-6" />
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* List View */}
      <div className="flex-1 flex flex-col border-r">
        {/* Header */}
        <div className="border-b px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-semibold">Presets</h1>
            <div className="text-sm text-muted-foreground">
              {filteredPresets.length} presets
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Icon
              name={IconNames.MagnifyingGlass}
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            />
            <Input
              placeholder="Search presets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filteredPresets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Icon
                name={IconNames.MagnifyingGlass}
                className="h-12 w-12 text-muted-foreground mb-3"
              />
              <p className="text-sm text-muted-foreground">
                No presets found matching your search.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredPresets.map((preset) => {
                const isActive = preset.presetId === activePresetId;
                const isSaved = savedLocally.has(preset.presetId);
                const isSelected = selectedPreset === preset.presetId;

                return (
                  <button
                    key={preset.presetId}
                    onClick={() => setSelectedPreset(preset.presetId)}
                    className={`w-full px-6 py-4 text-left hover:bg-muted/50 transition-colors ${
                      isSelected ? "bg-muted" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium truncate">{preset.name}</h3>
                          {isActive && (
                            <Badge variant="default" className="text-xs">
                              Active
                            </Badge>
                          )}
                          {isSaved && (
                            <Badge variant="outline" className="text-xs">
                              Saved
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {preset.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {preset.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                          {preset.tags.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{preset.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Color Preview */}
                      {preset.preset?.preview && (
                        <div className="flex gap-1 shrink-0">
                          <div
                            className="w-8 h-8 rounded border"
                            style={{
                              backgroundColor: preset.preset.preview.light.background,
                            }}
                          />
                          <div
                            className="w-8 h-8 rounded border"
                            style={{
                              backgroundColor: preset.preset.preview.light.accent,
                            }}
                          />
                          <div
                            className="w-8 h-8 rounded border"
                            style={{
                              backgroundColor: preset.preset.preview.dark.background,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Detail Panel */}
      {selected ? (
        <div className="w-96 flex flex-col">
          {/* Detail Header */}
          <div className="border-b px-6 py-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h2 className="text-lg font-semibold mb-1">{selected.name}</h2>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>by {selected.author}</span>
                  <span>•</span>
                  <span>v{selected.version}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPreset(null)}
              >
                <Icon name={IconNames.X} className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {selected.description}
            </p>
          </div>

          {/* Detail Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Preview Colors */}
            {selected.preset?.preview && (
              <div>
                <h3 className="text-sm font-medium mb-3">Color Preview</h3>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div
                      className="flex-1 h-20 rounded border flex items-center justify-center text-xs"
                      style={{
                        backgroundColor: selected.preset.preview.light.background,
                        color: selected.preset.preview.light.foreground,
                      }}
                    >
                      Light BG
                    </div>
                    <div
                      className="flex-1 h-20 rounded border flex items-center justify-center text-xs"
                      style={{
                        backgroundColor: selected.preset.preview.light.accent,
                        color: "#fff",
                      }}
                    >
                      Accent
                    </div>
                  </div>
                  <div
                    className="w-full h-20 rounded border flex items-center justify-center text-xs"
                    style={{
                      backgroundColor: selected.preset.preview.dark.background,
                      color: selected.preset.preview.dark.foreground,
                    }}
                  >
                    Dark BG
                  </div>
                </div>
              </div>
            )}

            {/* Tags */}
            <div>
              <h3 className="text-sm font-medium mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {selected.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div>
              <h3 className="text-sm font-medium mb-3">Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Downloads</span>
                  <span>{selected.downloads.toLocaleString()}</span>
                </div>
                {selected.rating && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rating</span>
                    <span>{selected.rating.toFixed(1)} / 5</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t p-4 space-y-2">
            {selected.presetId === activePresetId ? (
              <Button variant="outline" className="w-full" disabled>
                <Icon name={IconNames.Check} className="h-4 w-4 mr-2" />
                Applied
              </Button>
            ) : (
              <>
                <Button
                  className="w-full"
                  onClick={() => handleApplyPreset(selected.presetId)}
                >
                  <Icon name={IconNames.Palette} className="h-4 w-4 mr-2" />
                  Apply Preset
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handlePreviewPreset(selected.presetId)}
                >
                  <Icon name={IconNames.Eye} className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </>
            )}

            {savedLocally.has(selected.presetId) ? (
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => handleDeleteLocal(selected.presetId)}
              >
                <Icon name={IconNames.Trash} className="h-4 w-4 mr-2" />
                Remove from local storage
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => handleSaveLocally(selected.presetId)}
                disabled={savingPreset === selected.presetId}
              >
                <Icon name={IconNames.Download} className="h-4 w-4 mr-2" />
                {savingPreset === selected.presetId ? "Saving..." : "Save locally"}
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="w-96 flex items-center justify-center text-center p-8">
          <div>
            <Icon name={IconNames.Palette} className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Select a preset to view details
            </p>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <PresetPreviewModal
        preset={previewPreset}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        onApply={handleApplyFromPreview}
      />
    </div>
  );
}

export default function PresetsGalleryPage() {
  return (
    <ConvexProvider client={registryClient}>
      <PresetsGalleryContent />
    </ConvexProvider>
  );
}
