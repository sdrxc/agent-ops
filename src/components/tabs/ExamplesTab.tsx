"use client";

import { Agent } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Code2, FileInput, FileOutput } from "lucide-react";

interface ExamplesTabProps {
  agent: Agent;
}

export function ExamplesTab({ agent }: ExamplesTabProps) {
  const hasSamples = agent.sampleIO && agent.sampleIO.length > 0;
  const hasIntegrations =
    agent.integrationExamples && agent.integrationExamples.length > 0;

  return (
    <div className="space-y-6">
      {/* Sample Input/Output Section */}
      {hasSamples && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileInput className="h-5 w-5" />
              Sample Input & Output
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {agent.sampleIO!.map((sample, idx) => (
              <div key={idx} className="space-y-2">
                {sample.description && (
                  <p className="text-sm text-muted-foreground">
                    {sample.description}
                  </p>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileInput className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Input</span>
                    </div>
                    <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
                      {JSON.stringify(sample.input, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileOutput className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Output</span>
                    </div>
                    <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
                      {JSON.stringify(sample.output, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Integration Examples Section */}
      {hasIntegrations && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Code2 className="h-5 w-5" />
              Integration Examples
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="0">
              <TabsList>
                {agent.integrationExamples!.map((example, idx) => (
                  <TabsTrigger key={idx} value={String(idx)}>
                    <Badge variant="outline" className="text-xs">
                      {example.language}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
              {agent.integrationExamples!.map((example, idx) => (
                <TabsContent
                  key={idx}
                  value={String(idx)}
                  className="space-y-2"
                >
                  {example.description && (
                    <p className="text-sm text-muted-foreground">
                      {example.description}
                    </p>
                  )}
                  <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                    <code>{example.code}</code>
                  </pre>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!hasSamples && !hasIntegrations && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No examples available for this agent.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
