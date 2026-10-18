import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { clientKey, isCloudConfigured, rateLimit, serviceClient } from "@/lib/supabase-server";
import { normaliseEntry, type CapsuleEntry } from "@/lib/capsule";

/**
 * Adds to a sealed capsule without opening it.
 *
 * This is the whole point of the lock: she can keep putting things in all
 * year, and nothing — not this route, not the client — hands anything back
 * before the unlock date. The response carries a count and nothing else.
 */
export async function POST(request: Request) {
  if (!rateLimit(`append:${clientKey(request)}`, 60, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Slow down a moment." }, { status: 429 });
  }
  if (!isCloudConfigured()) {
    return NextResponse.json({ error: "Cloud storage isn't configured." }, { status: 501 });
  }

  let code = "";
  let entry: CapsuleEntry;
  try {
    const body = (await request.json()) as { code?: unknown };
    code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
    entry = normaliseEntry(body);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid request." },
      { status: 400 },
    );
  }
  if (code.length < 8) {
    return NextResponse.json({ error: "That recovery code doesn't look right." }, { status: 400 });
  }

  const client = serviceClient();
  if (!client) return NextResponse.json({ error: "Storage unavailable." }, { status: 503 });

  const codeHash = createHash("sha256").update(code).digest("hex");
  const { data, error } = await client
    .from("time_capsules")
    .select("id, entries, unlock_at")
    .eq("code_hash", codeHash)
    .maybeSingle();

  if (error) return NextResponse.json({ error: "Could not reach the capsule." }, { status: 502 });
  if (!data) return NextResponse.json({ error: "No capsule matches that code." }, { status: 404 });

  const existing = Array.isArray(data.entries) ? data.entries : [];
  if (existing.length >= 200) {
    return NextResponse.json({ error: "That capsule is full." }, { status: 409 });
  }

  const { error: updateError } = await client
    .from("time_capsules")
    .update({ entries: [...existing, entry], updated_at: new Date().toISOString() })
    .eq("id", data.id);

  if (updateError) {
    return NextResponse.json({ error: "That didn't save. Try again." }, { status: 502 });
  }

  // Deliberately no content in the response: adding is not opening.
  return NextResponse.json({
    added: true,
    entries: existing.length + 1,
    unlockAt: data.unlock_at,
  });
}
