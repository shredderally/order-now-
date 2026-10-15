import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const allowedEvents = new Set([
  "menu_view",
  "dish_view",
  "dish_add_to_cart",
  "whatsapp_order_click",
]);

const jsonResponse = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing required server configuration.");
    return jsonResponse({ error: "Server configuration error" }, 500);
  }

  let body: Record<string, unknown>;

  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  const restaurantSlug =
    typeof body.restaurant_slug === "string"
      ? body.restaurant_slug.trim().toLowerCase()
      : "";

  const eventType =
    typeof body.event_type === "string" ? body.event_type : "";

  if (
    !restaurantSlug ||
    restaurantSlug.length > 100 ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(restaurantSlug)
  ) {
    return jsonResponse({ error: "Invalid restaurant slug" }, 400);
  }

  if (!allowedEvents.has(eventType)) {
    return jsonResponse({ error: "Invalid event type" }, 400);
  }

  const dishId =
    typeof body.dish_id === "string" ? body.dish_id.slice(0, 100) : null;

  const dishName =
    typeof body.dish_name === "string"
      ? body.dish_name.slice(0, 150)
      : null;

  const sessionId =
    typeof body.session_id === "string" &&
    body.session_id.length <= 100
      ? body.session_id
      : null;

  const pagePath =
    typeof body.page_path === "string"
      ? body.page_path.slice(0, 200)
      : null;

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Resolve the public restaurant slug without exposing owner information.
  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .select("id")
    .eq("slug", restaurantSlug)
    .maybeSingle();

  if (restaurantError) {
    console.error("Restaurant lookup failed:", restaurantError.message);
    return jsonResponse({ error: "Could not resolve restaurant" }, 500);
  }

  if (!restaurant) {
    return jsonResponse({ error: "Restaurant not found" }, 404);
  }

  const { error: insertError } = await supabase
    .from("analytics_events")
    .insert({
      restaurant_id: restaurant.id,
      event_type: eventType,
      dish_id: dishId,
      dish_name: dishName,
      session_id: sessionId,
      page_path: pagePath,
    });

  if (insertError) {
    console.error("Analytics insert failed:", insertError.message);
    return jsonResponse({ error: "Could not record event" }, 500);
  }

  return jsonResponse({ success: true }, 201);
});
