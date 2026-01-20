/**
 * Admin New Preset Page
 *
 * Create a new design preset
 */

"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon, IconNames } from "@repo/design/icons";
import { Button } from "@repo/design/components/ui/button";
import { Input } from "@repo/design/components/ui/input";
import { Textarea } from "@repo/design/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/design/components/ui/card";
import { Label } from "@repo/design/components/ui/label";
import { useToast } from "@repo/design/hooks/use-toast";
import { Checkbox } from "@repo/design/components/ui/checkbox";

export default function NewPresetPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Form state
  const [presetId, setPresetId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("");
  const [tags, setTags] = useState("");
  const [version, setVersion] = useState("1.0.0");
  const [isPublic, setIsPublic] = useState(false);
  const [isBuiltin, setIsBuiltin] = useState(false);
  const [presetJson, setPresetJson] = useState("");

  // Mutations
  const createPreset = useMutation(api.app.presets.mutations.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!presetId || !name || !description || !author || !presetJson) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate and parse JSON
    let presetData;
    try {
      presetData = JSON.parse(presetJson);
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "The preset configuration is not valid JSON",
        variant: "destructive",
      });
      return;
    }

    // Validate preset ID format (kebab-case)
    if (!/^[a-z0-9-]+$/.test(presetId)) {
      toast({
        title: "Invalid Preset ID",
        description: "Preset ID must be lowercase letters, numbers, and hyphens only",
        variant: "destructive",
      });
      return;
    }

    try {
      await createPreset({
        presetId,
        name,
        description,
        author,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        version,
        preset: presetData,
        isPublic,
        isBuiltin,
      });

      toast({
        title: "Preset created",
        description: `"${name}" has been created successfully`,
      });

      router.push("/admin/presets");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create preset",
        variant: "destructive",
      });
    }
  };

  const handleLoadTemplate = () => {
    const template = {
      id: presetId || "my-preset",
      name: name || "My Preset",
      description: description || "A custom design preset",
      author: author || "Author Name",
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean) || ["custom"],
      version: version || "1.0.0",
      layers: {
        tokens: {
          colors: {
            semantic: {
              background: "oklch(0.98 0.005 85)",
              foreground: "oklch(0.2 0.01 85)",
            },
          },
          radius: {
            DEFAULT: "0.5rem",
          },
        },
      },
      metadata: {
        category: "custom",
        compatibility: ["next-15", "react-19"],
      },
    };

    setPresetJson(JSON.stringify(template, null, 2));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/presets">
            <Icon name={IconNames.ArrowLeft} className="h-4 w-4" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Preset</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Add a new design preset to your registry
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Metadata Card */}
        <Card>
          <CardHeader>
            <CardTitle>Preset Metadata</CardTitle>
            <CardDescription>
              Basic information about your design preset
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="presetId">
                  Preset ID <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="presetId"
                  value={presetId}
                  onChange={(e) => setPresetId(e.target.value)}
                  placeholder="my-custom-preset"
                  className="font-mono"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Lowercase letters, numbers, and hyphens only
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="1.0.0"
                  className="font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Custom Preset"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A beautiful design system with..."
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">
                Author <span className="text-destructive">*</span>
              </Label>
              <Input
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Your Name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="minimal, dark, ios"
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated tags for discovery
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPublic"
                  checked={isPublic}
                  onCheckedChange={(checked) => setIsPublic(checked as boolean)}
                />
                <Label htmlFor="isPublic" className="cursor-pointer font-normal">
                  Make this preset public
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isBuiltin"
                  checked={isBuiltin}
                  onCheckedChange={(checked) => setIsBuiltin(checked as boolean)}
                />
                <Label htmlFor="isBuiltin" className="cursor-pointer font-normal">
                  Mark as built-in (official TurboKit preset)
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preset Configuration Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Preset Configuration</CardTitle>
                <CardDescription>
                  Complete preset JSON definition
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleLoadTemplate}
              >
                <Icon name={IconNames.Code} className="h-4 w-4" />
                Load Template
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={presetJson}
              onChange={(e) => setPresetJson(e.target.value)}
              placeholder='{"layers": {...}, "metadata": {...}}'
              className="font-mono text-xs min-h-[400px]"
              required
            />
            <p className="text-xs text-muted-foreground mt-2">
              Paste your preset JSON here or use the template button to get started
            </p>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/presets">Cancel</Link>
          </Button>
          <Button type="submit">
            <Icon name={IconNames.Plus} className="h-4 w-4" />
            Create Preset
          </Button>
        </div>
      </form>
    </div>
  );
}
