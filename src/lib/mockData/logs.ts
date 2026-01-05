import { Log, Session, Agent } from "@/types/api";

// Generate mock logs based on agents
export function generateMockLogs(agents: Agent[], count: number = 50): Log[] {
  const sources: ("Chat" | "API" | "Event")[] = ["Chat", "API", "Event"];
  const envs: ("dev" | "qa" | "prod")[] = ["dev", "qa", "prod"];
  const workflows = [
    "Customer Support Triage",
    "Refund Auto-Approver",
    "Lead Qualification",
    undefined,
  ];
  const statuses: ("Success" | "Error")[] = ["Success", "Error"];

  const logs: Log[] = [];

  for (let i = 0; i < count; i++) {
    const agent = agents[i % agents.length] || agents[0];
    const source = sources[i % sources.length];
    const environment = envs[i % envs.length];
    const workflow = workflows[Math.floor(Math.random() * workflows.length)];
    const status = i % 10 === 0 ? "Error" : "Success"; // 10% error rate
    const latency = status === "Error" 
      ? Math.floor(Math.random() * 5000) + 2000 
      : Math.floor(Math.random() * 500) + 200;

    let input = "";
    let output = "";

    if (source === "Chat") {
      input =
        i % 3 === 0
          ? "Why is the pricing so high?"
          : "I need a refund for order #999";
      output =
        i % 3 === 0
          ? "Our pricing model is based on usage..."
          : "I can help with that refund...";
    } else if (source === "API") {
      input = i % 2 === 0 ? "POST /v1/chat/completions" : "GET /api/status";
      output = i % 2 === 0
        ? '{"id": "chatcmpl-123", "choices": [...]}'
        : '{"status": "ok"}';
    } else {
      input = "order.created";
      output = "Order processing started";
    }

    const timestamp = new Date(
      Date.now() - i * 60000 * (i % 3 === 0 ? 120 : 5)
    ).toISOString();

    logs.push({
      id: `trc_${1000 + i}`,
      timestamp,
      agent: agent.name,
      agentId: agent.id,
      workflow,
      source,
      input,
      output,
      status,
      latency,
      tokens: Math.floor(Math.random() * 1000) + 100,
      cost: Number((Math.random() * 0.05).toFixed(4)),
      environment,
      tags:
        i % 2 === 0
          ? ["US-East", "Mobile", "High-Priority"]
          : ["EU-West", "Web", "Legacy"],
    });
  }

  return logs;
}

// Generate mock sessions
export function generateMockSessions(
  logs: Log[],
  count: number = 20
): Session[] {
  const envs: ("dev" | "qa" | "prod")[] = ["dev", "qa", "prod"];
  const statuses: ("Completed" | "Active" | "Error")[] = [
    "Completed",
    "Active",
    "Error",
  ];

  const sessions: Session[] = [];
  const traceIdsBySession: string[][] = [];

  // Group some traces into sessions
  for (let i = 0; i < count; i++) {
    const traceCount = Math.floor(Math.random() * 5) + 2; // 2-6 traces per session
    const startIndex = i * 3;
    const sessionTraces = logs
      .slice(startIndex, startIndex + traceCount)
      .map((log) => log.id);
    traceIdsBySession.push(sessionTraces);
  }

  for (let i = 0; i < count; i++) {
    const environment = envs[i % envs.length];
    const status = statuses[i % statuses.length];
    const turnCount = traceIdsBySession[i]?.length || 2;
    const durationMinutes = Math.floor(Math.random() * 10) + 1;
    const durationSeconds = Math.floor(Math.random() * 60);
    const duration = `${durationMinutes}m ${durationSeconds}s`;

    const timestamp = new Date(
      Date.now() - i * 60000 * (i % 2 === 0 ? 30 : 10)
    ).toISOString();

    const hoursAgo = Math.floor(i / 2) + 1;
    const startTime =
      hoursAgo === 1 ? "1 hour ago" : `${hoursAgo} hours ago`;

    const summaries = [
      "User requested refund for Order #999. Agent verified eligibility and processed refund.",
      "Sales query about enterprise pricing. Failed during vector retrieval.",
      "Complex debugging session regarding API timeout. Agent provided code examples.",
      "Regression testing for new conversational flow.",
      "Customer support inquiry about product features.",
    ];

    sessions.push({
      id: `sess_${i + 1}`,
      userId: `usr_${Math.floor(Math.random() * 10000)}`,
      startTime,
      timestamp,
      duration,
      turnCount,
      status,
      summary: summaries[i % summaries.length],
      traces: traceIdsBySession[i] || [],
      environment,
      tags:
        i % 2 === 0
          ? ["US-East", "Mobile", "Refunds"]
          : ["EU-West", "Web", "Sales"],
    });
  }

  return sessions;
}

