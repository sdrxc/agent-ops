import { NextRequest, NextResponse } from "next/server";
import { mockDatabase } from "@/lib/mockDatabase";

// GET /api/agents/[id] - Get single agent by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Find agent in mock database
    const agents = mockDatabase.getAllAgents();
    const agent = agents.find((a) => a.id === id);

    if (!agent) {
      return NextResponse.json(
        { error: "Agent not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: agent }, { status: 200 });
  } catch (error) {
    console.error("Error fetching agent:", error);
    return NextResponse.json(
      { error: "Failed to fetch agent" },
      { status: 500 }
    );
  }
}

// PUT /api/agents/[id] - Update agent
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await request.json();

    // Update agent in mock database
    const updatedAgent = mockDatabase.updateAgent(id, updates);

    if (!updatedAgent) {
      return NextResponse.json(
        { error: "Agent not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: updatedAgent,
        message: "Agent updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating agent:", error);
    return NextResponse.json(
      { error: "Failed to update agent" },
      { status: 500 }
    );
  }
}

// DELETE /api/agents/[id] - Delete agent
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete agent from mock database
    const success = mockDatabase.deleteAgent(id);

    if (!success) {
      return NextResponse.json(
        { error: "Agent not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Agent deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting agent:", error);
    return NextResponse.json(
      { error: "Failed to delete agent" },
      { status: 500 }
    );
  }
}
