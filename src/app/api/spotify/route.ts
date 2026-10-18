import { NextResponse } from "next/server";

/* Proxy for Spotify's public oEmbed endpoint: keeps the request CORS-safe and
 * lets us cache it. Only open.spotify.com URLs are forwarded. */

const ALLOWED_HOST = "open.spotify.com";

export const revalidate = 86400;

export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  if (target.hostname !== ALLOWED_HOST) {
    return NextResponse.json({ error: "Only open.spotify.com is allowed" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://open.spotify.com/oembed?url=${encodeURIComponent(target.toString())}`,
      { next: { revalidate: 86400 } },
    );
    if (!res.ok) {
      return NextResponse.json({ error: "Spotify unavailable" }, { status: 502 });
    }
    const data = (await res.json()) as Record<string, unknown>;
    return NextResponse.json(
      { title: data.title, thumbnail_url: data.thumbnail_url },
      { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } },
    );
  } catch {
    return NextResponse.json({ error: "Spotify unavailable" }, { status: 502 });
  }
}
