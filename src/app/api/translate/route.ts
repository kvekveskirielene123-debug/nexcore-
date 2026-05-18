import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q  = searchParams.get("q");
  const tl = searchParams.get("tl");

  if (!q || !tl || tl === "en") {
    return NextResponse.json({ translated: q ?? "" });
  }

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(tl)}&dt=t&q=${encodeURIComponent(q)}`;
    const res = await fetch(url);
    if (!res.ok) return NextResponse.json({ translated: q });

    const data = await res.json();
    const segs: unknown[] = data?.[0] ?? [];
    const text = segs
      .filter((seg): seg is string[] => Array.isArray(seg) && typeof seg[0] === "string")
      .map((seg) => seg[0])
      .join("");

    return NextResponse.json({ translated: text || q });
  } catch {
    return NextResponse.json({ translated: q });
  }
}
