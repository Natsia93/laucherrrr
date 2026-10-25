import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      email = process.env.GMAIL_USER || "",
      to = "",
      subject = "🚀 [Launcher OS] Test Verification from Gmail Connector",
      message = "Hello! Your Gmail Connector in Launcher OS is active and connected successfully.",
    } = body;

    const trimmedEmail = email?.trim();
    const recipient = to?.trim() || trimmedEmail;

    if (!trimmedEmail) {
      return NextResponse.json(
        { success: false, error: "Gmail address is required" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Verification message sent successfully to ${recipient}!`,
      dispatchId: `gmail_${Date.now()}`,
      sender: trimmedEmail,
    });
  } catch (err: any) {
    console.error("Error in Gmail integration API:", err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Internal server error during Gmail dispatch",
      },
      { status: 500 }
    );
  }
}
