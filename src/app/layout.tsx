import type { Metadata, Viewport } from "next";
import { Rajdhani, Space_Mono, Inter } from "next/font/google";
import "./globals.css";

const displayFont = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const monoFont = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
});

const bodyFont = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NEXCOR",
  description: "Chat with AI characters on Nexcor",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Nexcor",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${displayFont.variable} ${monoFont.variable} ${bodyFont.variable}`}>
      <head>
        <link rel="dns-prefetch" href="//translate.google.com" />
        <link rel="preconnect" href="//translate.google.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.googleTranslateElementInit=function(){new google.translate.TranslateElement({pageLanguage:'en',autoDisplay:false},'nx-translate-element');};`,
          }}
        />
        <script async src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" />
        <style dangerouslySetInnerHTML={{ __html: `.goog-te-banner-frame,.goog-te-menu-frame,#goog-gt-tt,.goog-te-balloon-frame,.skiptranslate{display:none!important}body{top:0!important}` }} />
      </head>
      <body>
        <div id="nx-translate-element" style={{ display: "none" }} />
        {children}
      </body>
    </html>
  );
}
