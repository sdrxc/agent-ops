'use client';

import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CapabilitiesSectionProps {
  capabilities: Record<string, any>;
  onCapabilityChange: (key: string, value: string | boolean) => void;
  onRemoveCapability: (key: string) => void;
}

export function CapabilitiesSection({
  capabilities,
  onCapabilityChange,
  onRemoveCapability,
}: CapabilitiesSectionProps) {
  const entries = Object.entries(capabilities || {});

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-1">Capabilities</h3>
        <p className="text-sm text-muted-foreground">
          Define what your agent can do. Each capability is a key-value pair.
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No capabilities defined yet.</p>
          <p className="text-xs mt-1">Add capabilities to describe your agent&apos;s features.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map(([key, value]) => (
            <div key={key} className="flex items-center gap-3 group">
              <div className="flex-1 grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
                    Key
                  </Label>
                  <Input
                    value={key}
                    readOnly
                    className="font-mono text-sm bg-muted"
                  />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
                    Value
                  </Label>
                  <Input
                    value={String(value)}
                    placeholder="true, false, or string"
                    onChange={(e) => {
                      let newValue: string | boolean = e.target.value;
                      if (newValue.toLowerCase() === 'true') newValue = true;
                      else if (newValue.toLowerCase() === 'false') newValue = false;
                      onCapabilityChange(key, newValue);
                    }}
                    className="text-sm"
                  />
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemoveCapability(key)}
                className="opacity-0 group-hover:opacity-100 transition-opacity h-9 w-9 mt-6 text-muted-foreground hover:text-foreground"
                title="Remove capability"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Button
        variant="outline"
        onClick={() => onCapabilityChange(`capability_${entries.length + 1}`, true)}
        className="mt-4"
      >
        <Plus className="w-4 h-4 mr-1" /> Add Capability
      </Button>
    </div>
  );
}
