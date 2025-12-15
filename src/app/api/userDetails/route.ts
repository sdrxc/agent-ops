import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import response from "./response.json"
import axios from "axios";


const UserDetailsPayloadSchema = z.object({
  userEmail: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const { userEmail } = await request.json();

    const validatedPayload = UserDetailsPayloadSchema.parse({ userEmail });
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
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}