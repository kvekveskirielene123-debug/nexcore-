import { LegalPage } from "@/components/legal/LegalPage";

export const metadata = {
  title: "FAQ · Nexcor",
  description: "Answers to the most common questions about Nexcor — AI characters, Marks, privacy, and more.",
};

function FaqLogo() {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 96, height: 96 }}>
      <div
        aria-hidden
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 155, height: 155,
          background: "radial-gradient(circle, rgba(167,139,250,0.09) 0%, transparent 65%)",
        }}
      />
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden>
        <circle cx="36" cy="36" r="32" stroke="rgba(167,139,250,0.35)" strokeWidth="1.2"/>
        <circle cx="36" cy="36" r="32" stroke="rgba(0,229,255,0.1)" strokeWidth="0.6" strokeDasharray="3 4">
          <animateTransform attributeName="transform" type="rotate" from="0 36 36" to="360 36 36" dur="20s" repeatCount="indefinite"/>
        </circle>
        <text x="36" y="42" textAnchor="middle" fontSize="26" fontWeight="900" fill="rgba(167,139,250,0.9)" fontFamily="system-ui">?</text>
        <circle cx="36" cy="36" r="20" stroke="rgba(167,139,250,0.2)" strokeWidth="0.8" fill="none"/>
        <circle cx="36" cy="36" r="4" fill="rgba(167,139,250,0.15)" stroke="rgba(167,139,250,0.4)" strokeWidth="0.8">
          <animate attributeName="r" values="20;32;20" dur="4s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.3;0;0.3" dur="4s" repeatCount="indefinite"/>
        </circle>
      </svg>
    </div>
  );
}

const FAQ_ITEMS: { q: string; a: string; id?: string }[] = [
  {
    q: "What is Nexcor?",
    a: "Nexcor is an AI character chat platform. You can explore thousands of AI characters, have deep conversations with them, create your own characters, post on the Signal Feed, and connect with real users via direct messages. It's built around a DNA/genetics aesthetic and powered by Anthropic's Claude models.",
  },
  {
    q: "How do AI characters work?",
    a: "Each character has a name, personality description, long-term memory, and greeting written by its creator. When you chat, Nexcor sends your message along with the character's context and your recent conversation history to Claude (by Anthropic). Claude generates the reply in character. Anthropic does not use your messages to train their models per their standard API terms.",
  },
  {
    q: "What are Marks?",
    a: "Marks (◈) are Nexcor's in-app credits used to chat with certain AI models. Basic conversations with Haiku cost 0 Marks. More powerful models like Sonnet and Opus cost Marks per message. You receive a small daily top-up for free. You can also purchase Marks from the Store or earn them via the Brilliant subscription.",
  },
  {
    q: "What is Brilliant?",
    a: "Brilliant is Nexcor's subscription plan. Subscribers get a higher daily Marks allowance, access to all AI models without extra cost, expanded post limits on the Signal Feed (25/day vs. 5/day), and early access to new features. You can subscribe from the Brilliant page.",
  },
  {
    q: "Can I create my own character?",
    a: "Yes. Any logged-in user can create characters from the Create page. You write the name, subtitle, description, personality, and optionally a greeting and long-term memory. Characters can be public or private. If you create 20 or more characters you unlock the Creator badge.",
  },
  {
    q: "What is the Signal Feed?",
    a: "The Signal Feed is Nexcor's public microblog. You can post up to 500 characters of text, attach an image, add tags, and mark content NSFW. Posts expire after 24 hours and are visible to all logged-in users. Free users can post 5 times per day; Brilliant subscribers can post 25 times per day.",
  },
  {
    q: "How do direct messages (DMs) work?",
    a: "DMs let you chat in real time with other Nexcor users — no AI involved. From the Chats page, click 'New DM', search for a username, and open the conversation. Messages are delivered instantly via Supabase realtime. DMs are private and only visible to the two participants.",
  },
  {
    q: "Is my conversation data private?",
    a: "Yes. Your AI conversations are private — no other user can see them. Nexcor uses row-level security (RLS) so your data is only accessible to your account. Signal Feed posts and comments are public. DMs are private between the two participants. We never sell your data. See the Privacy Policy for full details.",
  },
  {
    q: "How do I delete my account?",
    a: "Go to Settings → scroll to Danger Zone → click 'Delete account'. This permanently removes your profile, characters, conversations, and Feed content within 30 days. This action cannot be undone.",
  },
  {
    q: "How do I export my data?",
    a: "Go to Settings → scroll to Privacy & Data → click 'Export my data'. A JSON file will download containing your profile, characters, conversations, and messages. You can also email us via the Contact page to request a full data export.",
  },
  {
    q: "What languages are supported?",
    id: "multilingual",
    a: "The Nexcor interface is in English, but AI characters can respond in many languages. Simply write to a character in your preferred language and it will reply in the same language. Claude supports dozens of languages natively.",
  },
  {
    q: "How do I report a user or character?",
    a: "Use the report button (flag icon) on any post, character card, or profile. Reports are reviewed by the Nexcor team. You can also contact us directly via the Contact page for urgent safety issues.",
  },
  {
    q: "How do I contact support?",
    a: "Use the Contact page. We personally read every message and aim to respond within 1 business day. For privacy and data requests, see the Privacy Policy for your specific rights and how to exercise them.",
  },
  {
    q: "What are Community Guidelines?",
    a: "Community Guidelines outline what behaviour is and isn't allowed on Nexcor. In short: be respectful, don't harass, always tag NSFW content appropriately, no illegal content, and no spam. Read the full guidelines to understand our rules.",
  },
];

export default function FaqPage() {
  return (
    <LegalPage
      logo={<FaqLogo />}
      title="FAQ"
      subtitle="Everything you need to know about Nexcor — answered honestly."
      lastUpdated="May 16, 2026"
      versionTag="NEXCOR FAQ · v.324B21"
    >
      <p>
        Can&apos;t find what you&apos;re looking for? <a href="/contact">Contact us directly</a> — we read every message.
      </p>

      {FAQ_ITEMS.map(({ q, a, id }, i) => (
        <div key={i} id={id}>
          <h2>{q}</h2>
          <p>{a}</p>
        </div>
      ))}
    </LegalPage>
  );
}
