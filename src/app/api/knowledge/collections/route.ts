import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fetchWithMockFallback } from "@/lib/api/middleware";
import response from "./response.json";
import { KnowledgeCollectionSchema } from "@/types/api";

const CreateCollectionSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  mcpEndpoints: z.array(z.string()).optional(),
  usageExample: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const data = await fetchWithMockFallback(
      {
        method: "GET",
        url: "/api/knowledge/collections",
      },
      response
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ /api/knowledge/collections GET Error:", error);
    return NextResponse.json(response);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedPayload = CreateCollectionSchema.parse(body);

    const transformMock = () => {
      const newCollection: z.infer<typeof KnowledgeCollectionSchema> = {
        id: `col_${Date.now()}`,
        name: validatedPayload.name,
        description: validatedPayload.description || "",
        documentCount: 0,
        totalSize: "0 KB",
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        tags: validatedPayload.tags || [],
        category: validatedPayload.category,
        mcpEndpoints: validatedPayload.mcpEndpoints,
        usageExample: validatedPayload.usageExample,
      };

      return {
        status: 200,
        message: "Collection created successfully",
        data: { collection: newCollection },
      };
    };

    const data = await fetchWithMockFallback(
      {
        method: "POST",
        url: "/api/knowledge/collections",
        data: validatedPayload,
      },
      response,
      transformMock
    );

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("❌ /api/knowledge/collections POST Error:", error);
    const newCollection: z.infer<typeof KnowledgeCollectionSchema> = {
      id: `col_${Date.now()}`,
      name: "Unknown",
      description: "",
      documentCount: 0,
      totalSize: "0 KB",
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      tags: [],
      category: "",
      mcpEndpoints: [],
      usageExample: "",
    };
    return NextResponse.json({
      status: 200,
      message: "Collection created successfully",
      data: { collection: newCollection },
    });
  }
}

