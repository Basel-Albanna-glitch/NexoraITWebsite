import { IBM_Plex_Sans_Arabic, Inter, Mulish } from "next/font/google";

// Inter for Latin; IBM Plex Sans Arabic for Arabic (it has the same light 200 weight the design relies on);
// Mulish only for the wordmark.
export const inter = Inter({ subsets: ["latin"], weight: ["200", "400", "600", "700"], variable: "--font-inter" });
export const plexArabic = IBM_Plex_Sans_Arabic({ subsets: ["arabic"], weight: ["200", "400", "600", "700"], variable: "--font-arabic" });
export const mulish = Mulish({ subsets: ["latin"], weight: ["700"], variable: "--font-mulish" });

export const fontVars = `${inter.variable} ${plexArabic.variable} ${mulish.variable}`;
