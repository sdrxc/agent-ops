"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";
import { useState } from "react";

interface Step6DeployAgentProps {
  sequenceID: string;
  projectID: string
  userID: string | null | undefined;
  stepID?: string;
  onStepValidate: (isValid: boolean) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const Step6DeployAgent = ({sequenceID, projectID, userID, stepID, onStepValidate, onNext, onPrevious }: Step6DeployAgentProps) => {
  const [deploying, setDeploying] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleDeploy = async () => {
    setDeploying(true);
    setResult(null);

    // Simulate deployment API call
    await new Promise((resolve) => setTimeout(resolve, 3000));

    setResult("✅ Agent deployed successfully!");
    setDeploying(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Rocket className="h-5 w-5" />
          <span>Deploy Agent</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-linear-to-br from-orange-500 to-amber-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Rocket className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Ready to Deploy!</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your agent configuration is complete and ready for deployment.
          </p>

          {/* <Button
            onClick={handleDeploy}
            disabled={deploying}
            className="px-6 py-3 text-white bg-green-600 hover:bg-green-700 transition rounded"
          >
            {deploying ? "Deploying..." : "Deploy Agent"}
          </Button> */}

          {result && (
            <p className="mt-4 text-green-600 font-semibold">
              {result}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Step6DeployAgent;
