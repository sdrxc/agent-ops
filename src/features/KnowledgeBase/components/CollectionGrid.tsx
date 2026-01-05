"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  FilterToolbar,
  FilterToolbarResponsiveRow,
  FilterToolbarSearch,
  FilterToolbarResultCount,
} from "@/components/FilterToolbar";
import { KnowledgeCollection } from "@/types/api";
import { Plus, Folder, Search, LayoutGrid, Rows3, Copy, Check, Terminal, Box } from "lucide-react";
import { cn } from "@/lib/utils";
import { CodeBlock } from "@/components/CodeBlock";
import { CollectionListTable } from "./CollectionListTable";

interface CollectionGridProps {
  collections: KnowledgeCollection[];
  onSelect: (collectionId: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onCreateCollection: () => void;
}

function CollectionCardItem({
  collection,
  viewMode,
  onSelect,
}: {
  collection: KnowledgeCollection;
  viewMode: "grid" | "list";
  onSelect: (id: string) => void;
}) {
  const [copiedEp, setCopiedEp] = useState<string | null>(null);

  const handleCopy = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedEp(text);
    setTimeout(() => setCopiedEp(null), 2000);
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onSelect(collection.id)}
    >
      <CardHeader className={viewMode === "list" ? "pb-2" : undefined}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Folder className="size-5 text-primary" />
            <CardTitle className="text-lg">{collection.name}</CardTitle>
          </div>
        </div>
      </CardHeader>
      {viewMode === "grid" && (
        <CardContent>
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm text-muted-foreground line-clamp-2 flex-1 mr-2">
              {collection.description}
            </p>
            {collection.category && (
              <span className="px-2 py-0.5 rounded-full bg-blue-100/50 text-blue-700 text-xs font-medium border border-blue-200 shrink-0">
                {collection.category}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-sm mb-4">
            <span className="text-muted-foreground">
              {collection.documentCount}{" "}
              {collection.documentCount === 1 ? "item" : "items"}
            </span>
            <span className="text-muted-foreground">{collection.totalSize}</span>
          </div>

          {/* MCP Endpoints */}
          {collection.mcpEndpoints && collection.mcpEndpoints.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
                  <Terminal className="size-3" />
                  MCP Endpoints
                </span>
              </div>

              <div className="space-y-1">
                {collection.mcpEndpoints.slice(0, 2).map((ep, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs bg-muted/40 rounded border px-2 py-1.5 group hover:bg-muted/60 transition-colors"
                  >
                    <span className="truncate flex-1 mr-2 text-muted-foreground font-mono">
                      {ep}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-muted-foreground hover:text-foreground"
                      onClick={(e) => handleCopy(ep, e)}
                      title="Copy Endpoint"
                    >
                      {copiedEp === ep ? (
                        <Check className="size-3 text-green-500" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MCP Tools */}
          {collection.tools && collection.tools.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
                  <Box className="size-3" />
                  MCP Tools
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {collection.tools.map((tool, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded border border-primary/20"
                    title={tool.description}
                  >
                    <Box className="size-3" />
                    {tool.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Integration Snippet (Always Visible) */}
          {collection.usageExample && (
            <div className="mt-4 pt-3 border-t border-dashed">
              <span className="text-[10px] uppercase font-bold text-muted-foreground mb-2 block tracking-wider">
                Integration Snippet
              </span>
              <div
                className="relative group"
                onClick={(e) => e.stopPropagation()}
              >
                <CodeBlock
                  code={collection.usageExample}
                  compact={true}
                  className="text-xs bg-slate-950 text-slate-50 border-0"
                />
              </div>
            </div>
          )}

          {collection.tags.length > 0 && (
            <div className="flex gap-1 mt-4 flex-wrap pt-2 border-t border-dashed">
              {collection.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-0.5 bg-secondary rounded-md text-secondary-foreground"
                >
                  {tag}
                </span>
              ))}
              {collection.tags.length > 3 && (
                <span className="text-xs px-2 py-0.5 text-muted-foreground">
                  +{collection.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export function CollectionGrid({
  collections,
  onSelect,
  searchTerm,
  onSearchChange,
  onCreateCollection,
}: CollectionGridProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredCollections = collections.filter((collection) =>
    collection.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full min-w-0 space-y-6">
      {/* Filter Toolbar */}
      <FilterToolbar>
        <FilterToolbarResponsiveRow>
          {/* Search */}
          <FilterToolbarSearch>
            <Search
              className="top-1/2 left-3 absolute text-slate-400 -translate-y-1/2"
              size={16}
            />
            <Input
              type="search"
              placeholder="Search collections..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-background shadow-none py-2 pr-4 pl-9 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 w-full max-w-xs text-sm transition-all"
            />
          </FilterToolbarSearch>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Create Collection Button */}
          <Button onClick={onCreateCollection}>
            <Plus className="size-4" />
            Create Collection
          </Button>
        </FilterToolbarResponsiveRow>
      </FilterToolbar>

      {/* Results count and View Toggle */}
      <div className="flex justify-between items-center">
        <FilterToolbarResultCount
          count={filteredCollections.length}
          total={searchTerm ? collections.length : undefined}
          label="collections"
        />

        {/* View Type Toggle */}
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(value) => {
            if (value) setViewMode(value as "grid" | "list");
          }}
          variant="outline"
          size="sm"
          className="gap-0 bg-gray-100 rounded-md"
        >
          <ToggleGroupItem
            value="grid"
            className="flex justify-center items-center bg-slate-100 data-[state=on]:bg-background data-[state=on]:border border-0 data-[state=on]:border-gray-200 rounded-r-none rounded-l-md"
          >
            <LayoutGrid className="w-4 h-4" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="list"
            className="flex justify-center items-center bg-slate-100 data-[state=on]:bg-background data-[state=on]:border border-0 data-[state=on]:border-gray-200 rounded-r-md rounded-l-none"
          >
            <Rows3 className="w-4 h-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Collections Grid */}
      {viewMode === "list" ? (
        <CollectionListTable
          collections={filteredCollections}
          onSelect={onSelect}
        />
      ) : filteredCollections.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {searchTerm ? (
            <p>No collections found matching &quot;{searchTerm}&quot;</p>
          ) : (
            <div className="space-y-4">
              <Folder className="size-12 mx-auto opacity-50" />
              <p>No collections yet. Create your first collection to get started.</p>
              <Button onClick={onCreateCollection} variant="outline">
                <Plus className="size-4 mr-2" />
                Create Collection
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCollections.map((collection) => (
            <CollectionCardItem
              key={collection.id}
              collection={collection}
              viewMode="grid"
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}












