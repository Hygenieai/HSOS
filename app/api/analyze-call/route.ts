import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { QUBE_SYSTEM_PROMPT } from "@/lib/qube/rules";

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured" },
      { status: 500 }
    );
  }

  let body: { transcript: string; prospectName: string; callStage: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { transcript, prospectName, callStage } = body;

  if (!transcript) {
    return NextResponse.json(
      { error: "transcript is required" },
      { status: 400 }
    );
  }

  try {
    const client = new Anthropic({ apiKey });

    const userMessage = [
      `Prospect: ${prospectName || "Unknown"}`,
      `Call Stage: ${callStage || "Unknown"}`,
      "",
      transcript,
    ].join("\n");

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: QUBE_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

    const analysis = JSON.parse(text);

    return NextResponse.json(analysis);
  } catch (err: unknown) {
    const errMessage =
      err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Analysis failed", details: errMessage },
      { status: 500 }
    );
  }
}
