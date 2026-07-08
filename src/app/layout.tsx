import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "業務棚卸し台帳",
  description: "社内業務の棚卸しと方針管理のための台帳アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-paper text-foreground">
        {children}
      </body>
    </html>
  );
}
