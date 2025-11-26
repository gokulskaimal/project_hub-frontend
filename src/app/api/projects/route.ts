import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Project routes - coming soon!",
    timestamp: new Date().toISOString(),
  });
}
