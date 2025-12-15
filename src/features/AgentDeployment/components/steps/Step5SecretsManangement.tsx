"use client";

import { useContext, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Rocket, X, Upload } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { AgentDeploymentContext } from "../context/AgentDeploymentContext";
import { SecretValues } from "../../types";

interface Step5CICDConfigProps {
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


const Step5CICDConfig = ({ sequenceID, projectID, userID, stepID, onStepValidate, onNext, onPrevious }: Step5CICDConfigProps) => {
  const { state, dispatch } = useContext(AgentDeploymentContext);
  const [form, setForm] = useState<SecretValues[]>(state.secretsManager || []);
  const [uploadMode, setUploadMode] = useState(false);
  const [jsonData, setJsonData] = useState<SecretValues[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // When coming back from Step6, restore existing secrets from context
  useEffect(() => {
    if (state.secretsManager && state.secretsManager.length > 0) {
      setForm(state.secretsManager);
      onStepValidate(true);
    } else {
      onStepValidate(false);
    }
  }, []);

  const addVariable = () => setForm([...form, { key: "", value: "" }]);
  const removeVariable = (index: number) => setForm(form.filter((_, i) => i !== index));
  const updateVariable = (index: number, field: keyof SecretValues, value: string) => {
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
        if (Array.isArray(json) && json.every((item) => item.key && item.value)) {
          setJsonData(json);
          setForm(json);
          setErrorMessage("");
        } else {
          setErrorMessage("JSON must be an array of { key, value } objects.");
          setJsonData([]);
          setForm([]);
        }
      } catch {
        setErrorMessage("Invalid JSON file format.");
        setJsonData([]);
        setForm([]);
      }
    };
    reader.readAsText(file);
  };

  const saveConfig = async () => {
    const secretsToSave = uploadMode ? jsonData : form;
    console.log("Saved Config form", form);
    try {
      const apiUrl = isLocalEnv ? `${baseURL}/api/step5-secretsUpload` : `/api/step5-secretsUpload`;
      const response = await axios.post(apiUrl, {
        projectID,
        sequenceID,
        userID,
        form: secretsToSave
      });

      console.log("secrets-upload status", response)

      if (response.status == 200 || response.status == 201) {
        toast.success("Secrets Saved Successfully!!", {
          style: { background: "#dcfce7", color: "#166534" },
        });

        toast.success("Click on Next to continue", {
          style: { background: "#dcfce7", color: "#166534" },
        });

        // Update global context
        dispatch({
          type: "SET_SECRETS_MANAGER",
          payload: secretsToSave,
        });
        onStepValidate(true);
      }
    }
    catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save secrets");
    }

  };

  const handleValidate = async () => {
    setLoading(true);
    try {
      const runtimeEnv = process.env.NEXT_PUBLIC_APP_ENV;
      const baseURL = process.env.NEXT_PUBLIC_API_URL || "";

      const isLocalEnv = runtimeEnv === "local";
      const url = isLocalEnv
        ? `${baseURL}/api/step5-validate`
        : `/api/step5-validate`;
      const res = await axios.post(url, {
        projectID,
        sequenceID,
        userID,
        stepID
      });
      if (res?.data?.data?.valid === true) {
        onStepValidate(true);
      } else {
        onStepValidate(false);
      }
    } catch {
      onStepValidate(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleValidate();
  }, []);

  // ✅ Validation for both modes
  const isManualValid =
    form.length > 0 && form.every((env) => env.key.trim() && env.value.trim());
  const isJsonValid =
    jsonData.length > 0 &&
    jsonData.every((env) => env.key.trim() && env.value.trim());

  // ✅ Validation: at least one filled key-value pair, no empty keys or values
  const isFormValid = uploadMode ? isJsonValid : isManualValid;

  // Auto-update global context whenever form changes
  useEffect(() => {
    dispatch({ type: "SET_SECRETS_MANAGER", payload: form });
    onStepValidate(isFormValid);
  }, [form]);


  return (
    <Card className="shadow-lg rounded-2xl border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Rocket className="h-5 w-5 text-purple-500" />
          <span>Secret Manager</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Mode Switch Buttons */}
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant={!uploadMode ? "default" : "outline"}
            onClick={() => { 
              setUploadMode(false);
              setJsonData([]);
              setErrorMessage("");
            }}
            className="rounded-xl"
          >
            Manual
          </Button>
          <Button
            type="button"
            variant={uploadMode ? "default" : "outline"}
            onClick={() => setUploadMode(true)}
            className="rounded-xl"
          >
            <Upload className="h-4 w-4 mr-2" /> JSON Upload
          </Button>
        </div>

        {!uploadMode ? (
          <div className="space-y-4">
            {form.map((env, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition"
              >
                <Input
                  placeholder="Key"
                  value={env.key}
                  className="flex-1"
                  onChange={(e) => updateVariable(index, "key", e.target.value)}
                />
                <Input
                  placeholder="Value"
                  value={env.value}
                  className="flex-1"
                  onChange={(e) => updateVariable(index, "value", e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="hover:bg-red-100 hover:text-red-600"
                  onClick={() => removeVariable(index)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addVariable}
              className="rounded-xl"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Variable
            </Button>
          </div>
        ) : (
          // JSON Upload Mode
          <div>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 p-2"
            />
            {jsonData.length > 0 && (
              <div className="text-sm text-green-700 bg-green-50 p-2 rounded-md mt-2">
                {jsonData.length} {jsonData.length === 1 ? "secret" : "secrets"} loaded from JSON
              </div>
            )}
          </div>
        )}

        {/* Error message display */}
        {errorMessage && (
          <div className="text-sm text-red-700 bg-red-50 p-2 rounded-md border border-red-200">
            {errorMessage}
          </div>
        )}

        {/* Save Button */}
        <Button className="w-full flex items-center gap-2" onClick={saveConfig} disabled={!isFormValid}>
          Save Secrets
        </Button>
      </CardContent>
    </Card>
  );
};

export default Step5CICDConfig;
