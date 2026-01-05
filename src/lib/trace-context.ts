import { TraceDetail, TraceExecutionContext } from "@/types/api";

/**
 * Extract execution context from trace data
 */
export function extractTraceContext(
  trace: TraceDetail
): TraceExecutionContext | null {
  return trace.executionContext || null;
}

/**
 * Build simulator state from trace execution context
 */
export function buildSimulatorState(context: TraceExecutionContext) {
  // Convert userInput to string if it's an object
  const userInputString =
    typeof context.userInput === "string"
      ? context.userInput
      : JSON.stringify(context.userInput, null, 2);

  return {
    agentId: context.agentId,
    jsonInput: userInputString,
    mode: "event" as const, // Default to event mode, can be determined from trace source
    systemPrompt: context.systemPrompt,
    modelConfig: context.modelConfig,
    enabledTools: context.enabledTools,
    promptVersion: context.promptVersion,
    timestamp: context.timestamp,
  };
}

/**
 * Serialize trace execution context for URL parameters
 * Uses base64 encoding to handle complex objects
 */
export function serializeTraceContext(
  context: TraceExecutionContext
): string {
  try {
    const serialized = JSON.stringify(context);
    return btoa(encodeURIComponent(serialized));
  } catch (error) {
    console.error("Error serializing trace context:", error);
    return "";
  }
}

/**
 * Deserialize trace execution context from URL parameters
 */
export function deserializeTraceContext(encoded: string): TraceExecutionContext | null {
  try {
    const decoded = decodeURIComponent(atob(encoded));
    return JSON.parse(decoded) as TraceExecutionContext;
  } catch (error) {
    console.error("Error deserializing trace context:", error);
    return null;
  }
}

/**
 * Create URL with trace context parameters
 */
export function createPlaygroundUrl(
  traceId: string,
  context: TraceExecutionContext
): string {
  const serialized = serializeTraceContext(context);
  return `/simulator?traceId=${encodeURIComponent(traceId)}&mode=debug&context=${serialized}`;
}

