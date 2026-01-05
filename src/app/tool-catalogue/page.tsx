"use client";

import { Layout } from "@/components/Layout";
import { ToolCatalogue } from "@/domains/tools/ToolCatalogue";

export default function Page() {
  return (
    <Layout>
      <ToolCatalogue />
    </Layout>
  );
}