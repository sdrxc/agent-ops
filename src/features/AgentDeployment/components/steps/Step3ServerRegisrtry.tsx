"use client";
import { useContext, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Server, UploadCloud } from "lucide-react";
import ServerCreationDialog from "./ServerCreationDialog";
import axios from "axios";
import { Separator } from "@radix-ui/react-separator";
import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";
import { AgentDeploymentContext } from "../context/AgentDeploymentContext";
import { ServerType } from "../../types";

interface Step3ServerConfigProps {
  sequenceID: string;
  projectID: string;
  userID: string | null | undefined;
  stepID?: string;
  onStepValidate: (isValid: boolean) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const runtimeEnv = process.env.NEXT_PUBLIC_APP_ENV;
const baseURL = process.env.NEXT_PUBLIC_API_URL || "";
const isLocalEnv = runtimeEnv === "local";


const Step3ServerRegisrtry = ({ sequenceID, projectID, userID, stepID, onStepValidate, onNext, onPrevious }: Step3ServerConfigProps) => {
  const { state, dispatch } = useContext(AgentDeploymentContext);
  const [servers, setServers] = useState<ServerType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDialogServerCreation, setOpenDialogServerCreation] = useState(false);
  const [openDialog, setOpenDialog] = useState(state.configureServer === null);
  const [configureServer, setConfigureServer] = useState<boolean | null>(state.configureServer);
  const [selectedServer, setSelectedServer] = useState<string>(state.selectedServerID || "");


  const handleChoice = (choice: boolean) => {
    setConfigureServer(choice);
    dispatch({ type: "SET_SERVER_SELECTION", payload: { serverID: selectedServer, configureServer: choice } });
    setOpenDialog(false);
  };

  useEffect(() => {
    if (state.configureServer !== null) {
      setOpenDialog(false);
      setConfigureServer(state.configureServer);
    }
  }, [state.configureServer]);


  useEffect(() => {
    if (configureServer === true) fetchServers();
    else if (configureServer === false) onStepValidate(true);
  }, [configureServer]);

  useEffect(() => {
    if (configureServer) onStepValidate(!!selectedServer);
  }, [selectedServer, configureServer, onStepValidate]);

  const fetchServers = async () => {
    const url = isLocalEnv ? `${baseURL}/api/listServers` : `/api/listServers`;
    try {
      setLoading(true);
      setError("");
      const response = await axios.post(url, { userID, projectID });

      if (response.status == 200 || response.status == 201) {

        console.log("inside fetch")
        const serverList: ServerType[] = response.data?.data?.servers || [];
        setServers(serverList);
        if (serverList.length > 0 && !selectedServer) setSelectedServer(serverList[0].serverID); // Use serverID
      }

    } catch (err) {
      console.error("Error fetching servers:", err);
      setError("Failed to load servers");
      setServers([]);
      setSelectedServer("");
    } finally {
      setLoading(false);
    }
  };

  const [submitting, setSubmitting] = useState(false);


  const handleServerRegistrySubmit = async () => {
    setSubmitting(true);
    try {
      const url = isLocalEnv ? `${baseURL}/api/step3-serverRegistry` : `/api/step3-serverRegistry`;
      const response = await axios.post(url, {
        projectID,
        sequenceID,
        userID,
        serverID: selectedServer, // ✅ use selected serverID
      });

      console.log("step3 response data", response)

      if (response.status == 200 || response.status == 201) {
        toast.success("Server Registered Successfully!", {
          style: { background: "#dcfce7", color: "#166534" },
        });

        toast.success("Click on Next to continue", {
          style: { background: "#dcfce7", color: "#166534" },
        });
        onStepValidate(true);
        dispatch({
          type: "SET_SERVER_SELECTION",
          payload: { serverID: selectedServer, configureServer: true },
        });
      } else {
        onStepValidate(false);
      }
    } catch (err) {
      console.error("Validation error:", err);
      onStepValidate(false);
    } finally {
      setSubmitting(false);
    }
  };


