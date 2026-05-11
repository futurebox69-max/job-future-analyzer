import type { Metadata } from "next";
import { Noto_Sans_KR, Gowun_Batang, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

const gowunBatang = Gowun_Batang({
  variable: "--font-gowun-batang",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://job-future-analyzer.vercel.app"),
  title: "직업의 미래 | REFRAME — 내 삶을 다시 설계하다",
  description:
    "AI가 내 직업을 대체할 가능성을 8차원으로 분석하고, 구체적인 전환 경로를 제시합니다.",
  keywords: ["AI 직업 대체율", "직업 미래", "커리어 전환", "자동화", "REFRAME"],
  openGraph: {
    title: "내 직업의 미래 — REFRAME",
    description:
      "AI가 내 직업을 대체할 가능성을 8차원으로 분석합니다. 무료 진단으로 내 커리어의 다음 한 수를 설계하세요.",
    url: "/",
    siteName: "REFRAME",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "REFRAME — 내 삶을 다시 설계하다",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "내 직업의 미래 — REFRAME",
    description:
      "AI가 내 직업을 대체할 가능성을 8차원으로 분석합니다. 무료 진단으로 내 커리어의 다음 한 수를 설계하세요.",
    images: ["/og-default.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${notoSansKR.variable} ${gowunBatang.variable} ${jetBrainsMono.variable} h-full`}
    >
      <body
        className="min-h-full flex flex-col antialiased"
        style={{ background: "#0B1B2B", fontFamily: "var(--font-noto-sans-kr), sans-serif" }}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
