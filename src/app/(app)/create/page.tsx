import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CreateClient } from "./CreateClient";
import { isSubscriptionActive } from "@/lib/ai/modelConfig";

export const metadata = {
  title: "Create Entity · Nexcor",
  description: "Synthesize a new AI character. Memory, personality, presence.",
};

export default async function CreatePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/create");

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_expires_at")
    .eq("id", user.id)
    .maybeSingle();

  const isBrilliant = isSubscriptionActive(profile?.subscription_expires_at ?? null);

  return <CreateClient isBrilliant={isBrilliant} />;
}