  // handle step validation
  const handleValidate = async () => {
    setLoading(true);
    try {
    
      const runtimeEnv = process.env.NEXT_PUBLIC_APP_ENV;
      const baseURL = process.env.NEXT_PUBLIC_API_URL || "";

      const isLocalEnv = runtimeEnv === "local";
      const url = isLocalEnv
        ? `${baseURL}/api/step3-validate`
        : `/api/step3-validate`;

      const res = await axios.post(url, {
        projectID,
        sequenceID,
        userID,
        stepID
      });

      if (res?.data?.data?.valid === true) {
        onStepValidate(true);
      } else {
        onStepValidate(false);
      }
    } catch (err) {
      onStepValidate(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleValidate();
  }, []);


  return (
    <div className="space-y-6">
      <Dialog
        open={openDialog}
        onOpenChange={() => { }} // prevent external control
      >
        <DialogContent
          className="max-w-md p-6 rounded-lg shadow-lg"
          // prevent closing by clicking outside or pressing escape
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Do you want to configure a server?
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 flex justify-between gap-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                handleChoice(false);
                onStepValidate(true); // ✅ mark valid if No
              }}
            >
              No
            </Button>

            <Button
              className="flex-1"
              onClick={() => handleChoice(true)}
            >
              Yes
            </Button>
          </div>
        </DialogContent>
      </Dialog>


      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-xl font-semibold">
            <Server className="h-6 w-6 text-blue-600" />
            <span>Server Registry</span>
          </CardTitle>
          <div className="text-xs text-gray-500">Provision a new server or use available servers</div>
        </CardHeader>

        <CardContent className="space-y-6">
          {configureServer === false && (
            <div className="p-4 bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-lg text-sm">
              Great! As you don’t want to configure a server in the agent, click <strong>Next</strong> to continue.
            </div>
          )}

          {configureServer === true && (
            <div className="space-y-4">
              <div
                className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-xs cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                onClick={() => setOpenDialogServerCreation(true)}
              >
                <div className="flex items-center gap-2 font-medium text-lg">
                  <Plus className="h-5 w-5 text-green-600" />
                  <span>Create a new Server</span>
                </div>
              </div>

              <Separator className="my-2" />

              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-xs relative space-y-2">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2 font-medium text-lg">
                    <UploadCloud className="h-5 w-5 text-blue-600" />
                    <span>Available Servers</span>
                  </div>
                  <Button size="sm" variant="outline" className="flex items-center gap-1" onClick={fetchServers}>
                    <RefreshCw className="w-4 h-4" /> Refresh
                  </Button>
                </div>

                {loading ? (
                  <div className="text-sm text-gray-500">Loading servers...</div>
                ) : error ? (
                  <div className="text-sm text-red-500">{error}</div>
                ) : servers.length === 0 ? (
                  <div className="text-sm text-gray-500">No servers available</div>
                ) : (
                  <Select.Root 
                    value={selectedServer} 
                    onValueChange={(value) => {
                      setSelectedServer(value);
                      dispatch({ type: "SET_SERVER_SELECTION", payload: { serverID: value, configureServer: true } });
                    }}
                    >
                    <Select.Trigger className="w-full flex justify-between items-center p-2 border rounded-md bg-white dark:bg-gray-700 dark:text-white">
                      <Select.Value placeholder="Select a server" />
                      <Select.Icon>
                        <ChevronDown className="w-4 h-4" />
                      </Select.Icon>
                    </Select.Trigger>

                    <Select.Content className="bg-white dark:bg-gray-700 rounded-md shadow-md mt-1">
                      <Select.ScrollUpButton className="flex justify-center items-center h-6">
                        <ChevronUp className="w-4 h-4" />
                      </Select.ScrollUpButton>
                      <Select.Viewport className="p-1">
                        {servers.map((server) => (
                          <Select.Item
                            key={server.serverID}
                            value={server.serverID} // ✅ use serverID as value
                            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-between"
                          >
                            <Select.ItemText>{server.serverID} - {server.serverName}</Select.ItemText>
                            <Select.ItemIndicator>
                              <Check className="w-4 h-4" />
                            </Select.ItemIndicator>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                      <Select.ScrollDownButton className="flex justify-center items-center h-6">
                        <ChevronDown className="w-4 h-4" />
                      </Select.ScrollDownButton>
                    </Select.Content>
                  </Select.Root>
                )}
              </div>
            </div>
          )}

          {configureServer && (
            <Button
              className="w-full flex items-center gap-2"
              onClick={handleServerRegistrySubmit}
            >
              {submitting ? "Submitting..." : "Submit Server Configuration"}
            </Button>
          )}
        </CardContent>

        <Dialog open={openDialogServerCreation} onOpenChange={setOpenDialogServerCreation}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Create New Server</DialogTitle>
            </DialogHeader>
            <ServerCreationDialog onClose={() => setOpenDialogServerCreation(false)} projectID={projectID} />
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  );
};

export default Step3ServerRegisrtry;
