import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "내 직업의 미래 | AI 직업 대체율 분석기",
  description:
    "AI가 내 직업을 대체할 가능성을 6차원으로 분석하고, 구체적인 전환 경로를 제시합니다.",
  keywords: ["AI 직업 대체율", "직업 미래", "커리어 전환", "자동화"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${notoSansKR.variable} h-full`}
    >
      <body
        className="min-h-full flex flex-col antialiased"
        style={{ background: "#0A0A0F", fontFamily: "var(--font-noto-sans-kr), sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
