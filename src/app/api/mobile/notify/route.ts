import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "") ?? "";
    const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !authUser) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { recipientId, title, body, data } = await req.json();
    if (!recipientId || !title || !body) {
      return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });
    }

    // Look up the recipient's push token
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("push_token")
      .eq("id", recipientId)
      .single();

    const token = (profile as any)?.push_token;
    if (!token) return NextResponse.json({ ok: false, error: "No push token" });

    // Send via Expo Push API
    const res = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
      },
      body: JSON.stringify({
        to: token,
        title,
        body,
        data: data ?? {},
        sound: "default",
        priority: "high",
        channelId: "default",
      }),
    });

    const result = await res.json();
    return NextResponse.json({ ok: true, result });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
