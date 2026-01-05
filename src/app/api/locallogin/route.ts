import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import response from "./response.json";

const LocalLoginSchema = z.object({
  userEmail: z.string().email(),
  userPassword: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const { userEmail, userPassword } = await request.json();
    const validatedData = LocalLoginSchema.parse({ userEmail, userPassword });

    const data = response;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in local login route:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}