import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "뜨읏 — 내가 살아낸 뜻을 발견하다",
  description:
    "사전은 뜻을 설명하고, 삶은 뜻을 만듭니다. 뜨읏에서 단어의 사전적 의미를 넘어 나만의 살아낸 정의를 발견하세요.",
  keywords: ["뜻 발견", "단어 의미", "삶의 의미", "자기이해", "뜨읏"],
  openGraph: {
    title: "뜨읏 — 내가 살아낸 뜻을 발견하다",
    description: "사전은 뜻을 설명하고, 삶은 뜻을 만듭니다.",
    type: "website",
    locale: "ko_KR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
