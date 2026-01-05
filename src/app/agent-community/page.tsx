"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/Layout";
import { AgentHub } from "@/features/Agenthub/Agenthub";
import { useFeatureFlags } from "@/contexts/FeatureFlagsContext";

export default function AgentCommunityPage() {
  const router = useRouter();
  const { agentCommunityEnabled } = useFeatureFlags();

  useEffect(() => {
    if (!agentCommunityEnabled) {
      router.push("/");
    }
  }, [agentCommunityEnabled, router]);

  if (!agentCommunityEnabled) {
    return null;
  }

  return (
    <Layout>
      <AgentHub />
    </Layout>
  );
}

