"use client";

/**
 * User-Facing Preset Gallery
 *
 * Browse and apply design presets to customize your experience.
 * Uses real-time Convex subscription for live updates.
 */

import { Badge } from "@spots/design/components/ui/badge";
import { Button } from "@spots/design/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@spots/design/components/ui/card";
import { Input } from "@spots/design/components/ui/input";
import { Skeleton } from "@spots/design/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@spots/design/components/ui/tabs";
import { api } from "@spots/backend/api";
import { useQuery, useMutation } from "convex/react";
import { Check, Palette, Search, Star, Sparkles } from "lucide-react";
import { useState } from "react";
import { useToast } from "@spots/design/hooks/use-toast";

export default function PresetsGalleryPage() {
  const publicPresets = useQuery(api.app.presets.queries.listPublic, { limit: 50 });
  const userSettings = useQuery(api.app.presets.queries.getUserSettings);
  const activePreset = useQuery(api.app.presets.queries.getActive);
  const setUserActive = useMutation(api.app.presets.mutations.setUserActive);
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const handleApplyPreset = async (presetId: string) => {
    try {
      await setUserActive({ presetId: presetId as any });
      toast({
        title: "Preset applied",
        description: "Your design preset has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to apply preset",
        variant: "destructive",
      });
    }
  };

  const handleClearPreset = async () => {
    try {
      await setUserActive({ presetId: undefined });
      toast({
        title: "Using system default",
        description: "Your preset has been reset to the system default.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reset",
        variant: "destructive",
      });
    }
  };

  // Loading state
  if (publicPresets === undefined) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Design Presets</h1>
          <p className="mt-1 text-muted-foreground">
            Browse and apply design presets to customize your experience
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="mt-1 h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Extract all unique tags for filtering
  const allTags = Array.from(
    new Set(publicPresets.flatMap((p) => p.tags))
  ).sort();

  // Filter presets
  const filteredPresets = publicPresets.filter((preset) => {
    const matchesSearch = searchQuery === "" ||
      preset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      preset.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      preset.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTag = selectedTag === null || preset.tags.includes(selectedTag);

    return matchesSearch && matchesTag;
  });

  const activePresetId = userSettings?.activePresetId || activePreset?.preset?._id;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Design Presets</h1>
          <p className="mt-1 text-muted-foreground">
            Browse and apply design presets to customize your experience
          </p>
        </div>
        {userSettings?.activePresetId && (
          <Button onClick={handleClearPreset} variant="outline">
            Reset to Default
          </Button>
        )}
      </div>

      {/* Current Preset Banner */}
      {activePreset?.preset && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Star className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium">
                Currently Using: {activePreset.preset.name}
                {userSettings?.activePresetId === activePreset.preset._id && (
                  <Badge className="ml-2" variant="secondary">Your Choice</Badge>
                )}
              </p>
              <p className="text-muted-foreground text-sm">
                {activePreset.preset.description}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search presets..."
            value={searchQuery}
          />
        </div>
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setSelectedTag(null)}
              size="sm"
              variant={selectedTag === null ? "default" : "outline"}
            >
              All
            </Button>
            {allTags.slice(0, 5).map((tag) => (
              <Button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                size="sm"
                variant={selectedTag === tag ? "default" : "outline"}
              >
                {tag}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Presets Grid */}
      {filteredPresets.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <Palette className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">
              {searchQuery || selectedTag
                ? "No presets match your search criteria."
                : "No public presets available yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPresets.map((preset) => {
            const isActive = activePresetId === preset._id;
            const previewColors = preset.preview as { primaryColor?: string; backgroundColor?: string } | undefined;

            return (
              <Card
                key={preset._id}
                className={`group transition-colors ${isActive ? "border-primary ring-1 ring-primary" : "hover:border-primary/50"}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        {preset.name}
                        {isActive && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        by {preset.author}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="font-mono text-xs">
                      v{preset.version}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Color Preview */}
                  <div className="flex h-16 overflow-hidden rounded-lg border">
                    <div
                      className="w-1/2"
                      style={{
                        backgroundColor: previewColors?.backgroundColor || "#f5f5f4",
                      }}
                    />
                    <div
                      className="w-1/2"
                      style={{
                        backgroundColor: previewColors?.primaryColor || "#1c1917",
                      }}
                    />
                  </div>

                  <p className="line-clamp-2 text-muted-foreground text-sm">
                    {preset.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {preset.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {preset.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{preset.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* Action */}
                  <Button
                    className="w-full"
                    disabled={isActive}
                    onClick={() => handleApplyPreset(preset._id)}
                    variant={isActive ? "secondary" : "default"}
                  >
                    {isActive ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Active
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Apply Preset
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Info Section */}
      <Card className="bg-muted/30">
        <CardContent className="flex items-start gap-4 p-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Palette className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">About Design Presets</h3>
            <p className="mt-1 text-muted-foreground text-sm">
              Design presets customize the look and feel of your experience. Each preset
              includes color schemes, typography settings, and visual effects. You can
              switch presets at any time, and your choice is saved to your account.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
