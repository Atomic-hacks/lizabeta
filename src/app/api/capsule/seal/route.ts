import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import {
  clientKey,
  isCloudConfigured,
  rateLimit,
  serviceClient,
  unlockDate,
} from "@/lib/supabase-server";
import { normaliseEntry, type CapsuleEntry } from "@/lib/capsule";

/** A 20-character code: ~100 bits, grouped so it can be read aloud. */
function makeCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(20);
  const chars = Array.from(bytes, (b) => alphabet[b % alphabet.length]);
  return [0, 5, 10, 15].map((i) => chars.slice(i, i + 5).join("")).join("-");
}

export async function POST(request: Request) {
  if (!rateLimit(`seal:${clientKey(request)}`, 12, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many capsules. Try again later." }, { status: 429 });
  }
  if (!isCloudConfigured()) {
    return NextResponse.json(
      { error: "Cloud storage isn't configured on this deployment." },
      { status: 501 },
    );
  }

  let entry: CapsuleEntry;
  try {
    entry = normaliseEntry(await request.json());
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid request." },
      { status: 400 },
    );
  }

  const client = serviceClient();
  if (!client) return NextResponse.json({ error: "Storage unavailable." }, { status: 503 });

  const code = makeCode();
  const codeHash = createHash("sha256").update(code).digest("hex");
  const unlock = unlockDate();

  const { error } = await client.from("time_capsules").insert({
    code_hash: codeHash,
    unlock_at: unlock.toISOString(),
    entries: [entry],
  });

  if (error) {
    return NextResponse.json({ error: "The capsule could not be sealed." }, { status: 502 });
  }

  return NextResponse.json({ sealed: true, code, unlockAt: unlock.toISOString(), entries: 1 });
}
