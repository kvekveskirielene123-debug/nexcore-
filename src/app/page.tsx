import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/home/Hero";
import { OurStory } from "@/components/home/OurStory";
import { CharacterShowcase } from "@/components/home/CharacterShowcase";
import { Features } from "@/components/home/Features";
import { FinalCta } from "@/components/home/FinalCta";
import { HomeFooter } from "@/components/home/HomeFooter";

export const metadata = {
  title: "Nexcor · Where memory meets imagination",
  description:
    "Premium AI character chat with deep memory, emotional roleplay, and storytelling. Made with heart by Kurai & Big G.",
  openGraph: {
    title: "Nexcor",
    description: "Where memory meets imagination. AI companions that feel truly alive.",
    type: "website",
  },
};

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoggedIn = !!user;

  return (
    <main className="min-h-screen bg-[#05020d]">
      <Navbar />
      <Hero isLoggedIn={isLoggedIn} />
      <OurStory />
      <CharacterShowcase />
      <Features />
      <FinalCta isLoggedIn={isLoggedIn} />
      <HomeFooter />
    </main>
  );
}
