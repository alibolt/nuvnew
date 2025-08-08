
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth-options";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return apiResponse.success({ message: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json(session);
}
