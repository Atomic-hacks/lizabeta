import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/* ---------------------------------------------------------------------------
 * SERVER ONLY. This module reads the service-role key and must never be
 * imported from a client component — importing it anywhere under "use client"
 * would ship the key to the browser.
 *
 * The capsule table has RLS on with no policies, so the anon key cannot read
 * or write it at all. Every capsule operation goes through a route handler
 * that validates input and enforces the unlock date.
 * ------------------------------------------------------------------------- */

export function isCloudConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function serviceClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * When the capsule may be opened. Resolved here, on the server, so no client
 * clock can move it.
 *
 * 1. TIME_CAPSULE_UNLOCK_DATE — an exact date, if you set one.
 * 2. NEXT_PUBLIC_BIRTHDAY_MMDD ("10-18") — her next birthday from now.
 * 3. Otherwise: one year from today.
 */
export function unlockDate(from: Date = new Date()): Date {
  const configured = process.env.TIME_CAPSULE_UNLOCK_DATE;
  if (configured) {
    const parsed = new Date(configured);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  const mmdd = process.env.NEXT_PUBLIC_BIRTHDAY_MMDD;
  if (mmdd && /^\d{2}-\d{2}$/.test(mmdd)) {
    const [month, day] = mmdd.split("-").map(Number);
    const candidate = new Date(Date.UTC(from.getUTCFullYear(), month - 1, day, 0, 0, 0));
    // Her birthday this year has already passed (or is today) — use next year.
    if (candidate.getTime() <= from.getTime()) {
      candidate.setUTCFullYear(candidate.getUTCFullYear() + 1);
    }
    return candidate;
  }

  const next = new Date(from);
  next.setFullYear(next.getFullYear() + 1);
  return next;
}

/* --- best-effort rate limiting ------------------------------------------
 * Per-instance and in-memory: enough to stop someone guessing codes in a
 * loop from one address. A multi-instance deployment should put a real
 * limiter (or Supabase-side counting) in front of this.
 * --------------------------------------------------------------------- */
const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}

export function clientKey(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}
