"use client";

import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { PromptEditor } from "@/components/PromptEditor";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Rocket } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";

export default function AssistantNewPage() {
  const router = useRouter();
  const [promptName, setPromptName] = useState("New Prompt");
  const [isSaving, setIsSaving] = useState(false);
  const [saveHandler, setSaveHandler] = useState<(() => void) | null>(null);
  const [deployHandler, setDeployHandler] = useState<(() => void) | null>(null);
  const [editorIsSaving, setEditorIsSaving] = useState(false);

  // Handle save from editor
  const handleSave = useCallback((prompt: any) => {
    // In production, this would call an API to save the prompt
    console.log("Saved prompt:", prompt);
    // Navigate back to assistant list
    router.push("/assistant");
  }, [router]);

  // Handle deploy
  const handleDeploy = useCallback((name: string, version: string) => {
    // In production, this would call an API to deploy
    console.log("Deploy prompt:", name, version);
    // For now, just show an alert
    alert(`Deploying ${name} version ${version}`);
  }, []);

  // Handle save button click
  const handleSaveClick = useCallback(() => {
    if (saveHandler) {
      saveHandler();
    }
  }, [saveHandler]);

  // Handle deploy button click
  const handleDeployClick = useCallback(() => {
    if (deployHandler) {
      deployHandler();
    }
  }, [deployHandler]);

  // Get handlers from editor
  const handleHandlersReady = useCallback((handlers: {
    save: () => void;
    deploy: () => void;
    isSaving: boolean;
    promptName: string;
    setPromptName: (name: string) => void;
  }) => {
    setSaveHandler(() => handlers.save);
    setDeployHandler(() => handlers.deploy);
    setEditorIsSaving(handlers.isSaving);
    // Sync promptName if it's different
    if (handlers.promptName !== promptName && handlers.promptName) {
      setPromptName(handlers.promptName);
    }
  }, [promptName]);

  return (
    <Layout fullWidth>
      <div className="flex flex-col h-full">
        <div className="flex-none px-4 md:px-6 py-4">
          <PageHeader
            backButton={{ href: "/assistant", label: "Back to Prompt Manager" }}
            editableTitle={{
              value: promptName,
              onChange: setPromptName,
              placeholder: "Prompt name",
            }}
            actions={
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleSaveClick}
                  disabled={isSaving || editorIsSaving}
                  variant="outline"
                  size="sm"
                >
                  {(isSaving || editorIsSaving) ? (
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 w-4 h-4" />
                  )}
                  Save
                </Button>
                <Button
                  onClick={handleDeployClick}
                  disabled={!deployHandler}
                  size="sm"
                >
                  <Rocket className="mr-2 w-4 h-4" />
                  Deploy
                </Button>
              </div>
            }
          />
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          <PromptEditor
            prompt={null}
            hideHeader={true}
            onSave={handleSave}
            onDeploy={handleDeploy}
            onHandlersReady={handleHandlersReady}
            controlledPromptName={promptName}
            onPromptNameChange={setPromptName}
          />
        </div>
      </div>
    </Layout>
  );
}

