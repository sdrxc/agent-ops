"use client";

import { Layout } from "@/components/Layout";
import { IncidentReporting } from "@/domains/incidents/IncidentReporting";

export default function IncidentsPage() {
  return (
    <Layout>
      <IncidentReporting />
    </Layout>
  );
}

