import Anthropic from "@anthropic-ai/sdk";
import { unlink } from "fs/promises";

async function main() {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  console.log("Sending test message to Claude...");

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 16,
    messages: [{ role: "user", content: "Say the word QUBE and nothing else" }],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "no text";
  console.log(`Response: ${text}`);
  console.log(`Stop reason: ${message.stop_reason}`);
  console.log("API is live. Cleaning up...");

  // Self-delete
  await unlink(new URL(import.meta.url).pathname);
  console.log("Test file deleted.");
}

main().catch((err) => {
  console.error("TEST FAILED:", err.message);
  process.exit(1);
});
