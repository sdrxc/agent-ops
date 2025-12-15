"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast"; // 👈 import toast
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useGlobalContext } from "@/app/GlobalContextProvider";

export const ProjectSetup = () => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(true);
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [enableMemoryManagement, setEnableMemoryManagement] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);

  const { user, loading } = useGlobalContext();

  // ✅ Validation (tags are optional now)
  useEffect(() => {
    const valid =
      projectName.trim().length > 0 &&
      description.trim().length > 0 &&
      !!user &&
      !loading;

    setIsFormValid(valid);
  }, [projectName, description, tags, user, loading]);

  // Helper function inside the component for environment-based API call
  const createProject = async (projectData: any) => {
    // Check env variable NEXT_PUBLIC_APP_ENV (set in your .env files)
    const env = process.env.NEXT_PUBLIC_APP_ENV;
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "";

    if (env === "local") {
      const endpoint = env === "local" ? `${baseURL}/api/create-project` : "/api/create-project";
      const response = await axios.post(endpoint, projectData);
      if (response.status === 200 || response.status === 201) {
        return response.data;
      }
    } else {
      // Real API call for dev/prod
      const response = await axios.post("/api/create-project", projectData);
      if (response.status === 200 || response.status === 201) {
        return response.data;
      }
      throw new Error("Failed to create project");
    }
  };

  // ✅ Handle form submission
  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    const now = new Date().toISOString();
    const projectData = {
      projectName,
      description,
      createdBy: user!.userID,
      tags: tags
        ? tags.split(",").map((t) => t.trim()).filter((t) => t.length > 0)
        : [],
      enableMemoryManagement,
    };

	try {
      const response = await createProject(projectData);
      const projectID = response?.data?.projectID;

      if (projectID) {
        toast.success("Project Created Successfully!", {
          style: { background: "#dcfce7", color: "#166534" },
        });
        setRedirecting(true);
        router.push(`/projectAgentDeployment/${projectID}`);
      } else {
        toast.error("Project created but no ID returned. Please try again.");
      }
    } catch (error: any) {
      console.error("Submission error:", error);
      const errMsg =
        error.response?.data?.error?.message || "Project Creation Failed, Try Again!";
      setError(errMsg);
      toast.error(errMsg, {
        style: { background: "#fee2e2", color: "#b91c1c" },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog
        open={showModal}
        onOpenChange={(open) => {
          if (!open) {
            router.push("/");
          } else {
            setShowModal(open);
          }
        }}
      >
        <DialogContent
          className="sm:max-w-[425px]"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new project.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Input
                id="projectName"
                placeholder="Project Name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Textarea
                id="description"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Input
                id="tags"
                placeholder="Tags (comma separated — optional)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="memory-management" className="text-sm font-medium">
                Enable Memory Management
              </Label>
              <Switch
                id="memory-management"
                checked={enableMemoryManagement}
                onCheckedChange={setEnableMemoryManagement}
                className="data-[state=checked]:bg-green-500"
              />
            </div>

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

            <Button
              onClick={handleSubmit}
              className="w-full"
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Save & Continue"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {redirecting && (
        <div className="flex items-center justify-center h-screen">
          <p className="text-lg font-medium">Redirecting to deployment...</p>
        </div>
      )}
    </>
  );
};
