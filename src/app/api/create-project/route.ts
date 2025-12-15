import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import response from "./response.json"
import axios from "axios";


const setupProjectPayloadSchema = z.object({
    projectName: z.string().min(3, "Project name must be at least 3 characters long."),
    description: z.string().max(500, "Description must not exceed 500 characters.").optional(),
    createdBy: z.string(),
    tags: z.array(z.string()).optional(),
    enableMemoryManagement: z.boolean(),
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
      `${backendUrl}/api/create-project`,
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