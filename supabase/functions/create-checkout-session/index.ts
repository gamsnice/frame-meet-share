import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      console.error("Auth error:", userError);
      throw new Error("Unauthorized");
    }

    console.log("User authenticated:", user.id, user.email);

    const { tier } = await req.json();
    
    if (!tier) {
      throw new Error("Tier is required");
    }

    console.log("Requested tier:", tier);

    // Get tier config from database
    const { data: tierConfig, error: tierError } = await supabaseClient
      .from("subscription_tier_config")
      .select("*")
      .eq("tier", tier)
      .single();

    if (tierError || !tierConfig) {
      console.error("Tier config error:", tierError);
      throw new Error(`Tier config not found for: ${tier}`);
    }

    if (!tierConfig.stripe_price_id) {
      throw new Error(`No Stripe Price ID configured for tier: ${tier}`);
    }

    console.log("Tier config found:", tierConfig.tier, "Price ID:", tierConfig.stripe_price_id);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if user already has a Stripe customer
    const { data: subscription } = await supabaseClient
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    let customerId = subscription?.stripe_customer_id;

    // Create or retrieve Stripe customer
    if (!customerId) {
      console.log("Creating new Stripe customer for:", user.email);
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        },
      });
      customerId = customer.id;
      console.log("Created Stripe customer:", customerId);
    } else {
      console.log("Using existing Stripe customer:", customerId);
    }

    // Determine success and cancel URLs
    const origin = req.headers.get("origin") || "https://meetme.lovable.app";
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: tierConfig.stripe_price_id,
          quantity: 1,
        },
      ],
      mode: "payment", // One-time payment
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
      metadata: {
        user_id: user.id,
        tier: tier,
      },
    });

    console.log("Checkout session created:", session.id);

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error creating checkout session:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
