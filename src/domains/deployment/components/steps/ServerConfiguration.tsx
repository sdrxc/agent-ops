"use client";
import { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Server, Check, Loader2 } from "lucide-react";
import axios from "axios";
import { Separator } from "@/components/ui/separator";
import toast from "react-hot-toast";
import { AgentDeploymentContext } from "../context/AgentDeploymentContext";

interface ServerConfigurationProps {
  sequenceID: string;
  projectID: string;
  userID: string | null | undefined;
  stepID?: string;
  onStepValidate: (isValid: boolean) => void;
  // onNext and onPrevious are no longer used but kept for interface compat if needed,
  // though we removed them from parent usage mostly.
  onNext: () => void;
  onPrevious: () => void;
}

const runtimeEnv = process.env.NEXT_PUBLIC_APP_ENV;
const baseURL = process.env.NEXT_PUBLIC_API_URL || "";
const isLocalEnv = runtimeEnv === "local";

const RECOMMENDED_AWS_SERVER = {
  id: "aws-recommended-us-east-1",
  name: "Recommended AWS server",
  regionLabel: "Compliant region: USA (us-east-1)",
};

const REGISTER_OWN_SERVER = {
  id: "register-own-server",
  name: "Register your own server",
};

const ServerConfiguration = ({
  sequenceID,
  projectID,
  userID,
  stepID,
  onStepValidate,
}: ServerConfigurationProps) => {
  const { state, dispatch } = useContext(AgentDeploymentContext);
  const [selectedServer, setSelectedServer] = useState<string>(
    state.selectedServerID || ""
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    onStepValidate(!!selectedServer);
  }, [selectedServer, onStepValidate]);

  const saveServerSelection = async (serverID: string) => {
    setSaving(true);
    try {
      const url = isLocalEnv
        ? `${baseURL}/api/step3-serverRegistry`
        : `/api/step3-serverRegistry`;
      const response = await axios.post(url, {
        projectID,
        sequenceID,
        userID,
        serverID: serverID,
      });

      if (response.status == 200 || response.status == 201) {
        toast.success("Server Selection Saved", {
          style: { background: "#dcfce7", color: "#166534" },
        });

        onStepValidate(true);
        dispatch({
          type: "SET_SERVER_SELECTION",
          payload: { serverID: serverID, configureServer: true },
        });

        // No onNext() - auto-save behavior
      } else {
        onStepValidate(false);
        toast.error("Server Selection Failed");
      }
    } catch (err) {
      console.error("Validation error:", err);
      onStepValidate(false);
      toast.error("Server Registration Failed");
    } finally {
      setSaving(false);
    }
  };

  // handle step validation
  useEffect(() => {
    const handleValidate = async () => {
      // setLoading(true);
      try {
        const url = isLocalEnv
          ? `${baseURL}/api/step3-validate`
          : `/api/step3-validate`;
        const res = await axios.post(url, {
          projectID,
          sequenceID,
          userID,
          stepID,
        });

        if (res?.data?.data?.valid === true) {
          onStepValidate(true);
        } else {
          onStepValidate(false);
        }
      } catch (err) {
        // silent fail
      }
    };
    handleValidate();
  }, []);

  const selectRecommendedAws = () => {
    const serverID = RECOMMENDED_AWS_SERVER.id;
    setSelectedServer(serverID);
    saveServerSelection(serverID);
  };

  const selectRegisterOwn = () => {
    // For now, this is just a placeholder action
    setSelectedServer(REGISTER_OWN_SERVER.id);
    dispatch({
      type: "SET_SERVER_SELECTION",
      payload: { serverID: REGISTER_OWN_SERVER.id, configureServer: true },
    });
    toast("Own-server registration is coming soon.", {
      style: { background: "#eff6ff", color: "#1d4ed8" },
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center pb-4 border-b border-border">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Server className="w-6 h-6 text-primary" /> Server Configuration
          </h2>
          <p className="text-muted-foreground mt-1">
            Choose a server option for this agent.
          </p>
        </div>
        {saving && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" /> Saving...
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <div
            className={`flex items-start justify-between gap-4 p-6 border rounded-xl cursor-pointer transition-colors
              ${
                selectedServer === RECOMMENDED_AWS_SERVER.id
                  ? "bg-primary/10 border-primary/20 shadow-sm ring-1 ring-primary/20"
                  : "bg-card border-border hover:border-primary/30 hover:bg-primary/5"
              }
            `}
            onClick={selectRecommendedAws}
            role="button"
            tabIndex={0}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium text-foreground">
                  {RECOMMENDED_AWS_SERVER.name}
                </h3>
                {selectedServer === RECOMMENDED_AWS_SERVER.id && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/20 px-2 py-1 rounded">
                    <Check className="w-3.5 h-3.5" /> Selected
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Managed, recommended default for most deployments.
              </p>
              <p className="text-xs text-muted-foreground">
                {RECOMMENDED_AWS_SERVER.regionLabel}
              </p>
            </div>
            {selectedServer === RECOMMENDED_AWS_SERVER.id && (
              <div className="shrink-0 text-primary">
                <Check className="w-6 h-6" />
              </div>
            )}
          </div>

          <div className="flex items-start justify-between gap-4 p-6 bg-card border border-border rounded-xl opacity-60">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium text-foreground">
                  {REGISTER_OWN_SERVER.name}
                </h3>
                {selectedServer === REGISTER_OWN_SERVER.id && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/20 px-2 py-1 rounded">
                    <Check className="w-3.5 h-3.5" /> Selected
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Bring your own compute and connect it to this agent.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="shrink-0"
              onClick={selectRegisterOwn}
            >
              Register (coming soon)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerConfiguration;
