/**
 * MenuBoxGh Analytics
 * Tracks menu views, dish views, cart additions, and WhatsApp order clicks.
 *
 * Required configuration:
 * window.MENUBOX_CONFIG = {
 *   supabaseUrl: "https://YOUR_PROJECT.supabase.co",
 *   publishableKey: "YOUR_SUPABASE_PUBLISHABLE_KEY",
 *   restaurantSlug: "your-restaurant-slug"
 * };
 *
 * Load config before loading this file.
 */

(function () {
  "use strict";

  const config = window.MENUBOX_CONFIG || {};

  const supabaseUrl = String(config.supabaseUrl || "").replace(/\/+$/, "");
  const publishableKey = config.publishableKey || "";
  const restaurantSlug = config.restaurantSlug || "";

  const ENDPOINT = supabaseUrl
    ? `${supabaseUrl}/functions/v1/track-event`
    : "";

  const ALLOWED_EVENTS = new Set([
    "menu_view",
    "dish_view",
    "dish_add_to_cart",
    "whatsapp_order_click"
  ]);

  const SESSION_STORAGE_KEY = "menubox_analytics_session";

  /**
   * Create or reuse an anonymous session ID.
   * This ID is not a customer's name or account identifier.
   */
  function getSessionId() {
    try {
      let sessionId = sessionStorage.getItem(SESSION_STORAGE_KEY);

      if (!sessionId) {
        sessionId =
          typeof crypto !== "undefined" &&
          typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

        sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
      }

      return sessionId;
    } catch {
      return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }
  }

  const sessionId = getSessionId();

  /**
   * Send one event to the server-side ingestion function.
   * Failures must never interrupt menu browsing or ordering.
   */
  async function track(eventType, details = {}) {
    if (!ALLOWED_EVENTS.has(eventType)) {
      console.warn("[MenuBox Analytics] Unsupported event:", eventType);
      return;
    }

    if (!ENDPOINT || !publishableKey || !restaurantSlug) {
      console.warn(
        "[MenuBox Analytics] Missing configuration. Event not sent:",
        eventType
      );
      return;
    }

    const payload = {
      restaurant_slug: restaurantSlug,
      event_type: eventType,
      dish_id: safeText(details.dishId, 100),
      dish_name: safeText(details.dishName, 150),
      session_id: sessionId,
      page_path: window.location.pathname
    };

    try {
      await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": publishableKey,
          "Authorization": `Bearer ${publishableKey}`
        },
        body: JSON.stringify(payload),
        keepalive: true
      });
    } catch (error) {
      // Analytics is optional. Ordering must continue working.
      console.debug("[MenuBox Analytics] Event could not be sent.", error);
    }
  }

  /**
   * Accept short text values only.
   * Prevents accidental submission of arbitrary objects or huge strings.
   */
  function safeText(value, maxLength) {
    if (typeof value !== "string") {
      return null;
    }

    const cleaned = value.trim();

    return cleaned ? cleaned.slice(0, maxLength) : null;
  }

  /**
   * Track a menu view once whenever this page loads.
   */
  function trackMenuView() {
    track("menu_view");
  }

  /**
   * Track a dish view.
   * Call this when a dish becomes visible to the visitor.
   */
  function trackDishView(dish) {
    if (!dish || typeof dish !== "object") {
      return;
    }

    track("dish_view", {
      dishId: String(dish.id || ""),
      dishName: String(dish.name || "")
    });
  }

  /**
   * Track a dish added to the cart.
   */
  function trackAddToCart(dish) {
    if (!dish || typeof dish !== "object") {
      return;
    }

    track("dish_add_to_cart", {
      dishId: String(dish.id || ""),
      dishName: String(dish.name || "")
    });
  }

  /**
   * Track a click that starts the WhatsApp ordering flow.
   * Do not pass the order message, customer's phone number,
   * delivery address, or other personal information.
   */
  function trackWhatsAppOrderClick() {
    track("whatsapp_order_click");
  }

  // Expose a small API for the existing menu code.
  window.MenuBoxAnalytics = Object.freeze({
    track,
    trackMenuView,
    trackDishView,
    trackAddToCart,
    trackWhatsAppOrderClick
  });

  // Automatically record the initial menu view.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", trackMenuView, {
      once: true
    });
  } else {
    trackMenuView();
  }
})();
