"use client";

/**
 * Admin New Preset Page
 *
 * Form for creating new design presets.
 */

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
import { Switch } from "@spots/design/components/ui/switch";
import { Textarea } from "@spots/design/components/ui/textarea";
import { api } from "@spots/backend/api";
import { useMutation } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@spots/design/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function NewPresetPage() {
  const router = useRouter();
  const { toast } = useToast();
  const createPreset = useMutation(api.app.presets.mutations.create);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    slug: "",
    name: "",
    description: "",
    author: "",
    version: "1.0.0",
    tags: "",
    isPublic: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const presetId = await createPreset({
        slug: formData.slug,
        name: formData.name,
        description: formData.description,
        author: formData.author,
        version: formData.version,
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        isPublic: formData.isPublic,
        layers: {
          tokens: {
            colors: {
              semantic: {
                background: "oklch(0.98 0.005 85)",
                foreground: "oklch(0.2 0.01 85)",
                primary: "oklch(0.22 0.01 85)",
                "primary-foreground": "oklch(0.97 0.005 85)",
                secondary: "oklch(0.94 0.01 85)",
                "secondary-foreground": "oklch(0.22 0.01 85)",
                muted: "oklch(0.94 0.01 85)",
                "muted-foreground": "oklch(0.55 0.01 85)",
                accent: "oklch(0.9 0.02 85)",
                "accent-foreground": "oklch(0.22 0.01 85)",
                destructive: "oklch(0.577 0.08 27.325)",
                "destructive-foreground": "oklch(0.97 0.005 85)",
                border: "oklch(0.9 0.01 85)",
                input: "oklch(0.94 0.01 85)",
                ring: "oklch(0.7 0.01 85)",
                card: "oklch(1 0.005 85)",
                "card-foreground": "oklch(0.2 0.01 85)",
                popover: "oklch(1 0.005 85)",
                "popover-foreground": "oklch(0.2 0.01 85)",
              },
            },
            spacing: { unit: "0.25rem" },
            radius: { DEFAULT: "0.5rem" },
            fonts: { sans: "var(--font-geist-sans)" },
            shadows: {},
          },
        },
      });

      toast({
        title: "Preset created",
        description: "Your new preset has been created successfully.",
      });

      router.push(`/admin/presets/${presetId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create preset",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild size="icon" variant="ghost">
          <Link href="/admin/presets">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Create New Preset</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Add a new design preset to your registry
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Preset Details</CardTitle>
          <CardDescription>
            Define the basic information for your design preset
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData({
                      ...formData,
                      name,
                      slug: formData.slug || generateSlug(name),
                    });
                  }}
                  placeholder="My Preset"
                  required
                  value={formData.name}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  pattern="^[a-z0-9]+(-[a-z0-9]+)*$"
                  placeholder="my-preset"
                  required
                  title="Lowercase letters, numbers, and hyphens only"
                  value={formData.slug}
                />
                <p className="text-muted-foreground text-xs">
                  Unique identifier (kebab-case)
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="A beautiful design preset with warm colors..."
                required
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
                  placeholder="Your Name"
                  required
                  value={formData.author}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  onChange={(e) =>
                    setFormData({ ...formData, version: e.target.value })
                  }
                  pattern="^\d+\.\d+\.\d+$"
                  placeholder="1.0.0"
                  required
                  title="Semantic version (e.g., 1.0.0)"
                  value={formData.version}
                />
              </div>
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
              <p className="text-muted-foreground text-xs">
                Comma-separated list of tags
              </p>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="isPublic">Make Public</Label>
                <p className="text-muted-foreground text-sm">
                  Allow others to discover and use this preset
                </p>
              </div>
              <Switch
                checked={formData.isPublic}
                id="isPublic"
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isPublic: checked })
                }
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button asChild type="button" variant="outline">
                <Link href="/admin/presets">Cancel</Link>
              </Button>
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Preset"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">What's next?</CardTitle>
          <CardDescription>
            After creating your preset, you can customize its design layers
          </CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          <ul className="list-inside list-disc space-y-1">
            <li>Edit color tokens (background, foreground, primary, etc.)</li>
            <li>Configure typography (fonts, sizes, weights)</li>
            <li>Set spacing and border radius values</li>
            <li>Define animations and transitions</li>
            <li>Customize component variants</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
