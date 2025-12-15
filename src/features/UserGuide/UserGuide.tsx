"use client";

import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/page-sections";

export const UserGuide = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          title="Documentation"
          description="Guides and tutorials for getting started with Agentrix"
        />
        <div className="text-gray-600 dark:text-gray-400">
          Documentation coming soon...
        </div>
      </div>
    </Layout>
  );
};
