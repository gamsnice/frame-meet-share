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
    const { code, state } = await req.json();

    if (!code || !state) {
      return new Response(
        JSON.stringify({ error: "Missing code or state" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const clientId = Deno.env.get("LINKEDIN_CLIENT_ID");
    const clientSecret = Deno.env.get("LINKEDIN_CLIENT_SECRET");
    
    if (!clientId || !clientSecret) {
      console.error("LinkedIn credentials not configured");
      return new Response(
        JSON.stringify({ error: "LinkedIn not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate state and get session_id
    const { data: stateData, error: stateError } = await supabase
      .from("linkedin_oauth_states")
      .select("*")
      .eq("state", state)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (stateError || !stateData) {
      console.error("Invalid or expired state:", stateError);
      return new Response(
        JSON.stringify({ error: "Invalid or expired OAuth state" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { session_id, redirect_uri } = stateData;

    // Delete used state
    await supabase.from("linkedin_oauth_states").delete().eq("state", state);

    // Exchange code for access token
    const tokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Token exchange failed:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to exchange authorization code" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    const expiresIn = tokenData.expires_in || 5184000; // Default 60 days

    // Fetch user profile using OpenID Connect userinfo endpoint
    const userInfoResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userInfoResponse.ok) {
      const errorText = await userInfoResponse.text();
      console.error("Failed to fetch user info:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to fetch LinkedIn profile" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userInfo = await userInfoResponse.json();
    const linkedinUrn = `urn:li:person:${userInfo.sub}`;
    const linkedinName = userInfo.name || userInfo.given_name || "LinkedIn User";

    // Calculate expiration time
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    // Store or update token
    const { error: upsertError } = await supabase
      .from("linkedin_tokens")
      .upsert(
        {
          session_id,
          access_token: accessToken,
          expires_at: expiresAt,
          linkedin_urn: linkedinUrn,
          linkedin_name: linkedinName,
        },
        { onConflict: "session_id" }
      );

    if (upsertError) {
      console.error("Failed to store token:", upsertError);
      return new Response(
        JSON.stringify({ error: "Failed to save LinkedIn connection" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("LinkedIn OAuth completed for session:", session_id, "user:", linkedinName);

    return new Response(
      JSON.stringify({ success: true, name: linkedinName }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in linkedin-auth-callback:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
