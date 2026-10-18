/* ---------------------------------------------------------------------------
 * ELIZABETH FM.
 *
 * The soundtrack is a real Spotify playlist. Spotify's embed plays it in
 * order and shows its own track list, which is the only supported way to play
 * a whole playlist from a third-party page — the Web API would be needed to
 * read the track names, and that requires an authenticated listener.
 *
 * So: the embed does the playing, and the "moments" below are ours — photos
 * and clips that belong with the music. No audio is extracted anywhere.
 * ------------------------------------------------------------------------- */

/** Her playlist. Swap this URL and the whole chapter follows. */
export const playlistUrl =
  "https://open.spotify.com/playlist/22aazRZW5GvPmEWMSLve7t";

export const playlistNote =
  "The whole thing, in order, the way it was put together for you.";

export type Track = {
  id: string;
  spotifyUrl: string;
  dedication: string;
  title?: string;
  artist?: string;
  momentImage?: string;
  momentCaption?: string;
  palette?: { bg: string; fg: string };
};

/**
 * Optional. Add individual track URLs here only if you want a specific song
 * pulled out and given its own dedication — they appear as single records
 * next to the playlist. Leaving this empty is completely fine.
 */
export const dragonPlaylist: Track[] = [];

/** Extracts a playlist or track id from any Spotify URL/URI form. */
export function spotifyUriFromUrl(url: string): string | null {
  const match = url.match(/(track|playlist|album)[/:]([a-zA-Z0-9]{22})/);
  return match ? `spotify:${match[1]}:${match[2]}` : null;
}

export function trackIdFromUrl(url: string): string | null {
  const match = url.match(/track[/:]([a-zA-Z0-9]{22})/);
  return match ? match[1] : null;
}

export const RADIO_STORAGE_KEY = "elizabeth.radio.v1";
