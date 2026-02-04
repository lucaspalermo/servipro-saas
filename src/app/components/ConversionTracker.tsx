"use client";

// Extend Window interface for GTM dataLayer and Meta fbq
declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
    fbq: (...args: unknown[]) => void;
  }
}

/**
 * Captures UTM parameters from URL and stores in sessionStorage.
 * Call this on the landing page or registration page.
 */
export function captureUTM() {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  const utmData: Record<string, string> = {};
  utmKeys.forEach((key) => {
    const val = params.get(key);
    if (val) utmData[key] = val;
  });
  if (Object.keys(utmData).length > 0) {
    sessionStorage.setItem("utm_data", JSON.stringify(utmData));
  }
}

/**
 * Returns stored UTM data from sessionStorage.
 */
export function getUTM(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(sessionStorage.getItem("utm_data") || "{}");
  } catch {
    return {};
  }
}

/**
 * Fires a conversion event to both Google Tag Manager (dataLayer) and Meta Pixel (fbq).
 */
export function trackConversion(eventName: string, value?: number) {
  if (typeof window === "undefined") return;
  const utm = getUTM();

  // Push to GTM dataLayer
  if (window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      conversionValue: value,
      timestamp: new Date().toISOString(),
      ...utm,
    });
  }

  // Fire Meta Pixel event
  if (typeof window.fbq === "function") {
    if (value) {
      window.fbq("track", eventName, { value, currency: "BRL", ...utm });
    } else {
      window.fbq("track", eventName, utm);
    }
  }
}

/**
 * Track specific user actions for better ad optimization.
 */
export function trackEvent(action: string, category: string, label?: string) {
  if (typeof window === "undefined") return;
  if (window.dataLayer) {
    window.dataLayer.push({
      event: "custom_event",
      eventAction: action,
      eventCategory: category,
      eventLabel: label,
    });
  }
}

/**
 * Fires a registration/lead conversion event.
 */
export function trackRegistration() {
  trackConversion("Lead");
  trackConversion("CompleteRegistration");
}

/**
 * Track CTA button clicks.
 */
export function trackCTAClick(buttonName: string) {
  trackEvent("cta_click", "engagement", buttonName);
  trackConversion("InitiateCheckout");
}
