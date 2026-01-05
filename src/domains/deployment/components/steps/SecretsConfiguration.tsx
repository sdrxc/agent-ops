"use client";

import { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Lock, X, Upload, FileJson, Trash2 } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { AgentDeploymentContext } from "../context/AgentDeploymentContext";
import { SecretValues } from "../../types";

interface SecretsConfigurationProps {
  sequenceID: string;
  projectID: string;
  userID: string | null | undefined;
  stepID?: string;
  onStepValidate: (isValid: boolean) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const runtimeEnv = process.env.NEXT_PUBLIC_APP_ENV;
const baseURL = process.env.NEXT_PUBLIC_API_URL || "";
const isLocalEnv = runtimeEnv === "local";

const SecretsConfiguration = ({
  sequenceID,
  projectID,
  userID,
  stepID,
  onStepValidate,
  onNext,
  onPrevious,
}: SecretsConfigurationProps) => {
  const { state, dispatch } = useContext(AgentDeploymentContext);
  const [form, setForm] = useState<SecretValues[]>(state.secretsManager || []);
  const [uploadMode, setUploadMode] = useState(false);
  const [jsonData, setJsonData] = useState<SecretValues[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // When coming back from Step6, restore existing secrets from context
  useEffect(() => {
    if (state.secretsManager && state.secretsManager.length > 0) {
      setForm(state.secretsManager);
      onStepValidate(true);
    } else if (state.secretsManager && state.secretsManager.length === 0) {
      // If we have an explicit empty array, we might still be valid if we don't enforce secrets
      // But let's assume validation is handled by API mainly, or if users click skip?
      // For now, let's just default to invalid if empty until they verify.
      // onStepValidate(false);
    }
  }, []);

  const addVariable = () => setForm([...form, { key: "", value: "" }]);
  const removeVariable = (index: number) =>
    setForm(form.filter((_, i) => i !== index));
  const updateVariable = (
    index: number,
    field: keyof SecretValues,
    value: string
  ) => {
    const updated = [...form];
    updated[index][field] = value;
    setForm(updated);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (
          Array.isArray(json) &&
          json.every((item) => item.key && item.value)
        ) {
          setJsonData(json);
          setForm(json); // Override manual form with JSON data
          setUploadMode(false); // Switch to manual view to show loaded secrets
          setErrorMessage("");
          toast.success(`Loaded ${json.length} secrets from JSON`);
        } else {
          setErrorMessage("JSON must be an array of { key, value } objects.");
          setJsonData([]);
        }
      } catch {
        setErrorMessage("Invalid JSON file format.");
        setJsonData([]);
      }
    };
    reader.readAsText(file);
  };

  const saveConfig = async () => {
    const secretsToSave = form; // We are always using 'form' as the source of truth now (json upload populates form)
    setSubmitting(true);
    try {
      const apiUrl = isLocalEnv
        ? `${baseURL}/api/step5-secretsUpload`
        : `/api/step5-secretsUpload`;
      const response = await axios.post(apiUrl, {
        projectID,
        sequenceID,
        userID,
        form: secretsToSave,
      });

      if (response.status == 200 || response.status == 201) {
        toast.success("Secrets Configured Successfully!", {
          style: { background: "#dcfce7", color: "#166534" },
        });

        // Update global context
        dispatch({
          type: "SET_SECRETS_MANAGER",
          payload: secretsToSave,
        });
        onStepValidate(true);
        // onNext(); // Advance removed
      } else {
        toast.error("Failed to save secrets");
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save secrets");
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Validation for both modes
  // const isManualValid = form.length > 0 && form.every((env) => env.key.trim() && env.value.trim());
  // Let's rely on server validation primarily, but basic client validation:
  // If they have entries, they must be complete. If empty, maybe that's valid (no secrets) is up to logic.
  // Assuming at least one secret IS NOT strictly required by UI logic unless business rule says so.
  // The original code had: const isManualValid = form.length > 0 && ...
  // So we will stick to that.
  const isFormValid =
    form.length > 0 && form.every((env) => env.key.trim() && env.value.trim());

  // Auto-update global context whenever form changes is risky if we don't validate.
  // We'll trust local state 'form' and only push to context on Save probably?
  // Original code pushed to context on effect [form]. We can keep that.
  useEffect(() => {
    dispatch({ type: "SET_SECRETS_MANAGER", payload: form });
    onStepValidate(isFormValid);
  }, [form]);

  // Initial Validation Check
  useEffect(() => {
    const checkValidation = async () => {
      try {
        const url = isLocalEnv
          ? `${baseURL}/api/step5-validate`
          : `/api/step5-validate`;
        const res = await axios.post(url, {
          projectID,
          sequenceID,
          userID,
          stepID,
        });
        if (res?.data?.data?.valid === true) {
          onStepValidate(true);
        }
      } catch {}
    };
    checkValidation();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center pb-4 border-b border-border">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Lock className="w-6 h-6 text-primary" /> Environment Secrets
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage sensitive environment variables and keys.
          </p>
        </div>
        <div className="flex gap-2">
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-background border border-border rounded-lg hover:bg-muted transition shadow-sm">
              <Upload className="w-4 h-4" /> Import JSON
            </div>
          </label>
        </div>
      </div>

      <div className="space-y-4">
        {form.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-xl bg-muted/50">
            <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-medium text-foreground">
              No Secrets Configured
            </h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-6">
              Add environment variables manually or import them from a JSON
              file.
            </p>
            <Button onClick={addVariable} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" /> Add First Variable
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {form.map((env, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-2 rounded-lg group"
              >
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Key (e.g. API_KEY)"
                    value={env.key}
                    onChange={(e) =>
                      updateVariable(index, "key", e.target.value)
                    }
                    className="font-mono text-sm"
                  />
                  <Input
                    placeholder="Value"
                    value={env.value}
                    type="password"
                    onChange={(e) =>
                      updateVariable(index, "value", e.target.value)
                    }
                    className="font-mono text-sm"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="opacity-20 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-colors"
                  onClick={() => removeVariable(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <div className="pt-2">
              <Button type="button" variant="link" onClick={addVariable}>
                <Plus className="h-4 w-4 mr-2" /> Add Another Variable
              </Button>
            </div>
          </div>
        )}

        {/* Error message display */}
        {errorMessage && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
            {errorMessage}
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-border mt-8">
          <Button
            variant="default"
            size="lg"
            className="w-full md:w-auto"
            onClick={saveConfig}
            disabled={!isFormValid || submitting}
          >
            {submitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SecretsConfiguration;
