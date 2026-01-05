"use client";

import { Layout } from "@/components/Layout";
import { AgentCatalogue } from "@/domains/agents/catalogue/AgentCatalogue";

export default function Page() {
  return (
    <Layout>
      <AgentCatalogue />
    </Layout>
  );
}