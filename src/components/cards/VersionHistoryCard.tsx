/**
 * Version History Card
 * Displays git-like version history for agent configurations
 * Allows restoring previous versions
 */

import { Agent, ConfigVersion } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useVersionHistory,
  formatVersionTimestamp,
} from "@/hooks/useVersionHistory";
import { GitBranch, RotateCcw, Clock, User, CheckCircle2 } from "lucide-react";

interface VersionHistoryCardProps {
  agent: Agent;
  onRestore?: (versionId: string) => void;
  className?: string;
}

export function VersionHistoryCard({
  agent,
  onRestore,
  className,
}: VersionHistoryCardProps) {
  const { getVersions, getCurrentVersion } = useVersionHistory(agent);
  const versions = getVersions();
  const currentVersion = getCurrentVersion();

  const handleRestore = (versionId: string) => {
    if (onRestore) {
      onRestore(versionId);
    }
  };

  const getEnvironmentColor = (env?: string) => {
    switch (env) {
      case "production":
        return "bg-green-100 text-green-800 border-green-200";
      case "staging":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "dev":
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-violet-600" />
            <CardTitle className="text-lg">Version History</CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs">
            {versions.length} {versions.length === 1 ? "version" : "versions"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Track configuration changes over time with git-like versioning
        </p>
      </CardHeader>
      <CardContent>
        {versions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <GitBranch className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No version history yet</p>
            <p className="text-xs mt-1">
              Versions will be created automatically when you save changes
            </p>
          </div>
        ) : (
          <div className="h-[400px] overflow-y-auto pr-4">
            <div className="space-y-3">
              {versions.map((version, index) => (
                <VersionItem
                  key={version.id}
                  version={version}
                  isLatest={index === 0}
                  isCurrent={currentVersion?.id === version.id}
                  onRestore={handleRestore}
                  environmentColor={getEnvironmentColor(version.environment)}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Individual Version Item
function VersionItem({
  version,
  isLatest,
  isCurrent,
  onRestore,
  environmentColor,
}: {
  version: ConfigVersion;
  isLatest: boolean;
  isCurrent: boolean;
  onRestore: (versionId: string) => void;
  environmentColor: string;
}) {
  return (
    <div
      className={`p-4 rounded-lg border-2 transition-all ${
        isCurrent
          ? "border-violet-300 bg-violet-50 dark:bg-violet-950 dark:border-violet-700"
          : "border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 hover:border-gray-300"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-sm text-violet-600">
            {version.version}
          </span>
          {isLatest && (
            <Badge
              variant="outline"
              className="text-xs bg-green-50 text-green-700 border-green-300"
            >
              Latest
            </Badge>
          )}
          {isCurrent && (
            <Badge
              variant="outline"
              className="text-xs bg-violet-50 text-violet-700 border-violet-300 flex items-center gap-1"
            >
              <CheckCircle2 className="h-3 w-3" />
              Current
            </Badge>
          )}
        </div>
        <Badge variant="outline" className={`text-xs ${environmentColor}`}>
          {version.environment || "dev"}
        </Badge>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
        {version.description}
      </p>

      {/* Metadata */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
        <div className="flex items-center gap-1">
          <User className="h-3 w-3" />
          <span>{version.author}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{formatVersionTimestamp(version.timestamp)}</span>
        </div>
      </div>

      {/* Actions */}
      {!isCurrent && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onRestore(version.id)}
          className="w-full text-xs hover:bg-violet-50 hover:border-violet-300"
        >
          <RotateCcw className="h-3 w-3 mr-2" />
          Restore this version
        </Button>
      )}
    </div>
  );
}
