import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import response from "./response.json";
import axios from "axios";

// ✅ Zod schema for validation
const projectDetailsPayloadSchema = z.object({
  projectID: z.string(),
  userID: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const { projectID, userID } = await request.json();

    // ✅ Validate payload
    const validatedPayload = projectDetailsPayloadSchema.parse({ projectID, userID });
    console.log("Validated Payload:", validatedPayload);

    const env = process.env.NEXT_PUBLIC_APP_ENV;
    console.log("ENV:", env);
    console.log("BACKEND_URL:", process.env.BACKEND_URL);

    // ✅ Use mock data during local development
    if (env === "local") {
      const data = response;
      return NextResponse.json(data);
    }

    // ✅ API call to backend
    const { data } = await axios.post(
      `${process.env.BACKEND_URL}/api/projectDetails`,
      validatedPayload,
      { headers: { "Content-Type": "application/json" } }
    );

    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Error in /api/projectDetails:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error.response) {
      // ✅ Pass backend error message through
      return NextResponse.json(
        { error: error.response.data || "Backend error" },
        { status: error.response.status || 500 }
      );
    }

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
