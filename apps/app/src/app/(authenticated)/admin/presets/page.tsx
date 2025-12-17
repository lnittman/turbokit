"use client";

/**
 * Admin Presets List Page
 *
 * Manages design system presets and themes.
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
import { Skeleton } from "@spots/design/components/ui/skeleton";
import { api } from "@spots/backend/api";
import { useQuery, useMutation } from "convex/react";
import Link from "next/link";
import { Plus, Star, Globe, Lock, Trash2 } from "lucide-react";
import { useToast } from "@spots/design/hooks/use-toast";

export default function PresetsPage() {
  const presets = useQuery(api.app.presets.queries.list, { includePublic: true });
  const stats = useQuery(api.app.presets.queries.count);
  const activePreset = useQuery(api.app.presets.queries.getActive);
  const removePreset = useMutation(api.app.presets.mutations.remove);
  const setSystemActive = useMutation(api.app.presets.mutations.setSystemActive);
  const { toast } = useToast();

  const handleDelete = async (presetId: string) => {
    try {
      await removePreset({ presetId: presetId as any });
      toast({
        title: "Preset deleted",
        description: "The preset has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete preset",
        variant: "destructive",
      });
    }
  };

  const handleSetActive = async (presetId: string) => {
    try {
      await setSystemActive({ presetId: presetId as any });
      toast({
        title: "Active preset updated",
        description: "The system active preset has been changed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to set active preset",
        variant: "destructive",
      });
    }
  };

  // Loading state
  if (presets === undefined) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-3xl tracking-tight">Design Presets</h1>
            <p className="mt-1 text-muted-foreground">
              Manage your design system presets and themes
            </p>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="mt-1 h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Design Presets</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your design system presets and themes
            {stats && ` (${stats.total} total, ${stats.public} public)`}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/presets/new">
            <Plus className="mr-2 h-4 w-4" />
            New Preset
          </Link>
        </Button>
      </div>

      {/* Active Preset Banner */}
      {activePreset?.preset && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="flex items-center gap-4 p-4">
            <Star className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="font-medium">Active Preset: {activePreset.preset.name}</p>
              <p className="text-muted-foreground text-sm">{activePreset.preset.slug}</p>
            </div>
            <Link
              className="text-primary text-sm hover:underline"
              href={`/admin/presets/${activePreset.preset._id}`}
            >
              View Details →
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Presets Grid */}
      {presets.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">
            No presets yet. Create your first preset to get started.
          </p>
          <Button asChild className="mt-4">
            <Link href="/admin/presets/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Preset
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {presets.map((preset) => (
            <Card key={preset._id} className="group relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {preset.name}
                      {preset.isActive && (
                        <Star className="h-4 w-4 fill-primary text-primary" />
                      )}
                    </CardTitle>
                    <CardDescription className="font-mono text-xs">
                      {preset.slug} v{preset.version}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1">
                    {preset.isPublic ? (
                      <Badge variant="secondary" className="gap-1">
                        <Globe className="h-3 w-3" />
                        Public
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <Lock className="h-3 w-3" />
                        Private
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-2 text-muted-foreground text-sm">
                  {preset.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {preset.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {preset.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{preset.tags.length - 3}
                    </Badge>
                  )}
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/presets/${preset._id}`}>
                      View
                    </Link>
                  </Button>
                  {!preset.isActive && (
                    <Button
                      onClick={() => handleSetActive(preset._id)}
                      size="sm"
                      variant="outline"
                    >
                      Set Active
                    </Button>
                  )}
                  <Button
                    className="ml-auto opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => handleDelete(preset._id)}
                    size="sm"
                    variant="ghost"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
