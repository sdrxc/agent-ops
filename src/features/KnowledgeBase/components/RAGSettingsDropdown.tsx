"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Settings2, ChevronDown, X } from "lucide-react";
import { RAGSettings } from "@/types/api";
import { cn } from "@/lib/utils";

interface RAGSettingsDropdownProps {
  settings: RAGSettings;
  onSettingsChange: (settings: RAGSettings) => void;
}

export function RAGSettingsDropdown({
  settings,
  onSettingsChange,
}: RAGSettingsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = (field: keyof RAGSettings, value: boolean) => {
    onSettingsChange({ ...settings, [field]: value });
  };

  const handleChunkSizeChange = (value: number[]) => {
    onSettingsChange({ ...settings, chunkSize: value[0].toString() });
  };

  const handleTopKChange = (value: string) => {
    onSettingsChange({ ...settings, topK: value });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2",
          isOpen && "bg-accent border-accent-foreground/20"
        )}
      >
        <Settings2 className="size-4" />
        Retrieval Config
        <ChevronDown className="size-4" />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-72 bg-popover rounded-lg shadow-lg border z-40 p-4 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between mb-4 pb-2 border-b">
              <span className="text-xs font-bold uppercase">Configuration</span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Hybrid Search */}
              <div className="flex justify-between items-center">
                <Label htmlFor="hybrid-search" className="text-sm">
                  Hybrid Search
                </Label>
                <Switch
                  id="hybrid-search"
                  checked={settings.hybridSearch}
                  onCheckedChange={(checked) => handleToggle("hybridSearch", checked)}
                />
              </div>

              {/* Re-ranking */}
              <div className="flex justify-between items-center">
                <Label htmlFor="reranking" className="text-sm">
                  Re-ranking
                </Label>
                <Switch
                  id="reranking"
                  checked={settings.reranking}
                  onCheckedChange={(checked) => handleToggle("reranking", checked)}
                />
              </div>

              <Separator />

              {/* Chunk Size */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="chunk-size" className="text-xs text-muted-foreground">
                    Chunk Size
                  </Label>
                  <span className="text-xs font-mono text-foreground">
                    {settings.chunkSize}
                  </span>
                </div>
                <Slider
                  id="chunk-size"
                  min={256}
                  max={2048}
                  step={256}
                  value={[parseInt(settings.chunkSize)]}
                  onValueChange={handleChunkSizeChange}
                  className="w-full"
                />
              </div>

              {/* TopK */}
              <div className="space-y-2">
                <Label htmlFor="topk" className="text-xs text-muted-foreground">
                  Top K
                </Label>
                <Input
                  id="topk"
                  type="number"
                  min="1"
                  max="20"
                  value={settings.topK}
                  onChange={(e) => handleTopKChange(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}





















