import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CreateClient } from "./CreateClient";

export const metadata = {
  title: "Create Entity · Nexcor",
  description: "Synthesize a new AI character. Memory, personality, presence.",
};

export default async function CreatePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware should already enforce this — belt & suspenders
  if (!user) redirect("/login?next=/create");

  return (
    <>
      <CreateClient />
    </>
  );
}
