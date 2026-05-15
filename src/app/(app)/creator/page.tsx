import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CreatorAnalyticsClient } from "./CreatorAnalyticsClient";

export const metadata = { title: "Creator Analytics · Nexcor" };

export default async function CreatorPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/creator");

  // Must have created at least one character
  const { count } = await supabase
    .from("characters")
    .select("id", { count: "exact", head: true })
    .eq("created_by", user.id);

  if ((count ?? 0) === 0) redirect("/create");

  return <CreatorAnalyticsClient />;
}
