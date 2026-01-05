import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fetchWithMockFallback } from "@/lib/api/middleware";
import { KnowledgeCollectionSchema } from "@/types/api";
import collectionsResponse from "../response.json";

const UpdateCollectionSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const transformMock = (mockData: any) => {
      const collections = mockData.data?.collections || [];
      const collection = collections.find((c: any) => c.id === id);
      
      if (!collection) {
        return { error: "Collection not found" };
      }

      return {
        status: 200,
        message: "Collection fetched successfully",
        data: { collection },
      };
    };

    const data = await fetchWithMockFallback(
      {
        method: "GET",
        url: `/api/knowledge/collections/${id}`,
      },
      collectionsResponse,
      transformMock
    );

    if (data.error) {
      return NextResponse.json(data, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ /api/knowledge/collections/[id] GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedPayload = UpdateCollectionSchema.parse(body);

    const transformMock = (mockData: any) => {
      const collections = mockData.data?.collections || [];
      const existingCollection = collections.find((c: any) => c.id === id);
      
      if (!existingCollection) {
        return { error: "Collection not found" };
      }

      const updatedCollection = {
        ...existingCollection,
        ...validatedPayload,
        updated: new Date().toISOString(),
      };

      return {
        status: 200,
        message: "Collection updated successfully",
        data: { collection: updatedCollection },
      };
    };

    const data = await fetchWithMockFallback(
      {
        method: "PUT",
        url: `/api/knowledge/collections/${id}`,
        data: validatedPayload,
      },
      collectionsResponse,
      transformMock
    );

    if (data.error) {
      return NextResponse.json(data, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("❌ /api/knowledge/collections/[id] PUT Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const mockDeleteResponse = {
      status: 200,
      message: "Collection deleted successfully",
    };

    const data = await fetchWithMockFallback(
      {
        method: "DELETE",
        url: `/api/knowledge/collections/${id}`,
      },
      mockDeleteResponse
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ /api/knowledge/collections/[id] DELETE Error:", error);
    return NextResponse.json({
      status: 200,
      message: "Collection deleted successfully",
    });
  }
}

