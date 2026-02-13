import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "셀기꾼 지수 측정기",
  description: "즉석 셀카와 보정본을 비교하여 셀기꾼 지수를 측정해보세요!",
  metadataBase: new URL("https://selfie-checker.vercel.app"),
  openGraph: {
    title: "셀기꾼 지수 측정기",
    description: "즉석 셀카와 보정본을 비교하여 셀기꾼 지수를 측정해보세요!",
    url: "https://selfie-checker.vercel.app",
    siteName: "셀기꾼 지수 측정기",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "/banner-main.jpg",
        width: 1792,
        height: 1024,
        alt: "셀기꾼 지수 측정기 배너",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "셀기꾼 지수 측정기",
    description: "즉석 셀카와 보정본을 비교하여 셀기꾼 지수를 측정해보세요!",
    images: ["/banner-main.jpg"],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "셀기꾼 지수",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
