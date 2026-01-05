"use client";

import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { PromptEditor } from "@/components/PromptEditor";
import { useRouter } from "next/navigation";

export default function PlaygroundPage() {
  const router = useRouter();

  const handleSave = (prompt: any) => {
    // After saving, navigate to the assistant page
    // In production, this would save to the backend
    console.log("Saved prompt:", prompt);
    router.push("/assistant");
  };

  const handleNavigate = (view: string, data?: any) => {
    if (view === "assistant" || view === "prompt-manager") {
      router.push("/assistant");
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          title="Playground"
          description="Test and iterate on prompts in real-time."
        />
        <PromptEditor
          prompt={null}
          initialContent="You are a helpful assistant."
          isPlayground={true}
          onSave={handleSave}
          onNavigate={handleNavigate}
          hideHeader={true}
        />
      </div>
    </Layout>
  );
}




