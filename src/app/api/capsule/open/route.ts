import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { clientKey, isCloudConfigured, rateLimit, serviceClient, unlockDate } from "@/lib/supabase-server";

/**
 * Opens a capsule if — and only if — the code matches and the unlock date
 * has passed. While it is shut, the response says how many entries are in
 * there and when it opens, and nothing else: no letter text, no photos.
 */
export async function POST(request: Request) {
  if (!rateLimit(`open:${clientKey(request)}`, 20, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }
  if (!isCloudConfigured()) {
    return NextResponse.json({ error: "Cloud storage isn't configured." }, { status: 501 });
  }

  let code = "";
  try {
    const body = (await request.json()) as { code?: unknown };
    code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (code.length < 8) {
    return NextResponse.json({ error: "That recovery code doesn't look right." }, { status: 400 });
  }

  const client = serviceClient();
  if (!client) return NextResponse.json({ error: "Storage unavailable." }, { status: 503 });

  const codeHash = createHash("sha256").update(code).digest("hex");
  const { data, error } = await client
    .from("time_capsules")
    .select("entries, unlock_at, created_at, updated_at")
    .eq("code_hash", codeHash)
    .maybeSingle();

  if (error) return NextResponse.json({ error: "Could not reach the capsule." }, { status: 502 });
  if (!data) return NextResponse.json({ error: "No capsule matches that code." }, { status: 404 });

  const entries = Array.isArray(data.entries) ? data.entries : [];
  const unlockAt = new Date(data.unlock_at ?? unlockDate());

  if (Date.now() < unlockAt.getTime()) {
    return NextResponse.json({
      locked: true,
      unlockAt: unlockAt.toISOString(),
      sealedAt: data.created_at,
      lastAddedAt: data.updated_at,
      entries: entries.length,
    });
  }

  return NextResponse.json({
    locked: false,
    unlockAt: unlockAt.toISOString(),
    sealedAt: data.created_at,
    entries,
  });
}
