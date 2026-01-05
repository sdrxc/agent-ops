"use client";

import { Trash2, Code, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { getParameterIcon } from "../ToolCreationDialog";

interface Parameter {
  name: string;
  parameter_type: string;
  description: string;
  required: boolean;
  default_value: any;
  validation_rules?: any;
  examples?: string[];
}

interface ParametersSectionProps {
  parameters: Parameter[];
  onAddParameter: () => void;
  onUpdateParameter: (index: number, parameter: Parameter) => void;
  onRemoveParameter: (index: number) => void;
}

export function ParametersSection({
  parameters,
  onAddParameter,
  onUpdateParameter,
  onRemoveParameter,
}: ParametersSectionProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Parameters</h3>
        <Button size="sm" onClick={onAddParameter}>
          <PlusCircle className="w-4 h-4 mr-1" /> Add Parameter
        </Button>
      </div>

      <div className="space-y-4">
        {parameters.map((p, pIdx) => (
          <Card key={pIdx} className="p-4 border-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-2 flex-1">
                  {getParameterIcon(p.parameter_type)}
                  <Input
                    placeholder="Parameter name"
                    value={p.name}
                    onChange={(e) => onUpdateParameter(pIdx, { ...p, name: e.target.value })}
                    className="flex-1"
                  />
                </div>
                <div className="w-32">
                  <select
                    value={p.parameter_type}
                    onChange={(e) => onUpdateParameter(pIdx, { ...p, parameter_type: e.target.value })}
                    className="w-full bg-transparent text-sm focus:outline-hidden"
                  >
                    <option value="string">string</option>
                    <option value="integer">integer</option>
                    <option value="float">float</option>
                    <option value="boolean">boolean</option>
                    <option value="object">object</option>
                    <option value="array">array</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 ml-4">
                <label className="flex items-center text-xs text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!p.required}
                    onChange={(e) => onUpdateParameter(pIdx, { ...p, required: e.target.checked })}
                    className="mr-1 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  Req
                </label>

                <button
                  title="Remove Parameter"
                  className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition"
                  onClick={() => onRemoveParameter(pIdx)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="mt-2">
              <Textarea
                placeholder="Description (explain the purpose of this parameter)"
                value={p.description}
                onChange={(e) => onUpdateParameter(pIdx, { ...p, description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <span className="uppercase text-xs font-semibold text-gray-500 tracking-wider block mb-1">
                  Default Value
                </span>
                <Input
                  placeholder="e.g., 10 or 'default-value'"
                  value={String(p.default_value ?? "")}
                  onChange={(e) => onUpdateParameter(pIdx, { ...p, default_value: e.target.value })}
                />
              </div>
              <div>
                <span className="uppercase text-xs font-semibold text-gray-500 tracking-wider flex items-center gap-1 mb-1">
                  Validation Rules (JSON) <Code size={12} />
                </span>
                <Textarea
                  placeholder='{"minimum": 1}'
                  value={JSON.stringify(p.validation_rules ?? {}, null, 2)}
                  rows={4}
                  className="text-xs font-mono"
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value || "{}");
                      onUpdateParameter(pIdx, { ...p, validation_rules: parsed });
                    } catch (err) {
                      // Handle JSON error
                    }
                  }}
                />
              </div>
            </div>

            <div className="mt-3">
              <span className="uppercase text-xs font-semibold text-gray-500 tracking-wider block mb-1">
                Examples (comma separated)
              </span>
              <Input
                placeholder="e.g., red, blue, green"
                value={(p.examples || []).join(",")}
                onChange={(e) => onUpdateParameter(pIdx, { ...p, examples: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
              />
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
}





















