import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "뜨읏 — 감정을 언어로",
  description:
    "내 감정을 더 정확한 언어로 표현해보세요. 뜨읏은 낮은 해상도의 감정 표현을 더 깊고 정교한 언어로 변환해드립니다.",
  keywords: ["감정 표현", "언어 해상도", "감정 언어화", "자기이해", "뜨읏"],
  openGraph: {
    title: "뜨읏 — 감정을 언어로",
    description: "내 감정을 더 정확한 언어로 표현해보세요.",
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
