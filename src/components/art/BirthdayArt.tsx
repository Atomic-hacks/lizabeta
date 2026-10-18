/**
 * Original vector artwork for Elizabeth's birthday.
 * Decoration only: hidden from assistive technology and never a click target.
 * Two motifs, one palette, no icon-library dependency or continuous animation.
 */
export function PaperStar({ className = "", size = 48 }: { className?: string; size?: number }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true" focusable="false">
      <path d="M50 5 61 35 94 36 68 56 77 89 50 70 22 90 31 57 6 36 39 35Z" fill="currentColor" />
      <path d="m50 5 1 45 43-14-26 20 9 33-26-39-29 40 9-33L6 36l45 14Z" fill="#fff8ec" fillOpacity=".18" />
      <path d="m50 5 1 45-29 40M51 50l43-14" stroke="#281335" strokeOpacity=".15" strokeWidth="1.3" />
    </svg>
  );
}

export function BirthdayBalloons({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="170" height="270" viewBox="0 0 170 270" fill="none" aria-hidden="true" focusable="false">
      <path d="M48 128c-18 30 30 41 19 72s-3 47 17 63M110 103c19 38-23 49-8 82s-12 58-18 78" stroke="#bfa2d4" strokeWidth="1.6" strokeLinecap="round" />
      <g transform="rotate(-14 48 81)">
        <path d="M48 16C21 16 7 36 8 65c1 32 20 58 40 64 20-6 39-32 40-64 1-29-13-49-40-49Z" fill="#b897d5" />
        <path d="M48 16c22 4 30 23 29 49-1 27-14 51-29 64 20-6 39-32 40-64 1-29-13-49-40-49Z" fill="#775292" fillOpacity=".3" />
        <path d="m48 128-6 10 13-1Z" fill="#9470b2" />
        <path d="M25 43c-5 8-7 17-6 27" stroke="#eee0f6" strokeOpacity=".65" strokeWidth="4" strokeLinecap="round" />
      </g>
      <g transform="rotate(11 111 60)">
        <path d="M111 5c-24 0-38 18-37 43 1 29 18 51 37 57 18-6 35-28 36-57 1-25-12-43-36-43Z" fill="#e4d3ed" />
        <path d="M111 5c18 5 25 20 24 43-1 24-11 44-24 57 18-6 35-28 36-57 1-25-12-43-36-43Z" fill="#ae8dc4" fillOpacity=".35" />
        <path d="m111 104-6 9 12 1Z" fill="#c4a9d6" />
        <path d="M90 29c-4 6-6 14-5 21" stroke="#fffaf3" strokeWidth="3" strokeLinecap="round" />
      </g>
      <path d="m79 258 6 6 8-6M85 264l-3 5" stroke="#bfa2d4" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function BirthdaySeal({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="46" height="60" viewBox="0 0 64 82" fill="none" aria-hidden="true" focusable="false">
      <path d="m17 40-4 39 17-10 9 10 5-39Z" fill="#b59ac9" />
      <path d="m37 41 8 37 6-11 11 3-13-34Z" fill="#8d6ba6" />
      <path d="m32 3 8 5 10 1 4 9 6 8-3 10-1 10-9 5-8 6-10-3-10-1-5-9-6-8 3-10 1-10 9-5Z" fill="#e8d8b2" />
      <circle cx="32" cy="29" r="17" stroke="#8e7344" strokeOpacity=".45" />
      <path d="m32 17 4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1Z" fill="#9a7a46" />
    </svg>
  );
}
