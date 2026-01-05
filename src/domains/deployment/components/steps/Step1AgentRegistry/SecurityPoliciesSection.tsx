'use client';

import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { SecurityPolicy } from '@/domains/deployment/types';

interface SecurityPoliciesSectionProps {
  security: SecurityPolicy[];
  onUpdateSecurityPolicy: (
    index: number,
    field: 'policy_name' | 'details' | 'enforced',
    value: string | boolean
  ) => void;
  onAddSecurityPolicy: () => void;
  onRemoveSecurityPolicy: (index: number) => void;
}

export function SecurityPoliciesSection({
  security,
  onUpdateSecurityPolicy,
  onAddSecurityPolicy,
  onRemoveSecurityPolicy,
}: SecurityPoliciesSectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-1">Security Policies</h3>
        <p className="text-sm text-muted-foreground">
          Define security policies and access controls for your agent
        </p>
      </div>

      {(security || []).length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No security policies defined yet.</p>
          <p className="text-xs mt-1">Add policies to secure your agent.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {security.map((policy, idx) => (
            <div key={idx} className="space-y-3 group">
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-3">
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
                      Policy Name
                    </Label>
                    <Input
                      value={policy.policy_name}
                      placeholder="e.g., Rate Limiting"
                      onChange={(e) => onUpdateSecurityPolicy(idx, 'policy_name', e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
                      Details
                    </Label>
                    <Textarea
                      value={policy.details || ''}
                      placeholder="Describe the policy details..."
                      onChange={(e) => onUpdateSecurityPolicy(idx, 'details', e.target.value)}
                      className="text-sm min-h-[80px]"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`enforced-${idx}`}
                      checked={policy.enforced}
                      onCheckedChange={(checked) => onUpdateSecurityPolicy(idx, 'enforced', checked === true)}
                    />
                    <Label
                      htmlFor={`enforced-${idx}`}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      Enforced
                    </Label>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveSecurityPolicy(idx)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-9 w-9 text-muted-foreground hover:text-foreground"
                  title="Remove policy"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button variant="outline" onClick={onAddSecurityPolicy} className="mt-4">
        <Plus className="w-4 h-4 mr-1" /> Add Policy
      </Button>
    </div>
  );
}
