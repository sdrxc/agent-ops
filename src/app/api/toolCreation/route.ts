import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import response from "./response.json";
import axios from "axios";

const toolCreationSchema = z.object({
  userID: z.string(),
  activeData: z.record(z.any()), // accept any JSON object
  isToolPublic: z.boolean()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // FIX: validate body directly
     const validatedPayload = toolCreationSchema.parse(body);
    console.log("Validated Payload:", validatedPayload);
    const env = process.env.NEXT_PUBLIC_APP_ENV;

    console.log('ENV :', env);
    console.log('BACKEND_URL :', process.env.BACKEND_URL);

    // ✅ Use mock during local dev
    if (env === "local") {
      const data = response;
      return NextResponse.json(data); // 👈 response.json content is returned
    }
    //const data = response
    //return NextResponse.json(data);

    const { data } = await axios.post(
      `${process.env.BACKEND_URL}/api/toolCreation`,
      validatedPayload,
      { headers: { "Content-Type": "application/json" } }
    );

    return NextResponse.json(data);

  } catch (error) {
    console.error("Validation failed:", error);
    return NextResponse.json(
      { status: "error", message: "Invalid payload", error },
      { status: 400 }
    );
  }
}
