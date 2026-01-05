"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { Rocket, UserPlus } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useGlobalContext } from "@/app/GlobalContextProvider";
import { motion } from "framer-motion";

export default function NewProjectPage() {
  const router = useRouter();
  const { user, loading } = useGlobalContext();

  // Form state
  const [projectName, setProjectName] = useState("New Project");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [enableMemoryManagement, setEnableMemoryManagement] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [projectID, setProjectID] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Validate form (description required for deploy/register actions)
  useEffect(() => {
    const valid =
      projectName.trim().length > 0 &&
      description.trim().length > 0 &&
      !!user &&
      !loading;

    setIsFormValid(valid);
  }, [projectName, description, user, loading]);

  // Create project function
  const createProject = async (projectData: any) => {
    const env = process.env.NEXT_PUBLIC_APP_ENV;
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "";

    const endpoint =
      env === "local" ? `${baseURL}/api/create-project` : "/api/create-project";

    const response = await axios.post(endpoint, projectData);

    if (response.status === 200 || response.status === 201) {
      return response.data;
    }

    throw new Error("Failed to create project");
  };

  // Update project function
  const updateProject = async (projectID: string, projectData: any) => {
    const env = process.env.NEXT_PUBLIC_APP_ENV;
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "";

    const endpoint =
      env === "local" ? `${baseURL}/api/update-project` : "/api/update-project";

    const response = await axios.post(endpoint, {
      projectID,
      ...projectData,
    });

    if (response.status === 200 || response.status === 201) {
      return response.data;
    }

    throw new Error("Failed to update project");
  };

  // Auto-save project (create or update)
  const autoSaveProject = useCallback(async () => {
    if (!user?.userID || loading) return;
    // Only require project name for auto-save, description can be empty
    if (!projectName.trim()) return;

    console.log("Auto-saving project:", projectName);
    setIsSaving(true);

    const projectData = {
      projectName,
      description,
      createdBy: user.userID,
      tags: tags
        ? tags
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t.length > 0)
        : [],
      enableMemoryManagement,
    };

    try {
      if (!projectID) {
        // Create new project
        const response = await createProject(projectData);
        const newProjectID = response?.data?.projectID;

        if (newProjectID) {
          setProjectID(newProjectID);
          toast.success("Project created!", {
            style: { background: "#dcfce7", color: "#166534" },
          });
        }
      } else {
        // Update existing project
        await updateProject(projectID, projectData);
      }
    } catch (error: any) {
      console.error("Auto-save error:", error);
      toast.error("Failed to save project", {
        style: { background: "#fee2e2", color: "#b91c1c" },
      });
    } finally {
      setIsSaving(false);
    }
  }, [
    projectID,
    projectName,
    description,
    tags,
    enableMemoryManagement,
    user,
    loading,
  ]);

  // Debounced auto-save effect
  useEffect(() => {
    if (!user?.userID || loading) return;
    // Only trigger auto-save if project name is present
    if (!projectName.trim()) return;

    console.log("⏱️ Auto-save will trigger in 1 second...");
    const timeoutId = setTimeout(() => {
      autoSaveProject();
    }, 1000); // Save 1 second after user stops typing

    return () => clearTimeout(timeoutId);
  }, [
    projectName,
    description,
    tags,
    enableMemoryManagement,
    autoSaveProject,
    user,
    loading,
  ]);

  // Handle deploy agent - use existing projectID or create project first
  const handleDeployAgent = useCallback(async () => {
    if (!isFormValid) {
      toast.error("Please fill in all required fields first.");
      return;
    }

    if (projectID) {
      // Project already exists, just navigate
      router.push(`/projectAgentDeployment/${encodeURIComponent(projectID)}`);
      return;
    }

    // Need to create project first
    setIsSubmitting(true);

    const projectData = {
      projectName,
      description,
      createdBy: user!.userID,
      tags: tags
        ? tags
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t.length > 0)
        : [],
      enableMemoryManagement,
    };

    try {
      const response = await createProject(projectData);
      const newProjectID = response?.data?.projectID;

      if (newProjectID) {
        setProjectID(newProjectID);
        router.push(
          `/projectAgentDeployment/${encodeURIComponent(newProjectID)}`
        );
      } else {
        toast.error("Project created but no ID returned. Please try again.");
      }
    } catch (error: any) {
      console.error("Submission error:", error);
      const errMsg =
        error.response?.data?.error?.message ||
        "Project creation failed. Try again!";
      toast.error(errMsg, {
        style: { background: "#fee2e2", color: "#b91c1c" },
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isFormValid,
    projectID,
    projectName,
    description,
    tags,
    enableMemoryManagement,
    user,
    router,
  ]);

  // Handle register agent - use existing projectID or create project first
  const handleRegisterAgent = useCallback(async () => {
    if (!isFormValid) {
      toast.error("Please fill in all required fields first.");
      return;
    }

    if (projectID) {
      // Project already exists, just navigate
      router.push(`/projects/${projectID}`);
      return;
    }

    // Need to create project first
    setIsSubmitting(true);

    const projectData = {
      projectName,
      description,
      createdBy: user!.userID,
      tags: tags
        ? tags
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t.length > 0)
        : [],
      enableMemoryManagement,
    };

    try {
      const response = await createProject(projectData);
      const newProjectID = response?.data?.projectID;

      if (newProjectID) {
        setProjectID(newProjectID);
        router.push(`/projects/${newProjectID}`);
      } else {
        toast.error("Project created but no ID returned. Please try again.");
      }
    } catch (error: any) {
      console.error("Submission error:", error);
      const errMsg =
        error.response?.data?.error?.message ||
        "Project creation failed. Try again!";
      toast.error(errMsg, {
        style: { background: "#fee2e2", color: "#b91c1c" },
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isFormValid,
    projectID,
    projectName,
    description,
    tags,
    enableMemoryManagement,
    user,
    router,
  ]);

  return (
    <Layout>
      <div className="flex flex-col h-full space-y-6">
        {/* Header with editable title */}
        <PageHeader
          backButton={{ href: "/agents", label: "Back to Agents" }}
          editableTitle={{
            value: projectName,
            onChange: setProjectName,
            placeholder: "Project name",
          }}
          description={
            isSaving ? (
              <p className="text-sm text-muted-foreground">Saving...</p>
            ) : projectID ? (
              <p className="text-sm text-muted-foreground">All changes saved</p>
            ) : null
          }
        />

        {/* Main Content */}
        <div className="space-y-6">
          {/* Project Details Card */}
          <Card>
            <CardContent className="pt-6 space-y-6">
              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Enter project description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags" className="text-sm font-medium">
                  Tags <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="tags"
                  placeholder="Enter tags separated by commas (e.g., AI, Production, Testing)"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Separate multiple tags with commas
                </p>
              </div>

              {/* Memory Management Toggle */}
              <div className="flex items-center justify-between space-x-2 pt-2">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="memory-management"
                    className="text-sm font-medium"
                  >
                    Enable Memory Management
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Allow agents in this project to store and retrieve memory
                  </p>
                </div>
                <Switch
                  id="memory-management"
                  checked={enableMemoryManagement}
                  onCheckedChange={setEnableMemoryManagement}
                  className="data-[state=checked]:bg-green-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Add Agent Options */}
          <div className="space-y-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
              Add New Agent
            </h3>
            <div className="gap-6 grid grid-cols-1 sm:grid-cols-2">
              {/* Deploy Agent Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                onClick={handleDeployAgent}
                className="group flex flex-col justify-center items-center gap-4 bg-gradient-to-b from-white dark:from-zinc-900 to-violet-50 dark:to-violet-950 hover:shadow-lg p-8 border border-violet-200 hover:border-violet-400 dark:border-violet-800 dark:hover:border-violet-500 rounded-2xl text-center transition-all cursor-pointer"
              >
                <div className="bg-violet-100 dark:bg-violet-900/30 dark:group-hover:bg-violet-800 group-hover:bg-violet-200 p-3 rounded-full transition-all">
                  <Rocket className="w-10 h-10 text-violet-600 dark:text-violet-400" />
                </div>
                <p className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                  Deploy an Agent
                </p>
                <p className="max-w-xs text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                  Configure a new deployment for your agent.
                </p>
              </motion.div>

              {/* Register Agent Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                onClick={handleRegisterAgent}
                className="group flex flex-col justify-center items-center gap-4 bg-gradient-to-b from-white dark:from-zinc-900 to-violet-50 dark:to-violet-950 hover:shadow-lg p-8 border border-violet-200 hover:border-violet-400 dark:border-violet-800 dark:hover:border-violet-500 rounded-2xl text-center transition-all cursor-pointer"
              >
                <div className="bg-violet-100 dark:bg-violet-900/30 dark:group-hover:bg-violet-800 group-hover:bg-violet-200 p-3 rounded-full transition-all">
                  <UserPlus className="w-10 h-10 text-violet-600 dark:text-violet-400" />
                </div>
                <p className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                  Register an Agent
                </p>
                <p className="max-w-xs text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                  Register an existing or external agent.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
