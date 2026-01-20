/**
 * Admin Presets List Page
 *
 * Browse, search, and manage design presets
 */

"use client";

import { useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Icon, IconNames } from "@repo/design/icons";
import { Button } from "@repo/design/components/ui/button";
import { Input } from "@repo/design/components/ui/input";
import { useToast } from "@repo/design/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/design/components/ui/card";
import { Badge } from "@repo/design/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/design/components/ui/select";

export default function PresetsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBuiltin, setFilterBuiltin] = useState<
    "all" | "builtin" | "custom"
  >("all");
  const [isSeeding, setIsSeeding] = useState(false);

  // Query all presets
  const allPresets = useQuery(api.app.presets.queries.list, {});

  // Seed action
  const seedBuiltinPresets = useAction(api.app.presets.actions.seedBuiltinPresets);

  // Handle seeding built-in presets
  const handleSeedPresets = async () => {
    setIsSeeding(true);
    try {
      const result = await seedBuiltinPresets();

      toast({
        title: "Seed completed",
        description: `Seeded ${result.seeded} preset(s), skipped ${result.skipped} existing preset(s).`,
      });
    } catch (error) {
      toast({
        title: "Seed failed",
        description: error instanceof Error ? error.message : "Failed to seed presets",
        variant: "destructive",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  // Filter presets based on search and filters
  const filteredPresets = allPresets?.filter((preset) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        preset.name.toLowerCase().includes(query) ||
        preset.description.toLowerCase().includes(query) ||
        preset.tags.some((tag) => tag.toLowerCase().includes(query));
      if (!matchesSearch) return false;
    }

    // Builtin filter
    if (filterBuiltin === "builtin" && !preset.isBuiltin) return false;
    if (filterBuiltin === "custom" && preset.isBuiltin) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Design Presets</h1>
          <p className="text-muted-foreground mt-1">
            Manage your design system presets and themes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleSeedPresets}
            disabled={isSeeding}
          >
            <Icon name={IconNames.Database} className="h-4 w-4" />
            {isSeeding ? "Seeding..." : "Seed Built-in Presets"}
          </Button>
          <Button asChild>
            <Link href="/admin/presets/new">
              <Icon name={IconNames.Plus} className="h-4 w-4" />
              Create Preset
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Search presets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <Select
          value={filterBuiltin}
          onValueChange={(value) =>
            setFilterBuiltin(value as "all" | "builtin" | "custom")
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Presets</SelectItem>
            <SelectItem value="builtin">Built-in Only</SelectItem>
            <SelectItem value="custom">Custom Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Presets Grid */}
      {!filteredPresets ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-full mt-2" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPresets.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Icon
              name={IconNames.MagnifyingGlass}
              className="h-12 w-12 text-muted-foreground mb-4"
            />
            <p className="text-muted-foreground text-center">
              No presets found.{" "}
              {searchQuery && "Try adjusting your search."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPresets.map((preset) => (
            <Card
              key={preset._id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">{preset.name}</CardTitle>
                  {preset.isBuiltin && (
                    <Badge variant="secondary" className="text-xs">
                      Built-in
                    </Badge>
                  )}
                </div>
                <CardDescription className="line-clamp-2">
                  {preset.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Tags */}
                {preset.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {preset.tags.slice(0, 3).map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-xs font-normal"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {preset.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs font-normal">
                        +{preset.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Icon name={IconNames.Download} className="h-3.5 w-3.5" />
                    {preset.downloads}
                  </div>
                  {preset.rating && (
                    <div className="flex items-center gap-1">
                      <Icon name={IconNames.Star} className="h-3.5 w-3.5" />
                      {preset.rating.toFixed(1)}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Icon name={IconNames.User} className="h-3.5 w-3.5" />
                    {preset.author}
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2">
                  {preset.isPublic ? (
                    <Badge variant="default" className="text-xs">
                      <Icon
                        name={IconNames.Globe}
                        className="h-3 w-3 mr-1"
                      />
                      Public
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      <Icon
                        name={IconNames.Lock}
                        className="h-3 w-3 mr-1"
                      />
                      Private
                    </Badge>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex gap-2">
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <Link href={`/admin/presets/${preset._id}`}>
                    <Icon name={IconNames.Pencil} className="h-3.5 w-3.5" />
                    Edit
                  </Link>
                </Button>
                <Button variant="default" size="sm" className="flex-1">
                  <Icon name={IconNames.Eye} className="h-3.5 w-3.5" />
                  Preview
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
