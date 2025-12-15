import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Play,
  Save,
  Upload,
  Download,
  GitBranch,
  History,
  Settings,
  Code,
  Zap,
  RotateCcw,
  Copy,
  Plus,
  X,
  ChevronDown,
  BarChart3,
  Clock,
  DollarSign,
} from "lucide-react";
import { Agent } from "@/types/api";

interface PromptPlaygroundTabProps {
  agent: Agent;
}

interface ModelProvider {
  id: string;
  name: string;
  logo: string;
  models: string[];
}

interface TestCase {
  id: string;
  name: string;
  variables: Record<string, string>;
  expectedOutput?: string;
}

interface PromptVersion {
  id: string;
  version: string;
  timestamp: string;
  author: string;
  description: string;
  environment: "dev" | "staging" | "production";
}

const modelProviders: ModelProvider[] = [
  {
    id: "openai",
    name: "OpenAI",
    logo: "🤖",
    models: ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    logo: "🧠",
    models: ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"],
  },
  {
    id: "google",
    name: "Google",
    logo: "🌟",
    models: ["gemini-pro", "gemini-pro-vision"],
  },
];

const mockVersions: PromptVersion[] = [
  {
    id: "1",
    version: "v2.1.3",
    timestamp: "2 hours ago",
    author: "John Doe",
    description: "Improved error handling and response quality",
    environment: "production",
  },
  {
    id: "2",
    version: "v2.1.2",
    timestamp: "1 day ago",
    author: "Jane Smith",
    description: "Added context window optimization",
    environment: "staging",
  },
  {
    id: "3",
    version: "v2.1.1",
    timestamp: "3 days ago",
    author: "Mike Johnson",
    description: "Initial version with basic functionality",
    environment: "dev",
  },
];

