import { NextRequest, NextResponse } from "next/server";
import { fetchWithMockFallback } from "@/lib/api/middleware";

const mockDeleteResponse = {
  status: 200,
  message: "Document deleted successfully",
};

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const data = await fetchWithMockFallback(
      {
        method: "DELETE",
        url: `/api/knowledge/documents/${id}`,
      },
      mockDeleteResponse
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ /api/knowledge/documents/[id] DELETE Error:", error);
    return NextResponse.json(mockDeleteResponse);
  }
}

