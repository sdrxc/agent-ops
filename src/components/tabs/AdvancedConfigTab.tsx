/**
 * Advanced Configuration Tab
 * Handles editing of capabilities, skills, and security policies
 * Only shown in edit mode
 */

import { useState } from "react";
import { AgentConfigSnapshot } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AdvancedConfigTabProps {
  config: AgentConfigSnapshot | null;
  onConfigChange: (config: AgentConfigSnapshot) => void;
}

export function AdvancedConfigTab({
  config,
  onConfigChange,
}: AdvancedConfigTabProps) {
  if (!config) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <p>No configuration available</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto space-y-6">
      {/* Capabilities Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Capabilities</CardTitle>
            <Badge variant="secondary" className="text-xs">
              Key-Value Pairs
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Define agent capabilities as key-value pairs. These can be strings or booleans.
          </p>
        </CardHeader>
        <CardContent>
          <CapabilitiesEditor
            capabilities={config.capabilities || {}}
            onChange={(capabilities) =>
              onConfigChange({ ...config, capabilities })
            }
          />
        </CardContent>
      </Card>

      {/* Skills Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Skills</CardTitle>
            <Badge variant="secondary" className="text-xs">
              Array
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Define agent skills with keys and descriptions. Skills are typically mapped from SDK decorators.
          </p>
        </CardHeader>
        <CardContent>
          <SkillsEditor
            skills={config.skills || []}
            onChange={(skills) => onConfigChange({ ...config, skills })}
          />
        </CardContent>
      </Card>

      {/* Security Policies Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Security Policies</CardTitle>
            <Badge variant="secondary" className="text-xs">
              Array
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Define security policies that govern agent behavior and data access.
          </p>
        </CardHeader>
        <CardContent>
          <SecurityPoliciesEditor
            policies={config.security || []}
            onChange={(security) => onConfigChange({ ...config, security })}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// Capabilities Editor (Key-Value Pairs)
function CapabilitiesEditor({
  capabilities,
  onChange,
}: {
  capabilities: Record<string, string | boolean>;
  onChange: (capabilities: Record<string, string | boolean>) => void;
}) {
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const handleAdd = () => {
    if (!newKey.trim()) return;
    onChange({ ...capabilities, [newKey]: newValue || true });
    setNewKey("");
    setNewValue("");
  };

  const handleRemove = (key: string) => {
    const updated = { ...capabilities };
    delete updated[key];
    onChange(updated);
  };

  const entries = Object.entries(capabilities);

  return (
    <div className="space-y-4">
      {/* Existing Capabilities */}
      {entries.length > 0 ? (
        <div className="space-y-3">
          {entries.map(([key, value]) => (
            <div
              key={key}
              className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50"
            >
              <div className="flex-1 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-muted-foreground">Key</span>
                  <p className="font-mono text-sm">{key}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Value</span>
                  <p className="font-mono text-sm">
                    {typeof value === "boolean" ? (value ? "true" : "false") : value}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(key)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground text-sm">
          <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No capabilities defined</p>
        </div>
      )}

      {/* Add New Capability */}
      <div className="border-t pt-4 space-y-3">
        <Label className="text-sm font-semibold">Add Capability</Label>
        <div className="grid grid-cols-2 gap-3">
          <Input
            placeholder="Key (e.g., web_search)"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
          />
          <Input
            placeholder="Value (e.g., true, enabled)"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
          />
        </div>
        <Button onClick={handleAdd} disabled={!newKey.trim()} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Capability
        </Button>
      </div>
    </div>
  );
}

// Skills Editor
function SkillsEditor({
  skills,
  onChange,
}: {
  skills: Array<{ key: string; description?: string }>;
  onChange: (skills: Array<{ key: string; description?: string }>) => void;
}) {
  const [newSkill, setNewSkill] = useState({ key: "", description: "" });

  const handleAdd = () => {
    if (!newSkill.key.trim()) return;
    onChange([...skills, { key: newSkill.key, description: newSkill.description || undefined }]);
    setNewSkill({ key: "", description: "" });
  };

  const handleRemove = (index: number) => {
    onChange(skills.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Existing Skills */}
      {skills.length > 0 ? (
        <div className="space-y-3">
          {skills.map((skill, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 border rounded-lg bg-gray-50"
            >
              <div className="flex-1 space-y-1">
                <p className="font-mono text-sm font-semibold">{skill.key}</p>
                {skill.description && (
                  <p className="text-sm text-muted-foreground">{skill.description}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground text-sm">
          <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No skills defined</p>
        </div>
      )}

      {/* Add New Skill */}
      <div className="border-t pt-4 space-y-3">
        <Label className="text-sm font-semibold">Add Skill</Label>
        <Input
          placeholder="Skill key (e.g., data_analysis)"
          value={newSkill.key}
          onChange={(e) => setNewSkill({ ...newSkill, key: e.target.value })}
        />
        <Textarea
          placeholder="Description (optional)"
          value={newSkill.description}
          onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
          className="min-h-[60px]"
        />
        <Button onClick={handleAdd} disabled={!newSkill.key.trim()} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Skill
        </Button>
      </div>
    </div>
  );
}

// Security Policies Editor
function SecurityPoliciesEditor({
  policies,
  onChange,
}: {
  policies: Array<{ policy_name: string; details?: string; enforced: boolean }>;
  onChange: (policies: Array<{ policy_name: string; details?: string; enforced: boolean }>) => void;
}) {
  const [newPolicy, setNewPolicy] = useState({
    policy_name: "",
    details: "",
    enforced: true,
  });

  const handleAdd = () => {
    if (!newPolicy.policy_name.trim()) return;
    onChange([
      ...policies,
      {
        policy_name: newPolicy.policy_name,
        details: newPolicy.details || undefined,
        enforced: newPolicy.enforced,
      },
    ]);
    setNewPolicy({ policy_name: "", details: "", enforced: true });
  };

  const handleRemove = (index: number) => {
    onChange(policies.filter((_, i) => i !== index));
  };

  const handleToggleEnforced = (index: number) => {
    const updated = [...policies];
    updated[index].enforced = !updated[index].enforced;
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Existing Policies */}
      {policies.length > 0 ? (
        <div className="space-y-3">
          {policies.map((policy, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 border rounded-lg bg-gray-50"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">{policy.policy_name}</p>
                  <Badge variant={policy.enforced ? "default" : "secondary"} className="text-xs">
                    {policy.enforced ? "Enforced" : "Not Enforced"}
                  </Badge>
                </div>
                {policy.details && (
                  <p className="text-sm text-muted-foreground">{policy.details}</p>
                )}
                <div className="flex items-center gap-2">
                  <Switch
                    checked={policy.enforced}
                    onCheckedChange={() => handleToggleEnforced(index)}
                    className="data-[state=checked]:bg-green-500"
                  />
                  <span className="text-xs text-muted-foreground">
                    {policy.enforced ? "Enforced" : "Not Enforced"}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground text-sm">
          <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No security policies defined</p>
        </div>
      )}

      {/* Add New Policy */}
      <div className="border-t pt-4 space-y-3">
        <Label className="text-sm font-semibold">Add Security Policy</Label>
        <Input
          placeholder="Policy name (e.g., data_encryption)"
          value={newPolicy.policy_name}
          onChange={(e) => setNewPolicy({ ...newPolicy, policy_name: e.target.value })}
        />
        <Textarea
          placeholder="Policy details (optional)"
          value={newPolicy.details}
          onChange={(e) => setNewPolicy({ ...newPolicy, details: e.target.value })}
          className="min-h-[60px]"
        />
        <div className="flex items-center gap-2">
          <Switch
            checked={newPolicy.enforced}
            onCheckedChange={(checked) => setNewPolicy({ ...newPolicy, enforced: checked })}
            className="data-[state=checked]:bg-green-500"
          />
          <span className="text-sm text-muted-foreground">
            {newPolicy.enforced ? "Enforced" : "Not Enforced"}
          </span>
        </div>
        <Button onClick={handleAdd} disabled={!newPolicy.policy_name.trim()} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Policy
        </Button>
      </div>
    </div>
  );
}
