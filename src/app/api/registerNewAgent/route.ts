import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import response from "./response.json"
import axios from "axios";


const setupProjectPayloadSchema = z.object({
    userID: z.string(),
    projectID: z.string(),
    name: z.string(),
    description: z.string(),
    tags: z.array(z.string()).optional(),
   });

export async function POST(request: NextRequest) {
  try {
    const projectData = await request.json();
    const validatedPayload = setupProjectPayloadSchema.parse(projectData);

    const env = process.env.NEXT_PUBLIC_APP_ENV;
    const backendUrl = process.env.BACKEND_URL;

    console.log('ENV :', env);
    console.log('BACKEND_URL :', process.env.BACKEND_URL);

    // ✅ Use mock during local dev
    if (env === "local") {
      const data = response;
      return NextResponse.json(data);
    }

    const { data } = await axios.post(
      `${backendUrl}/api/registerNewAgent`,
      validatedPayload,
      { headers: { "Content-Type": "application/json" } }
    );

    return NextResponse.json(data);
    

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}