import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import response from "./response.json";
import axios from "axios";

// Define schema for each form object
const keyValueSchema  = z.object({
  key: z.string(),
  value: z.string(),
});

const step5SecretsUploadSchema = z.object({
  projectID: z.string(),
  sequenceID: z.string(),
  userID: z.string(),
  form: z.array(keyValueSchema)
});

export async function POST(request: NextRequest) {
  try {
    const secretsUploadPayload = await request.json();
    const validatedPayload = step5SecretsUploadSchema.parse(secretsUploadPayload);
    console.log("Validated Payload:", validatedPayload);
    const env = process.env.NEXT_PUBLIC_APP_ENV;

    console.log('ENV :', env);
    console.log('BACKEND_URL :', process.env.BACKEND_URL);

    // ✅ Use mock during local dev
    if (env === "local") {
      const data = response;
      return NextResponse.json(data);
    }

    const { data } = await axios.post(
      `${process.env.BACKEND_URL}/api/step5-secretsUpload`,
      validatedPayload,
      { headers: { "Content-Type": "application/json" } }
    );

    return NextResponse.json(data);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
