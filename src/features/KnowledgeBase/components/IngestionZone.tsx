"use client";

import { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Link2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface IngestionZoneProps {
  onFileAdd: (file: File) => void;
  onUrlAdd: (url: string) => void;
}

export function IngestionZone({ onFileAdd, onUrlAdd }: IngestionZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (files: FileList | null) => {
    if (files && files.length > 0) {
      onFileAdd(files[0]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onUrlAdd(urlInput.trim());
      setUrlInput("");
    }
  };

  const isValidUrl = (string: string) => {
    try {
      const url = new URL(string);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
      return false;
    }
  };

  return (
    <Card className="mb-6 border-0 shadow-none">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 gap-4">
          {/* File Upload Zone */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center transition-colors max-w-sm mx-auto w-full",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload className="size-8 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium mb-1">Drop files here or click to upload</p>
            <p className="text-xs text-muted-foreground mb-4">
              Supports PDF, JPG, PNG files
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="size-4 mr-2" />
              Select File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </div>

          {/* URL Input Zone - DISABLED/REMOVED as per request */}
        </div>
      </CardContent>
    </Card>
  );
}

