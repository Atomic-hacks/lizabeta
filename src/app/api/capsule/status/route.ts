import { NextResponse } from "next/server";
import { isCloudConfigured, unlockDate } from "@/lib/supabase-server";

/** Tells the client which mode it is in, and when the capsule opens. */
export async function GET() {
  return NextResponse.json({
    cloud: isCloudConfigured(),
    unlockAt: unlockDate().toISOString(),
    now: new Date().toISOString(),
  });
}
