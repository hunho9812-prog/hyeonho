import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "김현호 | Hyeonho Kim",
  description: "김현호의 개인 소개 페이지입니다.",
  openGraph: {
    title: "김현호 | Hyeonho Kim",
    description: "김현호의 개인 소개 페이지입니다.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
