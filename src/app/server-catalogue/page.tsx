"use client";

import { Layout } from "@/components/Layout";
import { ServerCatalogue } from "@/domains/servers/ServerCatalogue";

export default function Page() {
  return (
    <Layout>
      <ServerCatalogue projectID="" />
    </Layout>
  );
}