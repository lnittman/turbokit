/**
 * Admin Preset Detail Page
 *
 * View and edit a specific design preset
 */

"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import type { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { Icon, IconNames } from "@repo/design/icons";
import { Button } from "@repo/design/components/ui/button";
import { Input } from "@repo/design/components/ui/input";
import { Textarea } from "@repo/design/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/design/components/ui/card";
import { Badge } from "@repo/design/components/ui/badge";
import { Label } from "@repo/design/components/ui/label";
import { useToast } from "@repo/design/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@repo/design/components/ui/alert-dialog";

export default function PresetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const presetId = params.id as Id<"presets">;

  // State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTags, setEditTags] = useState("");

  // Queries
  const preset = useQuery(api.app.presets.queries.get, {
    presetId: presetId as any, // Cast for now - need to handle string presetId
  });

  // Mutations
  const updatePreset = useMutation(api.app.presets.mutations.update);
  const deletePreset = useMutation(api.app.presets.mutations.deletePreset);
  const publishPreset = useMutation(api.app.presets.mutations.publish);
  const unpublishPreset = useMutation(api.app.presets.mutations.unpublish);

  // Initialize edit form when preset loads
  if (preset && !isEditing && !editName) {
    setEditName(preset.name);
    setEditDescription(preset.description);
    setEditTags(preset.tags.join(", "));
  }

  const handleSave = async () => {
    if (!preset) return;

    try {
      await updatePreset({
        id: preset._id,
        name: editName,
        description: editDescription,
        tags: editTags.split(",").map((t) => t.trim()).filter(Boolean),
      });

      toast({
        title: "Preset updated",
        description: "Your changes have been saved successfully.",
      });

      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update preset",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!preset) return;

    try {
      await deletePreset({ id: preset._id });

      toast({
        title: "Preset deleted",
        description: "The preset has been permanently deleted.",
      });

      router.push("/admin/presets");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete preset",
        variant: "destructive",
      });
    }
  };

  const handleTogglePublish = async () => {
    if (!preset) return;

    try {
      if (preset.isPublic) {
        await unpublishPreset({ id: preset._id });
        toast({
          title: "Preset unpublished",
          description: "The preset is now private.",
        });
      } else {
        await publishPreset({ id: preset._id });
        toast({
          title: "Preset published",
          description: "The preset is now public.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update publish status",
        variant: "destructive",
      });
    }
  };

  if (!preset) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/presets">
              <Icon name={IconNames.ArrowLeft} className="h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-24 bg-muted rounded" />
          <div className="h-96 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/presets">
              <Icon name={IconNames.ArrowLeft} className="h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{preset.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              ID: {preset.presetId} · v{preset.version}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={preset.isPublic ? "secondary" : "default"}
            size="sm"
            onClick={handleTogglePublish}
          >
            <Icon
              name={preset.isPublic ? IconNames.Lock : IconNames.Globe}
              className="h-4 w-4"
            />
            {preset.isPublic ? "Unpublish" : "Publish"}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Icon name={IconNames.Trash} className="h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Preset</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete &quot;{preset.name}&quot;? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Metadata Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Metadata</CardTitle>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Icon name={IconNames.Pencil} className="h-4 w-4" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false);
                        setEditName(preset.name);
                        setEditDescription(preset.description);
                        setEditTags(preset.tags.join(", "));
                      }}
                    >
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave}>
                      Save
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                ) : (
                  <p className="text-sm">{preset.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                {isEditing ? (
                  <Textarea
                    id="description"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {preset.description}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                {isEditing ? (
                  <Input
                    id="tags"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    placeholder="ios, minimal, dark"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {preset.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Preset Data Card */}
          <Card>
            <CardHeader>
              <CardTitle>Preset Configuration</CardTitle>
              <CardDescription>
                Complete preset JSON definition
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono max-h-96 overflow-y-auto">
                {JSON.stringify(preset.preset, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Downloads</span>
                <span className="font-mono font-medium">{preset.downloads}</span>
              </div>
              {preset.rating && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Rating</span>
                  <div className="flex items-center gap-1">
                    <Icon name={IconNames.Star} className="h-4 w-4 text-yellow-500" />
                    <span className="font-mono font-medium">
                      {preset.rating.toFixed(1)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({preset.ratingCount})
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Author</span>
                <p className="font-medium">{preset.author}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Version</span>
                <p className="font-mono font-medium">{preset.version}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Created</span>
                <p className="font-mono text-xs">
                  {new Date(preset.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Updated</span>
                <p className="font-mono text-xs">
                  {new Date(preset.updatedAt).toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Status</span>
                <div className="mt-1 flex flex-wrap gap-2">
                  {preset.isPublic && (
                    <Badge variant="default">Public</Badge>
                  )}
                  {preset.isBuiltin && (
                    <Badge variant="secondary">Built-in</Badge>
                  )}
                  {!preset.isPublic && !preset.isBuiltin && (
                    <Badge variant="outline">Private</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Icon name={IconNames.Eye} className="h-4 w-4" />
                Preview Preset
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Icon name={IconNames.Download} className="h-4 w-4" />
                Export JSON
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Icon name={IconNames.Copy} className="h-4 w-4" />
                Duplicate
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