export function PromptPlaygroundTab({ agent }: PromptPlaygroundTabProps) {
  const [selectedProvider, setSelectedProvider] = useState("openai");
  const [selectedModel, setSelectedModel] = useState("gpt-4");
  const [systemPrompt, setSystemPrompt] = useState(
    "You are an expert assistant specialized in providing accurate and helpful responses.",
  );
  const [userPrompt, setUserPrompt] = useState(
    "Hello, {{name}}! Can you help me with {{task}}?",
  );
  const [assistantPrompt, setAssistantPrompt] = useState("");
  const [temperature, setTemperature] = useState([0.7]);
  const [maxTokens, setMaxTokens] = useState([2048]);
  const [topK, setTopK] = useState([40]);
  const [presencePenalty, setPresencePenalty] = useState([0]);
  const [variables, setVariables] = useState<Record<string, string>>({
    name: "Alex",
    task: "understanding AI concepts",
  });
  const [testCases, setTestCases] = useState<TestCase[]>([
    {
      id: "1",
      name: "Basic greeting",
      variables: { name: "Alice", task: "learning about AI" },
      expectedOutput: "A friendly and informative response",
    },
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [compareMode, setCompareMode] = useState(false);

  const currentProvider = modelProviders.find((p) => p.id === selectedProvider);

  const addVariable = () => {
    const newKey = `variable${Object.keys(variables).length + 1}`;
    setVariables({ ...variables, [newKey]: "" });
  };

  const updateVariable = (oldKey: string, newKey: string, value: string) => {
    const newVariables = { ...variables };
    delete newVariables[oldKey];
    newVariables[newKey] = value;
    setVariables(newVariables);
  };

  const removeVariable = (key: string) => {
    const newVariables = { ...variables };
    delete newVariables[key];
    setVariables(newVariables);
  };

  const runTest = async () => {
    setIsRunning(true);

    // Simulate API call
    setTimeout(() => {
      const newResult = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        model: selectedModel,
        prompt: userPrompt,
        response: `This is a simulated response from ${selectedModel} for the prompt: "${userPrompt.replace(/\{\{(\w+)\}\}/g, (match, key) => variables[key] || match)}"`,
        metrics: {
          responseTime: Math.random() * 2000 + 500,
          tokens: Math.floor(Math.random() * 500 + 100),
          cost: Math.random() * 0.01 + 0.005,
        },
      };

      setResults([newResult, ...results]);
      setIsRunning(false);
    }, 2000);
  };

  const addTestCase = () => {
    const newTestCase: TestCase = {
      id: Date.now().toString(),
      name: `Test Case ${testCases.length + 1}`,
      variables: { ...variables },
      expectedOutput: "",
    };
    setTestCases([...testCases, newTestCase]);
  };

  return (
    <div className="h-full flex gap-6">
      {/* Left Panel - Editor */}
      <div className="w-1/2 space-y-6 overflow-y-auto">
        {/* Model Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Model Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Provider</Label>
                <Select
                  value={selectedProvider}
                  onValueChange={setSelectedProvider}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {modelProviders.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        <div className="flex items-center space-x-2">
                          <span>{provider.logo}</span>
                          <span>{provider.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Model</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currentProvider?.models.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Parameters */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Temperature: {temperature[0]}</Label>
                <Slider
                  value={temperature}
                  onValueChange={setTemperature}
                  max={2}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Max Tokens: {maxTokens[0]}</Label>
                <Slider
                  value={maxTokens}
                  onValueChange={setMaxTokens}
                  max={4096}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Top K: {topK[0]}</Label>
                <Slider
                  value={topK}
                  onValueChange={setTopK}
                  max={100}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Presence Penalty: {presencePenalty[0]}</Label>
                <Slider
                  value={presencePenalty}
                  onValueChange={setPresencePenalty}
                  max={2}
                  min={-2}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prompt Editor */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Code className="h-5 w-5" />
              <span>Multi-Message Template Editor</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>System Message</Label>
              <Textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Define the AI's role and behavior..."
                className="min-h-[80px] font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label>User Message</Label>
              <Textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Enter user prompt with {{variables}}..."
                className="min-h-[100px] font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label>Assistant Message (Optional)</Label>
              <Textarea
                value={assistantPrompt}
                onChange={(e) => setAssistantPrompt(e.target.value)}
                placeholder="Pre-fill assistant response for few-shot learning..."
                className="min-h-[80px] font-mono"
              />
            </div>
          </CardContent>
        </Card>

        {/* Variables */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Variables</span>
              </div>
              <Button variant="outline" size="sm" onClick={addVariable}>
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(variables).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-2">
                <Input
                  value={key}
                  onChange={(e) => updateVariable(key, e.target.value, value)}
                  placeholder="Variable name"
                  className="w-1/3"
                />
                <Input
                  value={value}
                  onChange={(e) => updateVariable(key, key, e.target.value)}
                  placeholder="Variable value"
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeVariable(key)}
                  className="h-8 w-8"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex space-x-2">
          <Button onClick={runTest} disabled={isRunning} className="flex-1">
            {isRunning ? (
              <>
                <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run Test
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={() => setCompareMode(!compareMode)}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Compare
          </Button>

          <Button variant="outline">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Right Panel - Results & Management */}
      <div className="w-1/2 space-y-6 overflow-y-auto">
        {/* Version Control */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <GitBranch className="h-5 w-5" />
              <span>Version Control</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockVersions.map((version) => (
                <div
                  key={version.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-medium">
                        {version.version}
                      </span>
                      <Badge
                        variant={
                          version.environment === "production"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {version.environment}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {version.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {version.author} • {version.timestamp}
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm">
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <History className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Test Cases */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Test Cases</span>
              </div>
              <Button variant="outline" size="sm" onClick={addTestCase}>
                <Plus className="h-3 w-3 mr-1" />
                Add Test
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testCases.map((testCase) => (
                <div key={testCase.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{testCase.name}</span>
                    <Button variant="ghost" size="sm">
                      <Play className="h-3 w-3 mr-1" />
                      Run
                    </Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    Variables:{" "}
                    {Object.entries(testCase.variables)
                      .map(([k, v]) => `${k}="${v}"`)
                      .join(", ")}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <History className="h-5 w-5" />
              <span>Test Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result) => (
                <div key={result.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline">{result.model}</Badge>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{result.metrics.responseTime.toFixed(0)}ms</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Zap className="h-3 w-3" />
                        <span>{result.metrics.tokens} tokens</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <DollarSign className="h-3 w-3" />
                        <span>${result.metrics.cost.toFixed(4)}</span>
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs text-gray-500">PROMPT</Label>
                      <p className="text-sm bg-gray-50 p-2 rounded">
                        {result.prompt}
                      </p>
                    </div>

                    <div>
                      <Label className="text-xs text-gray-500">RESPONSE</Label>
                      <p className="text-sm bg-blue-50 p-2 rounded">
                        {result.response}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
