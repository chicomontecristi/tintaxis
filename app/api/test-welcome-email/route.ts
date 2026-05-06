import { sendWelcomeEmail } from "@/lib/send-welcome-email";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email") || "test@example.com";
  const name = searchParams.get("name") || "Jose Chavez";
  const tier = (searchParams.get("tier") as any) || "codex";

  const result = await sendWelcomeEmail(email, name, tier);

  if (result.success) {
    return NextResponse.json({ success: true, message: `Welcome email sent to ${email}` });
  } else {
    return NextResponse.json({ success: false, error: result.error }, { status: 500 });
  }
}
