import { LegalPage } from "@/components/legal/LegalPage";

export const metadata = {
  title: "FAQ · Nexcor",
  description: "Answers to the most common questions about Nexcor — AI characters, Marks, privacy, and more.",
};

function FaqLogo() {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 96, height: 96 }}>

      {/* Outer ambient glow */}
      <div
        aria-hidden
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 170, height: 170,
          background: "radial-gradient(circle, rgba(167,139,250,0.12) 0%, rgba(0,229,255,0.04) 45%, transparent 70%)",
        }}
      />

      <svg width="88" height="88" viewBox="0 0 88 88" fill="none" aria-hidden>

        {/* ── Outer orbit ring ── */}
        <circle cx="44" cy="44" r="40" stroke="rgba(167,139,250,0.18)" strokeWidth="1"/>

        {/* ── Spinning dashed orbit ── */}
        <circle cx="44" cy="44" r="40" stroke="rgba(0,229,255,0.12)" strokeWidth="0.7" strokeDasharray="4 5" fill="none">
          <animateTransform attributeName="transform" type="rotate" from="0 44 44" to="360 44 44" dur="18s" repeatCount="indefinite"/>
        </circle>

        {/* ── Counter-spinning inner ring ── */}
        <circle cx="44" cy="44" r="30" stroke="rgba(167,139,250,0.14)" strokeWidth="0.7" strokeDasharray="2 6" fill="none">
          <animateTransform attributeName="transform" type="rotate" from="0 44 44" to="-360 44 44" dur="24s" repeatCount="indefinite"/>
        </circle>

        {/* ── Mid ring ── */}
        <circle cx="44" cy="44" r="22" stroke="rgba(0,229,255,0.18)" strokeWidth="0.9" fill="none"/>

        {/* ── Four cardinal tick marks (outer edge) ── */}
        <line x1="44" y1="4"  x2="44" y2="8"  stroke="rgba(0,229,255,0.55)"    strokeWidth="1.4" strokeLinecap="round"/>
        <line x1="44" y1="80" x2="44" y2="84" stroke="rgba(0,229,255,0.55)"    strokeWidth="1.4" strokeLinecap="round"/>
        <line x1="4"  y1="44" x2="8"  y2="44" stroke="rgba(167,139,250,0.45)" strokeWidth="1.4" strokeLinecap="round"/>
        <line x1="80" y1="44" x2="84" y2="44" stroke="rgba(167,139,250,0.45)" strokeWidth="1.4" strokeLinecap="round"/>

        {/* ── Diagonal tick marks ── */}
        <line x1="15.5" y1="15.5" x2="18.5" y2="18.5" stroke="rgba(167,139,250,0.22)" strokeWidth="1" strokeLinecap="round"/>
        <line x1="72.5" y1="15.5" x2="69.5" y2="18.5" stroke="rgba(167,139,250,0.22)" strokeWidth="1" strokeLinecap="round"/>
        <line x1="15.5" y1="72.5" x2="18.5" y2="69.5" stroke="rgba(167,139,250,0.22)" strokeWidth="1" strokeLinecap="round"/>
        <line x1="72.5" y1="72.5" x2="69.5" y2="69.5" stroke="rgba(167,139,250,0.22)" strokeWidth="1" strokeLinecap="round"/>

        {/* ── Orbiting dot ── */}
        <circle cx="44" cy="4" r="2.2" fill="#00e5ff" opacity="0.85">
          <animateTransform attributeName="transform" type="rotate" from="0 44 44" to="360 44 44" dur="6s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.4;1;0.4" dur="6s" repeatCount="indefinite"/>
        </circle>

        {/* ── Inner disc ── */}
        <circle cx="44" cy="44" r="19" fill="rgba(5,2,13,0.85)" stroke="rgba(167,139,250,0.3)" strokeWidth="1.1"/>

        {/* ── Subtle inner fill glow ── */}
        <circle cx="44" cy="44" r="16" fill="rgba(167,139,250,0.04)"/>

        {/* ── Question mark stem ── */}
        {/* Arc top of ? */}
        <path
          d="M37.5 36.5 C37.5 30 50.5 30 50.5 36.5 C50.5 41 44 41.5 44 47"
          stroke="url(#faqGrad)" strokeWidth="2.8" strokeLinecap="round" fill="none"
        />
        {/* Dot of ? */}
        <circle cx="44" cy="52.5" r="1.8" fill="url(#faqGrad)"/>

        {/* ── Gradient def ── */}
        <defs>
          <linearGradient id="faqGrad" x1="37" y1="30" x2="51" y2="55" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#c084fc"/>
            <stop offset="100%" stopColor="#00e5ff"/>
          </linearGradient>
        </defs>

        {/* ── Pulse ring ── */}
        <circle cx="44" cy="44" r="19" fill="none" stroke="rgba(167,139,250,0.35)" strokeWidth="1">
          <animate attributeName="r" values="19;34;19" dur="3.5s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.35;0;0.35" dur="3.5s" repeatCount="indefinite"/>
        </circle>

        {/* ── Node dots at ring intersections ── */}
        <circle cx="44" cy="14" r="1.4" fill="rgba(0,229,255,0.6)">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="2.8s" repeatCount="indefinite"/>
        </circle>
        <circle cx="74" cy="44" r="1.1" fill="rgba(167,139,250,0.5)">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="2.8s" begin="0.9s" repeatCount="indefinite"/>
        </circle>
        <circle cx="44" cy="74" r="1.1" fill="rgba(0,229,255,0.4)">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="2.8s" begin="1.8s" repeatCount="indefinite"/>
        </circle>
        <circle cx="14" cy="44" r="1.4" fill="rgba(167,139,250,0.5)">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="2.8s" begin="2.7s" repeatCount="indefinite"/>
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
