"use client";

import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { PromptEditor } from "@/components/PromptEditor";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Rocket } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";

// Types matching the assistant page
interface AssistantVersion {
  version: string;
  label: string;
  content: string;
  variables: string[];
  updatedAt: string;
  author: string;
}

interface Assistant {
  id: string;
  name: string;
  description: string;
  tags: string[];
  versions: AssistantVersion[];
  latestVersion: string;
}

// Mock data - in production this would come from an API
const mockAssistants: Assistant[] = [
  {
    id: "a_1",
    name: "Customer Support Persona",
    description: "Standard friendly support agent prompt with refund guidelines.",
    tags: ["Support", "External"],
    latestVersion: "v2.1",
    versions: [
      {
        version: "v2.1",
        label: "Production",
        content: `You are a helpful customer support agent for Acme Corp. 
Your tone should be empathetic and concise.
When handling refunds, always ask for the order ID first.
Current User Context: {{user_context}}
History: {{chat_history}}`,
        variables: ["user_context", "chat_history"],
        updatedAt: "2 days ago",
        author: "Sarah J.",
      },
      {
        version: "v1.0",
        label: "Deprecated",
        content: `You are a support bot. Answer questions.`,
        variables: [],
        updatedAt: "2 months ago",
        author: "Mike T.",
      },
    ],
  },
  {
    id: "a_2",
    name: "SQL Query Generator",
    description: "Converts natural language to Snowflake SQL dialect.",
    tags: ["Dev", "Data", "Internal"],
    latestVersion: "v1.5",
    versions: [
      {
        version: "v1.5",
        label: "Staging",
        content: `You are an expert SQL Data Analyst.
Convert the following natural language request into a valid Snowflake SQL query.
Schema: {{schema_definition}}
Request: {{user_request}}
Do not explain, just output SQL.`,
        variables: ["schema_definition", "user_request"],
        updatedAt: "5 hours ago",
        author: "Dev User",
      },
    ],
  },
  {
    id: "a_3",
    name: "Cold Email Outreach",
    description: "Sales template for initial LinkedIn contact.",
    tags: ["Sales", "Marketing"],
    latestVersion: "v3.0",
    versions: [
      {
        version: "v3.0",
        label: "Draft",
        content: `Hi {{prospect_name}},
I noticed your work at {{company_name}} and was impressed by {{achievement}}.
Our solution helps teams like yours reduce cloud costs by 30%.
Would you be open to a 5-min chat?`,
        variables: ["prospect_name", "company_name", "achievement"],
        updatedAt: "Just now",
        author: "SalesTeam",
      },
    ],
  },
];

// Convert Assistant to Prompt format for PromptEditor
function assistantToPrompt(assistant: Assistant) {
  return {
    id: assistant.id,
    name: assistant.name,
    description: assistant.description,
    tags: assistant.tags,
    versions: assistant.versions.map((v) => ({
      version: v.version,
      label: v.label,
      content: v.content,
      variables: v.variables,
      updatedAt: v.updatedAt,
      author: v.author,
    })),
    latestVersion: assistant.latestVersion,
  };
}

export default function AssistantEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [assistant, setAssistant] = useState<Assistant | null>(null);
  const [promptName, setPromptName] = useState("");
  const [editorIsSaving, setEditorIsSaving] = useState(false);

  // Find assistant by ID - legitimate data fetching pattern
  useEffect(() => {
    const found = mockAssistants.find((a) => a.id === id);
    if (found) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAssistant(found);
      setPromptName(found.name);
    }
  }, [id]);

  // Handle save from editor
  const handleSave = useCallback((prompt: any) => {
    // In production, this would call an API to save the prompt
    console.log("Saved prompt:", prompt);
    // Update local state
    if (assistant) {
      setAssistant({
        ...assistant,
        name: prompt.name,
        versions: prompt.versions,
        latestVersion: prompt.latestVersion,
      });
      setPromptName(prompt.name);
    }
    // Navigate back to assistant list
    router.push("/assistant");
  }, [assistant, router]);

  // Handle deploy
  const handleDeploy = useCallback((name: string, version: string) => {
    // In production, this would call an API to deploy
    console.log("Deploy prompt:", name, version);
    // For now, just show an alert
    alert(`Deploying ${name} version ${version}`);
  }, []);

  // Handle save button click
  const handleSaveClick = useCallback(() => {
    if (handlersRef.current.save) {
      handlersRef.current.save();
    }
  }, []);

  // Handle deploy button click
  const handleDeployClick = useCallback(() => {
    if (handlersRef.current.deploy) {
      handlersRef.current.deploy();
    }
  }, []);

  // Get handlers from editor - use refs to avoid infinite loops
  const handlersRef = useRef<{
    save: (() => void) | null;
    deploy: (() => void) | null;
  }>({ save: null, deploy: null });

  // Handler for when editor handlers are ready
  // Using Object.assign to avoid React Compiler immutability warnings on ref
  const handleHandlersReady = (handlers: {
    save: () => void;
    deploy: () => void;
    isSaving: boolean;
    promptName: string;
    setPromptName: (name: string) => void;
  }) => {
    // Store handlers in ref object using Object.assign
    Object.assign(handlersRef.current, {
      save: handlers.save,
      deploy: handlers.deploy,
    });
    // Only update isSaving state as it's needed for UI
    setEditorIsSaving(handlers.isSaving);
  };

  if (!assistant) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">Prompt not found</p>
            <Button
              variant="outline"
              onClick={() => router.push("/assistant")}
              className="mt-4"
            >
              Back to Prompt Manager
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const prompt = assistantToPrompt(assistant);
  const latestVersion = assistant.versions.find(
    (v) => v.version === assistant.latestVersion
  ) || assistant.versions[0];

  return (
    <Layout fullWidth>
      <div className="flex flex-col h-full">
        <div className="flex-none px-4 py-4 md:px-6 border-b">
          <PageHeader
            backButton={{ href: "/assistant", label: "Back to Prompt Manager" }}
            editableTitle={{
              value: promptName,
              onChange: setPromptName,
              placeholder: "Prompt name",
            }}
            description={
              latestVersion && (
                <Badge variant="outline" className="text-xs font-mono">
                  {latestVersion.version} • {latestVersion.label}
                </Badge>
              )
            }
            actions={
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleSaveClick}
                  disabled={editorIsSaving}
                  variant="outline"
                  size="sm"
                >
                  {editorIsSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save
                </Button>
                <Button
                  onClick={handleDeployClick}
                  size="sm"
                >
                  <Rocket className="h-4 w-4 mr-2" />
                  Deploy
                </Button>
              </div>
            }
          />
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          <PromptEditor
            prompt={prompt}
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

