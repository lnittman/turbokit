"use client";

/**
 * Admin Preset Detail Page
 *
 * View and edit a design preset.
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
import { Label } from "@spots/design/components/ui/label";
import { Separator } from "@spots/design/components/ui/separator";
import { Skeleton } from "@spots/design/components/ui/skeleton";
import { Switch } from "@spots/design/components/ui/switch";
import { Textarea } from "@spots/design/components/ui/textarea";
import { api } from "@spots/backend/api";
import { useQuery, useMutation } from "convex/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useToast } from "@spots/design/hooks/use-toast";
import {
  ArrowLeft,
  Copy,
  Globe,
  Lock,
  Loader2,
  Save,
  Star,
  Trash2,
} from "lucide-react";
import type { Id } from "@spots/backend/dataModel";

export default function PresetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const presetId = params.id as Id<"presets">;
  const preset = useQuery(api.app.presets.queries.get, { presetId });
  const updatePreset = useMutation(api.app.presets.mutations.update);
  const removePreset = useMutation(api.app.presets.mutations.remove);
  const duplicatePreset = useMutation(api.app.presets.mutations.duplicate);
  const togglePublic = useMutation(api.app.presets.mutations.togglePublic);
  const setSystemActive = useMutation(api.app.presets.mutations.setSystemActive);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    author: "",
    version: "",
    tags: "",
  });

  useEffect(() => {
    if (preset) {
      setFormData({
        name: preset.name,
        description: preset.description,
        author: preset.author,
        version: preset.version,
        tags: preset.tags.join(", "),
      });
    }
  }, [preset]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updatePreset({
        presetId,
        name: formData.name,
        description: formData.description,
        author: formData.author,
        version: formData.version,
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      toast({
        title: "Preset updated",
        description: "Your changes have been saved.",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this preset?")) return;

    try {
      await removePreset({ presetId });
      toast({
        title: "Preset deleted",
        description: "The preset has been removed.",
      });
      router.push("/admin/presets");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete",
        variant: "destructive",
      });
    }
  };

  const handleDuplicate = async () => {
    const newSlug = prompt("Enter a slug for the new preset:", `${preset?.slug}-copy`);
    if (!newSlug) return;

    try {
      const newPresetId = await duplicatePreset({
        presetId,
        newSlug,
      });
      toast({
        title: "Preset duplicated",
        description: "A copy of the preset has been created.",
      });
      router.push(`/admin/presets/${newPresetId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to duplicate",
        variant: "destructive",
      });
    }
  };

  const handleTogglePublic = async () => {
    try {
      const newStatus = await togglePublic({ presetId });
      toast({
        title: newStatus ? "Made public" : "Made private",
        description: newStatus
          ? "Others can now discover this preset."
          : "Only you can see this preset.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update",
        variant: "destructive",
      });
    }
  };

  const handleSetActive = async () => {
    try {
      await setSystemActive({ presetId });
      toast({
        title: "Active preset updated",
        description: "This preset is now the system default.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to set active",
        variant: "destructive",
      });
    }
  };

  // Loading state
  if (preset === undefined) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild size="icon" variant="ghost">
            <Link href="/admin/presets">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-1 h-4 w-32" />
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not found
  if (preset === null) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild size="icon" variant="ghost">
            <Link href="/admin/presets">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="font-bold text-3xl tracking-tight">Preset Not Found</h1>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">
              This preset doesn't exist or you don't have access to view it.
            </p>
            <Button asChild className="mt-4">
              <Link href="/admin/presets">Back to Presets</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button asChild size="icon" variant="ghost">
          <Link href="/admin/presets">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-bold text-3xl tracking-tight">{preset.name}</h1>
            {preset.isActive && (
              <Star className="h-5 w-5 fill-primary text-primary" />
            )}
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
          <p className="mt-1 font-mono text-muted-foreground text-sm">
            {preset.slug} v{preset.version}
          </p>
        </div>
        <div className="flex gap-2">
          {!isEditing && (
            <>
              <Button onClick={() => setIsEditing(true)} variant="outline">
                Edit
              </Button>
              {!preset.isActive && (
                <Button onClick={handleSetActive} variant="outline">
                  Set Active
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Preset Details</CardTitle>
          <CardDescription>
            Basic information about this design preset
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isEditing ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    value={formData.name}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="version">Version</Label>
                  <Input
                    id="version"
                    onChange={(e) =>
                      setFormData({ ...formData, version: e.target.value })
                    }
                    value={formData.version}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  value={formData.description}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    onChange={(e) =>
                      setFormData({ ...formData, author: e.target.value })
                    }
                    value={formData.author}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    placeholder="minimal, dark, modern"
                    value={formData.tags}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  onClick={() => setIsEditing(false)}
                  type="button"
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button disabled={isSaving} onClick={handleSave}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-sm">{preset.description}</p>
              </div>

              <div className="grid gap-4 text-sm md:grid-cols-2">
                <div>
                  <p className="font-medium text-muted-foreground">Author</p>
                  <p>{preset.author}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Version</p>
                  <p>{preset.version}</p>
                </div>
              </div>

              <div>
                <p className="mb-2 font-medium text-muted-foreground text-sm">
                  Tags
                </p>
                <div className="flex flex-wrap gap-1">
                  {preset.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                  {preset.tags.length === 0 && (
                    <span className="text-muted-foreground text-sm">No tags</span>
                  )}
                </div>
              </div>

              <div className="grid gap-4 text-sm md:grid-cols-2">
                <div>
                  <p className="font-medium text-muted-foreground">Created</p>
                  <p>{new Date(preset.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Updated</p>
                  <p>{new Date(preset.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Design Layers Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Design Layers</CardTitle>
          <CardDescription>
            Preview of the design tokens and configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-muted/50 p-4">
            <pre className="overflow-x-auto text-xs">
              {JSON.stringify(preset.layers, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>Manage this preset</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">Visibility</p>
              <p className="text-muted-foreground text-sm">
                {preset.isPublic
                  ? "This preset is visible to everyone"
                  : "Only you can see this preset"}
              </p>
            </div>
            <Switch
              checked={preset.isPublic}
              onCheckedChange={handleTogglePublic}
            />
          </div>

          <Separator />

          <div className="flex gap-3">
            <Button className="gap-2" onClick={handleDuplicate} variant="outline">
              <Copy className="h-4 w-4" />
              Duplicate
            </Button>
            <Button
              className="gap-2 text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={handleDelete}
              variant="outline"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
