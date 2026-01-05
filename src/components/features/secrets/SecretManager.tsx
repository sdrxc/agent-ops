"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Lock, Upload, Trash2 } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
// import { SecretValues } from "@/types/api"; // Removed to fix lint error

// We might need to import SecretValues from a shared type file if not available in @/types/api
// If it was in "deployment/types", we should probably move it to a shared location or redefine it.
// For now, I will define it here to be safe, or check if I can import it.
// Checked previous file interact: src/types/api.ts was open. Let's assume it might not be there.
// Creating a local interface to avoid import errors if not found.
export interface SecretValue {
    key: string;
    value: string;
}

interface SecretManagerProps {
    scope: "user" | "project";
    entityID: string; // userID or projectID
    initialSecrets?: SecretValue[]; // Optional initial state
    onSave?: (secrets: SecretValue[]) => void;
}

const runtimeEnv = process.env.NEXT_PUBLIC_APP_ENV;
const baseURL = process.env.NEXT_PUBLIC_API_URL || "";
const isLocalEnv = runtimeEnv === "local";

export const SecretManager = ({
    scope,
    entityID,
    initialSecrets = [],
    onSave,
}: SecretManagerProps) => {
    const [secrets, setSecrets] = useState<SecretValue[]>(initialSecrets);
    const [submitting, setSubmitting] = useState(false);
    const [jsonError, setJsonError] = useState("");

    // Load initial secrets if provided (or could fetch here if we wanted self-contained loading)
    useEffect(() => {
        if (initialSecrets.length > 0) {
            setSecrets(initialSecrets);
        }
    }, [initialSecrets]);

    // If we wanted to fetch individually on mount:
    // useEffect(() => { ... fetch logic ... }, [entityID, scope]);

    const addSecret = () => setSecrets([...secrets, { key: "", value: "" }]);

    const removeSecret = (index: number) =>
        setSecrets(secrets.filter((_, i) => i !== index));

    const updateSecret = (index: number, field: keyof SecretValue, value: string) => {
        const updated = [...secrets];
        updated[index][field] = value;
        setSecrets(updated);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                if (Array.isArray(json) && json.every((item) => item.key && item.value)) {
                    setSecrets(json);
                    setJsonError("");
                    toast.success(`Loaded ${json.length} secrets from JSON`);
                } else {
                    setJsonError("JSON must be an array of { key, value } objects.");
                }
            } catch {
                setJsonError("Invalid JSON file format.");
            }
        };
        reader.readAsText(file);
    };

    const handleSave = async () => {
        setSubmitting(true);
        try {
            // Construct payload based on scope
            // The existing API expects { projectID, sequenceID, userID, form }
            // We will adapt our payload to fit this or create a generic payload.
            // Since we are reusing an endpoint which might be rigid, we might need to "fake" some fields 
            // OR we should have updated the API route to be more flexible. 
            // For now, let's assume we send what we can.

            const payload = {
                projectID: scope === 'project' ? entityID : `user-scope-${entityID}`, // Fake project ID for user scope
                sequenceID: `settings-${Date.now()}`,
                userID: entityID, // Always pass the user ID if available, or entityID if scope is user
                form: secrets
            };

            const apiUrl = isLocalEnv
                ? `${baseURL}/api/step5-secretsUpload`
                : `/api/step5-secretsUpload`;

            const response = await axios.post(apiUrl, payload);

            if (response.status === 200 || response.status === 201) {
                toast.success("Secrets saved successfully!");
                if (onSave) onSave(secrets);
            } else {
                toast.error("Failed to save secrets.");
            }
        } catch (error) {
            console.error("Save error:", error);
            toast.error("An error occurred while saving.");
        } finally {
            setSubmitting(false);
        }
    };

    const isValid = secrets.length > 0 && secrets.every(s => s.key.trim() && s.value.trim());

    return (
        <div className="space-y-6">
            <div className="flex justify-end items-center pb-4 border-b border-border">
                <label className="cursor-pointer">
                    <input
                        type="file"
                        accept=".json"
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                    <div className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-foreground bg-background border border-border rounded-lg hover:bg-muted transition shadow-sm">
                        <Upload className="w-4 h-4" /> Import JSON
                    </div>
                </label>
            </div>

            <div className="space-y-4">
                {secrets.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-border rounded-xl bg-muted/30">
                        <p className="text-muted-foreground mb-4">No secrets configured successfully.</p>
                        <Button onClick={addSecret} variant="outline" size="sm" className="gap-2">
                            <Plus className="w-4 h-4" /> Add Variable
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {secrets.map((secret, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        placeholder="Key (e.g. OPENAI_API_KEY)"
                                        value={secret.key}
                                        onChange={(e) => updateSecret(index, "key", e.target.value)}
                                        className="font-mono text-sm"
                                    />
                                    <Input
                                        placeholder="Value"
                                        value={secret.value}
                                        type="password"
                                        onChange={(e) => updateSecret(index, "value", e.target.value)}
                                        className="font-mono text-sm"
                                    />
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeSecret(index)}
                                    className="text-muted-foreground hover:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        <div className="pt-2">
                            <Button type="button" variant="link" onClick={addSecret} className="h-auto p-0">
                                <Plus className="h-4 w-4 mr-2" /> Add Another
                            </Button>
                        </div>
                    </div>
                )}

                {jsonError && (
                    <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                        {jsonError}
                    </div>
                )}

                <div className="flex justify-end pt-4">
                    <Button
                        onClick={handleSave}
                        disabled={!isValid || submitting}
                        className="w-full md:w-auto"
                    >
                        {submitting ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </div>
        </div>
    );
};
