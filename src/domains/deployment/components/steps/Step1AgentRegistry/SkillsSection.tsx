"use client";

import { Plus, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skill } from "@/domains/deployment/types";

interface SkillsSectionProps {
  skills: Skill[];
  onUpdateSkill: (index: number, field: string, value: string) => void;
  onAddSkill: () => void;
  onRemoveSkill: (index: number) => void;
  isPreFilled?: boolean; // Indicates skills were auto-detected from SDK
}

export function SkillsSection({
  skills,
  onUpdateSkill,
  onAddSkill,
  onRemoveSkill,
  isPreFilled = false,
}: SkillsSectionProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-warning" />
        <h3 className="text-lg font-semibold">Skills</h3>
        {isPreFilled && (
          <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded-full font-medium">
            Auto-detected from SDK
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Skills represent the capabilities of your agent. Each skill maps to a{" "}
        <code className="text-xs bg-muted px-1 py-0.5 rounded">
          @trace_agent_call
        </code>{" "}
        decorated function.
      </p>

      {(skills || []).length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No skills defined yet.</p>
          <p className="text-xs mt-1">
            Add skills to describe what your agent can do.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {skills.map((skill, idx) => (
            <div key={idx} className="flex items-center gap-3 group">
              <div className="flex-1 grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
                    Key / Identifier
                  </Label>
                  <Input
                    value={skill.key || ""}
                    placeholder="e.g., process_query"
                    onChange={(e) => onUpdateSkill(idx, "key", e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
                    Description
                  </Label>
                  <Input
                    value={skill.description || ""}
                    placeholder="What does this skill do?"
                    onChange={(e) =>
                      onUpdateSkill(idx, "description", e.target.value)
                    }
                    className="text-sm"
                  />
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemoveSkill(idx)}
                className="opacity-0 group-hover:opacity-100 transition-opacity h-9 w-9 text-muted-foreground hover:text-foreground mt-6"
                title="Remove skill"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Button variant="outline" onClick={onAddSkill} className="mt-4">
        <Plus className="w-4 h-4 mr-1" /> Add Skill
      </Button>
    </div>
  );
}
