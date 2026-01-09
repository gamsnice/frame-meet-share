import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id, redirect_uri } = await req.json();

    if (!session_id || !redirect_uri) {
      return new Response(
        JSON.stringify({ error: "Missing session_id or redirect_uri" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const clientId = Deno.env.get("LINKEDIN_CLIENT_ID");
    if (!clientId) {
      console.error("LINKEDIN_CLIENT_ID not configured");
      return new Response(
        JSON.stringify({ error: "LinkedIn not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate random state for CSRF protection
    const state = crypto.randomUUID();

    // Store state -> session_id mapping in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Clean up expired states first
    await supabase
      .from("linkedin_oauth_states")
      .delete()
      .lt("expires_at", new Date().toISOString());

    // Insert new state
    const { error: insertError } = await supabase
      .from("linkedin_oauth_states")
      .insert({
        state,
        session_id,
        redirect_uri,
      });

    if (insertError) {
      console.error("Failed to store OAuth state:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to initiate OAuth flow" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build LinkedIn authorization URL
    // Using OpenID Connect scopes for Sign In with LinkedIn and w_member_social for posting
    const scopes = ["openid", "profile", "w_member_social"];
    const authUrl = new URL("https://www.linkedin.com/oauth/v2/authorization");
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("redirect_uri", redirect_uri);
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("scope", scopes.join(" "));

    console.log("LinkedIn OAuth initiated for session:", session_id);

    return new Response(
      JSON.stringify({ auth_url: authUrl.toString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in linkedin-auth-init:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
