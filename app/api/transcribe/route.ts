import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "DEEPGRAM_API_KEY is not configured" },
      { status: 500 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json(
      { error: "No audio file provided. Send a 'file' field in multipart form data." },
      { status: 400 }
    );
  }

  const audioBuffer = Buffer.from(await file.arrayBuffer());

  const dgResponse = await fetch(
    "https://api.deepgram.com/v1/listen?model=nova-2&diarize=true&punctuate=true",
    {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": (file as File).type || "audio/wav",
      },
      body: audioBuffer,
    }
  );

  if (!dgResponse.ok) {
    const errBody = await dgResponse.text();
    return NextResponse.json(
      { error: "Deepgram API error", details: errBody },
      { status: dgResponse.status }
    );
  }

  const dgResult = await dgResponse.json();
  const words: { word: string; speaker: number; punctuated_word: string }[] =
    dgResult.results?.channels?.[0]?.alternatives?.[0]?.words ?? [];

  // Build transcript with speaker labels (Rep = speaker 0, Prospect = speaker 1+)
  const lines: string[] = [];
  let currentSpeaker: number | null = null;
  let currentLine = "";

  for (const w of words) {
    if (w.speaker !== currentSpeaker) {
      if (currentLine) {
        const label = currentSpeaker === 0 ? "Rep" : "Prospect";
        lines.push(`${label}: ${currentLine.trim()}`);
      }
      currentSpeaker = w.speaker;
      currentLine = w.punctuated_word;
    } else {
      currentLine += " " + w.punctuated_word;
    }
  }

  // Push the last line
  if (currentLine) {
    const label = currentSpeaker === 0 ? "Rep" : "Prospect";
    lines.push(`${label}: ${currentLine.trim()}`);
  }

  const transcript = lines.join("\n");

  return NextResponse.json({ transcript });
}
