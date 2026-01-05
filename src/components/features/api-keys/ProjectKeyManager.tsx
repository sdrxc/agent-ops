"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Copy, Plus, Trash2 } from "lucide-react";
import { ApiKey } from "@/types/api";
import axios from "axios";
import toast from "react-hot-toast";

interface ProjectKeyManagerProps {
  userId: string;
  projects: { id: string; name: string }[];
  existingKeys: ApiKey[];
  onCreateKey: (name: string, projectId: string) => Promise<string>; // Returns the raw key
  onRevokeKey: (keyId: string) => Promise<void>;
  onRefresh?: () => void;
}

export function ProjectKeyManager({
  projects,
  existingKeys,
  onCreateKey,
  onRevokeKey,
  onRefresh,
}: ProjectKeyManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [selectedProject, setSelectedProject] = useState(
    projects[0]?.id || ""
  );
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [isRevoking, setIsRevoking] = useState<string | null>(null);

  const handleCreate = useCallback(async () => {
    if (!newKeyName.trim() || !selectedProject) {
      toast.error("Please provide a key name and select a project");
      return;
    }

    try {
      const rawKey = await onCreateKey(newKeyName.trim(), selectedProject);
      setNewlyCreatedKey(rawKey);
      setNewKeyName("");
      setIsCreating(false);
      if (onRefresh) onRefresh();
      toast.success("API key created successfully");
    } catch (error) {
      console.error("Failed to create key", error);
      toast.error("Failed to create API key");
    }
  }, [newKeyName, selectedProject, onCreateKey, onRefresh]);

  const handleRevoke = useCallback(
    async (keyId: string) => {
      if (!confirm("Are you sure you want to revoke this API key? This action cannot be undone.")) {
        return;
      }

      setIsRevoking(keyId);
      try {
        await onRevokeKey(keyId);
        if (onRefresh) onRefresh();
        toast.success("API key revoked successfully");
      } catch (error) {
        console.error("Failed to revoke key", error);
        toast.error("Failed to revoke API key");
      } finally {
        setIsRevoking(null);
      }
    },
    [onRevokeKey, onRefresh]
  );

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  }, []);

  const canCreate = newKeyName.trim().length > 0 && selectedProject.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Project Access Keys</h2>
        <Button
          onClick={() => setIsCreating(!isCreating)}
          variant="outline"
          disabled={!!newlyCreatedKey}
        >
          <Plus className="w-4 h-4 mr-2" />
          Generate New Key
        </Button>
      </div>

      {/* Creation Form */}
      {isCreating && !newlyCreatedKey && (
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-end w-full">
              <div className="flex-1 space-y-2 w-full sm:w-auto">
                <label className="text-sm font-medium">Key Name</label>
                <Input
                  placeholder="e.g. CI Pipeline"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && canCreate) {
                      handleCreate();
                    }
                  }}
                  className="w-full"
                />
              </div>
              <div className="w-full sm:w-[250px] space-y-2">
                <label className="text-sm font-medium">Assign Project</label>
                <Select
                  value={selectedProject}
                  onValueChange={setSelectedProject}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  onClick={handleCreate}
                  disabled={!canCreate}
                  className="flex-1 sm:flex-initial"
                >
                  Create Key
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsCreating(false);
                    setNewKeyName("");
                  }}
                  className="flex-1 sm:flex-initial"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* "Show Once" Success State */}
      {newlyCreatedKey && (
        <Card className="border-green-500 bg-green-500/10">
          <CardHeader>
            <CardTitle className="text-green-700 text-lg">
              Key Generated Successfully
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Please copy this key now. You won't be able to see it again.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-3 bg-background rounded border font-mono text-sm break-all">
                {newlyCreatedKey}
              </code>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => copyToClipboard(newlyCreatedKey)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <Button
              variant="link"
              className="px-0 text-green-700"
              onClick={() => setNewlyCreatedKey(null)}
            >
              I have saved this key
            </Button>
          </CardContent>
        </Card>
      )}

      {/* List of Existing Keys */}
      <div className="grid gap-4">
        {existingKeys.map((key) => (
          <Card
            key={key.id}
            className="flex items-center p-4 justify-between"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">{key.name}</span>
                <Badge variant="secondary" className="font-mono text-xs">
                  {key.prefix}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Access to:{" "}
                {key.projectIds
                  .map(
                    (pid) =>
                      projects.find((p) => p.id === pid)?.name || pid
                  )
                  .join(", ") || "No projects"}
                {" • "}
                Created on {new Date(key.createdAt).toLocaleDateString()}
                {key.lastUsedAt &&
                  ` • Last used ${new Date(key.lastUsedAt).toLocaleDateString()}`}
              </div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleRevoke(key.id)}
              disabled={isRevoking === key.id}
            >
              {isRevoking === key.id ? (
                "Revoking..."
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Revoke
                </>
              )}
            </Button>
          </Card>
        ))}

        {existingKeys.length === 0 && !isCreating && !newlyCreatedKey && (
          <div className="text-center py-8 text-muted-foreground">
            No API keys found. Create one to access the project programmatically.
          </div>
        )}
      </div>
    </div>
  );
}

