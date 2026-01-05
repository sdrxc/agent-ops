import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fetchWithMockFallback } from "@/lib/api/middleware";
import response from "./response.json";
import { KnowledgeDocumentSchema } from "@/types/api";

const CreateDocumentSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["pdf", "url", "txt", "md", "docx"]),
  collectionId: z.string(),
  tags: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get("collectionId");

    const transformMock = (mockData: any) => {
      let documents = mockData.data?.documents || [];
      if (collectionId) {
        documents = documents.filter((doc: any) => doc.collectionId === collectionId);
      }
      return {
        status: 200,
        message: "Documents fetched successfully",
        data: { documents },
      };
    };

    const params = collectionId ? { collectionId } : {};
    const data = await fetchWithMockFallback(
      {
        method: "GET",
        url: "/api/knowledge/documents",
        params,
      },
      response,
      transformMock
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ /api/knowledge/documents GET Error:", error);
    let documents = response.data?.documents || [];
    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get("collectionId");
    if (collectionId) {
      documents = documents.filter((doc: any) => doc.collectionId === collectionId);
    }
    return NextResponse.json({
      status: 200,
      message: "Documents fetched successfully",
      data: { documents },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedPayload = CreateDocumentSchema.parse(body);

    const transformMock = () => {
      const newDocument: z.infer<typeof KnowledgeDocumentSchema> = {
        id: `kb_${Date.now()}`,
        name: validatedPayload.name,
        type: validatedPayload.type,
        status: "Indexing",
        size: validatedPayload.type === "url" ? undefined : "1.2 MB",
        updatedAt: new Date().toISOString(),
        chunks: 0,
        tags: validatedPayload.tags || [],
        collectionId: validatedPayload.collectionId,
      };

      return {
        status: 200,
        message: "Document created successfully",
        data: { document: newDocument },
      };
    };

    const data = await fetchWithMockFallback(
      {
        method: "POST",
        url: "/api/knowledge/documents",
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
    console.error("❌ /api/knowledge/documents POST Error:", error);
    const newDocument: z.infer<typeof KnowledgeDocumentSchema> = {
      id: `kb_${Date.now()}`,
      name: "Unknown",
      type: "txt",
      status: "Indexing",
      size: "1.2 MB",
      updatedAt: new Date().toISOString(),
      chunks: 0,
      tags: [],
      collectionId: "",
    };
    return NextResponse.json({
      status: 200,
      message: "Document created successfully",
      data: { document: newDocument },
    });
  }
}

