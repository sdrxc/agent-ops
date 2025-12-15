import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import response from "./response.json"
import axios from "axios";

const step1AgentRegistrySchema = z.object({
  sequenceID: z.string(),
  stepID: z.string()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Local Fetch
    const validated = step1AgentRegistrySchema.parse(body);
    console.log("Validated Payload:", validated);
    const env = process.env.NEXT_PUBLIC_APP_ENV;

    console.log('ENV :', env);
    console.log('BACKEND_URL :', process.env.BACKEND_URL);

    // ✅ Use mock during local dev
    if (env === "local") {
      const data = response;
      return NextResponse.json(data); // 👈 response.json content is returned
    }

    const { data } = await axios.post(
      `${process.env.BACKEND_URL}/api/step2-validate`,
      validated,
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
