'use client';

import { useContext, useEffect, useRef, useState } from 'react';
import { UploadCloud, XCircle, CheckCircle2, Info, Eye, Edit, CheckIcon, Plus, Trash2, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import axios from "axios";
import toast from 'react-hot-toast';
import { AgentDeploymentContext } from '../context/AgentDeploymentContext';
import { validateAgentRegistry } from '../utils/validators';


interface Step1BasicConfigProps {
  sequenceID: string;
  projectID: string
  userID: string | null;
  onNext: () => void;
  onStepValidate: (isValid: boolean) => void;
  stepID: string;
}

export default function Step1AgentRegistry({ sequenceID, projectID, userID, onNext, onStepValidate, stepID }: Step1BasicConfigProps) {
  const { state, dispatch } = useContext(AgentDeploymentContext);
  const { agentRegistry } = state;
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [hasScrolledToError, setHasScrolledToError] = useState(false);
  const [localData, setLocalData] = useState(agentRegistry);
  const [localErrors, setLocalErrors] = useState<string[]>([]);
  const [isJsonValid, setIsJsonValid] = useState(false);
  const [isUploadedJsonValid, setIsUploadedJsonValid] = useState(false);
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [jsonData, setJsonData] = useState<any>(null);
  const [errors, setErrors] = useState<string | null>(null);
  const [jsonEditorValue, setJsonEditorValue] = useState<string>(JSON.stringify(localData, null, 2));
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'visual' | 'json' | 'upload'>('visual');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setJsonFile(file);
    setErrors(null);
    setIsUploadedJsonValid(false);
    setJsonData(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      try {
        const parsed = JSON.parse(text);
        const validationErrors = validateAgentRegistry(parsed);

        if (validationErrors.length > 0) {
          setErrors(`Invalid JSON content:\n${validationErrors.join(', ')}`);
          setIsUploadedJsonValid(false);
        } else {
          setErrors(null);
          setIsUploadedJsonValid(true);
          setJsonData(parsed);
          setJsonEditorValue(JSON.stringify(parsed, null, 2));
          setLocalData(parsed);
        }
      } catch {
        setErrors('Uploaded file contains invalid JSON.');
        setJsonData(null);
        setIsUploadedJsonValid(false);
      }
    };
    reader.readAsText(file);
  };

  const handleChange = (field: keyof typeof localData, value: any) => {
    setLocalData((prev: any) => {
      const updated = { ...prev, [field]: value };
      setJsonEditorValue(JSON.stringify(updated, null, 2));
      return updated;
    });
    // Remove error for this field if fixed
    setLocalErrors(prev => prev.filter(err => !err.toLowerCase().includes(field.toString())));
  };

  const handleJsonEditorChange = (value: string) => {
    setJsonEditorValue(value);
    try {
      const parsed = JSON.parse(value);
      setErrors(null);
      setJsonData(parsed);
      setLocalData(parsed);

      // Validate structure
      const validationErrors = validateAgentRegistry(parsed);
      if (validationErrors.length > 0) {
        setLocalErrors(validationErrors);
        setIsJsonValid(false);
      } else {
        setLocalErrors([]);
        setIsJsonValid(true);
      }
    } catch {
      setErrors('Invalid JSON format.');
      setJsonData(null);
      setIsJsonValid(false);
    }
  };


  const handleValidate = async () => {
    const runtimeEnv = process.env.NEXT_PUBLIC_APP_ENV;
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "";

    const isLocalEnv = runtimeEnv === "local";
    const url = isLocalEnv
      ? `${baseURL}/api/step1-validate`
      : `/api/step1-validate`;

      console.log('url ', url);

    try {
      const res = await axios.post(url, {
        projectID,
        sequenceID,
        userID,
        stepID
      });

      console.log('res data ', res.data);

      if (res?.data?.data?.valid === true) {
        onStepValidate(true);
      } else {
        onStepValidate(false);
      }
    } catch (err) {
      onStepValidate(false);
    }
  };

  useEffect(() => {
    console.log("Step 1 re-mounted. Validating again...");
    handleValidate();
  }, []);

  const handleAgentRegistrySubmit = async () => {
    setLocalErrors([]);
    dispatch({ type: 'SET_ERRORS', payload: [] });
    const validationErrors = validateAgentRegistry(localData);

    if (validationErrors.length > 0) {
      setLocalErrors(validationErrors);
      dispatch({ type: 'SET_ERRORS', payload: validationErrors });

      // Find first field name from the first error message
      if (!hasScrolledToError) {
        const firstError = validationErrors[0].toLowerCase();
        const fieldKey = Object.keys(inputRefs.current).find((key) =>
          firstError.includes(key.toLowerCase())
        );

        if (fieldKey && inputRefs.current[fieldKey]) {
          inputRefs.current[fieldKey]?.scrollIntoView({ behavior: "smooth", block: "center" });
          inputRefs.current[fieldKey]?.focus();
          setHasScrolledToError(true);
        }
      }
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERRORS', payload: [] });

      const runtimeEnv = process.env.NEXT_PUBLIC_APP_ENV;
      const baseURL = process.env.NEXT_PUBLIC_API_URL || "";

      const endpoint =
        runtimeEnv === "local"
          ? `${baseURL}/api/step1-agentRegistry`
          : "/api/step1-agentRegistry";

      const response = await axios.post(endpoint, {
        projectID,
        sequenceID,
        userID,
        agentRegistryData: localData,
      });

      console.log("response", response);

      if (response.status === 200 || response.status === 201) {
        toast.success("Agent Registered Successfully!", {
          style: { background: "#dcfce7", color: "#166534" },
        });

        toast.success("Click on Next to continue", {
          style: { background: "#dcfce7", color: "#166534" },
        });

        onStepValidate(true);
        // Update global state on success
        dispatch({ type: 'SET_AGENT_REGISTRY', payload: localData });
        // Reset flag when all valid
        setHasScrolledToError(false);
      } else {
        toast.error("Agent Registration Failed, Try Again!", {
          style: { background: "#fee2e2", color: "#b91c1c" },
        });
        onStepValidate(false);
      }
    } catch (error: any) {
      console.error('Agent registry submit error:', error);
      onStepValidate(false);
      setLocalErrors([error?.message || 'Unknown error']);
      dispatch({ type: 'SET_ERRORS', payload: [error?.message || 'Unknown error'] });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleCapabilityChange = (key: string, value: string | boolean) => {
    setLocalData((prev: any) => {
      const updatedCapabilities = { ...prev.capabilities, [key]: value };
      const updated = { ...prev, capabilities: updatedCapabilities };
      setJsonEditorValue(JSON.stringify(updated, null, 2));
      return updated;
    });
  };

  const handleRemoveCapability = (key: string) => {
    setLocalData((prev: any) => {
      const { [key]: _, ...rest } = prev.capabilities;
      const updated = { ...prev, capabilities: rest };
      setJsonEditorValue(JSON.stringify(updated, null, 2));
      return updated;
    });
  };

  const handleUpdateSkill = (index: number, field: string, value: string) => {
    setLocalData((prev: any) => {
      const updatedSkills = [...prev.skills];
      updatedSkills[index] = {
        ...updatedSkills[index],
        [field]: value,
      };
      const updated = { ...prev, skills: updatedSkills };

      // Optional: Sync with JSON editor
      setJsonEditorValue(JSON.stringify(updated, null, 2));

      return updated;
    });
  };

  const handleAddSkill = () => {
    setLocalData((prev: any) => {
      const newSkill = {
        name: '',
        description: '',
        version: '',
      };
      const updated = { ...prev, skills: [...prev.skills, newSkill] };

      // Optional: Sync with JSON editor
      setJsonEditorValue(JSON.stringify(updated, null, 2));

      return updated;
    });
  };

  const handleRemoveSkill = (index: number) => {
    setLocalData((prev: any) => {
      const updatedSkills = prev.skills.filter((_: any, idx: number) => idx !== index);
      const updated = { ...prev, skills: updatedSkills };

      // Optional: Sync with JSON editor
      setJsonEditorValue(JSON.stringify(updated, null, 2));

      return updated;
    });
  };

  const handleUpdateSecurityPolicy = (
    index: number,
    field: "policy_name" | "details" | "enforced",
    value: string | boolean
  ) => {
    setLocalData((prev: any) => {
      const updatedSecurity = [...prev.security];
      updatedSecurity[index] = {
        ...updatedSecurity[index],
        [field]: value,
      };
      const updated = { ...prev, security: updatedSecurity };

      // Optional: Sync JSON editor if you're using one
      setJsonEditorValue(JSON.stringify(updated, null, 2));

      return updated;
    });
  };

  const handleAddSecurityPolicy = () => {
    setLocalData((prev: any) => {
      const newPolicy = {
        policy_name: '',
        details: '',
        enforced: false,
      };
      const updated = { ...prev, security: [...prev.security, newPolicy] };

      setJsonEditorValue(JSON.stringify(updated, null, 2));

      return updated;
    });
  };

  const handleRemoveSecurityPolicy = (index: number) => {
    setLocalData((prev: any) => {
      const updatedSecurity = prev.security.filter((_: any, idx: number) => idx !== index);
      const updated = { ...prev, security: updatedSecurity };

      setJsonEditorValue(JSON.stringify(updated, null, 2));

      return updated;
    });
  };

  useEffect(() => {
    if (localErrors.length === 0 && hasScrolledToError) {
      setHasScrolledToError(false);
    }
  }, [localErrors, hasScrolledToError]);

  useEffect(() => {
    // When leaving the Upload tab → clear preview and errors
    if (activeTab !== 'upload') {
      setJsonFile(null);
      setJsonData(null);
      setErrors(null);
      setIsUploadedJsonValid(false);
    }

    // When entering JSON tab → ensure it reflects valid visual data
    if (activeTab === 'json') {
      try {
        const parsed = JSON.parse(jsonEditorValue);
        const validationErrors = validateAgentRegistry(parsed);
        if (validationErrors.length === 0) {
          setErrors(null);
          setIsJsonValid(true);
        }
      } catch {
        // ignore invalid JSON here — user may be editing manually
      }
    }
  }, [activeTab]);


  useEffect(() => {
    // keep JSON in sync when editing via visual editor
    if (activeTab !== 'json') {
      setJsonEditorValue(JSON.stringify(localData, null, 2));
    }
  }, [localData]);

  useEffect(() => {
    try {
      const parsed = JSON.parse(JSON.stringify(localData));
      const validationErrors = validateAgentRegistry(parsed);
      if (validationErrors.length > 0) {
        setIsJsonValid(false);
        //setLocalErrors(validationErrors);
      } else {
        setIsJsonValid(true);
      }
    } catch {
      setIsJsonValid(false);
    }
  }, [localData]);

  // --- End Helper Functions ---

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center space-x-2 text-xl font-semibold">
          <Bot className="h-6 w-6 text-blue-600" />
          <span>Agent Registry</span>
        </CardTitle>
        <div className="text-xs text-gray-500">
            Register your agent
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Separator className="my-4" />
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} defaultValue="visual" className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="visual">
              <Edit className="w-4 h-4 mr-1" /> Visual Editor
            </TabsTrigger>
            <TabsTrigger value="json">
              <Eye className="w-4 h-4 mr-1" /> JSON Editor
            </TabsTrigger>
            <TabsTrigger value="upload">
              <UploadCloud className="w-4 h-4 mr-1" /> Upload JSON
            </TabsTrigger>
          </TabsList>

          <TabsContent value="visual">
            <div className="space-y-6">
              {/* All Visual Editor fields */}
              <div>
                <Label htmlFor="agentName">
                  Name <span style={{ color: 'red' }}>*</span>
                </Label>
                <Input
                  id="agentName"
                  ref={(el) => {
                    inputRefs.current["name"] = el;
                  }}
                  value={localData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Agent name (MANDATORY)"
                  className={localErrors.find(e => e.toLowerCase().includes('name')) ? 'border-red-500' : ''}
                />
                {localErrors.find(e => e.toLowerCase().includes('name')) && (
                  <p className="text-red-600 text-sm mt-1">{localErrors.find(e => e.toLowerCase().includes('name'))}</p>
                )}
              </div>
              <div>
                <Label htmlFor="agentDescription">Description <span style={{ color: 'red' }}>*</span></Label>
                <Input
                  id="agentDescription"
                  ref={(el) => {
                    inputRefs.current["description"] = el;
                  }}
                  value={localData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Agent description (MANDATORY)"
                  className={localErrors.find(e => e.toLowerCase().includes('description')) ? 'border-red-500' : ''}
                />
                {localErrors.find(e => e.toLowerCase().includes('description')) && (
                  <p className="text-red-600 text-sm mt-1">{localErrors.find(e => e.toLowerCase().includes('description'))}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="agentVersion">Version <span style={{ color: 'red' }}>*</span></Label>
                  <Input
                    id="agentVersion"
                    ref={(el) => {
                      inputRefs.current["version"] = el;
                    }}
                    value={localData.version}
                    onChange={(e) => handleChange('version', e.target.value)}
                    placeholder="Semantic version (MANDATORY)"
                    className={localErrors.find(e => e.toLowerCase().includes('version')) ? 'border-red-500' : ''}
                  />
                  {localErrors.find(e => e.toLowerCase().includes('version')) && (
                    <p className="text-red-600 text-sm mt-1">{localErrors.find(e => e.toLowerCase().includes('version'))}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="protocolVersion">Protocol Version </Label>
                  <Input
                    id="protocolVersion"
                    value={localData.protocol_version}
                    onChange={(e) => handleChange('protocol_version', e.target.value)}
                    placeholder="e.g. 1.0 (OPTIONAL)"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="agentURL">Base URL <span style={{ color: 'red' }}>*</span></Label>
                <Input
                  id="agentURL"
                  ref={(el) => {
                    inputRefs.current["url"] = el;
                  }}
                  value={localData.url}
                  onChange={(e) => handleChange('url', e.target.value)}
                  placeholder="Agent endpoint (MANDATORY)"
                  className={localErrors.find(e => e.toLowerCase().includes('url')) ? 'border-red-500' : ''}
                />
                {localErrors.find(e => e.toLowerCase().includes('base url') || e.toLowerCase().includes('url')) && (
                  <p className="text-red-600 text-sm mt-1">{localErrors.find(e => e.toLowerCase().includes('base url') || e.toLowerCase().includes('url'))}</p>
                )}
              </div>
              <div>
                <Label htmlFor="preferredTransport">Preferred Transport</Label>
                <Input
                  id="preferredTransport"
                  value={localData.preferred_transport}
                  onChange={(e) => handleChange('preferred_transport', e.target.value)}
                  placeholder="e.g. HTTP+JSON (OPTIONAL)"
                />
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="inputModes">Input Modes (comma separated)</Label>
                  <Input
                    id="inputModes"
                    value={(localData.input_modes || []).join(', ')}
                    onChange={(e) =>
                      handleChange('input_modes', e.target.value.split(',').map((s) => s.trim()).filter(s => s.length > 0))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="outputModes">Output Modes (comma separated)</Label>
                  <Input
                    id="outputModes"
                    value={(localData.output_modes || []).join(', ')}
                    onChange={(e) =>
                      handleChange('output_modes', e.target.value.split(',').map((s) => s.trim()).filter(s => s.length > 0))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="defaultInputModes">Default Input Modes (comma separated)</Label>
                  <Input
                    id="defaultInputModes"
                    value={(localData.default_input_modes || []).join(', ')}
                    onChange={(e) =>
                      handleChange('default_input_modes', e.target.value.split(',').map((s) => s.trim()).filter(s => s.length > 0))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="defaultOutputModes">Default Output Modes (comma separated)</Label>
                  <Input
                    id="defaultOutputModes"
                    value={(localData.default_output_modes || []).join(', ')}
                    onChange={(e) =>
                      handleChange('default_output_modes', e.target.value.split(',').map((s) => s.trim()).filter(s => s.length > 0))
                    }
                  />
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-2">Capabilities (JSON Object)</h3>
                {Object.entries(localData.capabilities || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2 mb-2">
                    <Input
                      value={key}
                      readOnly
                      className="w-1/3 bg-gray-50 dark:bg-gray-800"
                    />
                    <Input
                      value={String(value)}
                      placeholder="Value (e.g., true, string)"
                      onChange={(e) => {
                        let newValue: string | boolean = e.target.value;
                        if (newValue.toLowerCase() === 'true') newValue = true;
                        else if (newValue.toLowerCase() === 'false') newValue = false;
                        handleCapabilityChange(key, newValue);
                      }}
                      className="flex-1"
                    />
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveCapability(key)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => handleCapabilityChange(`new_cap_${Object.keys(localData.capabilities).length + 1}`, true)}
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Capability
                </Button>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-2">Skills</h3>
                {(localData.skills || []).map((skill: any, idx: number) => (
                  <div key={idx} className="border rounded-md p-3 mb-3 space-y-2 relative group">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveSkill(idx)}
                    >
                      <XCircle className="w-5 h-5 text-red-500" />
                    </Button>
                    <Label>Name</Label>
                    <Input
                      value={skill.name}
                      placeholder="Skill Name (MANDATORY)"
                      onChange={(e) => handleUpdateSkill(idx, 'name', e.target.value)}
                    />
                    <Label>Description</Label>
                    <Input
                      value={skill.description}
                      placeholder="Skill Description (OPTIONAL)"
                      onChange={(e) => handleUpdateSkill(idx, 'description', e.target.value)}
                    />
                    <Label>Version</Label>
                    <Input
                      value={skill.version}
                      placeholder="Skill Version (OPTIONAL)"
                      onChange={(e) => handleUpdateSkill(idx, 'version', e.target.value)}
                    />
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={handleAddSkill}
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Skill
                </Button>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-2">Security Policies</h3>
                {(localData.security || []).map((policy: any, idx: number) => (
                  <div key={idx} className="border rounded-md p-3 mb-3 space-y-2 relative group">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveSecurityPolicy(idx)}
                    >
                      <XCircle className="w-5 h-5 text-red-500" />
                    </Button>
                    <Label>Policy Name</Label>
                    <Input
                      value={policy.policy_name}
                      placeholder="Policy Name (MANDATORY)"
                      onChange={(e) => handleUpdateSecurityPolicy(idx, 'policy_name', e.target.value)}
                    />
                    <Label>Details</Label>
                    <Textarea
                      value={policy.details}
                      placeholder="Policy Details (OPTIONAL)"
                      onChange={(e) => handleUpdateSecurityPolicy(idx, 'details', e.target.value)}
                    />
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`enforced-${idx}`}
                        checked={policy.enforced}
                        onChange={(e) => handleUpdateSecurityPolicy(idx, 'enforced', e.target.checked)}
                      />
                      <label htmlFor={`enforced-${idx}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Enforced (MANDATORY)
                      </label>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={handleAddSecurityPolicy}
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Policy
                </Button>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <label htmlFor="authExtendedCard" className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="authExtendedCard"
                    checked={localData.supports_authenticated_extended_card}
                    onChange={(e) => handleChange('supports_authenticated_extended_card', e.target.checked)}
                  />
                  <span>Supports Authenticated Extended Card</span>
                </label>
                <label htmlFor="feedbackEnabled" className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="feedbackEnabled"
                    checked={localData.feedback_enabled}
                    onChange={(e) => handleChange('feedback_enabled', e.target.checked)}
                  />
                  <span>Feedback Enabled</span>
                </label>
              </div>

              <Separator />

              <Button
                className="w-full flex items-center gap-2"
                onClick={handleAgentRegistrySubmit}
                disabled={loading}
              >
                {/* <Submit className="w-4 h-4" /> */}
                {loading ? 'Submitting...' : 'Submit Configuration'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="json">
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md space-y-4">
              <Textarea
                value={jsonEditorValue}
                onChange={(e) => handleJsonEditorChange(e.target.value)}
                className="font-mono text-sm h-64 resize-none"
              />
              <Button
                disabled={!isJsonValid || !!errors || localErrors.length > 0 || loading}
                className="w-full flex items-center gap-2"
                onClick={handleAgentRegistrySubmit}
              >
                <CheckCircle2 className="w-4 h-4" /> Use Edited JSON & Submit
              </Button>
              {localErrors.length > 0 && (
                <ul className="border-2 border-red-500 rounded-[5px] p-3 text-red-500 text-sm mt-2 space-y-1 bg-red-50 dark:bg-red-950/20">
                  {localErrors.map((err, idx) => (
                    <li key={idx} className="flex items-center gap-1">
                      <XCircle className="w-4 h-4" /> {err}
                    </li>
                  ))}
                </ul>
              )}

            </div>
          </TabsContent>

          <TabsContent value="upload">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="flex-1 w-full">
                <label
                  htmlFor="jsonUpload"
                  className="flex items-center justify-center gap-2 cursor-pointer rounded-md border border-dashed border-gray-300 dark:border-gray-600 p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <UploadCloud className="w-6 h-6" />
                  <span className="text-sm">
                    {jsonFile ? jsonFile.name : 'Click to upload JSON file'}
                  </span>
                </label>
                <input
                  type="file"
                  id="jsonUpload"
                  accept=".json,application/json"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            {jsonData && (
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md overflow-auto max-h-64 mt-4">
                <h4 className="text-sm font-semibold mb-2">Uploaded JSON Preview</h4>
                <pre className="text-sm font-mono">
                  {JSON.stringify(jsonData, null, 2)}
                </pre>
              </div>
            )}

            {errors && (
              <p className="flex items-center gap-2 border-2 border-red-500 rounded-[5px] p-3 text-red-500 text-sm mt-2 bg-red-50 dark:bg-red-950/20">
                <XCircle className="w-5 h-5 mt-[2px] flex-shrink-0" />
                {errors}
              </p>
            )}

            {jsonData && !errors && (
              <Button
                className="w-full flex items-center gap-2 mt-4"
                onClick={handleAgentRegistrySubmit}
                disabled={!isUploadedJsonValid || loading}
              >
                <CheckIcon className="w-4 h-4" /> Use Uploaded JSON & Submit
              </Button>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}