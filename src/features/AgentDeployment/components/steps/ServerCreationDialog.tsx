"use client";

import { UploadCloud, Info, XCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useGlobalContext } from "@/app/GlobalContextProvider";

interface ServerCreationDialogBoxProps {
  onClose: () => void;
  projectID: string;
}

export default function ServerCreationDialogBox({ onClose, projectID }: ServerCreationDialogBoxProps) {
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [jsonData, setJsonData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);

    if (file) {
      setJsonFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const result = JSON.parse(event.target?.result as string);
          if (Array.isArray(result)) {
            setError("Invalid JSON format");
            setJsonData(null);
            return;
          }
          setJsonData(result);
        } catch (err) {
          setError("Invalid JSON format");
          setJsonData(null);
        }
      };
      reader.readAsText(file);
    }
  };

const { user } = useGlobalContext();
  const userID = user!.userID
  const handleValidate = async () => {
    if (!jsonData) return;
    setLoading(true);

    try {
      
      const runtimeEnv = process.env.NEXT_PUBLIC_APP_ENV;
      const baseURL = process.env.NEXT_PUBLIC_API_URL || "";

      const endpoint =
        runtimeEnv === "local"
          ? `${baseURL}/api/serverCreation`
          : "/api/serverCreation";

      const response = await axios.post(endpoint, {
        userID, projectID, activeData: jsonData
      });

      console.log('response ', response);


      if (response.status === 200 || response.status === 201) {
        toast.success("Server Created Successfully!", {
          style: { background: "#dcfce7", color: "#166534" },
        });
        setLoading(false);
        onClose?.();
      }
    }
    catch (err) {
      setLoading(false);
      console.error("Validation error:", err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {/* <UploadCloud className="h-5 w-5" />
          <span>Create Tool</span> */}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* File Upload */}
        <div className="flex flex-col sm:flex-row items-start gap-4">
          {/* Upload */}
          <div className="flex-1">
            <label
              htmlFor="jsonUploadStep2"
              className="flex items-center gap-2 cursor-pointer rounded-md border border-dashed border-gray-300 dark:border-gray-600 p-4 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition w-full"
            >
              <UploadCloud className="w-6 h-6" />
              {jsonFile ? jsonFile.name : "Click to upload JSON file"}
            </label>
            <input
              type="file"
              id="jsonUploadStep2"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="hidden"
            />
            {error && (
              <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                <XCircle className="w-4 h-4" /> {error}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">

            <Button
              variant="ghost"
              className="w-12 h-12 flex items-center justify-center p-0"
              onClick={() => {
                console.log("Info clicked");
              }}
            >
              <Info className="w-5 h-5 text-gray-500" />
            </Button>
          </div>
        </div>

        {/* JSON Preview */}
        {jsonData && (
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md overflow-auto max-h-64 border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-500" /> JSON Preview
              </h4>
            </div>
            <pre className="text-sm font-mono text-gray-900 dark:text-gray-100">
              {JSON.stringify(jsonData, null, 2)}
            </pre>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={handleValidate}
            disabled={!jsonData || loading}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            {loading ? "Creating Server..." : "Create Server"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
