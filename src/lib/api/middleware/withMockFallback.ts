import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosRequestConfig } from "axios";

/**
 * Configuration for mock fallback behavior
 */
export interface MockFallbackConfig {
  /** Mock data to return when backend is unavailable */
  mockData: any;
  /** Optional function to transform mock data before returning */
  transformMock?: (data: any) => any;
  /** Custom error handler */
  onError?: (error: any) => void;
}

/**
 * Creates a route handler with automatic mock fallback
 * 
 * Handles:
 * - Local environment (returns mock)
 * - Missing BACKEND_URL (returns mock)
 * - Backend call failures (returns mock)
 * 
 * @param handler - The actual route handler function
 * @param config - Mock fallback configuration
 * @returns Route handler with mock fallback
 */
export function withMockFallback<T extends any[]>(
  handler: (
    request: NextRequest,
    ...args: T
  ) => Promise<NextResponse>,
  config: MockFallbackConfig
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const env = process.env.NEXT_PUBLIC_APP_ENV;
    const backendUrl = process.env.BACKEND_URL;

    // Use mock during local dev
    if (env === "local") {
      const mockData = config.transformMock
        ? config.transformMock(config.mockData)
        : config.mockData;
      return NextResponse.json(mockData);
    }

    // Fall back to mock if BACKEND_URL is missing
    if (!backendUrl) {
      console.warn("BACKEND_URL not set, using mock data");
      const mockData = config.transformMock
        ? config.transformMock(config.mockData)
        : config.mockData;
      return NextResponse.json(mockData);
    }

    // Try to execute the actual handler
    try {
      return await handler(request, ...args);
    } catch (error: any) {
      // Fall back to mock data if handler fails
      if (config.onError) {
        config.onError(error);
      } else {
        console.error("❌ Route handler failed, using mock data:", error.message);
      }
      const mockData = config.transformMock
        ? config.transformMock(config.mockData)
        : config.mockData;
      return NextResponse.json(mockData);
    }
  };
}

/**
 * Helper to make backend API calls with automatic mock fallback
 * 
 * @param config - Axios request configuration
 * @param mockData - Mock data to return if call fails
 * @param transformMock - Optional function to transform mock data before returning
 * @returns Response data or mock data
 */
export async function fetchWithMockFallback(
  config: AxiosRequestConfig,
  mockData: any,
  transformMock?: (data: any) => any
): Promise<any> {
  const env = process.env.NEXT_PUBLIC_APP_ENV;
  const backendUrl = process.env.BACKEND_URL;

  // Use mock during local dev
  if (env === "local") {
    return transformMock ? transformMock(mockData) : mockData;
  }

  // Fall back to mock if BACKEND_URL is missing
  if (!backendUrl) {
    console.warn("BACKEND_URL not set, using mock data");
    return transformMock ? transformMock(mockData) : mockData;
  }

  // Real backend call
  try {
    const { data } = await axios({
      ...config,
      url: `${backendUrl}${config.url}`,
      headers: {
        "Content-Type": "application/json",
        ...config.headers,
      },
    });
    return data;
  } catch (error: any) {
    // Fall back to mock data if backend call fails
    console.error("❌ Backend API call failed, using mock data:", error.message);
    return transformMock ? transformMock(mockData) : mockData;
  }
}

