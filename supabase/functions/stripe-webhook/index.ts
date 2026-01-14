import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

serve(async (req) => {
  const signature = req.headers.get("Stripe-Signature");
  const body = await req.text();
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature || !webhookSecret) {
    console.error("Missing signature or webhook secret");
    return new Response("Missing signature or webhook secret", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider
    );
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", errMessage);
    return new Response(`Webhook Error: ${errMessage}`, { status: 400 });
  }

  console.log("Received Stripe event:", event.type);

  // Use service role for database operations
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Checkout session completed:", session.id);
        
        const userId = session.metadata?.user_id;
        const tier = session.metadata?.tier;
        const customerId = session.customer as string;

        if (!userId || !tier) {
          console.error("Missing user_id or tier in session metadata");
          break;
        }

        console.log("Processing subscription for user:", userId, "tier:", tier);

        // Get tier limits from config
        const { data: tierConfig, error: tierError } = await supabaseAdmin
          .from("subscription_tier_config")
          .select("*")
          .eq("tier", tier)
          .single();

        if (tierError || !tierConfig) {
          console.error("Failed to get tier config:", tierError);
          break;
        }

        console.log("Tier config:", tierConfig);

        // Get current subscription to calculate remaining downloads
        const { data: currentSub, error: currentSubError } = await supabaseAdmin
          .from("subscriptions")
          .select("downloads_limit, downloads_used")
          .eq("user_id", userId)
          .single();

        if (currentSubError) {
          console.error("Failed to get current subscription:", currentSubError);
          break;
        }

        // Calculate remaining downloads from current subscription
        const currentRemaining = currentSub.downloads_limit === -1 
          ? 0 // If unlimited, don't add anything
          : Math.max(0, currentSub.downloads_limit - currentSub.downloads_used);

        // New limit = new tier's downloads + remaining downloads from current plan
        // If new tier is unlimited (-1), keep it unlimited
        const newDownloadsLimit = tierConfig.downloads_limit === -1 
          ? -1 
          : tierConfig.downloads_limit + currentRemaining;

        console.log("Download calculation:", {
          currentLimit: currentSub.downloads_limit,
          currentUsed: currentSub.downloads_used,
          currentRemaining,
          tierDownloads: tierConfig.downloads_limit,
          newLimit: newDownloadsLimit
        });

        // Calculate period dates (1 year from now)
        const now = new Date();
        const oneYearFromNow = new Date(now);
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

        // Update subscription - add new tier downloads to remaining downloads
        const { error: updateError } = await supabaseAdmin
          .from("subscriptions")
          .update({
            tier: tier,
            status: "active",
            stripe_customer_id: customerId,
            stripe_subscription_id: session.id, // Using session ID for one-time payments
            downloads_limit: newDownloadsLimit,
            downloads_used: 0, // Reset used count since remaining is now in the limit
            events_limit: tierConfig.events_limit,
            templates_limit: tierConfig.templates_limit,
            current_period_start: now.toISOString(),
            current_period_end: oneYearFromNow.toISOString(),
            updated_at: now.toISOString(),
          })
          .eq("user_id", userId);

        if (updateError) {
          console.error("Failed to update subscription:", updateError);
        } else {
          console.log("Subscription updated successfully for user:", userId, "New download limit:", newDownloadsLimit);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("Subscription updated:", subscription.id);
        
        // Find user by stripe customer id
        const { data: sub, error: findError } = await supabaseAdmin
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", subscription.customer as string)
          .maybeSingle();

        if (findError || !sub) {
          console.error("Could not find subscription for customer:", subscription.customer);
          break;
        }

        // Update subscription status
        const status = subscription.status === "active" ? "active" : 
                       subscription.status === "canceled" ? "cancelled" : 
                       subscription.status === "past_due" ? "expired" : "pending";

        await supabaseAdmin
          .from("subscriptions")
          .update({
            status: status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", sub.user_id);

        console.log("Subscription status updated for user:", sub.user_id);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("Subscription deleted:", subscription.id);

        // Find user and downgrade to free
        const { data: sub } = await supabaseAdmin
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", subscription.customer as string)
          .maybeSingle();

        if (sub) {
          // Get free tier config
          const { data: freeConfig } = await supabaseAdmin
            .from("subscription_tier_config")
            .select("*")
            .eq("tier", "free")
            .single();

          await supabaseAdmin
            .from("subscriptions")
            .update({
              tier: "free",
              status: "active",
              downloads_limit: freeConfig?.downloads_limit ?? 50,
              events_limit: freeConfig?.events_limit ?? 1,
              templates_limit: freeConfig?.templates_limit ?? 1,
              stripe_subscription_id: null,
              current_period_start: null,
              current_period_end: null,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", sub.user_id);

          console.log("User downgraded to free tier:", sub.user_id);
        }
        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error processing webhook:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500 }
    );
  }
});
