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
            __html: `
window.googleTranslateElementInit=function(){
  new google.translate.TranslateElement({pageLanguage:'en',autoDisplay:false},'nx-translate-element');
};
(function(){
  function nxKillBanner(){
    try{
      var b=document.querySelector('iframe.goog-te-banner-frame,iframe[name="google_translate_frame"]');
      if(b){b.style.cssText='display:none!important;height:0!important;';}
      var tt=document.getElementById('goog-gt-tt');
      if(tt)tt.style.display='none';
      var bf=document.querySelector('.goog-te-balloon-frame');
      if(bf)bf.style.display='none';
      if(document.body){document.body.style.top='0px';document.body.style.marginTop='0px';}
    }catch(e){}
  }
  var _obs;
  function startObs(){
    nxKillBanner();
    if(typeof MutationObserver==='undefined')return;
    _obs=new MutationObserver(function(ms){
      for(var i=0;i<ms.length;i++){
        if(ms[i].addedNodes.length||ms[i].attributeName==='style'){nxKillBanner();break;}
      }
    });
    _obs.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['style']});
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',startObs);}
  else{startObs();}
  window.addEventListener('load',nxKillBanner);
})();
`,
          }}
        />
        <script async src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" />
        <style dangerouslySetInnerHTML={{ __html: `iframe.goog-te-banner-frame,iframe[name="google_translate_frame"]{display:none!important;height:0!important;}.goog-te-menu-frame{display:none!important}#goog-gt-tt{display:none!important}.goog-te-balloon-frame{display:none!important}.goog-te-spinner-pos{display:none!important}body{top:0!important;margin-top:0!important}` }} />
      </head>
      <body>
        <div id="nx-translate-element" style={{ display: "none" }} />
        {children}
      </body>
    </html>
  );
}
