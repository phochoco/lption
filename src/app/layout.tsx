import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "LPtion - 스마트폰 빛공해 측정 플랫폼",
  description: "스마트폰으로 빛공해를 측정·기록·비교·리포트하는 플랫폼입니다. 시민, 조명업계, 지자체 모두를 위한 빛공해 측정 보조 도구.",
  keywords: ["빛공해", "측정", "휘도", "조도", "스마트폰", "환경", "민원"],
  openGraph: {
    title: "LPtion - 스마트폰 빛공해 측정 플랫폼",
    description: "스마트폰으로 빛공해를 측정·기록·비교·리포트하는 플랫폼",
    type: "website",
    url: "https://lption.dasiloom.com",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0a0e1a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <Header />
        <main className="page-container">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
