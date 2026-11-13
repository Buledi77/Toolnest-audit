/* ToolNest measurement hooks (inactive by default).
 *
 * Nothing is sent anywhere until a real configuration is supplied. To activate,
 * set window.TOOLNEST_CONFIG before this file loads (or edit the block below):
 *
 *   window.TOOLNEST_CONFIG = {
 *     ga4Id: "G-XXXXXXXXXX",          // optional, only with a real GA4 property
 *     collectEndpoint: ""             // optional first-party collector URL
 *   };
 *
 * The site currently ships with no analytics ID, so this file is a no-op apart
 * from recording outbound tool clicks in memory for local debugging.
 * It never collects names, emails, IP-based profiles or form contents.
 */
(function () {
  "use strict";
  var cfg = window.TOOLNEST_CONFIG || {};
  var queue = [];
  var hasGa = typeof cfg.ga4Id === "string" && /^G-[A-Z0-9]{6,}$/i.test(cfg.ga4Id);

  function pageType() {
    var p = location.pathname;
    if (p.indexOf("/compare/") === 0) return "comparison";
    if (p.indexOf("/tools/") === 0) return "tool";
    if (p.indexOf("/alternatives/") === 0) return "alternatives";
    if (p.indexOf("/best/") === 0) return "best-of";
    if (p.indexOf("/category/") === 0) return "category";
    if (p.indexOf("/goals/") === 0) return "goal";
    return "page";
  }

  function send(name, props) {
    var payload = {
      event: name,
      page_path: location.pathname,
      page_type: pageType(),
      referrer: document.referrer || "",
      props: props || {}
    };
    queue.push(payload);
    if (window.dataLayer && typeof window.dataLayer.push === "function") {
      window.dataLayer.push({ event: name, page_type: payload.page_type, page_path: payload.page_path });
    }
    if (hasGa && typeof window.gtag === "function") {
      window.gtag("event", name, props || {});
    }
    if (cfg.collectEndpoint && navigator.sendBeacon) {
      try {
        navigator.sendBeacon(cfg.collectEndpoint, JSON.stringify(payload));
      } catch (e) { /* never break the page for measurement */ }
    }
    return payload;
  }

  // Outbound tool clicks: captures which tool, which page type, which CTA slot.
  document.addEventListener("click", function (ev) {
    var a = ev.target && ev.target.closest ? ev.target.closest("a[data-tool]") : null;
    if (!a) return;
    send("outbound_tool_click", {
      tool: a.getAttribute("data-tool") || "",
      cta_position: a.getAttribute("data-pos") || "",
      source_page_type: a.getAttribute("data-page") || pageType(),
      destination: a.getAttribute("href") || ""
    });
  }, { passive: true });

  window.toolnestTrack = send;
  window.toolnestEvents = queue;
})();