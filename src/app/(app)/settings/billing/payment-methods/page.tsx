import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { stripe } from "@/lib/stripe";
import { PaymentMethodsClient } from "@/components/billing/PaymentMethodsClient";

export const metadata = { title: "Payment Methods · Nexcor" };

export default async function PaymentMethodsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/settings/billing/payment-methods");

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  let methods: any[] = [];
  let defaultMethodId: string | null = null;

  if (profile?.stripe_customer_id) {
    try {
      const [cardList, customer] = await Promise.all([
        stripe.paymentMethods.list({
          customer: profile.stripe_customer_id,
          type: "card",
          limit: 20,
        }),
        stripe.customers.retrieve(profile.stripe_customer_id),
      ]);
      methods = cardList.data;
      if (!customer.deleted) {
        defaultMethodId = ((customer as any).invoice_settings?.default_payment_method as string | null) ?? null;
      }
    } catch {
      // Stripe unavailable — show empty state
    }
  }

  const { status } = await searchParams;
  const justAdded = status === "added";

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#05020d] pt-24 pb-32 px-4 md:px-8">
        <div className="max-w-xl mx-auto">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-8">
            <Link
              href="/settings/billing"
              className="text-[10px] tracking-[2px] uppercase transition-colors hover:text-[#a78bfa]"
              style={{ fontFamily: "var(--font-mono)", color: "rgba(122,106,154,0.6)" }}
            >
              ← BILLING
            </Link>
            <span style={{ color: "rgba(122,106,154,0.3)" }}>/</span>
            <span
              className="text-[10px] tracking-[2px] uppercase"
              style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.5)" }}
            >
              PAYMENT METHODS
            </span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-6 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(0,229,255,0.5))" }} />
              <span
                className="text-[9px] tracking-[4px] uppercase"
                style={{ fontFamily: "var(--font-mono)", color: "rgba(0,229,255,0.5)" }}
              >
                ◈ PAYMENT METHODS · 324B21
              </span>
            </div>
            <h1
              className="text-[28px] md:text-[36px] font-black tracking-[5px] text-white uppercase"
              style={{
                fontFamily: "var(--font-display)",
                textShadow: "0 0 30px rgba(0,229,255,0.2)",
              }}
            >
              SAVED CARDS
            </h1>
            <p
              className="text-[13px] text-[#7a6a9a] italic mt-2"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Cards saved here are used for mark purchases and your subscription renewal.
            </p>
          </div>

          <PaymentMethodsClient
            initialMethods={methods}
            initialDefaultId={defaultMethodId}
            justAdded={justAdded}
          />

          <p
            className="text-[9px] tracking-[3px] text-purple-500/20 text-center mt-10 uppercase"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            SESTRA PROTOCOL · NEOLUTION SCIENCE DIVISION · 324B21
          </p>
        </div>
      </main>
    </>
  );
}
