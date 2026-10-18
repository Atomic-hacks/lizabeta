import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Fredoka, Geist_Mono, Nunito } from "next/font/google";
import { birthdayConfig } from "@/content/birthday";
import "./globals.css";

/* Two display registers: Fredoka for the loud chapters, Cormorant italic for
 * the quiet ones. Nunito carries the body, Geist Mono the HUD labels. */
const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fredoka",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${birthdayConfig.displayName}'s Universe`,
  description: birthdayConfig.tagline,
  robots: { index: false, follow: false },
  openGraph: {
    title: `${birthdayConfig.displayName}'s Universe`,
    description: birthdayConfig.tagline,
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#08060f",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${fredoka.variable} ${cormorant.variable} ${nunito.variable} ${geistMono.variable}`}
    >
      <head>
        {/* Only fetched if she turns the music on. */}
        <link rel="preconnect" href="https://open.spotify.com" />
      </head>
      <body>{children}</body>
    </html>
  );
}
