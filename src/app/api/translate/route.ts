import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { text, lang } = await req.json() as { text?: string; lang?: string };

  if (!text || !lang || lang === "en") {
    return NextResponse.json({ translated: text ?? "" });
  }

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(lang)}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (!res.ok) return NextResponse.json({ translated: text });

    const data = await res.json();
    const segs: unknown[] = data?.[0] ?? [];
    const translated = segs
      .filter((seg): seg is string[] => Array.isArray(seg) && typeof seg[0] === "string")
      .map((seg) => seg[0])
      .join("");

    return NextResponse.json({ translated: translated || text });
  } catch {
    return NextResponse.json({ translated: text });
  }
}
