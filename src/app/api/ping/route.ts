import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const ping = process.env.PING_MESSAGE ?? "ping";

    return NextResponse.json({ message: ping }, { status: 200 });
  } catch (error) {
    console.error("Error in ping route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
