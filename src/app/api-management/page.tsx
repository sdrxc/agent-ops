"use client";

import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { ProjectKeyManager } from "@/components/features/api-keys/ProjectKeyManager";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGlobalContext } from "@/app/GlobalContextProvider";
import axios from "axios";
import { ApiKey } from "@/types/api";

const runtimeEnv = process.env.NEXT_PUBLIC_APP_ENV;
const baseURL = process.env.NEXT_PUBLIC_API_URL || "";
const isLocalEnv = runtimeEnv === "local";

export default function APIManagementPage() {
  const { user } = useGlobalContext();
  const userId = user?.userID;
  const queryClient = useQueryClient();

  // Fetch projects
  const { data: projectsData } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const url = isLocalEnv
        ? `${baseURL}/api/listProjects`
        : `/api/listProjects`;

      const response = await axios.post(
        url,
        { userID: userId },
        { headers: { "Content-Type": "application/json" } }
      );

      // Handle both response formats (same as My Agents page)
      const projectsData = Array.isArray(response.data)
        ? response.data
        : response.data?.data?.projects || [];
      
      return projectsData;
    },
    enabled: !!userId,
  });

  // Fetch API keys
  const { data: apiKeysData, refetch: refetchKeys } = useQuery<ApiKey[]>({
    queryKey: ["api-keys", userId],
    queryFn: async () => {
      const url = isLocalEnv
        ? `${baseURL}/api/api-keys/list`
        : `/api/api-keys/list`;

      const response = await axios.post(
        url,
        { userID: userId },
        { headers: { "Content-Type": "application/json" } }
      );

      return response.data?.data?.apiKeys || [];
    },
    enabled: !!userId,
  });

  // Create key mutation
  const createKeyMutation = useMutation({
    mutationFn: async ({
      name,
      projectId,
    }: {
      name: string;
      projectId: string;
    }) => {
      const url = isLocalEnv
        ? `${baseURL}/api/api-keys/create`
        : `/api/api-keys/create`;

      const response = await axios.post(
        url,
        {
          name,
          userID: userId,
          projectID: projectId,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data?.data?.rawKey) {
        return response.data.data.rawKey;
      }
      throw new Error("Failed to create key");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
  });

  // Revoke key mutation
  const revokeKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      const url = isLocalEnv
        ? `${baseURL}/api/api-keys/revoke`
        : `/api/api-keys/revoke`;

      const response = await axios.post(
        url,
        {
          keyID: keyId,
          userID: userId,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || "Failed to revoke key");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
  });

  const projects =
    projectsData?.map((p: any) => ({
      id: p.projectID,
      name: p.projectName,
    })) || [];

  const apiKeys = apiKeysData || [];

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          title="API Management"
          description="Create and manage secure access keys for your projects"
        />

        <ProjectKeyManager
          userId={userId || ""}
          projects={projects}
          existingKeys={apiKeys}
          onCreateKey={async (name, projectId) => {
            return await createKeyMutation.mutateAsync({ name, projectId });
          }}
          onRevokeKey={async (keyId) => {
            await revokeKeyMutation.mutateAsync(keyId);
          }}
          onRefresh={() => {
            refetchKeys();
          }}
        />
      </div>
    </Layout>
  );
}




