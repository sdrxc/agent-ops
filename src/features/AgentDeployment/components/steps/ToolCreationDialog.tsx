"use client";

import React, { useEffect, useState } from "react";
import { Wrench, CheckCircle2, UploadCloud, XCircle, Info, Eye, RotateCcwIcon, SaveAllIcon, Globe, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, List, Code, Hash, Type, CheckSquare, XSquare, GripVertical } from 'lucide-react'; // Example icons
import axios from "axios";
import { Label } from "@radix-ui/react-select";
import toast from "react-hot-toast";
import { useGlobalContext } from "@/app/GlobalContextProvider";

// Helper function to get an icon based on the parameter type
const getParameterIcon = (type: string) => {
  switch (type) {
    case 'string':
      return <Type size={14} className="text-blue-500" />;
    case 'integer':
      return <Hash size={14} className="text-green-500" />;
    case 'float':
      return <Hash size={14} className="text-teal-500" />;
    case 'boolean':
      return <CheckSquare size={14} className="text-purple-500" />;
    case 'object':
      return <Code size={14} className="text-orange-500" />;
    case 'array':
      return <List size={14} className="text-pink-500" />;
    default:
      return <Info size={14} className="text-gray-400" />;
  }
};

interface ToolCreationDialogBoxProps {
  onClose: () => void;
}

const ToolCreationTemplate: any = {
  name: "",
  description: "",
  version: "0.0.0",
  tool_type: "api", // api, database, vector_store, function, service, utility, integration
  tags: [],

  endpoint_url: "",
  function_name: null,
  module_path: null,
  source_code: null,

  input_schema: {},
  output_schema: {},

  capabilities: [],
  parameters: [],
  dependencies: [],

  auth_secret_ref: null,

  author: "",
  license: "",
  documentation_url: "",

  trusted_source: false,
  security_clearance: "public", // public/restricted
  digital_signature: "",

  status: "active", // active, inactive, deprecated, maintenance, quarantined
  mcp_compatible: false,
  requires_auth: false,
  auth_config: {
    auth_type: "BearerToken",
    header_name: "Authorization",
  },
};



