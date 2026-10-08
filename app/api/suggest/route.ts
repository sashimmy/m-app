import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/prompts";
import { fallbackSuggestions } from "@/lib/data";

const BodySchema = z.object({
  mode: z.enum(["student", "group"]),
  payload: z.record(z.string(), z.unknown()),
});

const SuggestionSchema = z.object({
  title: z.string().min(1).max(120),
  why: z.string().min(1).max(400),
  steps: z.array(z.string().min(1).max(240)).min(2).max(5),
  whoCanHelp: z.string().min(1).max(60),
});
const OutputSchema = z.object({
  suggestions: z.array(SuggestionSchema).length(3),
});

// Basic in-memory IP rate limit: 10 req/min per IP
const buckets = new Map<string, number[]>();
function rateLimit(ip: string) {
  const now = Date.now();
  const windowMs = 60_000;
  const prev = buckets.get(ip) ?? [];
  const kept = prev.filter((t) => now - t < windowMs);
  if (kept.length >= 10) return false;
  kept.push(now);
  buckets.set(ip, kept);
  return true;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a moment." },
      { status: 429 }
    );
  }

  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      source: "fallback",
      suggestions: fallbackSuggestions(body.mode),
    });
  }

  try {
    const client = new Anthropic({ apiKey });
    const userPrompt = buildUserPrompt(body.mode, body.payload);

    const createPromise = client.messages.create({
      model: "claude-sonnet-5-5",
      max_tokens: 1200,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });
    type MessageResult = Awaited<typeof createPromise>;
    const resp = (await Promise.race([
      createPromise,
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), 15_000)),
    ])) as MessageResult;

    const text = (resp.content as Array<{ type: string; text?: string }>)
      .filter((b) => b.type === "text")
      .map((b) => b.text ?? "")
      .join("");

    // Extract the first JSON object from the response
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON in model response");
    const parsed = OutputSchema.parse(JSON.parse(match[0]));

    return NextResponse.json({
      source: "ai",
      suggestions: parsed.suggestions,
    });
  } catch (err) {
    console.error("Suggest route error:", err);
    return NextResponse.json({
      source: "fallback",
      suggestions: fallbackSuggestions(body.mode),
    });
  }
}
