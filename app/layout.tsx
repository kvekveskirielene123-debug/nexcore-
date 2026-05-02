import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nexcor - AI Character Chat",
  description: "Chat with AI characters on Nexcor",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
