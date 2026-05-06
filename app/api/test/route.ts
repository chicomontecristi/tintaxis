import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ status: "test ok", timestamp: new Date().toISOString() });
}
