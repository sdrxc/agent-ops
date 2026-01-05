import { NextRequest, NextResponse } from "next/server";
import { z, ZodSchema, ZodError } from "zod";

/**
 * Validation configuration
 */
export interface ValidationConfig<T> {
  /** Zod schema for request body validation */
  schema?: ZodSchema<T>;
  /** Zod schema for query parameters validation */
  querySchema?: ZodSchema<any>;
  /** Zod schema for route parameters validation */
  paramsSchema?: ZodSchema<any>;
  /** Custom error message for validation failures */
  errorMessage?: string;
}

/**
 * Creates a route handler with automatic request validation
 * 
 * Validates:
 * - Request body (if schema provided)
 * - Query parameters (if querySchema provided)
 * - Route parameters (if paramsSchema provided)
 * 
 * @param handler - The route handler function that receives validated data
 * @param config - Validation configuration
 * @returns Route handler with validation
 */
export function withValidation<T = any>(
  handler: (
    request: NextRequest,
    validated: {
      body?: T;
      query?: any;
      params?: any;
    },
    ...args: any[]
  ) => Promise<NextResponse>,
  config: ValidationConfig<T>
) {
  return async (
    request: NextRequest,
    ...args: any[]
  ): Promise<NextResponse> => {
    try {
      const validated: {
        body?: T;
        query?: any;
        params?: any;
      } = {};

      // Validate request body if schema provided
      if (config.schema) {
        // Clone request to avoid consuming the body
        const clonedRequest = request.clone();
        const body = await clonedRequest.json().catch(() => ({}));
        validated.body = config.schema.parse(body);
      }

      // Validate query parameters if querySchema provided
      if (config.querySchema) {
        const queryParams = Object.fromEntries(
          request.nextUrl.searchParams.entries()
        );
        validated.query = config.querySchema.parse(queryParams);
      }

      // Validate route parameters if paramsSchema provided
      if (config.paramsSchema && args[0]?.params) {
        const params = await args[0].params;
        validated.params = config.paramsSchema.parse(params);
      }

      return await handler(request, validated, ...args);
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            error: config.errorMessage || "Validation failed",
            details: error.errors,
          },
          { status: 400 }
        );
      }
      throw error;
    }
  };
}

/**
 * Combines validation and mock fallback middleware
 * 
 * @param validationConfig - Validation configuration
 * @param mockConfig - Mock fallback configuration
 * @param handler - The actual route handler
 * @returns Route handler with both validation and mock fallback
 */
export function withValidationAndMockFallback<T = any>(
  validationConfig: ValidationConfig<T>,
  mockConfig: { mockData: any; transformMock?: (data: any) => any },
  handler: (
    request: NextRequest,
    validated: {
      body?: T;
      query?: any;
      params?: any;
    },
    ...args: any[]
  ) => Promise<NextResponse>
) {
  const validatedHandler = withValidation(handler, validationConfig);
  
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    const env = process.env.NEXT_PUBLIC_APP_ENV;
    const backendUrl = process.env.BACKEND_URL;

    // Use mock during local dev
    if (env === "local") {
      const mockData = mockConfig.transformMock
        ? mockConfig.transformMock(mockConfig.mockData)
        : mockConfig.mockData;
      return NextResponse.json(mockData);
    }

    // Fall back to mock if BACKEND_URL is missing
    if (!backendUrl) {
      console.warn("BACKEND_URL not set, using mock data");
      const mockData = mockConfig.transformMock
        ? mockConfig.transformMock(mockConfig.mockData)
        : mockConfig.mockData;
      return NextResponse.json(mockData);
    }

    // Try to execute the validated handler
    try {
      return await validatedHandler(request, ...args);
    } catch (error: any) {
      // Fall back to mock data if handler fails
      console.error("❌ Route handler failed, using mock data:", error.message);
      const mockData = mockConfig.transformMock
        ? mockConfig.transformMock(mockConfig.mockData)
        : mockConfig.mockData;
      return NextResponse.json(mockData);
    }
  };
}

