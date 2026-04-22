import type { Metadata } from "next";
import {
  Cinzel,
  Cormorant_Garamond,
  EB_Garamond,
  Noto_Serif_KR,
} from "next/font/google";
import "./globals.css";
import { TokenMeter } from "@/components/TokenMeter";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-cinzel",
  display: "swap",
});
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});
const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-eb",
  display: "swap",
});
const notoSerifKR = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-kr",
  display: "swap",
});
export const metadata: Metadata = {
  title: "전박사의 릴레이노블",
  description: "집합적 서사의 연금술",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ko"
      className={`${cinzel.variable} ${cormorant.variable} ${ebGaramond.variable} ${notoSerifKR.variable}`}
    >
      <body>
        {children}
        <TokenMeter />
      </body>
    </html>
  );
}