export default function ToolCreationDialogBox({ onClose }: ToolCreationDialogBoxProps) {
  const [activeData, setActiveData] = useState<any>({ ...ToolCreationTemplate });
  const [jsonEditorValue, setJsonEditorValue] = useState<string>(
    JSON.stringify(ToolCreationTemplate, null, 2)
  );
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false); // for submit button
  const { user } = useGlobalContext();


  const [isToolPublic, setIsToolPublic] = useState(true);
  const toggleToolAccess = () => setIsToolPublic(prev => !prev);

  // Sync helpers
  const syncToJson = (data: any, replaceEditor = true) => {
    setActiveData(data);
    if (replaceEditor) setJsonEditorValue(JSON.stringify(data, null, 2));
  };

  useEffect(() => {
    // keep editor in sync when activeData is updated programmatically
    setJsonEditorValue(JSON.stringify(activeData, null, 2));
  }, [activeData]);

  const handleJsonChange = (val: string) => {
    setJsonEditorValue(val);
    try {
      const parsed = JSON.parse(val);
      setActiveData(parsed);
      setJsonError(null);
    } catch (err) {
      setJsonError("Invalid JSON");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        syncToJson(parsed, true);
        setJsonError(null);
      } catch (err) {
        setJsonError("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

  // Small helpers for arrays and nested data
  const updateField = (path: string[], value: any) => {
    const copy = structuredClone(activeData);
    let cur: any = copy;
    for (let i = 0; i < path.length - 1; i++) {
      cur = cur[path[i]] = cur[path[i]] ?? {};
    }
    cur[path[path.length - 1]] = value;
    syncToJson(copy);
  };

  // Tags
  const addTag = (tag: string) => {
    if (!tag) return;
    const copy = { ...activeData, tags: [...(activeData.tags || []), tag] };
    syncToJson(copy);
  };
  const removeTag = (index: number) => {
    const copy = { ...activeData, tags: (activeData.tags || []).filter((_: any, i: number) => i !== index) };
    syncToJson(copy);
  };

  // Dependencies
  const addDependency = (dep: string) => {
    if (!dep) return;
    const copy = { ...activeData, dependencies: [...(activeData.dependencies || []), dep] };
    syncToJson(copy);
  };
  const removeDependency = (idx: number) => {
    const copy = { ...activeData, dependencies: (activeData.dependencies || []).filter((_: any, i: number) => i !== idx) };
    syncToJson(copy);
  };

  // Parameters (top-level parameters array)
  const addParameter = () => {
    const param = { name: "", parameter_type: "string", description: "", required: true, default_value: null };
    const copy = { ...activeData, parameters: [...(activeData.parameters || []), param] };
    syncToJson(copy);
  };
  const updateParameter = (idx: number, value: any) => {
    const copy = structuredClone(activeData);
    copy.parameters[idx] = value;
    syncToJson(copy);
  };
  const removeParameter = (idx: number) => {
    const copy = { ...activeData, parameters: (activeData.parameters || []).filter((_: any, i: number) => i !== idx) };
    syncToJson(copy);
  };

  // Capabilities
  const addCapability = () => {
    const cap = {
      name: "",
      description: "",
      input_parameters: [],
      output_schema: {},
      examples: [],
    };
    const copy = { ...activeData, capabilities: [...(activeData.capabilities || []), cap] };
    syncToJson(copy);
  };
  const updateCapability = (idx: number, value: any) => {
    const copy = structuredClone(activeData);
    copy.capabilities[idx] = value;
    syncToJson(copy);
  };
  const removeCapability = (idx: number) => {
    const copy = { ...activeData, capabilities: (activeData.capabilities || []).filter((_: any, i: number) => i !== idx) };
    syncToJson(copy);
  };

  // Capability -> Parameter helpers
  const addCapParam = (capIdx: number) => {
    const copy = structuredClone(activeData);
    copy.capabilities[capIdx].input_parameters = copy.capabilities[capIdx].input_parameters || [];
    copy.capabilities[capIdx].input_parameters.push({ name: "", parameter_type: "string", description: "", required: true, default_value: null });
    syncToJson(copy);
  };
  const updateCapParam = (capIdx: number, pIdx: number, value: any) => {
    const copy = structuredClone(activeData);
    copy.capabilities[capIdx].input_parameters[pIdx] = value;
    syncToJson(copy);
  };
  const removeCapParam = (capIdx: number, pIdx: number) => {
    const copy = structuredClone(activeData);
    copy.capabilities[capIdx].input_parameters = (copy.capabilities[capIdx].input_parameters || []).filter((_: any, i: number) => i !== pIdx);
    syncToJson(copy);
  };

  // Capability examples (simple input/output JSON pairs)
  const addCapExample = (capIdx: number) => {
    const copy = structuredClone(activeData);
    copy.capabilities[capIdx].examples = copy.capabilities[capIdx].examples || [];
    copy.capabilities[capIdx].examples.push({ input: {}, output: {} });
    syncToJson(copy);
  };
  const updateCapExample = (capIdx: number, exIdx: number, key: "input" | "output", value: any) => {
    const copy = structuredClone(activeData);
    copy.capabilities[capIdx].examples[exIdx][key] = value;
    syncToJson(copy);
  };
  const removeCapExample = (capIdx: number, exIdx: number) => {
    const copy = structuredClone(activeData);
    copy.capabilities[capIdx].examples = (copy.capabilities[capIdx].examples || []).filter((_: any, i: number) => i !== exIdx);
    syncToJson(copy);
  };

  // Validation before saving
  const validateAndSave = () => {
    setLoading(true);
    const errors: string[] = [];
    if (!activeData.name || activeData.name.trim().length === 0) errors.push("Name is required");
    if (!activeData.description || activeData.description.trim().length === 0) errors.push("Description is required");
    if (!activeData.version) errors.push("Version is required");
    if (!activeData.tool_type) errors.push("Tool type is required");
    if (activeData.tool_type === "api" && !activeData.endpoint_url) errors.push("endpoint_url required for api type");
    if (activeData.tool_type === "function" && !activeData.function_name) errors.push("function_name required for function type");

    if (jsonError) errors.push("Fix JSON errors first");

    setTimeout(() => {
      setLoading(false);
      if (errors.length) {
        alert("Please fix:\n" + errors.join("\n"));
        return;
      }

      // final payload
      console.log("Saving tool payload:", activeData);
      // user can replace the console.log with an API call
      onClose();
    }, 500);
  };

  // Small presentational input components inside this file for convenience
  function TinyLabel({ children }: { children: React.ReactNode }) {
    return <div className="text-sm text-slate-600 mb-1">{children}</div>;
  }

  const userID = user!.userID
  const createToolApi = async () => {
    try {
      const runtimeEnv = process.env.NEXT_PUBLIC_APP_ENV;
      const baseURL = process.env.NEXT_PUBLIC_API_URL || "";

      const endpoint =
        runtimeEnv === "local"
          ? `${baseURL}/api/toolCreation`
          : "/api/toolCreation";

      const response = await axios.post(endpoint, {
        userID, activeData, isToolPublic
      });

      if (response.status === 200 || response.status === 201) {

      console.log("tool creted")
      toast.success("Tool Created Successfully!", {
        style: { background: "#dcfce7", color: "#166534" },
      });

      onClose?.();

      }
    }
    catch (err) {
      console.error("Validation error:", err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          {/* Left: Title */}
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            <span>Tool Creation</span>
          </CardTitle>

          {/* Right: Toggle Tool Access */}
          <div
            className="flex items-center gap-2 cursor-pointer px-3 py-1 rounded-full border transition duration-150 hover:bg-gray-50"
            onClick={toggleToolAccess}
            title={isToolPublic ? "Tool is Public (Accessible to all)" : "Tool is Private (Internal use only)"}
          >
            {isToolPublic ? (
              <Globe className="h-5 w-5 text-green-600" />
            ) : (
              <Lock className="h-5 w-5 text-red-600" />
            )}
            <span
              className={`text-sm font-medium ${isToolPublic ? "text-green-700" : "text-red-700"
                }`}
            >
              {isToolPublic ? "Public" : "Private"}
            </span>
          </div>
        </div>
      </CardHeader>




      <CardContent className="space-y-6">
        <Tabs defaultValue="visual">
          <div className="flex justify-between items-center">
            <TabsList className="grid grid-cols-3 w-full mb-4">
              <TabsTrigger value="visual">Visual Editor</TabsTrigger>
              <TabsTrigger value="json">JSON Editor</TabsTrigger>
              <TabsTrigger value="upload">JSON Upload</TabsTrigger>
            </TabsList>
          </div>

          {/* VISUAL */}
          <TabsContent value="visual" className="space-y-4">
            <div className="grid grid-cols-2 gap-2  h-[50vh] overflow-y-auto px-2 mx-1">
              <div>
                <TinyLabel>Tool Name (unique)</TinyLabel>
                <Input value={activeData.name} onChange={(e) => updateField(["name"], e.target.value)} />
              </div>

              <div>
                <TinyLabel>Version</TinyLabel>
                <Input value={activeData.version} onChange={(e) => updateField(["version"], e.target.value)} />
              </div>

              <div className="col-span-2">
                <TinyLabel>Description</TinyLabel>
                <Textarea value={activeData.description} onChange={(e) => updateField(["description"], e.target.value)} className="h-24" />
              </div>

              <div>
                <TinyLabel>Tool Type</TinyLabel>
                <select value={activeData.tool_type} onChange={(e) => updateField(["tool_type"], e.target.value)} className="w-full rounded-md border px-2 py-1">
                  <option value="api">api</option>
                  <option value="database">database</option>
                  <option value="vector_store">vector_store</option>
                  <option value="function">function</option>
                  <option value="service">service</option>
                  <option value="utility">utility</option>
                  <option value="integration">integration</option>
                </select>
              </div>

              <div>
                <TinyLabel>Status</TinyLabel>
                <select value={activeData.status} onChange={(e) => updateField(["status"], e.target.value)} className="w-full rounded-md border px-2 py-1">
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                  <option value="deprecated">deprecated</option>
                  <option value="maintenance">maintenance</option>
                  <option value="quarantined">quarantined</option>
                </select>
              </div>

              <div>
                <TinyLabel>Trusted Source</TinyLabel>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={!!activeData.trusted_source} onChange={(e) => updateField(["trusted_source"], e.target.checked)} />
                  <span className="text-sm">trusted_source</span>
                </div>
              </div>

              <div>
                <TinyLabel>Requires Auth</TinyLabel>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={!!activeData.requires_auth} onChange={(e) => updateField(["requires_auth"], e.target.checked)} />
                  <span className="text-sm">requires_auth</span>
                </div>
              </div>

              <div>
                <TinyLabel>MCP Compatible</TinyLabel>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={!!activeData.mcp_compatible} onChange={(e) => updateField(["mcp_compatible"], e.target.checked)} />
                  <span className="text-sm">mcp_compatible</span>
                </div>
              </div>

              <div>
                <TinyLabel>Security Clearance</TinyLabel>
                <select value={activeData.security_clearance} onChange={(e) => updateField(["security_clearance"], e.target.value)} className="w-full rounded-md border px-2 py-1">
                  <option value="public">public</option>
                  <option value="restricted">restricted</option>
                </select>
              </div>

              <div className="col-span-2">
                <TinyLabel>Author</TinyLabel>
                <Input value={activeData.author} onChange={(e) => updateField(["author"], e.target.value)} />
              </div>

              <div>
                <TinyLabel>License</TinyLabel>
                <Input value={activeData.license} onChange={(e) => updateField(["license"], e.target.value)} />
              </div>

              <div>
                <TinyLabel>Documentation URL</TinyLabel>
                <Input value={activeData.documentation_url} onChange={(e) => updateField(["documentation_url"], e.target.value)} />
              </div>

              <div className="col-span-2">
                <TinyLabel>Digital Signature</TinyLabel>
                <Input value={activeData.digital_signature} onChange={(e) => updateField(["digital_signature"], e.target.value)} />
              </div>

              <div className="col-span-2">
                <TinyLabel>Tags</TinyLabel>
                <div className="flex gap-2 flex-wrap">
                  {(activeData.tags || []).map((t: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 px-2 py-1 rounded bg-slate-100">
                      <span className="text-sm">{t}</span>
                      <button className="text-red-500" onClick={() => removeTag(idx)}>
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Input id="new-tag-input" placeholder="add tag" onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (val) {
                        addTag(val);
                        (e.target as HTMLInputElement).value = "";
                      }
                    }
                  }} />
                </div>
              </div>

              <div className="col-span-2">
                <TinyLabel>Dependencies</TinyLabel>
                <div className="flex flex-wrap gap-2">
                  {(activeData.dependencies || []).map((d: string, i: number) => (
                    <div key={i} className="px-2 py-1 bg-slate-100 rounded flex items-center gap-2">
                      <span className="text-sm">{d}</span>
                      <button className="text-red-500" onClick={() => removeDependency(i)}>×</button>
                    </div>
                  ))}
                </div>
                <div className="mt-2">
                  <Input id="new-dep" placeholder="add dependency" onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (val) {
                        addDependency(val);
                        (e.target as HTMLInputElement).value = "";
                      }
                    }
                  }} />
                </div>
              </div>

              {/* Endpoint / function / module / source code */}
              <div>
                <TinyLabel>Endpoint URL (if api)</TinyLabel>
                <Input value={activeData.endpoint_url} onChange={(e) => updateField(["endpoint_url"], e.target.value)} />
              </div>

              <div>
                <TinyLabel>Function Name (if function)</TinyLabel>
                <Input value={activeData.function_name ?? ""} onChange={(e) => updateField(["function_name"], e.target.value || null)} />
              </div>

              <div>
                <TinyLabel>Module Path</TinyLabel>
                <Input value={activeData.module_path ?? ""} onChange={(e) => updateField(["module_path"], e.target.value || null)} />
              </div>

              <div className="col-span-2">
                <TinyLabel>Source Code (optional)</TinyLabel>
                <Textarea value={activeData.source_code ?? ""} onChange={(e) => updateField(["source_code"], e.target.value || null)} className="h-10" />
              </div>

              {/* input/output schemas as JSON editors */}
              <div className="col-span-1">
                <TinyLabel>Input Schema (JSON)</TinyLabel>
                <Textarea className="font-mono h-20" value={JSON.stringify(activeData.input_schema ?? {}, null, 2)} onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    updateField(["input_schema"], parsed);
                    setJsonError(null);
                  } catch (err) {
                    setJsonError("Invalid JSON in input_schema");
                  }
                }} />
              </div>

              <div className="col-span-1">
                <TinyLabel>Output Schema (JSON)</TinyLabel>
                <Textarea className="font-mono h-20" value={JSON.stringify(activeData.output_schema ?? {}, null, 2)} onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    updateField(["output_schema"], parsed);
                    setJsonError(null);
                  } catch (err) {
                    setJsonError("Invalid JSON in output_schema");
                  }
                }} />
              </div>

              {/* auth secret */}
              <div className="col-span-2">
                <TinyLabel>Auth Secret Reference</TinyLabel>
                <Input value={activeData.auth_secret_ref ?? ""} onChange={(e) => updateField(["auth_secret_ref"], e.target.value || null)} />
              </div>

              {/* Auth config toggle and fields */}
              {activeData.requires_auth && (
                <div className="col-span-2 border rounded p-3">
                  <TinyLabel>Auth Config</TinyLabel>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <TinyLabel>Auth Type</TinyLabel>
                      <Input value={activeData.auth_config?.auth_type ?? "BearerToken"} onChange={(e) => updateField(["auth_config", "auth_type"], e.target.value)} />
                    </div>
                    <div>
                      <TinyLabel>Header Name</TinyLabel>
                      <Input value={activeData.auth_config?.header_name ?? "Authorization"} onChange={(e) => updateField(["auth_config", "header_name"], e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              {/* Parameters list (top-level) */}
              <div className="col-span-2">
                {/* Main Card for the entire Parameters section */}
                <Card className="p-4 shadow-md">
                  <div className="flex items-center justify-between mb-3">
                    {/* ALTERNATIVE TO TinyLabel: 
        A standard <span> with specific Tailwind classes for styling 
      */}
                    <span className="uppercase text-xs font-semibold text-gray-500 tracking-wider">
                      Parameters
                    </span>

                    <Button
                      onClick={addParameter}
                      className="flex items-center gap-1 text-xs"
                    >
                      <PlusCircle size={14} /> Add Parameter
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {(activeData.parameters || []).map((p: any, pIdx: number) => (
                      <Card key={pIdx} className="p-3 border border-gray-200 shadow-xs hover:shadow-md transition duration-150">

                        {/* Header Row: Name, Type, Actions */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2 w-full">
                            <GripVertical size={16} className="text-gray-400 cursor-move" />

                            <div className="grow">
                              <Input
                                placeholder="Parameter Name"
                                value={p.name}
                                onChange={(e) => updateParameter(pIdx, { ...p, name: e.target.value })}
                              />
                            </div>

                            <div className="w-1/3 flex items-center gap-1 border rounded-md px-2 py-1 bg-gray-50">
                              {getParameterIcon(p.parameter_type)}
                              <select
                                value={p.parameter_type}
                                onChange={(e) => updateParameter(pIdx, { ...p, parameter_type: e.target.value })}
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
                                onChange={(e) => updateParameter(pIdx, { ...p, required: e.target.checked })}
                                className="mr-1 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                              />
                              Req
                            </label>

                            <button
                              title="Remove Parameter"
                              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition"
                              onClick={() => removeParameter(pIdx)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Description Textarea */}
                        <div className="mt-2">
                          <Textarea
                            placeholder="Description (explain the purpose of this parameter)"
                            value={p.description}
                            onChange={(e) => updateParameter(pIdx, { ...p, description: e.target.value })}
                            rows={2}
                          />
                        </div>

                        {/* Optional Fields: Default Value and Validation Rules */}
                        <div className="grid grid-cols-2 gap-3 mt-3">
                          <div>
                            {/* Using <span> alternative */}
                            <span className="uppercase text-xs font-semibold text-gray-500 tracking-wider block mb-1">
                              Default Value
                            </span>
                            <Input
                              placeholder="e.g., 10 or 'default-value'"
                              value={String(p.default_value ?? "")}
                              onChange={(e) => updateParameter(pIdx, { ...p, default_value: e.target.value })}
                            />
                          </div>
                          <div>
                            {/* Using <span> alternative */}
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
                                  updateParameter(pIdx, { ...p, validation_rules: parsed });
                                } catch (err) {
                                  // Handle JSON error
                                }
                              }}
                            />
                          </div>
                        </div>

                        {/* Examples Input */}
                        <div className="mt-3">
                          {/* Using <span> alternative */}
                          <span className="uppercase text-xs font-semibold text-gray-500 tracking-wider block mb-1">
                            Examples (comma separated)
                          </span>
                          <Input
                            placeholder="e.g., red, blue, green"
                            value={(p.examples || []).join(",")}
                            onChange={(e) => updateParameter(pIdx, { ...p, examples: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                          />
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Capabilities */}
              <div className="col-span-2">
                <div className="flex items-center justify-between">
                  <TinyLabel>Capabilities</TinyLabel>
                  <Button size="sm" onClick={addCapability}>Add Capability</Button>
                </div>

                <div className="space-y-4 mt-2">
                  {(activeData.capabilities || []).map((cap: any, capIdx: number) => (
                    <div key={capIdx} className="border rounded p-3">
                      <div className="flex gap-2">
                        <Input placeholder="capability name" value={cap.name} onChange={(e) => updateCapability(capIdx, { ...cap, name: e.target.value })} />
                        <button className="text-red-500" onClick={() => removeCapability(capIdx)}>Remove</button>
                      </div>
                      <div className="mt-2">
                        <Textarea placeholder="capability description" value={cap.description} onChange={(e) => updateCapability(capIdx, { ...cap, description: e.target.value })} />
                      </div>

                      {/* input params inside capability */}
                      <div className="mt-2">
                        <div className="flex items-center justify-between">
                          <TinyLabel>Input Parameters</TinyLabel>
                          <Button onClick={() => addCapParam(capIdx)}>Add</Button>
                        </div>

                        <div className="space-y-2 mt-2">
                          {(cap.input_parameters || []).map((pp: any, ppi: number) => (
                            <div key={ppi} className="border rounded p-2">
                              <div className="grid grid-cols-3 gap-2">
                                <Input placeholder="name" value={pp.name} onChange={(e) => updateCapParam(capIdx, ppi, { ...pp, name: e.target.value })} />
                                <select value={pp.parameter_type} onChange={(e) => updateCapParam(capIdx, ppi, { ...pp, parameter_type: e.target.value })} className="rounded-md border px-2 py-1">
                                  <option value="string">string</option>
                                  <option value="integer">integer</option>
                                  <option value="float">float</option>
                                  <option value="boolean">boolean</option>
                                  <option value="object">object</option>
                                  <option value="array">array</option>
                                </select>
                                <div className="flex items-center gap-2">
                                  <input type="checkbox" checked={!!pp.required} onChange={(e) => updateCapParam(capIdx, ppi, { ...pp, required: e.target.checked })} />
                                  <span className="text-sm">required</span>
                                  <button className="ml-auto text-red-500" onClick={() => removeCapParam(capIdx, ppi)}>Remove</button>
                                </div>
                              </div>

                              <div className="mt-2">
                                <Textarea placeholder="description" value={pp.description} onChange={(e) => updateCapParam(capIdx, ppi, { ...pp, description: e.target.value })} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* capability output schema */}
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <div>
                          <TinyLabel>Output Schema (JSON)</TinyLabel>
                          <Textarea className="font-mono h-28" value={JSON.stringify(cap.output_schema ?? {}, null, 2)} onChange={(e) => {
                            try {
                              const parsed = JSON.parse(e.target.value || "{}");
                              updateCapability(capIdx, { ...cap, output_schema: parsed });
                              setJsonError(null);
                            } catch (err) {
                              setJsonError("Invalid JSON in capability output_schema");
                            }
                          }} />
                        </div>

                        <div>
                          <TinyLabel>Examples (input/output JSON)</TinyLabel>
                          <div className="space-y-2">
                            {(cap.examples || []).map((ex: any, exIdx: number) => (
                              <div key={exIdx} className="border rounded p-2">
                                <TinyLabel>Input</TinyLabel>
                                <Textarea className="font-mono h-20" value={JSON.stringify(ex.input ?? {}, null, 2)} onChange={(e) => {
                                  try {
                                    const parsed = JSON.parse(e.target.value || "{}");
                                    updateCapExample(capIdx, exIdx, "input", parsed);
                                    setJsonError(null);
                                  } catch (err) {
                                    setJsonError("Invalid JSON in capability example input");
                                  }
                                }} />
                                <TinyLabel>Output</TinyLabel>
                                <Textarea className="font-mono h-20" value={JSON.stringify(ex.output ?? {}, null, 2)} onChange={(e) => {
                                  try {
                                    const parsed = JSON.parse(e.target.value || "{}");
                                    updateCapExample(capIdx, exIdx, "output", parsed);
                                    setJsonError(null);
                                  } catch (err) {
                                    setJsonError("Invalid JSON in capability example output");
                                  }
                                }} />
                                <div className="flex justify-end mt-2">
                                  <button className="text-red-500" onClick={() => removeCapExample(capIdx, exIdx)}>Remove Example</button>
                                </div>
                              </div>
                            ))}

                            <div className="flex justify-end">
                              <Button onClick={() => addCapExample(capIdx)}>Add Example</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="border rounded-sm bg-gray-200 p-2">
              <div className="flex justify-between items-center">
                <div className="flex gap-1">
                  <Button variant="outline" onClick={() => {
                    setActiveData({ ...ToolCreationTemplate });
                  }}><RotateCcwIcon /></Button>
                  <Button variant="ghost" onClick={() => console.log("Preview:", activeData)}><Eye /></Button>
                </div>

                <div className="flex gap-2 text-xs">
                  <Button variant="outline" onClick={onClose}>Cancel</Button>
                  <Button variant="outline" onClick={validateAndSave} disabled={loading}>
                    <SaveAllIcon className="w-4 h-4 mr-2" /> {loading ? "Saving..." : "Save Tool"}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* JSON Editor */}
          <TabsContent value="json">
            <div className="space-y-2">
              <TinyLabel>JSON Editor (bi-directional sync)</TinyLabel>
              <Textarea className="font-mono h-80" value={jsonEditorValue} onChange={(e) => handleJsonChange(e.target.value)} />
              {jsonError && <div className="text-red-500">{jsonError}</div>}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => syncToJson(activeData, true)}>Sync From Visual</Button>
                <Button onClick={() => {
                  try {
                    const parsed = JSON.parse(jsonEditorValue);
                    syncToJson(parsed, true);
                    setJsonError(null);
                    alert("JSON parsed and synced to visual editor");
                  } catch (err) {
                    setJsonError("Invalid JSON");
                  }
                }}>Apply JSON</Button>
              </div>
            </div>
          </TabsContent>

          {/* UPLOAD */}
          <TabsContent value="upload">
            <div className="space-y-4">
              <TinyLabel>Upload a JSON file to populate the editor</TinyLabel>
              <input type="file" accept="application/json" onChange={handleFileUpload} />
              {jsonError && <div className="text-red-500">{jsonError}</div>}

              <div>
                <TinyLabel>Or paste JSON</TinyLabel>
                <Textarea value={jsonEditorValue} onChange={(e) => handleJsonChange(e.target.value)} className="h-60 font-mono" />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setActiveData({ ...ToolCreationTemplate }); }}><RotateCcwIcon /></Button>
                <Button onClick={() => {
                  try {
                    const parsed = JSON.parse(jsonEditorValue);
                    syncToJson(parsed, true);
                    setJsonError(null);
                    alert("Loaded JSON into visual editor");
                  } catch (err) {
                    setJsonError("Invalid JSON");
                  }
                }}>Load JSON</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardContent>
        <Button
          className="w-full flex items-center gap-2"
          disabled={submitting}
          onClick={createToolApi}
        >
          {submitting ? "Creating..." : "Create Tool"}
        </Button>
      </CardContent>
    </Card>
  );
}
